import Phaser from "phaser";

import { EventBus, GameEventTypes, SourceAnalysisPayload } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { PrimarySource } from "../data/PrimarySource";
import { FontFamilies } from "../managers/FontManager";
import type { IntelligenceManager } from "../managers/IntelligenceManager";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class SourceAnalysisComponent extends Phaser.GameObjects.Container {
    private readonly panelWidth: number;
    private readonly modelAnswerTexts: Phaser.GameObjects.Text[] = [];

    private rationaleTextObject: Phaser.GameObjects.Text | null = null;
    private hasAnsweredAnalysisQuestion: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.panelWidth = width;
        scene.add.existing(this);
        this.setSize(width, height);
    }

    public setPrimarySource(
        primarySource: PrimarySource,
        scenarioNumber: number,
        gameState: GameState,
        intelligenceManager: IntelligenceManager,
    ): void {
        this.removeAll(true);
        this.modelAnswerTexts.length = 0;
        this.rationaleTextObject = null;
        this.hasAnsweredAnalysisQuestion = false;
        const titleTextObject = UiPanelFactory.createSectionHeader(
            this.scene,
            16,
            12,
            primarySource.sourceDisplayTitle,
            20,
        );
        this.add(titleTextObject);
        const originTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            46,
            this.panelWidth - 32,
            primarySource.authorOrOrigin + ", " + primarySource.dateText + ".",
            13,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(originTextObject);
        const sourceTypeTextObject = this.scene.add.text(16, 66, primarySource.sourceType, {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "12px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        this.add(sourceTypeTextObject);
        const excerptTopY = 92;
        const excerptTextObject = this.scene.add.text(26, excerptTopY + 12, primarySource.excerptText, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontStyle: "italic",
            fontSize: "14px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            wordWrap: { width: this.panelWidth - 52, useAdvancedWrap: true },
            lineSpacing: 3,
        });
        const excerptFrameGraphics = this.scene.add.graphics();
        excerptFrameGraphics.fillStyle(UiPalette.PARCHMENT, 1);
        excerptFrameGraphics.fillRect(16, excerptTopY, this.panelWidth - 32, excerptTextObject.height + 24);
        excerptFrameGraphics.lineStyle(2, UiPalette.DEEP_BRASS, 0.9);
        excerptFrameGraphics.strokeRect(17, excerptTopY + 1, this.panelWidth - 34, excerptTextObject.height + 22);
        this.add(excerptFrameGraphics);
        this.add(excerptTextObject);
        let cursorY = excerptTopY + excerptTextObject.height + 40;
        const promptLabels = ["Point of view", "Purpose", "Historical situation", "Audience", "Limitations"];
        const modelAnswers = [
            primarySource.pointOfViewAnswer,
            primarySource.purposeAnswer,
            primarySource.historicalSituationAnswer,
            primarySource.audienceAnswer,
            primarySource.limitationsAnswer,
        ];
        for (let promptIndex = 0; promptIndex < promptLabels.length; promptIndex++) {
            cursorY = this.addSourcingPrompt(
                promptIndex,
                promptLabels[promptIndex],
                modelAnswers[promptIndex],
                cursorY,
            );
        }
        cursorY += 6;
        const analysisHeaderTextObject = this.scene.add.text(16, cursorY, "Analysis Question", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "14px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        this.add(analysisHeaderTextObject);
        const analysisQuestionTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            cursorY + 22,
            this.panelWidth - 32,
            primarySource.analysisQuestion,
            15,
        );
        this.add(analysisQuestionTextObject);
        let optionY = cursorY + 22 + analysisQuestionTextObject.height + 10;
        for (let optionIndex = 0; optionIndex < primarySource.analysisOptions.length; optionIndex++) {
            const optionButton = UiPanelFactory.createBrassButton(
                this.scene,
                16,
                optionY,
                this.panelWidth - 32,
                36,
                primarySource.analysisOptions[optionIndex],
                () => {
                    this.handleAnalysisAnswer(
                        primarySource,
                        optionIndex,
                        scenarioNumber,
                        gameState,
                        intelligenceManager,
                    );
                },
            );
            this.add(optionButton);
            optionY += 44;
        }
        this.rationaleTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            optionY + 4,
            this.panelWidth - 32,
            "",
            14,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(this.rationaleTextObject);
    }

    private addSourcingPrompt(
        promptIndex: number,
        promptLabel: string,
        modelAnswerText: string,
        promptTopY: number,
    ): number {
        const promptLabelTextObject = this.scene.add.text(16, promptTopY, promptLabel, {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "13px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        this.add(promptLabelTextObject);
        const modelAnswerTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            promptTopY + 22,
            this.panelWidth - 260,
            modelAnswerText,
            13,
            UiPalette.PARCHMENT_CSS,
        );
        modelAnswerTextObject.setVisible(false);
        this.add(modelAnswerTextObject);
        this.modelAnswerTexts.push(modelAnswerTextObject);
        const revealButton = UiPanelFactory.createBrassButton(
            this.scene,
            this.panelWidth - 226,
            promptTopY - 4,
            210,
            28,
            "Reveal model answer",
            () => {
                this.handleRevealClicked(promptIndex);
            },
        );
        this.add(revealButton);
        return promptTopY + 22 + Math.max(24, modelAnswerTextObject.height) + 24;
    }

    private handleRevealClicked(promptIndex: number): void {
        const modelAnswerTextObject = this.modelAnswerTexts[promptIndex];
        modelAnswerTextObject.setVisible(!modelAnswerTextObject.visible);
    }

    private handleAnalysisAnswer(
        primarySource: PrimarySource,
        selectedOptionIndex: number,
        _scenarioNumber: number,
        gameState: GameState,
        intelligenceManager: IntelligenceManager,
    ): void {
        if (this.hasAnsweredAnalysisQuestion) {
            return;
        }
        this.hasAnsweredAnalysisQuestion = true;
        const wasAnalysisCorrect = primarySource.isAnalysisAnswerCorrect(selectedOptionIndex);
        intelligenceManager.recordSourceAnalysisResult(primarySource.sourceIdentifier, wasAnalysisCorrect);
        if (wasAnalysisCorrect) {
            gameState.setScenarioFlag("source_correct_" + primarySource.sourceIdentifier);
        }
        if (this.rationaleTextObject !== null) {
            const correctOptionText = primarySource.analysisOptions[primarySource.correctAnalysisOptionIndex];
            const verdictText = wasAnalysisCorrect ? "Correct." : "Review the reasoning below.";
            this.rationaleTextObject.setText(verdictText + " The strongest answer is: " + correctOptionText);
        }
        EventBus.getInstance().publish(
            GameEventTypes.SOURCE_ANALYZED,
            new SourceAnalysisPayload(primarySource.sourceIdentifier, wasAnalysisCorrect),
        );
    }
}
