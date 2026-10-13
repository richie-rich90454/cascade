import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { SeedRandom } from "../../src/core/SeedRandom";

class MidiCatalogEntry {
    public readonly assetId: string;
    public readonly category: string;
    public readonly tempoBpm: number;
    public readonly keyRootMidiNote: number;
    public readonly durationBars: number;
    public readonly moodCode: string;
    public readonly seedKey: string;

    constructor(
        assetId: string,
        category: string,
        tempoBpm: number,
        keyRootMidiNote: number,
        durationBars: number,
        moodCode: string,
        seedKey: string,
    ) {
        this.assetId = assetId;
        this.category = category;
        this.tempoBpm = tempoBpm;
        this.keyRootMidiNote = keyRootMidiNote;
        this.durationBars = durationBars;
        this.moodCode = moodCode;
        this.seedKey = seedKey;
    }
}

class MidiNoteEvent {
    public readonly startTick: number;
    public readonly durationTicks: number;
    public readonly midiNoteNumber: number;
    public readonly velocity: number;
    public readonly channelIndex: number;

    constructor(
        startTick: number,
        durationTicks: number,
        midiNoteNumber: number,
        velocity: number,
        channelIndex: number,
    ) {
        this.startTick = startTick;
        this.durationTicks = durationTicks;
        this.midiNoteNumber = midiNoteNumber;
        this.velocity = velocity;
        this.channelIndex = channelIndex;
    }
}

