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
    private readonly sourcingHintTexts: Phaser.GameObjects.Text[] = [];
    private readonly revealButtonTexts: Phaser.GameObjects.Text[] = [];
    private readonly analysisOptionButtons: Phaser.GameObjects.Container[] = [];
    private contentHeightPx: number = 0;

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
        this.sourcingHintTexts.length = 0;
        this.revealButtonTexts.length = 0;
        this.analysisOptionButtons.length = 0;
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
        const sourceTypeTopY = 46 + originTextObject.displayHeight + 8;
        const sourceTypeTextObject = this.scene.add.text(16, sourceTypeTopY, primarySource.sourceType, {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "12px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        this.add(sourceTypeTextObject);
        const excerptTopY = sourceTypeTopY + sourceTypeTextObject.displayHeight + 12;
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
        excerptFrameGraphics.fillRect(16, excerptTopY, this.panelWidth - 32, excerptTextObject.displayHeight + 24);
        excerptFrameGraphics.lineStyle(2, UiPalette.DEEP_BRASS, 0.9);
        excerptFrameGraphics.strokeRect(
            17,
            excerptTopY + 1,
            this.panelWidth - 34,
            excerptTextObject.displayHeight + 22,
        );
        this.add(excerptFrameGraphics);
        this.add(excerptTextObject);
        let cursorY = excerptTopY + excerptTextObject.displayHeight + 40;
        const promptLabels = ["Point of view", "Purpose", "Historical situation", "Audience", "Limitations"];
        const promptHints = [
            "Who created it, and what position shaped the account?",
            "What result did the author want?",
            "What was happening when this source was created?",
            "Who was meant to read or hear it?",
            "What can this source not tell you?",
        ];
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
                promptHints[promptIndex],
                modelAnswers[promptIndex],
                cursorY,
            );
        }
        cursorY += 6;
        const analysisHeaderTextObject = this.scene.add.text(16, cursorY, "Check your reading", {
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
        let optionY = cursorY + 22 + analysisQuestionTextObject.displayHeight + 10;
        for (let optionIndex = 0; optionIndex < primarySource.analysisOptions.length; optionIndex++) {
            const optionButton = UiPanelFactory.createBrassButton(
                this.scene,
                16,
                optionY,
                this.panelWidth - 32,
                44,
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
            this.analysisOptionButtons.push(optionButton);
            optionY += 50;
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
        this.contentHeightPx = optionY + this.rationaleTextObject.displayHeight + 24;
    }

    public getContentHeightPx(): number {
        return this.contentHeightPx;
    }

    private addSourcingPrompt(
        promptIndex: number,
        promptLabel: string,
        promptHint: string,
        modelAnswerText: string,
        promptTopY: number,
    ): number {
        const promptContentWidth = Math.max(180, this.panelWidth - 32);
        const isNarrowPrompt = promptContentWidth < 430;
        const revealButtonWidth = isNarrowPrompt
            ? promptContentWidth
            : Math.min(210, Math.max(112, Math.floor(promptContentWidth * 0.46)));
        const answerTextWidth = isNarrowPrompt
            ? promptContentWidth
            : Math.max(80, promptContentWidth - revealButtonWidth - 18);
        const promptLabelTextObject = this.scene.add.text(16, promptTopY + 2, promptLabel, {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "14px",
            fontStyle: "bold",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        this.add(promptLabelTextObject);
        const modelAnswerTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            promptTopY + 20,
            answerTextWidth,
            modelAnswerText,
            14,
            UiPalette.PARCHMENT_CSS,
        );
        modelAnswerTextObject.setVisible(false);
        this.add(modelAnswerTextObject);
        this.modelAnswerTexts.push(modelAnswerTextObject);
        const sourcingHintTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            promptTopY + 20,
            answerTextWidth,
            promptHint,
            12,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(sourcingHintTextObject);
        this.sourcingHintTexts.push(sourcingHintTextObject);
        const promptHeight =
            20 +
            Math.max(20, modelAnswerTextObject.displayHeight, sourcingHintTextObject.displayHeight) +
            (isNarrowPrompt ? 34 : 4);
        const promptBackground = this.scene.add.graphics();
        promptBackground.fillStyle(UiPalette.DARK_OLIVE, 0.96);
        promptBackground.fillRect(0, promptTopY, this.panelWidth - 32, promptHeight);
        promptBackground.lineStyle(1, UiPalette.FIELD_GRAY, 0.55);
        promptBackground.strokeRect(0.5, promptTopY + 0.5, this.panelWidth - 33, promptHeight - 1);
        this.addAt(promptBackground, this.list.length - 3);
        const revealButton = UiPanelFactory.createBrassButton(
            this.scene,
            this.panelWidth - 16 - revealButtonWidth,
            isNarrowPrompt ? promptTopY + promptHeight - 34 : promptTopY - 4,
            revealButtonWidth,
            isNarrowPrompt ? 30 : 32,
            "Show model answer",
            () => {
                this.handleRevealClicked(promptIndex);
            },
        );
        this.add(revealButton);
        const revealButtonLabel = revealButton.getByName("cascade-ui-button-label");
        if (revealButtonLabel instanceof Phaser.GameObjects.Text) {
            this.revealButtonTexts.push(revealButtonLabel);
        }
        return promptTopY + promptHeight + 6;
    }

    private handleRevealClicked(promptIndex: number): void {
        const modelAnswerTextObject = this.modelAnswerTexts[promptIndex];
        const shouldShowAnswer = !modelAnswerTextObject.visible;
        modelAnswerTextObject.setVisible(shouldShowAnswer);
        this.sourcingHintTexts[promptIndex]?.setVisible(!shouldShowAnswer);
        this.revealButtonTexts[promptIndex]?.setText(shouldShowAnswer ? "Hide model answer" : "Show model answer");
    }

    private handleAnalysisAnswer(
        primarySource: PrimarySource,
        selectedOptionIndex: number,
        scenarioNumber: number,
        gameState: GameState,
        intelligenceManager: IntelligenceManager,
    ): void {
        if (this.hasAnsweredAnalysisQuestion) {
            return;
        }
        const wasAnalysisCorrect = primarySource.isAnalysisAnswerCorrect(selectedOptionIndex);
        this.hasAnsweredAnalysisQuestion = wasAnalysisCorrect;
        intelligenceManager.recordSourceAnalysisResult(primarySource.sourceIdentifier, wasAnalysisCorrect);
        if (scenarioNumber === 1 && wasAnalysisCorrect) {
            gameState.setScenarioFlag(`source_s1_analyzed_${primarySource.sourceIdentifier}`);
        }
        if (wasAnalysisCorrect) {
            gameState.setScenarioFlag("source_correct_" + primarySource.sourceIdentifier);
        }
        if (this.rationaleTextObject !== null) {
            const correctOptionText = primarySource.analysisOptions[primarySource.correctAnalysisOptionIndex];
            const verdictText = wasAnalysisCorrect
                ? "Correct. You connected evidence in the document to the broader historical pattern."
                : "Not yet. Recheck the author's point of view and the historical situation, then try another answer. Reveal a model answer above if you need a hint.";
            this.rationaleTextObject.setText(
                wasAnalysisCorrect ? `${verdictText} Strongest answer: ${correctOptionText}` : verdictText,
            );
        }
        if (wasAnalysisCorrect) {
            this.analysisOptionButtons.forEach((optionButton) => optionButton.setVisible(false));
        }
        EventBus.getInstance().publish(
            GameEventTypes.SOURCE_ANALYZED,
            new SourceAnalysisPayload(primarySource.sourceIdentifier, wasAnalysisCorrect),
        );
    }
}
