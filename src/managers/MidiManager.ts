export class ParsedMidiNote {
    public readonly startTimeSeconds: number;
    public readonly durationSeconds: number;
    public readonly midiNoteNumber: number;
    public readonly velocity: number;
    public readonly channelIndex: number;
    public readonly instrumentProgram: number;

    constructor(
        startTimeSeconds: number,
        durationSeconds: number,
        midiNoteNumber: number,
        velocity: number,
        channelIndex: number,
        instrumentProgram: number,
    ) {
        this.startTimeSeconds = startTimeSeconds;
        this.durationSeconds = durationSeconds;
        this.midiNoteNumber = midiNoteNumber;
        this.velocity = velocity;
        this.channelIndex = channelIndex;
        this.instrumentProgram = instrumentProgram;
    }
}

export class ParsedMidiSequence {
    public readonly sequenceIdentifier: string;
    public readonly notes: ParsedMidiNote[];
    public readonly durationSeconds: number;
    public readonly initialTempoMicrosecondsPerQuarter: number;

    constructor(
        sequenceIdentifier: string,
        notes: ParsedMidiNote[],
        durationSeconds: number,
        initialTempoMicrosecondsPerQuarter: number,
    ) {
        this.sequenceIdentifier = sequenceIdentifier;
        this.notes = notes;
        this.durationSeconds = durationSeconds;
        this.initialTempoMicrosecondsPerQuarter = initialTempoMicrosecondsPerQuarter;
    }
}

class MidiChannelState {
    public instrumentProgram: number = 0;
}

class PendingMidiNote {
    public readonly startTimeSeconds: number;
    public readonly velocity: number;
    public readonly channelIndex: number;

    constructor(startTimeSeconds: number, velocity: number, channelIndex: number) {
        this.startTimeSeconds = startTimeSeconds;
        this.velocity = velocity;
        this.channelIndex = channelIndex;
    }
}

export class MidiManager {
    private audioContext: AudioContext | null;
    private masterGainNode: GainNode | null;
    private scheduledNoteOscillators: OscillatorNode[];
    private schedulingIntervalHandle: number | null;
    private currentSequence: ParsedMidiSequence | null;
    private currentSequenceStartTime: number;
    private currentSequenceScheduledUntil: number;
    private isLoopingCurrentSequence: boolean;
    private masterVolumeLevel: number;

    constructor() {
        this.audioContext = null;
        this.masterGainNode = null;
        this.scheduledNoteOscillators = [];
        this.schedulingIntervalHandle = null;
        this.currentSequence = null;
        this.currentSequenceStartTime = 0;
        this.currentSequenceScheduledUntil = 0;
        this.isLoopingCurrentSequence = false;
        this.masterVolumeLevel = 0.5;
    }

    public async ensureAudioContextReady(): Promise<AudioContext> {
        if (this.audioContext === null) {
            this.audioContext = new AudioContext();
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.value = this.masterVolumeLevel;
            this.masterGainNode.connect(this.audioContext.destination);
        }
        if (this.audioContext.state === "suspended") {
            await this.audioContext.resume();
        }
        return this.audioContext;
    }

