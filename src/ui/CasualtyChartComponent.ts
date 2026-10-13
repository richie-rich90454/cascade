import Phaser from "phaser";

import { FontFamilies } from "../managers/FontManager";
import { UnitCategory } from "../types/UnitCategory";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class CasualtyChartComponent extends Phaser.GameObjects.Container {
    private readonly panelWidth: number;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.panelWidth = width;
        scene.add.existing(this);
        this.setSize(width, height);
    }

    public setCasualtyData(casualtiesByCategory: Map<string, number>, titleText: string): void {
        this.removeAll(true);
        const titleTextObject = UiPanelFactory.createSectionHeader(this.scene, 16, 12, titleText, 20);
        this.add(titleTextObject);
        if (casualtiesByCategory.size === 0) {
            const emptyTextObject = UiPanelFactory.createBodyText(
                this.scene,
                16,
                56,
                this.panelWidth - 32,
                "No casualty data is available.",
                14,
                UiPalette.AGED_PARCHMENT_CSS,
            );
            this.add(emptyTextObject);
            return;
        }
        const categoryCodes: string[] = Array.from(casualtiesByCategory.keys());
        categoryCodes.sort((leftCode, rightCode) => {
            return (casualtiesByCategory.get(rightCode) ?? 0) - (casualtiesByCategory.get(leftCode) ?? 0);
        });
        let maximumCasualtyCount = 1;
        for (const casualtyCount of casualtiesByCategory.values()) {
            if (casualtyCount > maximumCasualtyCount) {
                maximumCasualtyCount = casualtyCount;
            }
        }
        const labelWidthPx = 190;
        const barMaximumWidthPx = Math.max(60, this.panelWidth - labelWidthPx - 120);
        const rowHeightPx = 30;
        let rowY = 56;
        const chartGraphics = this.scene.add.graphics();
        this.add(chartGraphics);
        for (const categoryCode of categoryCodes) {
            const casualtyCount = casualtiesByCategory.get(categoryCode) ?? 0;
            const unitCategory = UnitCategory.findByUnitCategoryCode(categoryCode);
            const categoryDisplayName = unitCategory === null ? categoryCode : unitCategory.getDisplayName();
            const barWidthPx = Math.max(2, (casualtyCount / maximumCasualtyCount) * barMaximumWidthPx);
            const categoryLabelTextObject = UiPanelFactory.createBodyText(
                this.scene,
                16,
                rowY,
                labelWidthPx - 12,
                categoryDisplayName,
                14,
                UiPalette.PARCHMENT_CSS,
            );
            this.add(categoryLabelTextObject);
            chartGraphics.fillStyle(UiPalette.BLOOD_RED, 1);
            chartGraphics.fillRect(labelWidthPx, rowY + 3, barWidthPx, 18);
            chartGraphics.lineStyle(1, UiPalette.BRIGHT_BLOOD, 0.9);
            chartGraphics.strokeRect(labelWidthPx + 0.5, rowY + 3.5, barWidthPx - 1, 17);
            const casualtyCountTextObject = this.scene.add.text(
                labelWidthPx + barWidthPx + 8,
                rowY + 2,
                casualtyCount.toLocaleString("en-US"),
                {
                    fontFamily: FontFamilies.TYPEWRITER_BODY,
                    fontSize: "14px",
                    color: UiPalette.HIGHLIGHT_BRASS_CSS,
                },
            );
            this.add(casualtyCountTextObject);
            rowY += rowHeightPx;
        }
    }
}
