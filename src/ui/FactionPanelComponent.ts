import Phaser from "phaser";

import type { Nation } from "../domain/Nation";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class FactionPanelComponent extends Phaser.GameObjects.Container {
    private static readonly PANEL_HEIGHT_PX = 230;
    private static readonly PANEL_PADDING_PX = 16;
    private static readonly SWATCH_SIZE_PX = 24;
    private static readonly SWATCH_Y_PX = 80;

    private readonly nationNameTextObject: Phaser.GameObjects.Text;
    private readonly nationCodeTextObject: Phaser.GameObjects.Text;
    private readonly nationStatsTextObject: Phaser.GameObjects.Text;
    private readonly factionSwatchGraphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_SIDEBAR);
        const innerWidthPx = width - FactionPanelComponent.PANEL_PADDING_PX * 2;
        this.add(
            UiPanelFactory.createPanelContainer(
                scene,
                0,
                0,
                width,
                FactionPanelComponent.PANEL_HEIGHT_PX,
                PanelVariant.LEATHER,
            ),
        );
        this.nationNameTextObject = scene.add.text(FactionPanelComponent.PANEL_PADDING_PX, 14, "No nation selected", {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "21px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
            wordWrap: { width: innerWidthPx, useAdvancedWrap: true },
        });
        this.nationCodeTextObject = scene.add.text(FactionPanelComponent.PANEL_PADDING_PX, 48, "", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "14px",
            color: UiPalette.BRASS_TAN_CSS,
        });
        this.factionSwatchGraphics = scene.add.graphics();
        this.drawSwatch(UiPalette.MID_OLIVE);
        this.nationStatsTextObject = scene.add.text(50, FactionPanelComponent.SWATCH_Y_PX, "", {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "15px",
            color: UiPalette.PARCHMENT_CSS,
            wordWrap: { width: innerWidthPx - 36, useAdvancedWrap: true },
            lineSpacing: 6,
        });
        this.add(this.nationNameTextObject);
        this.add(this.nationCodeTextObject);
        this.add(this.factionSwatchGraphics);
        this.add(this.nationStatsTextObject);
    }

    public setNation(nation: Nation): void {
        this.nationNameTextObject.setText(nation.getDisplayName());
        this.nationCodeTextObject.setText(`Code: ${nation.getNationCode()}`);
        this.drawSwatch(Phaser.Display.Color.HexStringToColor(nation.getPrimaryColorHex()).color);
        const statLines = [
            `Treasury: ${nation.getTreasury()}`,
            `Manpower: ${nation.getManpower()}`,
            `Legitimacy: ${nation.getLegitimacy()}`,
            `Stability: ${nation.getStability()}`,
            `Provinces Controlled: ${nation.getControlledProvinceCount()}`,
        ];
        this.nationStatsTextObject.setText(statLines.join("\n"));
    }

    private drawSwatch(colorValue: number): void {
        this.factionSwatchGraphics.clear();
        this.factionSwatchGraphics.fillStyle(colorValue, 1);
        this.factionSwatchGraphics.fillRect(
            FactionPanelComponent.PANEL_PADDING_PX,
            FactionPanelComponent.SWATCH_Y_PX,
            FactionPanelComponent.SWATCH_SIZE_PX,
            FactionPanelComponent.SWATCH_SIZE_PX,
        );
        this.factionSwatchGraphics.lineStyle(2, UiPalette.HIGHLIGHT_BRASS, 0.9);
        this.factionSwatchGraphics.strokeRect(
            FactionPanelComponent.PANEL_PADDING_PX,
            FactionPanelComponent.SWATCH_Y_PX,
            FactionPanelComponent.SWATCH_SIZE_PX,
            FactionPanelComponent.SWATCH_SIZE_PX,
        );
    }
}