    public parseMidiArrayBuffer(midiData: ArrayBuffer, sequenceIdentifier: string): ParsedMidiSequence {
        const dataView = new DataView(midiData);
        let byteOffset = 0;

        const headerChunkIdentifier = this.readAsciiText(dataView, byteOffset, 4);
        byteOffset += 4;
        if (headerChunkIdentifier !== "MThd") {
            throw new Error("Provided data is not a standard MIDI file.");
        }
        const headerLength = dataView.getUint32(byteOffset);
        byteOffset += 4;
        const headerEndOffset = byteOffset + headerLength;
        byteOffset += 2;
        byteOffset += 2;
        const divisionUnit = dataView.getUint16(byteOffset);
        byteOffset += 2;

        const ticksPerQuarterNote = divisionUnit & 0x8000 ? 480 : divisionUnit;
        let runningTempoMicrosecondsPerQuarter = 500000;
        const parsedNotes: ParsedMidiNote[] = [];
        let maximumEndTimeSeconds = 0;

        while (
            byteOffset < headerEndOffset + this.computeRemainingFileLength(headerEndOffset, dataView) &&
            byteOffset + 8 <= dataView.byteLength
        ) {
            const trackChunkIdentifier = this.readAsciiText(dataView, byteOffset, 4);
            byteOffset += 4;
            const trackLength = dataView.getUint32(byteOffset);
            byteOffset += 4;
            if (trackChunkIdentifier !== "MTrk") {
                byteOffset += trackLength;
                continue;
            }
            const trackEndOffset = byteOffset + trackLength;

            let absoluteTickPosition = 0;
            let currentTimeSeconds = 0;
            let runningStatusCode = 0;
            const channelStates: MidiChannelState[] = [];
            for (let channelIndex = 0; channelIndex < 16; channelIndex++) {
                channelStates.push(new MidiChannelState());
            }
            const pendingNotesByChannelAndNote = new Map<string, PendingMidiNote>();

            while (byteOffset < trackEndOffset) {
                const deltaTimeResult = this.readVariableLengthQuantity(dataView, byteOffset);
                byteOffset = deltaTimeResult.nextOffset;
                absoluteTickPosition += deltaTimeResult.value;
                currentTimeSeconds =
                    (absoluteTickPosition / ticksPerQuarterNote) * (runningTempoMicrosecondsPerQuarter / 1000000);

                let statusByte = dataView.getUint8(byteOffset);
                if (statusByte >= 0x80) {
                    byteOffset += 1;
                    runningStatusCode = statusByte;
                } else {
                    statusByte = runningStatusCode;
                }

                if (statusByte === 0xff) {
                    const metaType = dataView.getUint8(byteOffset);
                    byteOffset += 1;
                    const metaLengthResult = this.readVariableLengthQuantity(dataView, byteOffset);
                    byteOffset = metaLengthResult.nextOffset;
                    if (metaType === 0x51 && metaLengthResult.value === 3) {
                        runningTempoMicrosecondsPerQuarter =
                            (dataView.getUint8(byteOffset) << 16) |
                            (dataView.getUint8(byteOffset + 1) << 8) |
                            dataView.getUint8(byteOffset + 2);
                    }
                    byteOffset += metaLengthResult.value;
                    continue;
                }

                if (statusByte === 0xf0 || statusByte === 0xf7) {
                    const sysexLengthResult = this.readVariableLengthQuantity(dataView, byteOffset);
                    byteOffset = sysexLengthResult.nextOffset + sysexLengthResult.value;
                    continue;
                }

                const eventTypeCode = statusByte & 0xf0;
                const channelIndex = statusByte & 0x0f;

                if (eventTypeCode === 0x90 || eventTypeCode === 0x80) {
                    const midiNoteNumber = dataView.getUint8(byteOffset);
                    const noteVelocity = dataView.getUint8(byteOffset + 1);
                    byteOffset += 2;
                    const pendingNoteKey = `${channelIndex}:${midiNoteNumber}`;
                    if (eventTypeCode === 0x90 && noteVelocity > 0) {
                        pendingNotesByChannelAndNote.set(
                            pendingNoteKey,
                            new PendingMidiNote(currentTimeSeconds, noteVelocity, channelIndex),
                        );
                    } else {
                        const pendingNote = pendingNotesByChannelAndNote.get(pendingNoteKey);
                        if (pendingNote !== undefined) {
                            const noteDurationSeconds = Math.max(
                                0.05,
                                currentTimeSeconds - pendingNote.startTimeSeconds,
                            );
                            parsedNotes.push(
                                new ParsedMidiNote(
                                    pendingNote.startTimeSeconds,
                                    noteDurationSeconds,
                                    midiNoteNumber,
                                    pendingNote.velocity,
                                    pendingNote.channelIndex,
                                    channelStates[pendingNote.channelIndex].instrumentProgram,
                                ),
                            );
                            maximumEndTimeSeconds = Math.max(maximumEndTimeSeconds, currentTimeSeconds);
                            pendingNotesByChannelAndNote.delete(pendingNoteKey);
                        }
                    }
                    continue;
                }

                if (eventTypeCode === 0xc0) {
                    channelStates[channelIndex].instrumentProgram = dataView.getUint8(byteOffset);
                    byteOffset += 1;
                    continue;
                }

                if (eventTypeCode === 0xd0) {
                    byteOffset += 1;
                    continue;
                }

                byteOffset += 2;
            }
            byteOffset = trackEndOffset;
        }

        parsedNotes.sort((firstNote, secondNote) => firstNote.startTimeSeconds - secondNote.startTimeSeconds);
        return new ParsedMidiSequence(
            sequenceIdentifier,
            parsedNotes,
            Math.max(1, maximumEndTimeSeconds),
            runningTempoMicrosecondsPerQuarter,
        );
    }

