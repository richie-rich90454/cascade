import Phaser from "phaser";

import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";

export class GovernmentInterventionMeterComponent extends Phaser.GameObjects.Container {
    private readonly meterWidth: number;
    private readonly meterGraphics: Phaser.GameObjects.Graphics;

    private interventionLevel: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
        super(scene, x, y);
        this.meterWidth = width;
        const leftLabelTextObject = scene.add.text(0, 8, "Laissez-Faire", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "13px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        const rightLabelTextObject = scene.add.text(width, 8, "State Intervention", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "13px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        rightLabelTextObject.setOrigin(1, 0);
        this.meterGraphics = scene.add.graphics();
        scene.add.existing(this);
        this.add(this.meterGraphics);
        this.add(leftLabelTextObject);
        this.add(rightLabelTextObject);
        this.redrawMeter();
        this.setSize(width, 84);
    }

    public setInterventionLevel(interventionLevel: number): void {
        this.interventionLevel = Math.max(0, Math.min(100, interventionLevel));
        this.redrawMeter();
    }

    public getInterventionLevel(): number {
        return this.interventionLevel;
    }

    private redrawMeter(): void {
        const trackTopY = 44;
        const trackHeightPx = 14;
        const thumbWidthPx = 14;
        const thumbHeightPx = 26;
        const thumbX = (this.interventionLevel / 100) * (this.meterWidth - thumbWidthPx);
        this.meterGraphics.clear();
        this.meterGraphics.fillStyle(UiPalette.MID_OLIVE, 1);
        this.meterGraphics.fillRect(0, trackTopY, this.meterWidth, trackHeightPx);
        this.meterGraphics.lineStyle(2, UiPalette.DEEP_BRASS, 0.95);
        this.meterGraphics.strokeRect(1, trackTopY + 1, this.meterWidth - 2, trackHeightPx - 2);
        this.meterGraphics.fillStyle(UiPalette.BRIGHT_BRASS, 1);
        this.meterGraphics.fillRect(thumbX, trackTopY - 6, thumbWidthPx, thumbHeightPx);
        this.meterGraphics.lineStyle(1, UiPalette.HIGHLIGHT_BRASS, 0.95);
        this.meterGraphics.strokeRect(thumbX + 0.5, trackTopY - 5.5, thumbWidthPx - 1, thumbHeightPx - 1);
    }
}
