import Phaser from "phaser";

import { EventBus, GameEventTypes, MapModeSelectedPayload } from "../core/EventBus";
import { FontFamilies } from "../managers/FontManager";
import { MapModeOption } from "./LeftSidebarComponent";
import { UiPalette } from "./UiPalette";

export class MapModeSelectorComponent extends Phaser.GameObjects.Container {
    private static readonly CHIP_HEIGHT_PX = 30;
    private static readonly CHIP_GAP_PX = 8;

    private activeMapModeCode: string;
    private readonly chipGraphicsByMapModeCode: Map<string, Phaser.GameObjects.Graphics>;
    private readonly chipLabelByMapModeCode: Map<string, Phaser.GameObjects.Text>;
    private readonly chipWidthByMapModeCode: Map<string, number>;

    constructor(scene: Phaser.Scene, x: number, y: number, mapModeOptions: MapModeOption[]) {
        super(scene, x, y);
        this.activeMapModeCode = "";
        this.chipGraphicsByMapModeCode = new Map<string, Phaser.GameObjects.Graphics>();
        this.chipLabelByMapModeCode = new Map<string, Phaser.GameObjects.Text>();
        this.chipWidthByMapModeCode = new Map<string, number>();
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_PANEL);

        let chipLeftX = 0;
        for (const mapModeOption of mapModeOptions) {
            const chipWidthPx = Math.max(72, mapModeOption.getDisplayName().length * 9 + 20);
            const chipGraphics = scene.add.graphics();
            chipGraphics.setPosition(chipLeftX, 0);
            const chipLabelTextObject = scene.add.text(
                chipLeftX + chipWidthPx / 2,
                MapModeSelectorComponent.CHIP_HEIGHT_PX / 2,
                mapModeOption.getDisplayName(),
                {
                    fontFamily: FontFamilies.SMALL_CAPS,
                    fontSize: "14px",
                    color: UiPalette.PARCHMENT_CSS,
                },
            );
            chipLabelTextObject.setOrigin(0.5, 0.5);
            const chipZone = scene.add
                .zone(chipLeftX, 0, chipWidthPx, MapModeSelectorComponent.CHIP_HEIGHT_PX)
                .setOrigin(0, 0);
            chipZone.setInteractive({ useHandCursor: true });
            chipZone.on("pointerup", () => {
                this.setActiveMapMode(mapModeOption.getMapModeCode());
                EventBus.getInstance().publish(
                    GameEventTypes.UI_MAP_MODE_SELECTED,
                    new MapModeSelectedPayload(mapModeOption.getMapModeCode()),
                );
            });
            this.chipGraphicsByMapModeCode.set(mapModeOption.getMapModeCode(), chipGraphics);
            this.chipLabelByMapModeCode.set(mapModeOption.getMapModeCode(), chipLabelTextObject);
            this.chipWidthByMapModeCode.set(mapModeOption.getMapModeCode(), chipWidthPx);
            this.add(chipGraphics);
            this.add(chipLabelTextObject);
            this.add(chipZone);
            chipLeftX += chipWidthPx + MapModeSelectorComponent.CHIP_GAP_PX;
        }

        if (mapModeOptions.length > 0) {
            this.setActiveMapMode(mapModeOptions[0].getMapModeCode());
        }
    }

    public setActiveMapMode(mapModeCode: string): void {
        this.activeMapModeCode = mapModeCode;
        for (const [optionCode, chipGraphics] of this.chipGraphicsByMapModeCode.entries()) {
            const chipLabelTextObject = this.chipLabelByMapModeCode.get(optionCode);
            const chipWidthPx = this.chipWidthByMapModeCode.get(optionCode);
            if (chipLabelTextObject === undefined || chipWidthPx === undefined) {
                continue;
            }
            const isActive = optionCode === this.activeMapModeCode;
            chipGraphics.clear();
            chipGraphics.fillStyle(isActive ? UiPalette.BRASS_TAN : UiPalette.MID_OLIVE, 1);
            chipGraphics.fillRect(0, 0, chipWidthPx, MapModeSelectorComponent.CHIP_HEIGHT_PX);
            chipGraphics.lineStyle(2, isActive ? UiPalette.HIGHLIGHT_BRASS : UiPalette.DEEP_BRASS, 0.95);
            chipGraphics.strokeRect(1, 1, chipWidthPx - 2, MapModeSelectorComponent.CHIP_HEIGHT_PX - 2);
            chipLabelTextObject.setColor(isActive ? UiPalette.NEAR_BLACK_LEATHER_CSS : UiPalette.PARCHMENT_CSS);
        }
    }

    public getActiveMapModeCode(): string {
        return this.activeMapModeCode;
    }
}