    public playSequence(parsedSequence: ParsedMidiSequence, shouldLoop: boolean, volumeLevel: number): void {
        this.stopAllPlayback();
        if (this.audioContext === null || this.masterGainNode === null) {
            return;
        }
        this.masterVolumeLevel = volumeLevel;
        this.masterGainNode.gain.value = volumeLevel;
        this.currentSequence = parsedSequence;
        this.isLoopingCurrentSequence = shouldLoop;
        this.currentSequenceStartTime = this.audioContext.currentTime + 0.05;
        this.currentSequenceScheduledUntil = 0;

        this.schedulingIntervalHandle = window.setInterval(() => {
            this.schedulePendingNotes();
        }, 60);
        this.schedulePendingNotes();
    }

    public stopAllPlayback(): void {
        if (this.schedulingIntervalHandle !== null) {
            window.clearInterval(this.schedulingIntervalHandle);
            this.schedulingIntervalHandle = null;
        }
        for (const scheduledOscillator of this.scheduledNoteOscillators) {
            try {
                scheduledOscillator.stop();
            } catch {
                continue;
            }
        }
        this.scheduledNoteOscillators = [];
        this.currentSequence = null;
    }

    public setMasterVolume(volumeLevel: number): void {
        this.masterVolumeLevel = Math.max(0, Math.min(1, volumeLevel));
        if (this.masterGainNode !== null) {
            this.masterGainNode.gain.value = this.masterVolumeLevel;
        }
    }

    public getMasterVolume(): number {
        return this.masterVolumeLevel;
    }

    public isPlaying(): boolean {
        return this.currentSequence !== null;
    }

    private schedulePendingNotes(): void {
        if (this.audioContext === null || this.masterGainNode === null || this.currentSequence === null) {
            return;
        }
        const schedulingLookaheadSeconds = 0.25;
        const nowSeconds = this.audioContext.currentTime;
        const scheduleUntilSeconds = nowSeconds + schedulingLookaheadSeconds;

        for (const parsedNote of this.currentSequence.notes) {
            const absoluteStartSeconds = this.currentSequenceStartTime + parsedNote.startTimeSeconds;
            if (
                absoluteStartSeconds < this.currentSequenceScheduledUntil ||
                absoluteStartSeconds > scheduleUntilSeconds
            ) {
                continue;
            }
            this.scheduleSingleNote(parsedNote, absoluteStartSeconds);
        }
        this.currentSequenceScheduledUntil = scheduleUntilSeconds;

        if (this.currentSequenceStartTime + this.currentSequence.durationSeconds < nowSeconds) {
            if (this.isLoopingCurrentSequence) {
                this.currentSequenceStartTime = nowSeconds + 0.1;
                this.currentSequenceScheduledUntil = 0;
            } else {
                this.stopAllPlayback();
            }
        }
    }

