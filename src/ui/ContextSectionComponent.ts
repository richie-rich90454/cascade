import Phaser from "phaser";

import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";

export class ContextSectionComponent extends Phaser.GameObjects.Container {
    private readonly sectionWidth: number;
    private readonly backgroundGraphics: Phaser.GameObjects.Graphics;
    private readonly titleTextObject: Phaser.GameObjects.Text;
    private readonly contextTextObject: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
        super(scene, x, y);
        this.sectionWidth = width;
        this.backgroundGraphics = scene.add.graphics();
        this.titleTextObject = scene.add.text(10, 8, "Context", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "14px",
            color: UiPalette.DEEP_BRASS_CSS,
        });
        this.contextTextObject = scene.add.text(10, 32, "", {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "14px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            wordWrap: { width: width - 20, useAdvancedWrap: true },
            lineSpacing: 3,
        });
        scene.add.existing(this);
        this.add(this.backgroundGraphics);
        this.add(this.titleTextObject);
        this.add(this.contextTextObject);
        this.redrawBackground();
    }

    public setContextText(contextText: string): void {
        this.contextTextObject.setText(contextText);
        this.redrawBackground();
    }

    private redrawBackground(): void {
        const computedHeightPx = 32 + this.contextTextObject.height + 12;
        this.backgroundGraphics.clear();
        this.backgroundGraphics.fillStyle(UiPalette.PARCHMENT, 1);
        this.backgroundGraphics.fillRect(0, 0, this.sectionWidth, computedHeightPx);
        this.backgroundGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.85);
        this.backgroundGraphics.strokeRect(0.5, 0.5, this.sectionWidth - 1, computedHeightPx - 1);
        this.setSize(this.sectionWidth, computedHeightPx);
    }
}
