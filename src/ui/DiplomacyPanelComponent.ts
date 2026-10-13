import Phaser from "phaser";

import type { Nation } from "../domain/Nation";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class DiplomacyPanelComponent extends Phaser.GameObjects.Container {
    private static readonly PANEL_HEIGHT_PX = 150;
    private static readonly PANEL_PADDING_PX = 16;
    private static readonly BAR_TOP_Y_PX = 92;
    private static readonly BAR_HEIGHT_PX = 14;

    private readonly panelWidthPx: number;
    private readonly firstNationTextObject: Phaser.GameObjects.Text;
    private readonly secondNationTextObject: Phaser.GameObjects.Text;
    private readonly relationBarGraphics: Phaser.GameObjects.Graphics;
    private readonly relationValueTextObject: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_SIDEBAR);
        this.panelWidthPx = width;
        this.add(
            UiPanelFactory.createPanelContainer(
                scene,
                0,
                0,
                width,
                DiplomacyPanelComponent.PANEL_HEIGHT_PX,
                PanelVariant.LEATHER,
            ),
        );
        const headerTextObject = UiPanelFactory.createSectionHeader(
            scene,
            DiplomacyPanelComponent.PANEL_PADDING_PX,
            12,
            "Diplomatic Relations",
            16,
        );
        this.firstNationTextObject = scene.add.text(
            DiplomacyPanelComponent.PANEL_PADDING_PX,
            40,
            "No nation selected",
            {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "16px",
                color: UiPalette.PARCHMENT_CSS,
            },
        );
        this.secondNationTextObject = scene.add.text(DiplomacyPanelComponent.PANEL_PADDING_PX, 62, "", {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "16px",
            color: UiPalette.PARCHMENT_CSS,
        });
        this.relationBarGraphics = scene.add.graphics();
        this.drawRelationBar(0);
        this.relationValueTextObject = scene.add.text(width / 2, 112, "Relation: 0", {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "15px",
            color: UiPalette.BRASS_TAN_CSS,
        });
        this.relationValueTextObject.setOrigin(0.5, 0);
        this.add(headerTextObject);
        this.add(this.firstNationTextObject);
        this.add(this.secondNationTextObject);
        this.add(this.relationBarGraphics);
        this.add(this.relationValueTextObject);
    }

    public setNations(firstNation: Nation, secondNation: Nation, relationScore: number): void {
        this.firstNationTextObject.setText(`${firstNation.getDisplayName()} (${firstNation.getNationCode()})`);
        this.secondNationTextObject.setText(`${secondNation.getDisplayName()} (${secondNation.getNationCode()})`);
        const clampedRelationScore = Phaser.Math.Clamp(Math.round(relationScore), -100, 100);
        this.relationValueTextObject.setText(`Relation: ${clampedRelationScore}`);
        this.drawRelationBar(clampedRelationScore);
    }

    private drawRelationBar(relationScore: number): void {
        const barLeftX = DiplomacyPanelComponent.PANEL_PADDING_PX;
        const barWidthPx = this.panelWidthPx - DiplomacyPanelComponent.PANEL_PADDING_PX * 2;
        const barCenterX = barLeftX + barWidthPx / 2;
        const halfBarWidthPx = barWidthPx / 2;
        const barTopY = DiplomacyPanelComponent.BAR_TOP_Y_PX;
        const barHeightPx = DiplomacyPanelComponent.BAR_HEIGHT_PX;
        this.relationBarGraphics.clear();
        this.relationBarGraphics.fillStyle(UiPalette.NEAR_BLACK_LEATHER, 0.9);
        this.relationBarGraphics.fillRect(barLeftX, barTopY, barWidthPx, barHeightPx);
        if (relationScore < 0) {
            const fillWidthPx = (Math.abs(relationScore) / 100) * halfBarWidthPx;
            this.relationBarGraphics.fillStyle(UiPalette.BLOOD_RED, 1);
            this.relationBarGraphics.fillRect(barCenterX - fillWidthPx, barTopY, fillWidthPx, barHeightPx);
        } else if (relationScore > 0) {
            const fillWidthPx = (relationScore / 100) * halfBarWidthPx;
            this.relationBarGraphics.fillStyle(UiPalette.BRIGHT_BRASS, 1);
            this.relationBarGraphics.fillRect(barCenterX, barTopY, fillWidthPx, barHeightPx);
        }
        this.relationBarGraphics.lineStyle(2, UiPalette.HIGHLIGHT_BRASS, 0.9);
        this.relationBarGraphics.lineBetween(barCenterX, barTopY - 3, barCenterX, barTopY + barHeightPx + 3);
        this.relationBarGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.9);
        this.relationBarGraphics.strokeRect(barLeftX, barTopY, barWidthPx, barHeightPx);
    }
}