    private scheduleSingleNote(parsedNote: ParsedMidiNote, absoluteStartSeconds: number): void {
        if (this.audioContext === null || this.masterGainNode === null) {
            return;
        }
        const noteFrequencyHertz = 440 * Math.pow(2, (parsedNote.midiNoteNumber - 69) / 12);
        const gainEnvelope = this.audioContext.createGain();
        const notePeakGain = (parsedNote.velocity / 127) * 0.12;
        gainEnvelope.gain.setValueAtTime(0.0001, absoluteStartSeconds);
        gainEnvelope.gain.linearRampToValueAtTime(notePeakGain, absoluteStartSeconds + 0.02);
        gainEnvelope.gain.exponentialRampToValueAtTime(0.0001, absoluteStartSeconds + parsedNote.durationSeconds);

        if (parsedNote.channelIndex === 9) {
            const noiseBufferSource = this.audioContext.createBufferSource();
            noiseBufferSource.buffer = this.createNoiseBuffer();
            const noiseFilter = this.audioContext.createBiquadFilter();
            noiseFilter.type = "bandpass";
            noiseFilter.frequency.value = noteFrequencyHertz * 2;
            noiseBufferSource.connect(noiseFilter);
            noiseFilter.connect(gainEnvelope);
            gainEnvelope.connect(this.masterGainNode);
            noiseBufferSource.start(absoluteStartSeconds);
            noiseBufferSource.stop(absoluteStartSeconds + parsedNote.durationSeconds);
            return;
        }

        const oscillatorNode = this.audioContext.createOscillator();
        oscillatorNode.type = this.selectWaveformForProgram(parsedNote.instrumentProgram);
        oscillatorNode.frequency.value = noteFrequencyHertz;
        oscillatorNode.connect(gainEnvelope);
        gainEnvelope.connect(this.masterGainNode);
        oscillatorNode.start(absoluteStartSeconds);
        oscillatorNode.stop(absoluteStartSeconds + parsedNote.durationSeconds + 0.05);
        this.scheduledNoteOscillators.push(oscillatorNode);
        if (this.scheduledNoteOscillators.length > 512) {
            this.scheduledNoteOscillators = this.scheduledNoteOscillators.slice(-256);
        }
    }

    private selectWaveformForProgram(instrumentProgram: number): OscillatorType {
        if (instrumentProgram <= 7) {
            return "triangle";
        }
        if (instrumentProgram <= 15) {
            return "sine";
        }
        if (instrumentProgram <= 23) {
            return "square";
        }
        if (instrumentProgram <= 31) {
            return "sawtooth";
        }
        if (instrumentProgram <= 39) {
            return "square";
        }
        if (instrumentProgram <= 47) {
            return "triangle";
        }
        if (instrumentProgram <= 55) {
            return "sine";
        }
        if (instrumentProgram <= 63) {
            return "sawtooth";
        }
        if (instrumentProgram <= 71) {
            return "triangle";
        }
        if (instrumentProgram <= 79) {
            return "sine";
        }
        if (instrumentProgram <= 87) {
            return "square";
        }
        if (instrumentProgram <= 95) {
            return "sine";
        }
        if (instrumentProgram <= 103) {
            return "sawtooth";
        }
        if (instrumentProgram <= 111) {
            return "triangle";
        }
        if (instrumentProgram <= 119) {
            return "square";
        }
        return "sine";
    }

    private createNoiseBuffer(): AudioBuffer {
        if (this.audioContext === null) {
            throw new Error("Audio context is not initialized.");
        }
        const noiseBufferLength = Math.floor(this.audioContext.sampleRate * 0.2);
        const noiseBuffer = this.audioContext.createBuffer(1, noiseBufferLength, this.audioContext.sampleRate);
        const noiseChannelData = noiseBuffer.getChannelData(0);
        for (let sampleIndex = 0; sampleIndex < noiseBufferLength; sampleIndex++) {
            noiseChannelData[sampleIndex] = Math.random() * 2 - 1;
        }
        return noiseBuffer;
    }

    private readAsciiText(dataView: DataView, byteOffset: number, byteCount: number): string {
        let asciiText = "";
        for (let byteIndex = 0; byteIndex < byteCount; byteIndex++) {
            asciiText += String.fromCharCode(dataView.getUint8(byteOffset + byteIndex));
        }
        return asciiText;
    }

    private readVariableLengthQuantity(dataView: DataView, byteOffset: number): { value: number; nextOffset: number } {
        let value = 0;
        let currentOffset = byteOffset;
        for (let iteration = 0; iteration < 4; iteration++) {
            const currentByte = dataView.getUint8(currentOffset);
            value = (value << 7) | (currentByte & 0x7f);
            currentOffset += 1;
            if ((currentByte & 0x80) === 0) {
                break;
            }
        }
        return { value, nextOffset: currentOffset };
    }

    private computeRemainingFileLength(headerEndOffset: number, dataView: DataView): number {
        return Math.max(0, dataView.byteLength - headerEndOffset);
    }
}
