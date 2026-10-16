import Phaser from "phaser";

import type { Nation } from "../domain/Nation";
import { FontFamilies } from "../managers/FontManager";
import type { MilitaryManager } from "../managers/MilitaryManager";
import { UnitCategory } from "../types/UnitCategory";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class DivisionDesignerComponent extends Phaser.GameObjects.Container {
    private static readonly REGIMENT_SLOT_COUNT = 5;
    private static readonly REGIMENT_SLOT_WIDTH_PX = 44;
    private static readonly REGIMENT_SLOT_HEIGHT_PX = 60;
    private static readonly REGIMENT_SLOT_GAP_PX = 8;
    private static readonly PALETTE_CATEGORY_CODES: string[] = [
        "infantry",
        "artillery",
        "armor",
        "engineer",
        "medic",
        "mechanized",
    ];

    private readonly slotCategoryCodeBySlotIndex: Array<string | null>;
    private readonly slotGraphicsBySlotIndex: Phaser.GameObjects.Graphics[];
    private readonly slotTextBySlotIndex: Phaser.GameObjects.Text[];
    private readonly paletteCategoryList: UnitCategory[];
    private readonly paletteGraphicsByCategoryCode: Map<string, Phaser.GameObjects.Graphics>;
    private readonly paletteChipWidthPx: number;
    private readonly combatPowerTextObject: Phaser.GameObjects.Text;
    private activeNation: Nation | null;
    private activeMilitaryManager: MilitaryManager | null;
    private activeProvinceIdentifier: string;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.slotCategoryCodeBySlotIndex = [null, null, null, null, null];
        this.slotGraphicsBySlotIndex = [];
        this.slotTextBySlotIndex = [];
        this.paletteCategoryList = [];
        this.paletteGraphicsByCategoryCode = new Map<string, Phaser.GameObjects.Graphics>();
        this.paletteChipWidthPx = (width - 36) / 2;
        this.activeNation = null;
        this.activeMilitaryManager = null;
        this.activeProvinceIdentifier = "";
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_PANEL);
        this.setSize(width, height);

        const titleTextObject = UiPanelFactory.createSectionHeader(scene, 12, 8, "Division Designer", 18);
        this.add(titleTextObject);

        for (let slotIndex = 0; slotIndex < DivisionDesignerComponent.REGIMENT_SLOT_COUNT; slotIndex++) {
            const slotLeftX =
                12 +
                slotIndex *
                    (DivisionDesignerComponent.REGIMENT_SLOT_WIDTH_PX + DivisionDesignerComponent.REGIMENT_SLOT_GAP_PX);
            const slotGraphics = scene.add.graphics();
            slotGraphics.setPosition(slotLeftX, 42);
            const slotCenterX = slotLeftX + DivisionDesignerComponent.REGIMENT_SLOT_WIDTH_PX / 2;
            const slotTextObject = scene.add.text(
                slotCenterX,
                42 + DivisionDesignerComponent.REGIMENT_SLOT_HEIGHT_PX / 2,
                "",
                {
                    fontFamily: FontFamilies.DISPLAY_SERIF,
                    fontSize: "12px",
                    color: UiPalette.PARCHMENT_CSS,
                    align: "center",
                    wordWrap: { width: DivisionDesignerComponent.REGIMENT_SLOT_WIDTH_PX - 4, useAdvancedWrap: true },
                },
            );
            slotTextObject.setOrigin(0.5, 0.5);
            const slotZone = scene.add
                .zone(
                    slotLeftX,
                    42,
                    DivisionDesignerComponent.REGIMENT_SLOT_WIDTH_PX,
                    DivisionDesignerComponent.REGIMENT_SLOT_HEIGHT_PX,
                )
                .setOrigin(0, 0);
            slotZone.setInteractive({ useHandCursor: true });
            slotZone.on("pointerup", () => {
                this.handleSlotClicked(slotIndex);
            });
            this.slotGraphicsBySlotIndex.push(slotGraphics);
            this.slotTextBySlotIndex.push(slotTextObject);
            this.add(slotGraphics);
            this.add(slotTextObject);
            this.add(slotZone);
        }

        for (const paletteCategoryCode of DivisionDesignerComponent.PALETTE_CATEGORY_CODES) {
            const paletteCategory = UnitCategory.findByUnitCategoryCode(paletteCategoryCode);
            if (paletteCategory !== null) {
                this.paletteCategoryList.push(paletteCategory);
            }
        }
        for (let categoryIndex = 0; categoryIndex < this.paletteCategoryList.length; categoryIndex++) {
            const paletteCategory = this.paletteCategoryList[categoryIndex];
            const chipLeftX = 12 + (categoryIndex % 2) * (this.paletteChipWidthPx + 12);
            const chipTopY = 120 + Math.floor(categoryIndex / 2) * 36;
            const chipGraphics = scene.add.graphics();
            chipGraphics.setPosition(chipLeftX, chipTopY);
            const chipLabelTextObject = scene.add.text(
                chipLeftX + this.paletteChipWidthPx / 2,
                chipTopY + 14,
                paletteCategory.getDisplayName(),
                {
                    fontFamily: FontFamilies.DISPLAY_SERIF,
                    fontSize: "14px",
                    color: UiPalette.PARCHMENT_CSS,
                },
            );
            chipLabelTextObject.setOrigin(0.5, 0.5);
            const chipZone = scene.add.zone(chipLeftX, chipTopY, this.paletteChipWidthPx, 28).setOrigin(0, 0);
            chipZone.setInteractive({ useHandCursor: true });
            chipZone.on("pointerup", () => {
                this.handlePaletteCategoryClicked(paletteCategory);
            });
            this.paletteGraphicsByCategoryCode.set(paletteCategory.getCode(), chipGraphics);
            this.add(chipGraphics);
            this.add(chipLabelTextObject);
            this.add(chipZone);
        }

        this.combatPowerTextObject = scene.add.text(12, 238, "Combat power: 0", {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "15px",
            color: UiPalette.BRIGHT_BRASS_CSS,
        });
        const raiseDivisionButton = UiPanelFactory.createBrassButton(scene, 12, 264, 160, 36, "Raise Division", () =>
            this.handleRaiseDivision(),
        );
        this.add(this.combatPowerTextObject);
        this.add(raiseDivisionButton);

        this.redrawSlots();
        this.redrawPalette();
    }

    public openDesignerForNation(nation: Nation, militaryManager: MilitaryManager, provinceIdentifier: string): void {
        this.activeNation = nation;
        this.activeMilitaryManager = militaryManager;
        this.activeProvinceIdentifier = provinceIdentifier;
        for (let slotIndex = 0; slotIndex < this.slotCategoryCodeBySlotIndex.length; slotIndex++) {
            this.slotCategoryCodeBySlotIndex[slotIndex] = null;
        }
        this.redrawSlots();
        this.updateCombatPowerLabel();
    }

    private handleSlotClicked(slotIndex: number): void {
        if (this.slotCategoryCodeBySlotIndex[slotIndex] === null) {
            return;
        }
        this.slotCategoryCodeBySlotIndex[slotIndex] = null;
        this.redrawSlots();
        this.updateCombatPowerLabel();
    }

    private handlePaletteCategoryClicked(paletteCategory: UnitCategory): void {
        const emptySlotIndex = this.slotCategoryCodeBySlotIndex.indexOf(null);
        if (emptySlotIndex < 0) {
            return;
        }
        this.slotCategoryCodeBySlotIndex[emptySlotIndex] = paletteCategory.getCode();
        this.redrawSlots();
        this.updateCombatPowerLabel();
    }

    private handleRaiseDivision(): void {
        if (this.activeNation === null || this.activeMilitaryManager === null) {
            return;
        }
        const firstFilledCategoryCode = this.slotCategoryCodeBySlotIndex.find(
            (slotCategoryCode) => slotCategoryCode !== null,
        );
        if (firstFilledCategoryCode === undefined || firstFilledCategoryCode === null) {
            return;
        }
        const divisionNumber =
            this.activeMilitaryManager.getUnitsForNation(this.activeNation.getIdentifier()).length + 1;
        // ponytail: ordinal suffixes ("1st", "2nd") when the numbering polish matters
        const divisionName = divisionNumber + "th Division";
        const divisionCategory = UnitCategory.findByUnitCategoryCode(firstFilledCategoryCode) ?? UnitCategory.INFANTRY;
        this.activeMilitaryManager.recruitUnit(
            this.activeNation,
            divisionCategory,
            this.activeProvinceIdentifier,
            divisionName,
        );
        for (let slotIndex = 0; slotIndex < this.slotCategoryCodeBySlotIndex.length; slotIndex++) {
            this.slotCategoryCodeBySlotIndex[slotIndex] = null;
        }
        this.redrawSlots();
        this.updateCombatPowerLabel();
    }

    private redrawSlots(): void {
        for (let slotIndex = 0; slotIndex < this.slotCategoryCodeBySlotIndex.length; slotIndex++) {
            const slotCategoryCode = this.slotCategoryCodeBySlotIndex[slotIndex];
            const isFilled = slotCategoryCode !== null;
            const slotGraphics = this.slotGraphicsBySlotIndex[slotIndex];
            slotGraphics.clear();
            slotGraphics.fillStyle(isFilled ? UiPalette.MID_OLIVE : UiPalette.DARK_OLIVE, 1);
            slotGraphics.fillRect(
                0,
                0,
                DivisionDesignerComponent.REGIMENT_SLOT_WIDTH_PX,
                DivisionDesignerComponent.REGIMENT_SLOT_HEIGHT_PX,
            );
            slotGraphics.lineStyle(isFilled ? 2 : 1, isFilled ? UiPalette.BRIGHT_BRASS : UiPalette.FIELD_GRAY, 0.95);
            slotGraphics.strokeRect(
                1,
                1,
                DivisionDesignerComponent.REGIMENT_SLOT_WIDTH_PX - 2,
                DivisionDesignerComponent.REGIMENT_SLOT_HEIGHT_PX - 2,
            );
            if (slotCategoryCode === null) {
                this.slotTextBySlotIndex[slotIndex].setText("");
                continue;
            }
            const slotCategory = UnitCategory.findByUnitCategoryCode(slotCategoryCode);
            this.slotTextBySlotIndex[slotIndex].setText(
                slotCategory === null ? slotCategoryCode : slotCategory.getDisplayName(),
            );
        }
    }

    private redrawPalette(): void {
        for (const paletteCategory of this.paletteCategoryList) {
            const chipGraphics = this.paletteGraphicsByCategoryCode.get(paletteCategory.getCode());
            if (chipGraphics === undefined) {
                continue;
            }
            chipGraphics.clear();
            chipGraphics.fillStyle(UiPalette.MID_OLIVE, 1);
            chipGraphics.fillRect(0, 0, this.paletteChipWidthPx, 28);
            chipGraphics.lineStyle(2, UiPalette.BRASS_TAN, 0.95);
            chipGraphics.strokeRect(1, 1, this.paletteChipWidthPx - 2, 26);
        }
    }

    private updateCombatPowerLabel(): void {
        let totalCombatPower = 0;
        for (const slotCategoryCode of this.slotCategoryCodeBySlotIndex) {
            if (slotCategoryCode !== null) {
                totalCombatPower += DivisionDesignerComponent.getCategoryWeight(slotCategoryCode);
            }
        }
        this.combatPowerTextObject.setText("Combat power: " + totalCombatPower);
    }

    private static getCategoryWeight(unitCategoryCode: string): number {
        switch (unitCategoryCode) {
            case "infantry":
                return 10;
            case "artillery":
                return 8;
            case "armor":
                return 14;
            case "engineer":
                return 6;
            case "medic":
                return 3;
            case "mechanized":
                return 12;
            default:
                return 5;
        }
    }
}
