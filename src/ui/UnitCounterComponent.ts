import Phaser from "phaser";

import type { Unit } from "../domain/Unit";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";

export class UnitCounterComponent extends Phaser.GameObjects.Container {
    private static readonly COUNTER_WIDTH_PX = 56;
    private static readonly COUNTER_HEIGHT_PX = 32;
    private static readonly HIT_AREA_HEIGHT_PX = 40;
    private static readonly STRENGTH_BAR_HEIGHT_PX = 5;
    private static readonly STRENGTH_HIGH_MINIMUM = 66;
    private static readonly STRENGTH_LOW_MAXIMUM = 33;
    private static readonly STRENGTH_GREEN_COLOR = 0x3f8a3f;

    private readonly unit: Unit;
    private readonly nationColorValue: number;
    private readonly counterGraphics: Phaser.GameObjects.Graphics;
    private readonly symbolTextObject: Phaser.GameObjects.Text;

    private hasSelection: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, unit: Unit, nationColorHex: string) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_BASE);
        this.unit = unit;
        this.nationColorValue = Phaser.Display.Color.HexStringToColor(nationColorHex).color;
        this.hasSelection = false;
        this.counterGraphics = scene.add.graphics();
        this.symbolTextObject = scene.add.text(
            UnitCounterComponent.COUNTER_WIDTH_PX / 2,
            UnitCounterComponent.COUNTER_HEIGHT_PX / 2,
            "",
            {
                fontFamily: FontFamilies.DISPLAY_SERIF,
                fontSize: "15px",
                color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            },
        );
        this.symbolTextObject.setOrigin(0.5, 0.5);
        const hitZone = scene.add
            .zone(0, 0, UnitCounterComponent.COUNTER_WIDTH_PX, UnitCounterComponent.HIT_AREA_HEIGHT_PX)
            .setOrigin(0, 0);
        hitZone.setInteractive({ useHandCursor: true });
        this.add(this.counterGraphics);
        this.add(this.symbolTextObject);
        this.add(hitZone);
        this.updateDisplay();
    }

    public updateDisplay(): void {
        const strengthValue = Phaser.Math.Clamp(this.unit.getStrength(), 0, 100);
        this.counterGraphics.clear();
        this.counterGraphics.fillStyle(this.nationColorValue, 1);
        this.counterGraphics.fillRect(
            0,
            0,
            UnitCounterComponent.COUNTER_WIDTH_PX,
            UnitCounterComponent.COUNTER_HEIGHT_PX,
        );
        this.counterGraphics.lineStyle(
            this.hasSelection ? 3 : 2,
            this.hasSelection ? UiPalette.HIGHLIGHT_BRASS : UiPalette.NEAR_BLACK_LEATHER,
            1,
        );
        this.counterGraphics.strokeRect(
            1,
            1,
            UnitCounterComponent.COUNTER_WIDTH_PX - 2,
            UnitCounterComponent.COUNTER_HEIGHT_PX - 2,
        );

        this.counterGraphics.fillStyle(UiPalette.NEAR_BLACK_LEATHER, 0.85);
        this.counterGraphics.fillRect(
            0,
            UnitCounterComponent.COUNTER_HEIGHT_PX + 2,
            UnitCounterComponent.COUNTER_WIDTH_PX,
            UnitCounterComponent.STRENGTH_BAR_HEIGHT_PX,
        );
        let strengthColorValue = UiPalette.BRIGHT_BLOOD;
        if (strengthValue >= UnitCounterComponent.STRENGTH_HIGH_MINIMUM) {
            strengthColorValue = UnitCounterComponent.STRENGTH_GREEN_COLOR;
        } else if (strengthValue >= UnitCounterComponent.STRENGTH_LOW_MAXIMUM) {
            strengthColorValue = UiPalette.BRIGHT_BRASS;
        }
        this.counterGraphics.fillStyle(strengthColorValue, 1);
        this.counterGraphics.fillRect(
            0,
            UnitCounterComponent.COUNTER_HEIGHT_PX + 2,
            Math.round((UnitCounterComponent.COUNTER_WIDTH_PX * strengthValue) / 100),
            UnitCounterComponent.STRENGTH_BAR_HEIGHT_PX,
        );
        this.symbolTextObject.setText(UnitCounterComponent.getUnitAbbreviation(this.unit.getUnitCategory().getCode()));
    }

    public setSelected(isSelected: boolean): void {
        this.hasSelection = isSelected;
        this.updateDisplay();
    }

    private static getUnitAbbreviation(unitCategoryCode: string): string {
        switch (unitCategoryCode) {
            case "infantry":
                return "INF";
            case "armor":
                return "ARM";
            case "artillery":
                return "ART";
            case "cavalry":
                return "CAV";
            case "air":
                return "AIR";
            case "naval":
                return "NAV";
            case "submarine":
                return "SUB";
            case "carrier":
                return "CAR";
            case "garrison":
                return "GAR";
            case "engineer":
                return "ENG";
            case "medic":
                return "MED";
            case "headquarters":
                return "HQ";
            case "militia":
                return "MIL";
            case "mechanized":
                return "MEC";
            case "paratrooper":
                return "PAR";
            case "marine":
                return "MAR";
            default:
                return "UNK";
        }
    }
}
