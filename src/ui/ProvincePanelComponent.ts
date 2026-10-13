import Phaser from "phaser";

import type { Nation } from "../domain/Nation";
import type { Province } from "../domain/Province";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class ProvincePanelComponent extends Phaser.GameObjects.Container {
    private static readonly PANEL_HEIGHT_PX = 220;
    private static readonly PANEL_PADDING_PX = 16;

    private readonly provinceHeaderTextObject: Phaser.GameObjects.Text;
    private readonly provinceBodyTextObject: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_SIDEBAR);
        this.add(
            UiPanelFactory.createPanelContainer(
                scene,
                0,
                0,
                width,
                ProvincePanelComponent.PANEL_HEIGHT_PX,
                PanelVariant.LEATHER,
            ),
        );
        const innerWidthPx = width - ProvincePanelComponent.PANEL_PADDING_PX * 2;
        this.provinceHeaderTextObject = scene.add.text(
            ProvincePanelComponent.PANEL_PADDING_PX,
            14,
            "No province selected",
            {
                fontFamily: FontFamilies.DISPLAY_SERIF,
                fontSize: "21px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
                wordWrap: { width: innerWidthPx, useAdvancedWrap: true },
            },
        );
        this.provinceBodyTextObject = scene.add.text(ProvincePanelComponent.PANEL_PADDING_PX, 54, "", {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "16px",
            color: UiPalette.PARCHMENT_CSS,
            wordWrap: { width: innerWidthPx, useAdvancedWrap: true },
            lineSpacing: 8,
        });
        this.add(this.provinceHeaderTextObject);
        this.add(this.provinceBodyTextObject);
    }

    public setProvince(province: Province, ownerNation: Nation | null): void {
        this.provinceHeaderTextObject.setText(province.getDisplayName());
        const terrainTypeCode = province.getTerrainTypeCode();
        const terrainDisplayText = terrainTypeCode.charAt(0).toUpperCase() + terrainTypeCode.slice(1);
        const ownerDisplayText = ownerNation !== null ? ownerNation.getDisplayName() : "Unclaimed";
        const detailLines = [
            `Terrain: ${terrainDisplayText}`,
            `Owner: ${ownerDisplayText}`,
            `Victory Points: ${province.getVictoryPointValue()}`,
            `Supply Value: ${province.getSupplyValue()}`,
            `Capital: ${province.isCapital() ? "Yes" : "No"}`,
        ];
        this.provinceBodyTextObject.setText(detailLines.join("\n"));
    }
}
