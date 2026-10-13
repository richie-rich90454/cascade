import Phaser from "phaser";

import type { Nation } from "../domain/Nation";
import type { WarScoreBreakdown } from "../managers/DiplomacyManager";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";

export class WarScoreComponent extends Phaser.GameObjects.Container {
    private readonly componentWidthPx: number;
    private readonly contentContainer: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.componentWidthPx = width;
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_PANEL);
        this.setSize(width, height);
        this.contentContainer = scene.add.container(12, 12);
        this.add(this.contentContainer);
    }

    public setWarScoreBreakdown(nation: Nation, warScoreBreakdown: WarScoreBreakdown): void {
        this.contentContainer.removeAll(true);
        const headerTextObject = this.scene.add.text(0, 0, nation.getDisplayName() + " - War Score", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "15px",
            color: UiPalette.AGED_PARCHMENT_CSS,
        });
        const totalTextObject = this.scene.add.text(0, 22, String(warScoreBreakdown.totalScore), {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "40px",
            color: UiPalette.BRIGHT_BRASS_CSS,
        });
        this.contentContainer.add(headerTextObject);
        this.contentContainer.add(totalTextObject);

        const barGraphics = this.scene.add.graphics();
        this.contentContainer.add(barGraphics);
        let rowTopY = 78;
        this.createScoreBarRow(barGraphics, rowTopY, "Military", warScoreBreakdown.militaryScore, 60);
        rowTopY += 36;
        this.createScoreBarRow(barGraphics, rowTopY, "Economic", warScoreBreakdown.economicScore, 40);
        rowTopY += 36;
        this.createScoreBarRow(barGraphics, rowTopY, "Diplomatic", warScoreBreakdown.diplomaticScore, 20);
        rowTopY += 36;
        this.createScoreBarRow(barGraphics, rowTopY, "Moral", warScoreBreakdown.moralScore, 20);
    }

    private createScoreBarRow(
        barGraphics: Phaser.GameObjects.Graphics,
        rowTopY: number,
        rowLabelText: string,
        rowValue: number,
        maximumValue: number,
    ): void {
        const rowLabelTextObject = this.scene.add.text(0, rowTopY, `${rowLabelText}: ${rowValue} / ${maximumValue}`, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "13px",
            color: UiPalette.PARCHMENT_CSS,
        });
        this.contentContainer.add(rowLabelTextObject);
        const barWidthPx = this.componentWidthPx - 24;
        const clampedFraction = Math.max(0, Math.min(1, rowValue / maximumValue));
        barGraphics.fillStyle(UiPalette.MID_OLIVE, 1);
        barGraphics.fillRect(0, rowTopY + 20, barWidthPx, 8);
        barGraphics.fillStyle(UiPalette.BRIGHT_BRASS, 1);
        barGraphics.fillRect(0, rowTopY + 20, barWidthPx * clampedFraction, 8);
        barGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.9);
        barGraphics.strokeRect(0.5, rowTopY + 20.5, barWidthPx - 1, 7);
    }
}
