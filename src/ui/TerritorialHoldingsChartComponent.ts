import Phaser from "phaser";

import { EventBus, GameEventTypes, MechanicCompletedPayload } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { TerritorialHoldingsRow } from "../domain/WorldStatePresent";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class TerritorialHoldingsChartComponent extends Phaser.GameObjects.Container {
    private readonly panelWidth: number;
    private readonly expectedClassificationByRowIndex: string[] = [];
    private readonly chosenClassificationByRowIndex: string[] = [];
    private readonly chipGraphicsByRowIndex: Phaser.GameObjects.Graphics[] = [];
    private readonly chipTextByRowIndex: Phaser.GameObjects.Text[] = [];

    private feedbackTextObject: Phaser.GameObjects.Text | null = null;
    private hasCompletedChart: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.panelWidth = width;
        scene.add.existing(this);
        this.setSize(width, height);
    }

    public setTerritorialHoldingsRows(
        rows: TerritorialHoldingsRow[],
        scenarioNumber: number,
        gameState: GameState,
    ): void {
        this.removeAll(true);
        this.expectedClassificationByRowIndex.length = 0;
        this.chosenClassificationByRowIndex.length = 0;
        this.chipGraphicsByRowIndex.length = 0;
        this.chipTextByRowIndex.length = 0;
        this.feedbackTextObject = null;
        this.hasCompletedChart = false;
        const titleTextObject = UiPanelFactory.createSectionHeader(
            this.scene,
            16,
            12,
            "Territorial Holdings: Continuity and Change",
            18,
        );
        this.add(titleTextObject);
        const instructionTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            44,
            this.panelWidth - 32,
            "Classify each holding by clicking its chip until it reads Continuity or Change.",
            13,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(instructionTextObject);
        const holdingWidthPx = 160;
        const classificationX = this.panelWidth - 146;
        const status1900X = 16 + holdingWidthPx + 8;
        const statusColumnWidthPx = (classificationX - 8 - status1900X) / 2;
        const statusPresentX = status1900X + statusColumnWidthPx + 8;
        const headerLabels = ["Holding", "Status in 1900", "Status in Present", "Classification"];
        const headerPositions = [16, status1900X, statusPresentX, classificationX];
        for (let headerIndex = 0; headerIndex < headerLabels.length; headerIndex++) {
            const headerTextObject = this.scene.add.text(headerPositions[headerIndex], 74, headerLabels[headerIndex], {
                fontFamily: FontFamilies.SMALL_CAPS,
                fontSize: "12px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
            });
            this.add(headerTextObject);
        }
        const rowTopY = 98;
        const rowHeightPx = 56;
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const rowY = rowTopY + rowIndex * rowHeightPx;
            this.buildHoldingRow(
                rowIndex,
                rows[rowIndex],
                rowY,
                status1900X,
                statusPresentX,
                classificationX,
                statusColumnWidthPx,
                scenarioNumber,
                gameState,
            );
        }
        const tableBottomY = rowTopY + rows.length * rowHeightPx;
        const dividerGraphics = this.scene.add.graphics();
        dividerGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.6);
        dividerGraphics.lineBetween(16, tableBottomY, this.panelWidth - 16, tableBottomY);
        this.add(dividerGraphics);
        this.feedbackTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            tableBottomY + 12,
            this.panelWidth - 32,
            "",
            14,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(this.feedbackTextObject);
    }

    private buildHoldingRow(
        rowIndex: number,
        row: TerritorialHoldingsRow,
        rowY: number,
        status1900X: number,
        statusPresentX: number,
        classificationX: number,
        statusColumnWidthPx: number,
        scenarioNumber: number,
        gameState: GameState,
    ): void {
        const holdingTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            rowY,
            148,
            row.holdingDisplayName,
            13,
            UiPalette.HIGHLIGHT_BRASS_CSS,
        );
        const status1900TextObject = UiPanelFactory.createBodyText(
            this.scene,
            status1900X,
            rowY,
            statusColumnWidthPx,
            row.statusIn1900,
            12,
            UiPalette.PARCHMENT_CSS,
        );
        const statusPresentTextObject = UiPanelFactory.createBodyText(
            this.scene,
            statusPresentX,
            rowY,
            statusColumnWidthPx,
            row.statusInPresent,
            12,
            UiPalette.PARCHMENT_CSS,
        );
        this.add(holdingTextObject);
        this.add(status1900TextObject);
        this.add(statusPresentTextObject);
        const chipZone = this.scene.add.zone(0, 0, 130, 26).setOrigin(0, 0);
        chipZone.setInteractive({ useHandCursor: true });
        chipZone.on("pointerdown", () => {
            this.handleChipClicked(rowIndex, scenarioNumber, gameState);
        });
        const chipGraphics = this.scene.add.graphics();
        const chipTextObject = this.scene.add.text(65, 13, "", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "12px",
            color: UiPalette.FIELD_GRAY_CSS,
        });
        chipTextObject.setOrigin(0.5, 0.5);
        const chipContainer = this.scene.add.container(classificationX, rowY + 14);
        chipContainer.add(chipGraphics);
        chipContainer.add(chipTextObject);
        chipContainer.add(chipZone);
        this.add(chipContainer);
        this.expectedClassificationByRowIndex.push(row.classificationAsContinuityOrChange.toLowerCase());
        this.chosenClassificationByRowIndex.push("");
        this.chipGraphicsByRowIndex.push(chipGraphics);
        this.chipTextByRowIndex.push(chipTextObject);
        this.refreshChip(rowIndex);
    }

    private handleChipClicked(rowIndex: number, scenarioNumber: number, gameState: GameState): void {
        if (this.hasCompletedChart) {
            return;
        }
        const currentClassification = this.chosenClassificationByRowIndex[rowIndex];
        this.chosenClassificationByRowIndex[rowIndex] =
            currentClassification === "continuity" ? "change" : "continuity";
        this.refreshChip(rowIndex);
        this.updateCompletionState(scenarioNumber, gameState);
    }

    private refreshChip(rowIndex: number): void {
        const chipGraphics = this.chipGraphicsByRowIndex[rowIndex];
        const chipTextObject = this.chipTextByRowIndex[rowIndex];
        const chosenClassification = this.chosenClassificationByRowIndex[rowIndex];
        chipGraphics.clear();
        if (chosenClassification === "") {
            chipGraphics.fillStyle(UiPalette.PARCHMENT, 1);
            chipTextObject.setColor(UiPalette.FIELD_GRAY_CSS);
            chipTextObject.setText("Unclassified");
        } else {
            chipGraphics.fillStyle(UiPalette.BRASS_TAN, 1);
            chipTextObject.setColor(UiPalette.NEAR_BLACK_LEATHER_CSS);
            chipTextObject.setText(chosenClassification === "continuity" ? "Continuity" : "Change");
        }
        chipGraphics.fillRect(0, 0, 130, 26);
        chipGraphics.lineStyle(2, UiPalette.DEEP_BRASS, 0.9);
        chipGraphics.strokeRect(1, 1, 128, 24);
    }

    private updateCompletionState(scenarioNumber: number, gameState: GameState): void {
        if (this.hasCompletedChart) {
            return;
        }
        for (let rowIndex = 0; rowIndex < this.expectedClassificationByRowIndex.length; rowIndex++) {
            if (this.chosenClassificationByRowIndex[rowIndex] !== this.expectedClassificationByRowIndex[rowIndex]) {
                return;
            }
        }
        this.hasCompletedChart = true;
        gameState.setScenarioFlag("territorial_chart_s" + scenarioNumber + "_complete");
        if (this.feedbackTextObject !== null) {
            this.feedbackTextObject.setText("Chart complete. Every holding is classified correctly.");
        }
        EventBus.getInstance().publish(
            GameEventTypes.MECHANIC_COMPLETED,
            new MechanicCompletedPayload("territorial_chart", scenarioNumber),
        );
    }
}
