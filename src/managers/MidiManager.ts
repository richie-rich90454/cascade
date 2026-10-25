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
    private dynamicsCompressorNode: DynamicsCompressorNode | null;
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
        this.dynamicsCompressorNode = null;
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
            this.dynamicsCompressorNode = this.audioContext.createDynamicsCompressor();
            this.masterGainNode.gain.value = this.masterVolumeLevel;
            this.dynamicsCompressorNode.threshold.value = -12;
            this.dynamicsCompressorNode.knee.value = 8;
            this.dynamicsCompressorNode.ratio.value = 8;
            this.dynamicsCompressorNode.attack.value = 0.003;
            this.dynamicsCompressorNode.release.value = 0.18;
            this.masterGainNode.connect(this.dynamicsCompressorNode);
            this.dynamicsCompressorNode.connect(this.audioContext.destination);
        }
        if (this.audioContext.state === "suspended") {
            await this.audioContext.resume();
        }
        return this.audioContext;
    }

    public parseMidiArrayBuffer(midiData: ArrayBuffer, sequenceIdentifier: string): ParsedMidiSequence {
        const dataView = new DataView(midiData);
        if (dataView.byteLength < 14) {
            throw new Error("The MIDI file is shorter than its required header.");
        }
        let byteOffset = 0;

        const headerChunkIdentifier = this.readAsciiText(dataView, byteOffset, 4);
        byteOffset += 4;
        if (headerChunkIdentifier !== "MThd") {
            throw new Error("Provided data is not a standard MIDI file.");
        }
        const headerLength = dataView.getUint32(byteOffset);
        byteOffset += 4;
        if (headerLength < 6 || headerLength > dataView.byteLength - byteOffset) {
            throw new Error("The MIDI header length is invalid.");
        }
        const headerEndOffset = byteOffset + headerLength;
        const fileFormat = dataView.getUint16(byteOffset);
        byteOffset += 2;
        const declaredTrackCount = dataView.getUint16(byteOffset);
        byteOffset += 2;
        const divisionUnit = dataView.getUint16(byteOffset);
        byteOffset += 2;

        if (fileFormat !== 0 || declaredTrackCount !== 1) {
            throw new Error("Cascade supports single-track MIDI files only.");
        }
        if (divisionUnit === 0 || (divisionUnit & 0x8000) !== 0) {
            throw new Error("The MIDI file must use a nonzero ticks-per-quarter-note time division.");
        }
        const ticksPerQuarterNote = divisionUnit;
        let runningTempoMicrosecondsPerQuarter = 500000;
        const initialTempoMicrosecondsPerQuarter = runningTempoMicrosecondsPerQuarter;
        const parsedNotes: ParsedMidiNote[] = [];
        let maximumEndTimeSeconds = 0;
        let parsedTrackCount = 0;
        byteOffset = headerEndOffset;

        while (byteOffset + 8 <= dataView.byteLength) {
            const trackChunkIdentifier = this.readAsciiText(dataView, byteOffset, 4);
            const trackLength = dataView.getUint32(byteOffset + 4);
            byteOffset += 8;
            const trackEndOffset = byteOffset + trackLength;
            if (!Number.isSafeInteger(trackEndOffset) || trackEndOffset > dataView.byteLength) {
                throw new Error("A MIDI chunk extends beyond the end of the file.");
            }
            if (trackChunkIdentifier !== "MTrk") {
                byteOffset = trackEndOffset;
                continue;
            }
            parsedTrackCount += 1;
            if (parsedTrackCount > declaredTrackCount) {
                throw new Error("The MIDI file contains more tracks than its header declares.");
            }

            let absoluteTickPosition = 0;
            let currentTimeSeconds = 0;
            let runningStatusCode = 0;
            const channelStates: MidiChannelState[] = [];
            for (let channelIndex = 0; channelIndex < 16; channelIndex++) {
                channelStates.push(new MidiChannelState());
            }
            const pendingNotesByChannelAndNote = new Map<string, PendingMidiNote>();

            while (byteOffset < trackEndOffset) {
                const eventStartOffset = byteOffset;
                const deltaTimeResult = this.readVariableLengthQuantity(dataView, byteOffset, trackEndOffset);
                byteOffset = deltaTimeResult.nextOffset;
                absoluteTickPosition += deltaTimeResult.value;
                currentTimeSeconds +=
                    (deltaTimeResult.value / ticksPerQuarterNote) * (runningTempoMicrosecondsPerQuarter / 1000000);
                if (byteOffset >= trackEndOffset) {
                    throw new Error("A MIDI track ends before its event status byte.");
                }

                let statusByte = dataView.getUint8(byteOffset);
                if (statusByte >= 0x80) {
                    byteOffset += 1;
                    if (statusByte < 0xf0) {
                        runningStatusCode = statusByte;
                    } else {
                        runningStatusCode = 0;
                    }
                } else {
                    if (runningStatusCode < 0x80 || runningStatusCode >= 0xf0) {
                        throw new Error("A MIDI event uses running status before a channel status is defined.");
                    }
                    statusByte = runningStatusCode;
                }

                if (statusByte === 0xff) {
                    if (byteOffset >= trackEndOffset) {
                        throw new Error("A MIDI meta event is missing its type byte.");
                    }
                    const metaType = dataView.getUint8(byteOffset);
                    byteOffset += 1;
                    const metaLengthResult = this.readVariableLengthQuantity(dataView, byteOffset, trackEndOffset);
                    byteOffset = metaLengthResult.nextOffset;
                    if (metaLengthResult.value > trackEndOffset - byteOffset) {
                        throw new Error("A MIDI meta event extends beyond its track.");
                    }
                    if (metaType === 0x51) {
                        if (metaLengthResult.value !== 3) {
                            throw new Error("A MIDI tempo event must contain exactly three bytes.");
                        }
                        runningTempoMicrosecondsPerQuarter =
                            (dataView.getUint8(byteOffset) << 16) |
                            (dataView.getUint8(byteOffset + 1) << 8) |
                            dataView.getUint8(byteOffset + 2);
                        if (runningTempoMicrosecondsPerQuarter === 0) {
                            throw new Error("A MIDI tempo event cannot set a zero tempo.");
                        }
                    }
                    byteOffset += metaLengthResult.value;
                } else {
                    if (statusByte === 0xf0 || statusByte === 0xf7) {
                        const sysexLengthResult = this.readVariableLengthQuantity(dataView, byteOffset, trackEndOffset);
                        byteOffset = sysexLengthResult.nextOffset;
                        if (sysexLengthResult.value > trackEndOffset - byteOffset) {
                            throw new Error("A MIDI system-exclusive event extends beyond its track.");
                        }
                        byteOffset += sysexLengthResult.value;
                    } else {
                        if (statusByte >= 0xf0) {
                            throw new Error(`Unsupported MIDI system event status: 0x${statusByte.toString(16)}.`);
                        }
                        const eventTypeCode = statusByte & 0xf0;
                        const channelIndex = statusByte & 0x0f;
                        const dataByteCount = eventTypeCode === 0xc0 || eventTypeCode === 0xd0 ? 1 : 2;
                        if (dataByteCount > trackEndOffset - byteOffset) {
                            throw new Error("A MIDI channel event extends beyond its track.");
                        }

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
                        } else if (eventTypeCode === 0xc0) {
                            channelStates[channelIndex].instrumentProgram = dataView.getUint8(byteOffset);
                            byteOffset += 1;
                        } else {
                            byteOffset += dataByteCount;
                        }
                    }
                }

                if (byteOffset <= eventStartOffset) {
                    throw new Error("MIDI event parsing stopped without advancing the track position.");
                }
            }
            byteOffset = trackEndOffset;
        }
        if (byteOffset !== dataView.byteLength) {
            throw new Error("The MIDI file ends with an incomplete chunk header.");
        }
        if (parsedTrackCount !== declaredTrackCount) {
            throw new Error("The MIDI file has fewer tracks than its header declares.");
        }

        parsedNotes.sort((firstNote, secondNote) => firstNote.startTimeSeconds - secondNote.startTimeSeconds);
        return new ParsedMidiSequence(
            sequenceIdentifier,
            parsedNotes,
            Math.max(1, maximumEndTimeSeconds),
            initialTempoMicrosecondsPerQuarter,
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
        const notePeakGain = (parsedNote.velocity / 127) * 0.24;
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

    private readVariableLengthQuantity(
        dataView: DataView,
        byteOffset: number,
        endOffset: number,
    ): { value: number; nextOffset: number } {
        let value = 0;
        let currentOffset = byteOffset;
        for (let iteration = 0; iteration < 4; iteration++) {
            if (currentOffset >= endOffset) {
                throw new Error("A MIDI variable-length quantity exceeds its track boundary.");
            }
            const currentByte = dataView.getUint8(currentOffset);
            value = (value << 7) | (currentByte & 0x7f);
            currentOffset += 1;
            if ((currentByte & 0x80) === 0) {
                return { value, nextOffset: currentOffset };
            }
        }
        throw new Error("A MIDI variable-length quantity cannot exceed four bytes.");
    }
}
