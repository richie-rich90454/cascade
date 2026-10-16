import Phaser from "phaser";

import { EventBus, GameEventTypes, MechanicCompletedPayload } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { ContinuityChangeDefinition } from "../domain/scenarios/Scenario";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class ContinuityChangeChartComponent extends Phaser.GameObjects.Container {
    private readonly panelWidth: number;
    private readonly markerClassifications: string[] = [];
    private readonly markerChipGraphics: Phaser.GameObjects.Graphics[] = [];
    private readonly markerChipTexts: Phaser.GameObjects.Text[] = [];
    private readonly markerExplanationTexts: Phaser.GameObjects.Text[] = [];

    private feedbackTextObject: Phaser.GameObjects.Text | null = null;
    private hasCompletedChart: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.panelWidth = width;
        scene.add.existing(this);
        this.setSize(width, height);
    }

    public setContinuityChangeDefinition(
        definition: ContinuityChangeDefinition,
        scenarioNumber: number,
        gameState: GameState,
    ): void {
        this.removeAll(true);
        this.markerClassifications.length = 0;
        this.markerChipGraphics.length = 0;
        this.markerChipTexts.length = 0;
        this.markerExplanationTexts.length = 0;
        this.feedbackTextObject = null;
        this.hasCompletedChart = false;
        const titleTextObject = UiPanelFactory.createSectionHeader(this.scene, 16, 12, definition.chartTitle, 20);
        this.add(titleTextObject);
        const instructionTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            44,
            this.panelWidth - 32,
            "Click each marker chip on the timeline to classify it as a continuity or a change.",
            13,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(instructionTextObject);
        this.feedbackTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            68,
            this.panelWidth - 32,
            "",
            13,
            UiPalette.HIGHLIGHT_BRASS_CSS,
        );
        this.add(this.feedbackTextObject);
        const timelineY = 230;
        const timelineStartX = 40;
        const timelineEndX = this.panelWidth - 40;
        const timelineGraphics = this.scene.add.graphics();
        timelineGraphics.lineStyle(2, UiPalette.FIELD_GRAY, 1);
        timelineGraphics.lineBetween(timelineStartX, timelineY, timelineEndX, timelineY);
        this.add(timelineGraphics);
        const startYearTextObject = this.scene.add.text(timelineStartX, timelineY + 8, String(definition.startYear), {
            fontFamily: FontFamilies.TYPEWRITER_BODY,
            fontSize: "13px",
            color: UiPalette.PARCHMENT_CSS,
        });
        const endYearTextObject = this.scene.add.text(timelineEndX, timelineY + 8, String(definition.endYear), {
            fontFamily: FontFamilies.TYPEWRITER_BODY,
            fontSize: "13px",
            color: UiPalette.PARCHMENT_CSS,
        });
        endYearTextObject.setOrigin(1, 0);
        this.add(startYearTextObject);
        this.add(endYearTextObject);
        const chipVerticalOffsets = [-120, 14, -70, 60];
        const explanationTopY = 350;
        for (let markerIndex = 0; markerIndex < definition.markers.length; markerIndex++) {
            const marker = definition.markers[markerIndex];
            const yearRange = definition.endYear - definition.startYear;
            const yearRatio = yearRange <= 0 ? 0 : (marker.markerYear - definition.startYear) / yearRange;
            const markerX = timelineStartX + Math.max(0, Math.min(1, yearRatio)) * (timelineEndX - timelineStartX);
            const tickGraphics = this.scene.add.graphics();
            tickGraphics.lineStyle(1, UiPalette.BRASS_TAN, 0.9);
            tickGraphics.lineBetween(markerX, timelineY - 6, markerX, timelineY + 6);
            this.add(tickGraphics);
            const chipY = timelineY + chipVerticalOffsets[markerIndex % 4];
            const chipX = Math.max(8, Math.min(this.panelWidth - 178, markerX - 85));
            this.buildMarkerChip(markerIndex, marker.markerLabel, chipX, chipY, definition, scenarioNumber, gameState);
            const explanationTextObject = UiPanelFactory.createBodyText(
                this.scene,
                16,
                explanationTopY + markerIndex * 52,
                this.panelWidth - 32,
                marker.explanationText,
                13,
                UiPalette.AGED_PARCHMENT_CSS,
            );
            explanationTextObject.setVisible(false);
            this.add(explanationTextObject);
            this.markerExplanationTexts.push(explanationTextObject);
        }
    }

    private buildMarkerChip(
        markerIndex: number,
        markerLabel: string,
        chipX: number,
        chipY: number,
        definition: ContinuityChangeDefinition,
        scenarioNumber: number,
        gameState: GameState,
    ): void {
        const chipZone = this.scene.add.zone(0, 0, 170, 30).setOrigin(0, 0);
        chipZone.setInteractive({ useHandCursor: true });
        chipZone.on("pointerdown", () => {
            this.handleMarkerClicked(markerIndex, definition, scenarioNumber, gameState);
        });
        const chipGraphics = this.scene.add.graphics();
        const chipTextObject = this.scene.add.text(85, 15, "", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "14px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
        });
        chipTextObject.setOrigin(0.5, 0.5);
        const chipContainer = this.scene.add.container(chipX, chipY);
        chipContainer.add(chipGraphics);
        chipContainer.add(chipTextObject);
        chipContainer.add(chipZone);
        this.add(chipContainer);
        const markerLabelTextObject = this.scene.add.text(chipX + 4, chipY + 32, markerLabel, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "13px",
            color: UiPalette.AGED_PARCHMENT_CSS,
            wordWrap: { width: 170, useAdvancedWrap: true },
        });
        this.add(markerLabelTextObject);
        this.markerClassifications.push("");
        this.markerChipGraphics.push(chipGraphics);
        this.markerChipTexts.push(chipTextObject);
        this.refreshMarkerChip(markerIndex);
    }

    private handleMarkerClicked(
        markerIndex: number,
        definition: ContinuityChangeDefinition,
        scenarioNumber: number,
        gameState: GameState,
    ): void {
        if (this.hasCompletedChart) {
            return;
        }
        const currentClassification = this.markerClassifications[markerIndex];
        this.markerClassifications[markerIndex] = currentClassification === "continuity" ? "change" : "continuity";
        this.refreshMarkerChip(markerIndex);
        this.updateCompletionState(definition, scenarioNumber, gameState);
    }

    private refreshMarkerChip(markerIndex: number): void {
        const chipGraphics = this.markerChipGraphics[markerIndex];
        const chipTextObject = this.markerChipTexts[markerIndex];
        const chosenClassification = this.markerClassifications[markerIndex];
        chipGraphics.clear();
        if (chosenClassification === "") {
            chipGraphics.fillStyle(UiPalette.PARCHMENT, 1);
            chipTextObject.setColor(UiPalette.NEAR_BLACK_LEATHER_CSS);
            chipTextObject.setText("Unclassified");
        } else {
            chipGraphics.fillStyle(UiPalette.BRASS_TAN, 1);
            chipTextObject.setColor(UiPalette.NEAR_BLACK_LEATHER_CSS);
            chipTextObject.setText(chosenClassification === "continuity" ? "Continuity" : "Change");
        }
        chipGraphics.fillRect(0, 0, 170, 30);
        chipGraphics.lineStyle(2, UiPalette.DEEP_BRASS, 0.9);
        chipGraphics.strokeRect(1, 1, 168, 28);
    }

    private updateCompletionState(
        definition: ContinuityChangeDefinition,
        scenarioNumber: number,
        gameState: GameState,
    ): void {
        if (this.hasCompletedChart) {
            return;
        }
        for (let markerIndex = 0; markerIndex < definition.markers.length; markerIndex++) {
            const expectedClassification = definition.markers[markerIndex].classification.toLowerCase();
            if (this.markerClassifications[markerIndex] !== expectedClassification) {
                return;
            }
        }
        this.hasCompletedChart = true;
        for (const markerExplanationText of this.markerExplanationTexts) {
            markerExplanationText.setVisible(true);
        }
        gameState.setScenarioFlag("continuity_chart_s" + scenarioNumber + "_complete");
        if (this.feedbackTextObject !== null) {
            this.feedbackTextObject.setText("Chart complete. Every marker is classified correctly.");
        }
        EventBus.getInstance().publish(
            GameEventTypes.CONTINUITY_CHART_COMPLETED,
            new MechanicCompletedPayload("continuity_chart", scenarioNumber),
        );
    }
}