class MidiCatalogBuilder {
    public static buildCatalog(): MidiCatalogEntry[] {
        return [
            new MidiCatalogEntry("ambient_scenario_1", "ambient", 72, 45, 16, "tense", "ambient_s1"),
            new MidiCatalogEntry("ambient_scenario_2", "ambient", 96, 50, 16, "martial", "ambient_s2"),
            new MidiCatalogEntry("ambient_scenario_3", "ambient", 84, 43, 16, "grim", "ambient_s3"),
            new MidiCatalogEntry("ambient_scenario_4", "ambient", 92, 48, 16, "jazzy", "ambient_s4"),
            new MidiCatalogEntry("ambient_scenario_5", "ambient", 68, 46, 16, "somber", "ambient_s5"),
            new MidiCatalogEntry("ambient_scenario_6", "ambient", 76, 41, 16, "foreboding", "ambient_s6"),
            new MidiCatalogEntry("ambient_scenario_7", "ambient", 100, 50, 16, "martial", "ambient_s7"),
            new MidiCatalogEntry("ambient_scenario_8", "ambient", 104, 45, 16, "epic", "ambient_s8"),
            new MidiCatalogEntry("ambient_scenario_9", "ambient", 60, 43, 16, "mournful", "ambient_s9"),
            new MidiCatalogEntry("ambient_scenario_10", "ambient", 66, 48, 16, "contemplative", "ambient_s10"),
            new MidiCatalogEntry("combat_scenario_2", "combat", 132, 50, 8, "martial", "combat_s2"),
            new MidiCatalogEntry("combat_scenario_3", "combat", 124, 43, 8, "grim", "combat_s3"),
            new MidiCatalogEntry("combat_scenario_7", "combat", 138, 50, 8, "martial", "combat_s7"),
            new MidiCatalogEntry("combat_scenario_8", "combat", 144, 45, 8, "epic", "combat_s8"),
            new MidiCatalogEntry("menu_main", "menu", 70, 45, 12, "somber", "menu_main"),
            new MidiCatalogEntry("menu_campaign", "menu", 84, 48, 12, "hopeful", "menu_campaign"),
            new MidiCatalogEntry("menu_debrief", "menu", 64, 46, 12, "reflective", "menu_debrief"),
            new MidiCatalogEntry("menu_journal", "menu", 60, 43, 12, "quiet", "menu_journal"),
            new MidiCatalogEntry("menu_progress_check", "menu", 72, 48, 12, "focused", "menu_progress_check"),
            new MidiCatalogEntry("menu_teacher", "menu", 76, 45, 12, "neutral", "menu_teacher"),
            new MidiCatalogEntry("jingle_victory", "jingle", 120, 48, 2, "triumphant", "jingle_victory"),
            new MidiCatalogEntry("jingle_defeat", "jingle", 84, 43, 2, "mournful", "jingle_defeat"),
            new MidiCatalogEntry("jingle_neutral", "jingle", 92, 45, 2, "ambiguous", "jingle_neutral"),
            new MidiCatalogEntry("jingle_unlock", "jingle", 108, 50, 2, "rising", "jingle_unlock"),
            new MidiCatalogEntry("jingle_source_analyzed", "jingle", 128, 52, 1, "bright", "jingle_source"),
            new MidiCatalogEntry("jingle_causal_chain_correct", "jingle", 116, 48, 2, "satisfying", "jingle_chain_ok"),
            new MidiCatalogEntry(
                "jingle_causal_chain_incorrect",
                "jingle",
                76,
                43,
                2,
                "descending",
                "jingle_chain_bad",
            ),
            new MidiCatalogEntry("jingle_newspaper", "jingle", 100, 45, 1, "bright", "jingle_newspaper"),
            new MidiCatalogEntry("jingle_telegram", "jingle", 140, 50, 1, "bright", "jingle_telegram"),
            new MidiCatalogEntry("sfx_click", "sfx", 120, 60, 1, "bright", "sfx_click"),
            new MidiCatalogEntry("sfx_hover", "sfx", 120, 64, 1, "bright", "sfx_hover"),
            new MidiCatalogEntry("sfx_open", "sfx", 120, 55, 1, "rising", "sfx_open"),
            new MidiCatalogEntry("sfx_close", "sfx", 120, 55, 1, "descending", "sfx_close"),
            new MidiCatalogEntry("sfx_move", "sfx", 120, 52, 1, "neutral", "sfx_move"),
            new MidiCatalogEntry("sfx_attack", "sfx", 120, 40, 1, "grim", "sfx_attack"),
            new MidiCatalogEntry("sfx_industry", "sfx", 120, 45, 1, "neutral", "sfx_industry"),
            new MidiCatalogEntry("sfx_railroad", "sfx", 120, 48, 1, "neutral", "sfx_railroad"),
            new MidiCatalogEntry("sfx_naval", "sfx", 120, 38, 1, "somber", "sfx_naval"),
            new MidiCatalogEntry("sfx_air", "sfx", 120, 62, 1, "bright", "sfx_air"),
            new MidiCatalogEntry("sfx_diplomacy", "sfx", 120, 50, 1, "bright", "sfx_diplomacy"),
            new MidiCatalogEntry("sfx_casualty", "sfx", 120, 36, 1, "mournful", "sfx_casualty"),
            new MidiCatalogEntry("sfx_war_declared", "sfx", 120, 34, 1, "grim", "sfx_war"),
            new MidiCatalogEntry("sfx_peace_signed", "sfx", 120, 52, 1, "hopeful", "sfx_peace"),
            new MidiCatalogEntry("sfx_notification", "sfx", 120, 58, 1, "bright", "sfx_notification"),
            new MidiCatalogEntry("sfx_error", "sfx", 120, 38, 1, "descending", "sfx_error"),
            new MidiCatalogEntry("sfx_success", "sfx", 120, 56, 1, "rising", "sfx_success"),
        ];
    }
}

