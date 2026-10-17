import { AssetManager } from "./AssetManager";
import { MidiManager, ParsedMidiSequence } from "./MidiManager";

export class SoundEffectTypes {
    public static readonly CLICK = "sfx_click";
    public static readonly HOVER = "sfx_hover";
    public static readonly OPEN = "sfx_open";
    public static readonly CLOSE = "sfx_close";
    public static readonly MOVE = "sfx_move";
    public static readonly ATTACK = "sfx_attack";
    public static readonly INDUSTRY = "sfx_industry";
    public static readonly RAILROAD = "sfx_railroad";
    public static readonly NAVAL = "sfx_naval";
    public static readonly AIR = "sfx_air";
    public static readonly DIPLOMACY = "sfx_diplomacy";
    public static readonly CASUALTY = "sfx_casualty";
    public static readonly WAR_DECLARED = "sfx_war_declared";
    public static readonly PEACE_SIGNED = "sfx_peace_signed";
    public static readonly NOTIFICATION = "sfx_notification";
    public static readonly ERROR = "sfx_error";
    public static readonly SUCCESS = "sfx_success";
}

class SoundEffectRecipe {
    public readonly baseFrequencyHertz: number;
    public readonly durationSeconds: number;
    public readonly waveformType: OscillatorType;
    public readonly sweepToFrequencyHertz: number;

    constructor(
        baseFrequencyHertz: number,
        durationSeconds: number,
        waveformType: OscillatorType,
        sweepToFrequencyHertz: number,
    ) {
        this.baseFrequencyHertz = baseFrequencyHertz;
        this.durationSeconds = durationSeconds;
        this.waveformType = waveformType;
        this.sweepToFrequencyHertz = sweepToFrequencyHertz;
    }
}

export class AudioManager {
    private static readonly SINGLETON_INSTANCE = new AudioManager();

    private readonly midiManager: MidiManager;
    private readonly parsedSequencesByAssetIdentifier: Map<string, ParsedMidiSequence>;

    private isMusicPlaybackEnabled: boolean;
    private isSoundEffectsEnabled: boolean;
    private currentMusicAssetIdentifier: string;

    private constructor() {
        this.midiManager = new MidiManager();
        this.parsedSequencesByAssetIdentifier = new Map<string, ParsedMidiSequence>();
        this.isMusicPlaybackEnabled = true;
        this.isSoundEffectsEnabled = true;
        this.currentMusicAssetIdentifier = "";
    }

    public static getInstance(): AudioManager {
        return AudioManager.SINGLETON_INSTANCE;
    }

    public async initializeAudio(): Promise<void> {
        await this.midiManager.ensureAudioContextReady();
    }

    public activateAudioFromUserGesture(): void {
        const trackToResume = this.currentMusicAssetIdentifier;
        void this.initializeAudio().then(() => {
            if (trackToResume.length > 0 && this.isMusicPlaybackEnabled) {
                this.currentMusicAssetIdentifier = "";
                this.playMusicTrack(trackToResume);
            }
        });
    }

    public registerParsedSequence(assetIdentifier: string, parsedSequence: ParsedMidiSequence): void {
        this.parsedSequencesByAssetIdentifier.set(assetIdentifier, parsedSequence);
    }

    public async loadAndRegisterParsedSequencesFromManifest(): Promise<number> {
        const midiManifestEntries = AssetManager.getInstance().getMidiEntries();
        let registeredSequenceCount = 0;
        for (const manifestEntry of midiManifestEntries) {
            if (this.parsedSequencesByAssetIdentifier.has(manifestEntry.assetIdentifier)) {
                continue;
            }
            try {
                const midiResponse = await fetch(manifestEntry.relativeFilePath);
                if (!midiResponse.ok) {
                    continue;
                }
                const midiBinaryData = await midiResponse.arrayBuffer();
                const parsedSequence = this.midiManager.parseMidiArrayBuffer(
                    midiBinaryData,
                    manifestEntry.assetIdentifier,
                );
                this.parsedSequencesByAssetIdentifier.set(manifestEntry.assetIdentifier, parsedSequence);
                registeredSequenceCount += 1;
            } catch {
                continue;
            }
        }
        return registeredSequenceCount;
    }

    public playSoundEffect(soundEffectIdentifier: string): void {
        if (!this.isSoundEffectsEnabled) {
            return;
        }
        const soundEffectRecipe = AudioManager.getSoundEffectRecipe(soundEffectIdentifier);
        void this.renderSoundEffectRecipe(soundEffectRecipe);
    }

