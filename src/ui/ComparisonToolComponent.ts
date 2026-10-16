import Phaser from "phaser";

import { EventBus, GameEventTypes, MechanicCompletedPayload } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { ComparisonDefinition } from "../domain/scenarios/Scenario";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class ComparisonToolComponent extends Phaser.GameObjects.Container {
    private readonly panelWidth: number;
    private readonly rowRevealStates: boolean[] = [];
    private readonly chosenClassificationByRowIndex: string[] = [];
    private readonly leftAnswerTextObjects: Phaser.GameObjects.Text[] = [];
    private readonly rightAnswerTextObjects: Phaser.GameObjects.Text[] = [];
    private readonly chipGraphicsByRowIndex: Phaser.GameObjects.Graphics[] = [];
    private readonly chipTextByRowIndex: Phaser.GameObjects.Text[] = [];

    private feedbackTextObject: Phaser.GameObjects.Text | null = null;
    private hasCompletedComparison: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.panelWidth = width;
        scene.add.existing(this);
        this.setSize(width, height);
    }

    public setComparisonDefinition(
        definition: ComparisonDefinition,
        scenarioNumber: number,
        gameState: GameState,
    ): void {
        this.removeAll(true);
        this.rowRevealStates.length = 0;
        this.chosenClassificationByRowIndex.length = 0;
        this.leftAnswerTextObjects.length = 0;
        this.rightAnswerTextObjects.length = 0;
        this.chipGraphicsByRowIndex.length = 0;
        this.chipTextByRowIndex.length = 0;
        this.feedbackTextObject = null;
        this.hasCompletedComparison = false;
        const titleTextObject = UiPanelFactory.createSectionHeader(this.scene, 16, 12, definition.comparisonTitle, 20);
        this.add(titleTextObject);
        const leftColumnX = 16;
        const rightColumnX = this.panelWidth / 2 + 8;
        const leftHeaderTextObject = this.scene.add.text(leftColumnX, 48, definition.leftColumnLabel, {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "14px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        const rightHeaderTextObject = this.scene.add.text(rightColumnX, 48, definition.rightColumnLabel, {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "14px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        this.add(leftHeaderTextObject);
        this.add(rightHeaderTextObject);
        const rowHeight = 132;
        let rowY = 76;
        for (let rowIndex = 0; rowIndex < definition.rows.length; rowIndex++) {
            this.buildComparisonRow(rowIndex, definition, scenarioNumber, gameState, rowY, rowHeight);
            rowY += rowHeight;
        }
        this.feedbackTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            rowY + 4,
            this.panelWidth - 32,
            "",
            14,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(this.feedbackTextObject);
    }

    private buildComparisonRow(
        rowIndex: number,
        definition: ComparisonDefinition,
        scenarioNumber: number,
        gameState: GameState,
        rowY: number,
        rowHeight: number,
    ): void {
        const row = definition.rows[rowIndex];
        const leftColumnX = 16;
        const rightColumnX = this.panelWidth / 2 + 8;
        const columnWidth = this.panelWidth / 2 - 24;
        const rowDividerGraphics = this.scene.add.graphics();
        rowDividerGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.6);
        rowDividerGraphics.lineBetween(16, rowY + rowHeight - 4, this.panelWidth - 16, rowY + rowHeight - 4);
        this.add(rowDividerGraphics);
        const criterionTextObject = this.scene.add.text(leftColumnX, rowY, row.criterionText, {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "14px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
            wordWrap: { width: this.panelWidth - 32, useAdvancedWrap: true },
        });
        this.add(criterionTextObject);
        const leftAnswerTextObject = this.scene.add.text(leftColumnX, rowY + 44, row.leftAnswerText, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "13px",
            color: UiPalette.PARCHMENT_CSS,
            wordWrap: { width: columnWidth, useAdvancedWrap: true },
            lineSpacing: 3,
        });
        leftAnswerTextObject.setVisible(false);
        const rightAnswerTextObject = this.scene.add.text(rightColumnX, rowY + 44, row.rightAnswerText, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "13px",
            color: UiPalette.PARCHMENT_CSS,
            wordWrap: { width: columnWidth, useAdvancedWrap: true },
            lineSpacing: 3,
        });
        rightAnswerTextObject.setVisible(false);
        this.add(leftAnswerTextObject);
        this.add(rightAnswerTextObject);
        this.leftAnswerTextObjects.push(leftAnswerTextObject);
        this.rightAnswerTextObjects.push(rightAnswerTextObject);
        this.rowRevealStates.push(false);
        this.chosenClassificationByRowIndex.push("");
        const classificationLabelTextObject = this.scene.add.text(leftColumnX, rowY + 96, "Classification", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "12px",
            color: UiPalette.AGED_PARCHMENT_CSS,
        });
        this.add(classificationLabelTextObject);
        const chipZone = this.scene.add.zone(0, 0, 150, 26).setOrigin(0, 0);
        chipZone.setInteractive({ useHandCursor: true });
        chipZone.on("pointerdown", () => {
            this.handleChipClicked(rowIndex, definition, scenarioNumber, gameState);
        });
        const chipGraphics = this.scene.add.graphics();
        const chipTextObject = this.scene.add.text(75, 13, "", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "12px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
        });
        chipTextObject.setOrigin(0.5, 0.5);
        const chipContainer = this.scene.add.container(100, rowY + 90);
        chipContainer.add(chipGraphics);
        chipContainer.add(chipTextObject);
        chipContainer.add(chipZone);
        this.add(chipContainer);
        this.chipGraphicsByRowIndex.push(chipGraphics);
        this.chipTextByRowIndex.push(chipTextObject);
        this.refreshChip(rowIndex);
        const revealButton = UiPanelFactory.createBrassButton(
            this.scene,
            rightColumnX,
            rowY + 88,
            170,
            30,
            "Reveal",
            () => {
                this.handleRevealClicked(rowIndex, definition, scenarioNumber, gameState);
            },
        );
        this.add(revealButton);
    }

    private handleChipClicked(
        rowIndex: number,
        definition: ComparisonDefinition,
        scenarioNumber: number,
        gameState: GameState,
    ): void {
        if (this.hasCompletedComparison) {
            return;
        }
        const chosenClassification = this.chosenClassificationByRowIndex[rowIndex];
        this.chosenClassificationByRowIndex[rowIndex] =
            chosenClassification === "similarity" ? "difference" : "similarity";
        this.refreshChip(rowIndex);
        this.updateCompletionState(definition, scenarioNumber, gameState);
    }

    private handleRevealClicked(
        rowIndex: number,
        definition: ComparisonDefinition,
        scenarioNumber: number,
        gameState: GameState,
    ): void {
        this.rowRevealStates[rowIndex] = true;
        this.leftAnswerTextObjects[rowIndex].setVisible(true);
        this.rightAnswerTextObjects[rowIndex].setVisible(true);
        this.updateCompletionState(definition, scenarioNumber, gameState);
    }

    private refreshChip(rowIndex: number): void {
        const chipGraphics = this.chipGraphicsByRowIndex[rowIndex];
        const chipTextObject = this.chipTextByRowIndex[rowIndex];
        const chosenClassification = this.chosenClassificationByRowIndex[rowIndex];
        chipGraphics.clear();
        if (chosenClassification === "") {
            chipGraphics.fillStyle(UiPalette.PARCHMENT, 1);
            chipTextObject.setColor(UiPalette.NEAR_BLACK_LEATHER_CSS);
            chipTextObject.setText("Unclassified");
        } else {
            chipGraphics.fillStyle(UiPalette.BRASS_TAN, 1);
            chipTextObject.setColor(UiPalette.NEAR_BLACK_LEATHER_CSS);
            chipTextObject.setText(chosenClassification === "similarity" ? "Similarity" : "Difference");
        }
        chipGraphics.fillRect(0, 0, 150, 26);
        chipGraphics.lineStyle(2, UiPalette.DEEP_BRASS, 0.9);
        chipGraphics.strokeRect(1, 1, 148, 24);
    }

    private updateCompletionState(
        definition: ComparisonDefinition,
        scenarioNumber: number,
        gameState: GameState,
    ): void {
        if (this.hasCompletedComparison) {
            return;
        }
        for (let rowIndex = 0; rowIndex < definition.rows.length; rowIndex++) {
            if (!this.rowRevealStates[rowIndex]) {
                return;
            }
            const expectedClassification = definition.rows[rowIndex].isSimilarity ? "similarity" : "difference";
            if (this.chosenClassificationByRowIndex[rowIndex] !== expectedClassification) {
                return;
            }
        }
        this.hasCompletedComparison = true;
        gameState.setScenarioFlag("comparison_s" + scenarioNumber + "_complete");
        if (this.feedbackTextObject !== null) {
            this.feedbackTextObject.setText("Comparison complete. Every row is revealed and classified correctly.");
        }
        EventBus.getInstance().publish(
            GameEventTypes.COMPARISON_COMPLETED,
            new MechanicCompletedPayload("comparison", scenarioNumber),
        );
    }
}