class MidiSequenceComposer {
    private static readonly MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];
    private static readonly MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
    private static readonly CHORD_DEGREE_PROGRESSIONS: Record<string, number[]> = {
        somber: [0, 5, 3, 4],
        mournful: [0, 5, 2, 4],
        reflective: [0, 3, 5, 4],
        quiet: [0, 4, 5, 3],
        neutral: [0, 3, 4, 0],
        focused: [0, 5, 3, 4],
        tense: [0, 1, 5, 4],
        foreboding: [0, 1, 2, 1],
        grim: [0, 5, 4, 4],
        martial: [0, 4, 5, 0],
        epic: [0, 5, 3, 0],
        jazzy: [0, 3, 4, 2],
        hopeful: [0, 4, 5, 3],
        triumphant: [0, 4, 0, 0],
        ambiguous: [0, 3, 1, 4],
        rising: [0, 2, 4, 6],
        descending: [6, 4, 2, 0],
        bright: [0, 2, 4, 6],
        satisfying: [0, 4, 5, 7],
    };

    public static composeSequenceForCatalogEntry(catalogEntry: MidiCatalogEntry): MidiNoteEvent[] {
        const seedRandom = new SeedRandom(catalogEntry.seedKey);
        const isMinorMood = MidiSequenceComposer.isMinorMood(catalogEntry.moodCode);
        const scaleIntervals = isMinorMood
            ? MidiSequenceComposer.MINOR_SCALE_INTERVALS
            : MidiSequenceComposer.MAJOR_SCALE_INTERVALS;
        const progression =
            MidiSequenceComposer.CHORD_DEGREE_PROGRESSIONS[catalogEntry.moodCode] ??
            MidiSequenceComposer.CHORD_DEGREE_PROGRESSIONS.neutral;
        const ticksPerBar = 480 * 4;
        const noteEvents: MidiNoteEvent[] = [];
        const totalBars = catalogEntry.durationBars;

        for (let barIndex = 0; barIndex < totalBars; barIndex++) {
            const barStartTick = barIndex * ticksPerBar;
            const chordDegree = progression[barIndex % progression.length];
            const chordRootOffset = MidiSequenceComposer.scaleDegreeToSemitoneOffset(scaleIntervals, chordDegree);
            const chordThirdOffset = MidiSequenceComposer.scaleDegreeToSemitoneOffset(scaleIntervals, chordDegree + 2);
            const chordFifthOffset = MidiSequenceComposer.scaleDegreeToSemitoneOffset(scaleIntervals, chordDegree + 4);

            if (catalogEntry.category === "sfx") {
                const singleNoteOffset = chordRootOffset;
                noteEvents.push(
                    new MidiNoteEvent(barStartTick, 240, catalogEntry.keyRootMidiNote + singleNoteOffset + 12, 96, 0),
                );
                continue;
            }

            const sustainedVelocity = catalogEntry.category === "ambient" ? 44 : 62;
            noteEvents.push(
                new MidiNoteEvent(
                    barStartTick,
                    ticksPerBar - 20,
                    catalogEntry.keyRootMidiNote + chordRootOffset - 12,
                    sustainedVelocity,
                    0,
                ),
            );
            noteEvents.push(
                new MidiNoteEvent(
                    barStartTick,
                    ticksPerBar - 20,
                    catalogEntry.keyRootMidiNote + chordFifthOffset - 12,
                    sustainedVelocity,
                    1,
                ),
            );

            const arpeggioNoteCount = catalogEntry.category === "combat" ? 8 : 4;
            const arpeggioStepTicks = Math.floor(ticksPerBar / arpeggioNoteCount);
            for (let arpeggioIndex = 0; arpeggioIndex < arpeggioNoteCount; arpeggioIndex++) {
                const arpeggioDegreeOffsets = [
                    chordRootOffset,
                    chordThirdOffset,
                    chordFifthOffset,
                    chordRootOffset + 12,
                ];
                const arpeggioOffset = arpeggioDegreeOffsets[arpeggioIndex % arpeggioDegreeOffsets.length];
                const jitter = seedRandom.nextBoolean(0.25) ? 1 : 0;
                noteEvents.push(
                    new MidiNoteEvent(
                        barStartTick + arpeggioIndex * arpeggioStepTicks,
                        arpeggioStepTicks - 10,
                        catalogEntry.keyRootMidiNote + arpeggioOffset + jitter,
                        catalogEntry.category === "combat" ? 88 : 58,
                        2,
                    ),
                );
            }

            if (catalogEntry.category === "combat") {
                const percussionStepTicks = Math.floor(ticksPerBar / 8);
                for (let percussionIndex = 0; percussionIndex < 8; percussionIndex++) {
                    const isAccentBeat = percussionIndex % 4 === 0;
                    noteEvents.push(
                        new MidiNoteEvent(
                            barStartTick + percussionIndex * percussionStepTicks,
                            30,
                            isAccentBeat ? 49 : 42,
                            isAccentBeat ? 110 : 70,
                            9,
                        ),
                    );
                }
            }

            if (catalogEntry.category === "jingle" || catalogEntry.category === "menu") {
                const melodyDegreeSequence = [
                    chordRootOffset,
                    chordThirdOffset,
                    chordFifthOffset,
                    chordRootOffset + 12,
                ];
                const melodyStepTicks = Math.floor(ticksPerBar / melodyDegreeSequence.length);
                for (let melodyIndex = 0; melodyIndex < melodyDegreeSequence.length; melodyIndex++) {
                    noteEvents.push(
                        new MidiNoteEvent(
                            barStartTick + melodyIndex * melodyStepTicks,
                            melodyStepTicks - 20,
                            catalogEntry.keyRootMidiNote + melodyDegreeSequence[melodyIndex] + 12,
                            catalogEntry.category === "jingle" ? 104 : 64,
                            3,
                        ),
                    );
                }
            }
        }
        return noteEvents;
    }

    private static isMinorMood(moodCode: string): boolean {
        const majorMoods = ["hopeful", "bright", "rising", "triumphant", "satisfying"];
        return !majorMoods.includes(moodCode);
    }

    private static scaleDegreeToSemitoneOffset(scaleIntervals: number[], scaleDegree: number): number {
        const octaveOffset = Math.floor(scaleDegree / scaleIntervals.length);
        const wrappedDegree = ((scaleDegree % scaleIntervals.length) + scaleIntervals.length) % scaleIntervals.length;
        return scaleIntervals[wrappedDegree] + octaveOffset * 12;
    }
}

