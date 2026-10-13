import Phaser from "phaser";

import { UiPalette } from "./UiPalette";

export class TypewriterTextComponent extends Phaser.GameObjects.Container {
    private static readonly MINIMUM_CHARACTERS_PER_SECOND = 1;

    private readonly textObject: Phaser.GameObjects.Text;

    private fullCharacters: string[];
    private revealedCharacterCount: number;
    private revealTimerEvent: Phaser.Time.TimerEvent | null;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, fontFamilyName: string, fontSizePx: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.textObject = scene.add.text(0, 0, "", {
            fontFamily: fontFamilyName,
            fontSize: `${fontSizePx}px`,
            color: UiPalette.PARCHMENT_CSS,
            wordWrap: { width: width, useAdvancedWrap: true },
            lineSpacing: 4,
        });
        this.add(this.textObject);
        this.fullCharacters = [];
        this.revealedCharacterCount = 0;
        this.revealTimerEvent = null;
        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.cancelRevealTimerEvent();
        });
    }

    public setTextAndReveal(fullText: string, charactersPerSecond: number): void {
        this.cancelRevealTimerEvent();
        this.fullCharacters = Array.from(fullText);
        this.revealedCharacterCount = 0;
        this.textObject.setText("");
        if (this.fullCharacters.length === 0) {
            return;
        }
        const revealRate = Math.max(TypewriterTextComponent.MINIMUM_CHARACTERS_PER_SECOND, charactersPerSecond);
        const characterDelayMs = Math.max(1, Math.round(1000 / revealRate));
        this.revealTimerEvent = this.scene.time.addEvent({
            delay: characterDelayMs,
            loop: true,
            callback: () => {
                this.revealNextCharacter();
            },
        });
    }

    public completeRevealImmediately(): void {
        this.cancelRevealTimerEvent();
        this.revealedCharacterCount = this.fullCharacters.length;
        this.textObject.setText(this.fullCharacters.join(""));
    }

    public isRevealComplete(): boolean {
        return this.revealedCharacterCount >= this.fullCharacters.length;
    }

    public getRevealedText(): string {
        return this.fullCharacters.slice(0, this.revealedCharacterCount).join("");
    }

    private revealNextCharacter(): void {
        this.revealedCharacterCount += 1;
        this.textObject.setText(this.getRevealedText());
        if (this.isRevealComplete()) {
            this.cancelRevealTimerEvent();
        }
    }

    private cancelRevealTimerEvent(): void {
        if (this.revealTimerEvent !== null) {
            this.revealTimerEvent.remove(false);
            this.revealTimerEvent = null;
        }
    }
}
