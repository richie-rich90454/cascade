import Phaser from "phaser";

import { prefersReducedMotion } from "../core/AccessibilityPreferences";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";

export class TitleCardComponent extends Phaser.GameObjects.Container {
    private static readonly AUTO_DISMISS_DELAY_MS = 2800;
    private static readonly FADE_DURATION_MS = 400;

    private readonly chapterTextObject: Phaser.GameObjects.Text;
    private readonly titleTextObject: Phaser.GameObjects.Text;
    private readonly subtitleTextObject: Phaser.GameObjects.Text;

    private dismissTimerEvent: Phaser.Time.TimerEvent | null;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_POPUP);
        this.setScrollFactor(0, 0, true);

        const screenWidthPx = scene.scale.width;
        const screenHeightPx = scene.scale.height;
        const screenCenterOffsetX = screenWidthPx / 2 - x;
        const screenCenterOffsetY = screenHeightPx / 2 - y;

        const backdropGraphics = scene.add.graphics();
        backdropGraphics.fillStyle(UiPalette.NEAR_BLACK_LEATHER, 0.97);
        backdropGraphics.fillRect(0, 0, screenWidthPx, screenHeightPx);
        backdropGraphics.lineStyle(2, UiPalette.DEEP_BRASS, 0.9);
        backdropGraphics.strokeRect(36, 28, screenWidthPx - 72, screenHeightPx - 56);
        backdropGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.5);
        backdropGraphics.strokeRect(42, 34, screenWidthPx - 84, screenHeightPx - 68);
        backdropGraphics.setPosition(-x, -y);

        this.chapterTextObject = scene.add.text(screenCenterOffsetX, screenCenterOffsetY - 150, "", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "22px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        this.chapterTextObject.setOrigin(0.5, 0.5);

        this.titleTextObject = scene.add.text(screenCenterOffsetX, screenCenterOffsetY - 30, "", {
            fontFamily: FontFamilies.GOTHIC,
            fontSize: "64px",
            color: UiPalette.PARCHMENT_CSS,
            align: "center",
            wordWrap: { width: width },
        });
        this.titleTextObject.setOrigin(0.5, 0.5);

        this.subtitleTextObject = scene.add.text(screenCenterOffsetX, screenCenterOffsetY + 90, "", {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "24px",
            color: UiPalette.AGED_PARCHMENT_CSS,
            align: "center",
            wordWrap: { width: width },
        });
        this.subtitleTextObject.setOrigin(0.5, 0.5);

        this.add(backdropGraphics);
        this.add(this.chapterTextObject);
        this.add(this.titleTextObject);
        this.add(this.subtitleTextObject);

        this.dismissTimerEvent = null;
        this.setAlpha(0);
        this.setVisible(false);
    }

    public presentTitleCard(chapterNumberText: string, titleText: string, subtitleText: string): void {
        this.chapterTextObject.setText(chapterNumberText);
        this.titleTextObject.setText(titleText);
        this.subtitleTextObject.setText(subtitleText);
        if (this.dismissTimerEvent !== null) {
            this.dismissTimerEvent.remove(false);
            this.dismissTimerEvent = null;
        }
        this.scene.tweens.killTweensOf(this);
        this.setAlpha(0);
        this.setVisible(true);
        if (prefersReducedMotion()) {
            this.setAlpha(1);
            this.dismissTimerEvent = this.scene.time.delayedCall(TitleCardComponent.AUTO_DISMISS_DELAY_MS, () => {
                this.dismissTimerEvent = null;
                this.setVisible(false);
            });
            return;
        }
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: TitleCardComponent.FADE_DURATION_MS,
            ease: "Sine.easeOut",
        });
        this.dismissTimerEvent = this.scene.time.delayedCall(TitleCardComponent.AUTO_DISMISS_DELAY_MS, () => {
            this.dismissTimerEvent = null;
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                duration: TitleCardComponent.FADE_DURATION_MS,
                ease: "Sine.easeIn",
                onComplete: () => {
                    this.setVisible(false);
                },
            });
        });
    }
}