class StandardMidiFileWriter {
    public static writeMidiFileBytes(catalogEntry: MidiCatalogEntry, noteEvents: MidiNoteEvent[]): Buffer {
        const ticksPerQuarterNote = 480;
        const trackEventBytes: number[] = [];

        StandardMidiFileWriter.appendVariableLengthQuantity(trackEventBytes, 0);
        trackEventBytes.push(0xff, 0x51, 0x03);
        const microsecondsPerQuarter = Math.floor(60000000 / catalogEntry.tempoBpm);
        trackEventBytes.push(
            (microsecondsPerQuarter >> 16) & 0xff,
            (microsecondsPerQuarter >> 8) & 0xff,
            microsecondsPerQuarter & 0xff,
        );

        for (const usedChannelIndex of [0, 1, 2, 3, 9]) {
            StandardMidiFileWriter.appendVariableLengthQuantity(trackEventBytes, 0);
            trackEventBytes.push(0xc0 | usedChannelIndex, 0);
        }

        const orderedEvents: Array<{ tick: number; statusByte: number; dataBytes: number[] }> = [];
        for (const noteEvent of noteEvents) {
            orderedEvents.push({
                tick: noteEvent.startTick,
                statusByte: 0x90 | noteEvent.channelIndex,
                dataBytes: [noteEvent.midiNoteNumber, noteEvent.velocity],
            });
            orderedEvents.push({
                tick: noteEvent.startTick + noteEvent.durationTicks,
                statusByte: 0x80 | noteEvent.channelIndex,
                dataBytes: [noteEvent.midiNoteNumber, 0],
            });
        }
        orderedEvents.sort((firstEvent, secondEvent) => firstEvent.tick - secondEvent.tick);

        let previousTick = 0;
        for (const orderedEvent of orderedEvents) {
            const deltaTicks = Math.max(0, orderedEvent.tick - previousTick);
            previousTick = orderedEvent.tick;
            StandardMidiFileWriter.appendVariableLengthQuantity(trackEventBytes, deltaTicks);
            trackEventBytes.push(orderedEvent.statusByte, ...orderedEvent.dataBytes);
        }

        StandardMidiFileWriter.appendVariableLengthQuantity(trackEventBytes, 0);
        trackEventBytes.push(0xff, 0x2f, 0x00);

        const headerBytes: number[] = [];
        StandardMidiFileWriter.appendAsciiText(headerBytes, "MThd");
        StandardMidiFileWriter.appendBigEndianUint32(headerBytes, 6);
        StandardMidiFileWriter.appendBigEndianUint16(headerBytes, 0);
        StandardMidiFileWriter.appendBigEndianUint16(headerBytes, 1);
        StandardMidiFileWriter.appendBigEndianUint16(headerBytes, ticksPerQuarterNote);

        const trackChunkBytes: number[] = [];
        StandardMidiFileWriter.appendAsciiText(trackChunkBytes, "MTrk");
        StandardMidiFileWriter.appendBigEndianUint32(trackChunkBytes, trackEventBytes.length);
        trackChunkBytes.push(...trackEventBytes);

        return Buffer.from([...headerBytes, ...trackChunkBytes]);
    }