    public playMusicTrack(musicAssetIdentifier: string, shouldLoop: boolean = true): void {
        if (!this.isMusicPlaybackEnabled) {
            return;
        }
        if (this.currentMusicAssetIdentifier === musicAssetIdentifier && this.midiManager.isPlaying()) {
            return;
        }
        const parsedSequence = this.parsedSequencesByAssetIdentifier.get(musicAssetIdentifier);
        if (parsedSequence === undefined) {
            return;
        }
        this.currentMusicAssetIdentifier = musicAssetIdentifier;
        this.midiManager.playSequence(parsedSequence, shouldLoop, 0.85);
    }

    public stopMusic(): void {
        this.currentMusicAssetIdentifier = "";
        this.midiManager.stopAllPlayback();
    }

    public setMusicPlaybackEnabled(isEnabled: boolean): void {
        this.isMusicPlaybackEnabled = isEnabled;
        if (!isEnabled) {
            this.midiManager.stopAllPlayback();
        }
    }

    public isMusicEnabled(): boolean {
        return this.isMusicPlaybackEnabled;
    }

    public setSoundEffectsEnabled(isEnabled: boolean): void {
        this.isSoundEffectsEnabled = isEnabled;
    }

    public areSoundEffectsEnabled(): boolean {
        return this.isSoundEffectsEnabled;
    }

    private async renderSoundEffectRecipe(soundEffectRecipe: SoundEffectRecipe): Promise<void> {
        const audioContext = await this.midiManager.ensureAudioContextReady();
        const oscillatorNode = audioContext.createOscillator();
        const gainEnvelope = audioContext.createGain();
        const startTimeSeconds = audioContext.currentTime;
        oscillatorNode.type = soundEffectRecipe.waveformType;
        oscillatorNode.frequency.setValueAtTime(soundEffectRecipe.baseFrequencyHertz, startTimeSeconds);
        oscillatorNode.frequency.exponentialRampToValueAtTime(
            Math.max(20, soundEffectRecipe.sweepToFrequencyHertz),
            startTimeSeconds + soundEffectRecipe.durationSeconds,
        );
        gainEnvelope.gain.setValueAtTime(0.0001, startTimeSeconds);
        gainEnvelope.gain.linearRampToValueAtTime(0.08, startTimeSeconds + 0.01);
        gainEnvelope.gain.exponentialRampToValueAtTime(0.0001, startTimeSeconds + soundEffectRecipe.durationSeconds);
        oscillatorNode.connect(gainEnvelope);
        gainEnvelope.connect(audioContext.destination);
        oscillatorNode.start(startTimeSeconds);
        oscillatorNode.stop(startTimeSeconds + soundEffectRecipe.durationSeconds + 0.02);
    }

    private static getSoundEffectRecipe(soundEffectIdentifier: string): SoundEffectRecipe {
        switch (soundEffectIdentifier) {
            case SoundEffectTypes.CLICK:
                return new SoundEffectRecipe(660, 0.06, "square", 520);
            case SoundEffectTypes.HOVER:
                return new SoundEffectRecipe(880, 0.03, "sine", 880);
            case SoundEffectTypes.OPEN:
                return new SoundEffectRecipe(440, 0.12, "triangle", 720);
            case SoundEffectTypes.CLOSE:
                return new SoundEffectRecipe(720, 0.12, "triangle", 400);
            case SoundEffectTypes.MOVE:
                return new SoundEffectRecipe(320, 0.1, "triangle", 420);
            case SoundEffectTypes.ATTACK:
                return new SoundEffectRecipe(180, 0.22, "sawtooth", 90);
            case SoundEffectTypes.INDUSTRY:
                return new SoundEffectRecipe(240, 0.3, "square", 200);
            case SoundEffectTypes.RAILROAD:
                return new SoundEffectRecipe(500, 0.4, "triangle", 300);
            case SoundEffectTypes.NAVAL:
                return new SoundEffectRecipe(150, 0.5, "sine", 110);
            case SoundEffectTypes.AIR:
                return new SoundEffectRecipe(900, 0.35, "sawtooth", 1400);
            case SoundEffectTypes.DIPLOMACY:
                return new SoundEffectRecipe(520, 0.16, "sine", 660);
            case SoundEffectTypes.CASUALTY:
                return new SoundEffectRecipe(200, 0.4, "triangle", 80);
            case SoundEffectTypes.WAR_DECLARED:
                return new SoundEffectRecipe(160, 0.6, "sawtooth", 60);
            case SoundEffectTypes.PEACE_SIGNED:
                return new SoundEffectRecipe(480, 0.5, "sine", 720);
            case SoundEffectTypes.NOTIFICATION:
                return new SoundEffectRecipe(700, 0.14, "square", 700);
            case SoundEffectTypes.ERROR:
                return new SoundEffectRecipe(220, 0.25, "square", 140);
            case SoundEffectTypes.SUCCESS:
                return new SoundEffectRecipe(520, 0.2, "sine", 1040);
            default:
                return new SoundEffectRecipe(440, 0.08, "sine", 440);
        }
    }
}
