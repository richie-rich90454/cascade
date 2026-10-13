import Phaser from "phaser";

import { Units } from "../data/Units";
import type { Nation } from "../domain/Nation";
import type { ProductionQueueItem, EconomyManager } from "../managers/EconomyManager";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class ProductionQueueComponent extends Phaser.GameObjects.Container {
    private static readonly ROW_HEIGHT_PX = 46;
    private static readonly LIST_ROW_HEIGHT_PX = 20;

    private readonly componentWidthPx: number;
    private readonly queueItemContainer: Phaser.GameObjects.Container;
    private readonly productionPowerTextObject: Phaser.GameObjects.Text;
    private readonly templateListContainer: Phaser.GameObjects.Container;
    private onQueueItemRequested: ((unitTemplateIdentifier: string) => void) | null;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.componentWidthPx = width;
        this.onQueueItemRequested = null;
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_PANEL);
        this.setSize(width, height);

        const titleTextObject = UiPanelFactory.createSectionHeader(scene, 12, 8, "Production Queue", 18);
        this.productionPowerTextObject = UiPanelFactory.createBodyText(
            scene,
            12,
            34,
            width - 24,
            "",
            13,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.queueItemContainer = scene.add.container(0, 58);
        this.templateListContainer = scene.add.container(12, height - 236);
        this.templateListContainer.setVisible(false);
        this.createTemplateListRows(scene, width);

        const addProductionButton = UiPanelFactory.createBrassButton(
            scene,
            12,
            height - 42,
            170,
            32,
            "+ Add Production",
            () => {
                this.templateListContainer.setVisible(!this.templateListContainer.visible);
            },
        );

        this.add(titleTextObject);
        this.add(this.productionPowerTextObject);
        this.add(this.queueItemContainer);
        this.add(this.templateListContainer);
        this.add(addProductionButton);
    }

    public setProductionQueue(queueItems: ProductionQueueItem[], nation: Nation, economyManager: EconomyManager): void {
        this.productionPowerTextObject.setText(
            `${nation.getDisplayName()} - Production power: ${economyManager.computeProductionPowerPerTurn(nation)} per turn`,
        );
        this.queueItemContainer.removeAll(true);
        for (let itemIndex = 0; itemIndex < queueItems.length; itemIndex++) {
            const queueItem = queueItems[itemIndex];
            const itemRowContainer = this.scene.add.container(12, itemIndex * ProductionQueueComponent.ROW_HEIGHT_PX);
            const unitTemplate = Units.findUnitTemplateByIdentifier(queueItem.unitTemplateIdentifier);
            const itemNameText = unitTemplate === null ? queueItem.unitTemplateIdentifier : unitTemplate.displayName;
            const itemNameTextObject = this.scene.add.text(0, 0, itemNameText, {
                fontFamily: FontFamilies.DISPLAY_SERIF,
                fontSize: "14px",
                color: UiPalette.PARCHMENT_CSS,
            });
            const factoriesTextObject = this.scene.add.text(0, 17, "Factories: " + queueItem.assignedFactoryCount, {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "12px",
                color: UiPalette.AGED_PARCHMENT_CSS,
            });
            const barWidthPx = this.componentWidthPx - 90;
            const completionPercentage = queueItem.getCompletionPercentage();
            const progressGraphics = this.scene.add.graphics();
            progressGraphics.fillStyle(UiPalette.MID_OLIVE, 1);
            progressGraphics.fillRect(0, 33, barWidthPx, 8);
            progressGraphics.fillStyle(UiPalette.BRIGHT_BRASS, 1);
            progressGraphics.fillRect(0, 33, (barWidthPx * completionPercentage) / 100, 8);
            progressGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.9);
            progressGraphics.strokeRect(0.5, 33.5, barWidthPx - 1, 7);
            const percentageTextObject = this.scene.add.text(barWidthPx + 8, 28, completionPercentage + "%", {
                fontFamily: FontFamilies.TYPEWRITER_BODY,
                fontSize: "11px",
                color: UiPalette.AGED_PARCHMENT_CSS,
            });
            itemRowContainer.add(itemNameTextObject);
            itemRowContainer.add(factoriesTextObject);
            itemRowContainer.add(progressGraphics);
            itemRowContainer.add(percentageTextObject);
            if (queueItem.isCompleted) {
                itemRowContainer.setAlpha(0.4);
                const strikeGraphics = this.scene.add.graphics();
                strikeGraphics.lineStyle(1, UiPalette.BRIGHT_BLOOD, 1);
                strikeGraphics.lineBetween(0, 8, barWidthPx + 30, 8);
                itemRowContainer.add(strikeGraphics);
            }
            this.queueItemContainer.add(itemRowContainer);
        }
    }

    public setOnQueueItemRequested(onQueueItemRequested: (unitTemplateIdentifier: string) => void): void {
        this.onQueueItemRequested = onQueueItemRequested;
    }

    private createTemplateListRows(scene: Phaser.Scene, width: number): void {
        const columnWidthPx = (width - 36) / 2;
        const listBackgroundGraphics = scene.add.graphics();
        listBackgroundGraphics.fillStyle(UiPalette.DARK_OLIVE, 0.96);
        listBackgroundGraphics.fillRect(-6, -24, width - 24, 8 * ProductionQueueComponent.LIST_ROW_HEIGHT_PX + 28);
        listBackgroundGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.95);
        listBackgroundGraphics.strokeRect(-6, -24, width - 24, 8 * ProductionQueueComponent.LIST_ROW_HEIGHT_PX + 28);
        this.templateListContainer.add(listBackgroundGraphics);
        const listHeaderTextObject = scene.add.text(-2, -20, "Select a unit template", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "12px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        this.templateListContainer.add(listHeaderTextObject);

        const unitTemplates = Units.getAllUnitTemplates();
        for (let templateIndex = 0; templateIndex < unitTemplates.length; templateIndex++) {
            const unitTemplate = unitTemplates[templateIndex];
            const rowLeftX = (templateIndex % 2) * (columnWidthPx + 10);
            const rowTopY = Math.floor(templateIndex / 2) * ProductionQueueComponent.LIST_ROW_HEIGHT_PX;
            const rowGraphics = scene.add.graphics();
            rowGraphics.fillStyle(UiPalette.MID_OLIVE, 0.7);
            rowGraphics.fillRect(rowLeftX, rowTopY, columnWidthPx, ProductionQueueComponent.LIST_ROW_HEIGHT_PX - 2);
            const rowTextObject = scene.add.text(rowLeftX + 5, rowTopY + 2, unitTemplate.displayName, {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "12px",
                color: UiPalette.PARCHMENT_CSS,
            });
            const rowZone = scene.add
                .zone(rowLeftX, rowTopY, columnWidthPx, ProductionQueueComponent.LIST_ROW_HEIGHT_PX - 2)
                .setOrigin(0, 0);
            rowZone.setInteractive({ useHandCursor: true });
            rowZone.on("pointerover", () => {
                rowGraphics.clear();
                rowGraphics.fillStyle(UiPalette.DEEP_BRASS, 0.95);
                rowGraphics.fillRect(rowLeftX, rowTopY, columnWidthPx, ProductionQueueComponent.LIST_ROW_HEIGHT_PX - 2);
            });
            rowZone.on("pointerout", () => {
                rowGraphics.clear();
                rowGraphics.fillStyle(UiPalette.MID_OLIVE, 0.7);
                rowGraphics.fillRect(rowLeftX, rowTopY, columnWidthPx, ProductionQueueComponent.LIST_ROW_HEIGHT_PX - 2);
            });
            rowZone.on("pointerup", () => {
                if (this.onQueueItemRequested !== null) {
                    this.onQueueItemRequested(unitTemplate.identifier);
                }
            });
            this.templateListContainer.add(rowGraphics);
            this.templateListContainer.add(rowTextObject);
            this.templateListContainer.add(rowZone);
        }
    }
}