    public static verifyMidiFileBytes(midiFileBytes: Buffer): boolean {
        const headerIdentifier = midiFileBytes.toString("ascii", 0, 4);
        const trackIdentifier = midiFileBytes.toString("ascii", 14, 18);
        const hasEndOfTrack =
            midiFileBytes[midiFileBytes.length - 3] === 0xff && midiFileBytes[midiFileBytes.length - 2] === 0x2f;
        return headerIdentifier === "MThd" && trackIdentifier === "MTrk" && hasEndOfTrack;
    }

    private static appendAsciiText(byteAccumulator: number[], asciiText: string): void {
        for (let characterIndex = 0; characterIndex < asciiText.length; characterIndex++) {
            byteAccumulator.push(asciiText.charCodeAt(characterIndex));
        }
    }

    private static appendBigEndianUint32(byteAccumulator: number[], unsignedValue: number): void {
        byteAccumulator.push(
            (unsignedValue >>> 24) & 0xff,
            (unsignedValue >>> 16) & 0xff,
            (unsignedValue >>> 8) & 0xff,
            unsignedValue & 0xff,
        );
    }

    private static appendBigEndianUint16(byteAccumulator: number[], unsignedValue: number): void {
        byteAccumulator.push((unsignedValue >>> 8) & 0xff, unsignedValue & 0xff);
    }

    private static appendVariableLengthQuantity(byteAccumulator: number[], unsignedValue: number): void {
        const variableLengthBytes: number[] = [unsignedValue & 0x7f];
        let remainingValue = unsignedValue >>> 7;
        while (remainingValue > 0) {
            variableLengthBytes.unshift((remainingValue & 0x7f) | 0x80);
            remainingValue >>>= 7;
        }
        byteAccumulator.push(...variableLengthBytes);
    }
}

function runMidiGeneration(): number {
    const repositoryRootPath = process.cwd();
    const midiOutputDirectoryPath = join(repositoryRootPath, "public", "assets", "midi");
    const manifestPath = join(repositoryRootPath, "public", "assets", "manifest.json");
    mkdirSync(midiOutputDirectoryPath, { recursive: true });

    const catalogEntries = MidiCatalogBuilder.buildCatalog();
    const midiManifestEntries: Array<{
        assetId: string;
        category: string;
        tier: number;
        source: string;
        file: string;
        width: number;
        height: number;
        status: string;
    }> = [];

    for (const catalogEntry of catalogEntries) {
        const noteEvents = MidiSequenceComposer.composeSequenceForCatalogEntry(catalogEntry);
        const midiFileBytes = StandardMidiFileWriter.writeMidiFileBytes(catalogEntry, noteEvents);
        if (!StandardMidiFileWriter.verifyMidiFileBytes(midiFileBytes)) {
            throw new Error(`Generated MIDI file failed verification: ${catalogEntry.assetId}`);
        }
        writeFileSync(join(midiOutputDirectoryPath, `${catalogEntry.assetId}.mid`), midiFileBytes);
        midiManifestEntries.push({
            assetId: catalogEntry.assetId,
            category: `midi_${catalogEntry.category}`,
            tier: 1,
            source: "procedural",
            file: `assets/midi/${catalogEntry.assetId}.mid`,
            width: 0,
            height: 0,
            status: "generated",
        });
    }

    const existingManifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
        generatedAtIsoTimestamp: string;
        assets: Array<{
            assetId: string;
            category: string;
            tier: number;
            source: string;
            file: string;
            width: number;
            height: number;
            status: string;
        }>;
    };
    const nonMidiAssets = existingManifest.assets.filter((manifestEntry) => !manifestEntry.file.endsWith(".mid"));
    existingManifest.assets = [...nonMidiAssets, ...midiManifestEntries];
    existingManifest.generatedAtIsoTimestamp = new Date().toISOString();
    writeFileSync(manifestPath, JSON.stringify(existingManifest, null, 2), "utf8");

    return midiManifestEntries.length;
}

const generatedMidiFileCount = runMidiGeneration();
console.log(`GenerateMidi: wrote ${generatedMidiFileCount} procedural MIDI assets to public/assets/midi/.`);
