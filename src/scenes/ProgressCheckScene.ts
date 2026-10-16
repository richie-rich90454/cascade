import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { CED_UNIT_SEVEN_TOPICS } from "../data/CedUnitSevenCoverage";
import type { PrimarySource } from "../data/PrimarySource";
import { PrimarySources } from "../data/PrimarySources";
import { ProgressCheckBank } from "../data/ProgressCheckBank";
import { AssessmentManager } from "../managers/AssessmentManager";
import { FontFamilies } from "../managers/FontManager";
import { StudentTextEntryField } from "../ui/QuickwriteComponent";
import { UiPalette } from "../ui/UiPalette";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";

export class ProgressCheckScene extends Phaser.Scene {
    private getProgressCheckContentWidth(): number {
        return Math.min(980, this.scale.width - 80);
    }

    private static readonly CONTENT_BASE_Y: number = 170;

    private currentMultipleChoiceQuestionIndex: number;
    private currentQuestionBottomY: number;
    private hasCurrentQuestionBeenAnswered: boolean;
    private selectedAnswerIndexesByQuestionIdentifier: Map<string, number>;
    private contentContainer: Phaser.GameObjects.Container | null;
    private textEntryFields: StudentTextEntryField[];
    private contentHeightPx: number;
    private scrollOffsetY: number;

    constructor() {
        super({ key: SceneKeys.PROGRESS_CHECK });
        this.currentMultipleChoiceQuestionIndex = 0;
        this.currentQuestionBottomY = 0;
        this.hasCurrentQuestionBeenAnswered = false;
        this.selectedAnswerIndexesByQuestionIdentifier = new Map<string, number>();
        this.contentContainer = null;
        this.textEntryFields = [];
        this.contentHeightPx = 0;
        this.scrollOffsetY = 0;
    }

    public create(): void {
        this.currentMultipleChoiceQuestionIndex = 0;
        this.currentQuestionBottomY = 0;
        this.hasCurrentQuestionBeenAnswered = false;
        this.selectedAnswerIndexesByQuestionIdentifier = new Map<string, number>();
        this.contentContainer = null;
        this.textEntryFields = [];
        this.contentHeightPx = 0;
        this.scrollOffsetY = 0;

        this.add.rectangle(0, 0, this.scale.width, this.scale.height, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        const headerTextObject = UiPanelFactory.createSectionHeader(
            this,
            this.scale.width / 2,
            20,
            "PERSONAL PROGRESS CHECK 7",
            28,
        );
        headerTextObject.setOrigin(0.5, 0);
        UiPanelFactory.createBrassButton(this, 24, 24, 200, 40, "BACK TO MENU", () => {
            this.scene.start(SceneKeys.MAIN_MENU);
        });
        GameSession.getInstance().getAudioManager().playMusicTrack("menu_progress_check");

        UiPanelFactory.createBrassButton(this, 40, 104, 260, 44, "MULTIPLE CHOICE (25)", () => {
            this.startMultipleChoiceMode();
        });
        UiPanelFactory.createBrassButton(this, 320, 104, 230, 44, "SHORT ANSWER (2)", () => {
            this.startShortAnswerMode();
        });
        UiPanelFactory.createBrassButton(this, 570, 104, 250, 44, "DOCUMENT BASED (1)", () => {
            this.startDocumentBasedMode();
        });
        this.input.on(
            "wheel",
            (
                _pointer: Phaser.Input.Pointer,
                _currentlyOver: Phaser.GameObjects.GameObject[],
                _deltaX: number,
                deltaY: number,
                _deltaZ: number,
            ) => {
                this.handleWheelScroll(deltaY);
            },
        );

        this.showModeSelectionContent();
    }

    private rebuildContent(): Phaser.GameObjects.Container {
        for (const textEntryField of this.textEntryFields) {
            textEntryField.destroy();
        }
        this.textEntryFields = [];
        if (this.contentContainer !== null) {
            this.contentContainer.destroy(true);
            this.contentContainer = null;
        }
        const contentContainer = this.add.container(0, ProgressCheckScene.CONTENT_BASE_Y);
        this.contentContainer = contentContainer;
        this.contentHeightPx = 0;
        this.scrollOffsetY = 0;
        return contentContainer;
    }

    private handleWheelScroll(deltaY: number): void {
        if (this.contentContainer === null) {
            return;
        }
        this.scrollOffsetY -= deltaY * 0.5;
        this.applyScrollClamp();
    }

    private applyScrollClamp(): void {
        if (this.contentContainer === null) {
            return;
        }
        const availableHeightPx = this.scale.height - ProgressCheckScene.CONTENT_BASE_Y - 20;
        const minimumOffsetY = Math.min(0, availableHeightPx - this.contentHeightPx);
        this.scrollOffsetY = Phaser.Math.Clamp(this.scrollOffsetY, minimumOffsetY, 0);
        this.contentContainer.setY(ProgressCheckScene.CONTENT_BASE_Y + this.scrollOffsetY);
    }

    private showModeSelectionContent(): void {
        const contentContainer = this.rebuildContent();
        contentContainer.add(
            UiPanelFactory.createTypewriterText(
                this,
                40,
                0,
                this.getProgressCheckContentWidth(),
                "Select a mode above to begin the Personal Progress Check for Unit 7.",
            ),
        );
        this.contentHeightPx = 30;
        this.applyScrollClamp();
    }

    private startMultipleChoiceMode(): void {
        this.buildMultipleChoiceQuestion();
    }

    private startShortAnswerMode(): void {
        this.buildShortAnswerQuestions();
    }

    private startDocumentBasedMode(): void {
        this.buildDocumentBasedQuestion();
    }

    private buildMultipleChoiceQuestion(): void {
        const multipleChoiceQuestions = ProgressCheckBank.getAllMultipleChoiceQuestions();
        if (this.currentMultipleChoiceQuestionIndex >= multipleChoiceQuestions.length) {
            this.buildMultipleChoiceResults();
            return;
        }
        const contentContainer = this.rebuildContent();
        const question = multipleChoiceQuestions[this.currentMultipleChoiceQuestionIndex];
        this.hasCurrentQuestionBeenAnswered = false;
        let cursorY = 0;
        contentContainer.add(
            UiPanelFactory.createTypewriterText(
                this,
                40,
                cursorY,
                this.getProgressCheckContentWidth(),
                `Progress Check in progress — question ${this.currentMultipleChoiceQuestionIndex + 1} ` +
                    `of ${multipleChoiceQuestions.length}.`,
            ),
        );
        cursorY += 30;
        contentContainer.add(
            UiPanelFactory.createBadgeChip(this, 40, cursorY, "Topic " + question.cedTopicCode, UiPalette.DEEP_BRASS),
        );
        cursorY += 36;
        const questionTextObject = UiPanelFactory.createBodyText(
            this,
            40,
            cursorY,
            this.getProgressCheckContentWidth(),
            question.questionText,
        );
        contentContainer.add(questionTextObject);
        cursorY += questionTextObject.displayHeight + 18;
        for (let answerOptionIndex = 0; answerOptionIndex < question.answerOptions.length; answerOptionIndex += 1) {
            const selectedAnswerIndex = answerOptionIndex;
            contentContainer.add(
                UiPanelFactory.createBrassButton(
                    this,
                    40,
                    cursorY,
                    this.getProgressCheckContentWidth(),
                    44,
                    question.answerOptions[selectedAnswerIndex],
                    () => {
                        this.handleMultipleChoiceAnswerSelected(selectedAnswerIndex);
                    },
                ),
            );
            cursorY += 52;
        }
        this.currentQuestionBottomY = cursorY;
        this.contentHeightPx = cursorY;
        this.applyScrollClamp();
    }

    private handleMultipleChoiceAnswerSelected(selectedAnswerIndex: number): void {
        if (this.hasCurrentQuestionBeenAnswered || this.contentContainer === null) {
            return;
        }
        const question = ProgressCheckBank.getAllMultipleChoiceQuestions()[this.currentMultipleChoiceQuestionIndex];
        this.hasCurrentQuestionBeenAnswered = true;
        this.selectedAnswerIndexesByQuestionIdentifier.set(question.questionIdentifier, selectedAnswerIndex);
        const wasAnswerCorrect = question.isAnswerCorrect(selectedAnswerIndex);
        GameSession.getInstance()
            .getAssessmentManager()
            .recordTopicPracticeAttempt(question.cedTopicCode, wasAnswerCorrect);
        let cursorY = this.currentQuestionBottomY + 4;
        const topic = CED_UNIT_SEVEN_TOPICS.find((topicRecord) => topicRecord.topicCode === question.cedTopicCode);
        const correctionText = wasAnswerCorrect
            ? ""
            : `\nCorrect choice: ${question.answerOptions[question.correctAnswerIndex]}\nNext step: revisit ${topic?.topicTitle ?? question.cedTopicCode} in Scenario ${topic?.scenarioNumbers[0] ?? "linked"}, then explain which source evidence supports this interpretation.`;
        const rationaleTextObject = UiPanelFactory.createBodyText(
            this,
            20,
            20,
            850,
            `${wasAnswerCorrect ? "Correct." : "Not quite."} ${question.rationaleText}${correctionText}`,
            15,
            UiPalette.NEAR_BLACK_LEATHER_CSS,
        );
        const rationalePanel = UiPanelFactory.createPanelContainer(
            this,
            40,
            cursorY,
            this.getProgressCheckContentWidth(),
            rationaleTextObject.displayHeight + 40,
            PanelVariant.PARCHMENT,
        );
        rationalePanel.add(rationaleTextObject);
        this.contentContainer.add(rationalePanel);
        cursorY += rationaleTextObject.displayHeight + 56;
        this.contentContainer.add(
            UiPanelFactory.createBrassButton(this, 40, cursorY, 300, 44, "NEXT QUESTION", () => {
                this.advanceToNextMultipleChoiceQuestion();
            }),
        );
        cursorY += 60;
        this.contentHeightPx = cursorY;
        this.applyScrollClamp();
    }

    private advanceToNextMultipleChoiceQuestion(): void {
        this.currentMultipleChoiceQuestionIndex += 1;
        this.buildMultipleChoiceQuestion();
    }

    private buildMultipleChoiceResults(): void {
        const contentContainer = this.rebuildContent();
        const multipleChoiceQuestions = ProgressCheckBank.getAllMultipleChoiceQuestions();
        const correctAnswerCount = ProgressCheckBank.scoreMultipleChoiceAnswers(
            this.selectedAnswerIndexesByQuestionIdentifier,
        );
        let cursorY = 0;
        contentContainer.add(
            UiPanelFactory.createTypewriterText(
                this,
                40,
                cursorY,
                this.getProgressCheckContentWidth(),
                "Progress Check complete.",
            ),
        );
        cursorY += 44;
        const scoreTextObject = UiPanelFactory.createBodyText(
            this,
            40,
            cursorY,
            this.getProgressCheckContentWidth(),
            `You answered ${correctAnswerCount} of ${multipleChoiceQuestions.length} correctly.`,
            22,
        );
        contentContainer.add(scoreTextObject);
        cursorY += scoreTextObject.displayHeight + 30;
        const practiceNote = UiPanelFactory.createBodyText(
            this,
            40,
            cursorY,
            this.getProgressCheckContentWidth(),
            "Use the topic breakdown in the teacher dashboard to decide what to review next. This practice score is not an AP exam prediction.",
            15,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        contentContainer.add(practiceNote);
        cursorY += practiceNote.displayHeight + 18;
        contentContainer.add(
            UiPanelFactory.createBrassButton(this, 40, cursorY, 220, 44, "RETRY", () => {
                this.restartMultipleChoiceMode();
            }),
        );
        contentContainer.add(
            UiPanelFactory.createBrassButton(this, 280, cursorY, 260, 44, "BACK TO MENU", () => {
                this.scene.start(SceneKeys.MAIN_MENU);
            }),
        );
        cursorY += 60;
        this.contentHeightPx = cursorY;
        this.applyScrollClamp();
    }

    private restartMultipleChoiceMode(): void {
        this.currentMultipleChoiceQuestionIndex = 0;
        this.selectedAnswerIndexesByQuestionIdentifier = new Map<string, number>();
        this.buildMultipleChoiceQuestion();
    }

    private buildShortAnswerQuestions(): void {
        const contentContainer = this.rebuildContent();
        let cursorY = 0;
        contentContainer.add(
            UiPanelFactory.createTypewriterText(
                this,
                40,
                cursorY,
                this.getProgressCheckContentWidth(),
                "Write a complete response to each question, then save it to your journal.",
            ),
        );
        cursorY += 30;
        for (const shortAnswerQuestion of ProgressCheckBank.SHORT_ANSWER_QUESTIONS) {
            contentContainer.add(
                UiPanelFactory.createBadgeChip(
                    this,
                    40,
                    cursorY,
                    shortAnswerQuestion.questionVariant,
                    UiPalette.DEEP_BRASS,
                ),
            );
            cursorY += 36;
            if (!shortAnswerQuestion.stimulusText.startsWith("No stimulus")) {
                const stimulusTextObject = UiPanelFactory.createTypewriterText(
                    this,
                    20,
                    20,
                    860,
                    shortAnswerQuestion.stimulusText,
                    15,
                    UiPalette.NEAR_BLACK_LEATHER_CSS,
                );
                const stimulusPanel = UiPanelFactory.createPanelContainer(
                    this,
                    40,
                    cursorY,
                    this.getProgressCheckContentWidth(),
                    stimulusTextObject.displayHeight + 40,
                    PanelVariant.NEWSPAPER,
                );
                stimulusPanel.add(stimulusTextObject);
                contentContainer.add(stimulusPanel);
                cursorY += stimulusTextObject.displayHeight + 56;
            }
            const questionTextObject = UiPanelFactory.createBodyText(
                this,
                40,
                cursorY,
                this.getProgressCheckContentWidth(),
                shortAnswerQuestion.questionText,
            );
            contentContainer.add(questionTextObject);
            cursorY += questionTextObject.displayHeight + 14;
            const responseField = new StudentTextEntryField(
                this,
                40,
                cursorY,
                this.getProgressCheckContentWidth(),
                120,
            );
            this.textEntryFields.push(responseField);
            contentContainer.add(responseField.getFieldContainer());
            cursorY += 132;
            const feedbackTextObject = UiPanelFactory.createTypewriterText(
                this,
                40,
                cursorY,
                this.getProgressCheckContentWidth(),
                "",
            );
            contentContainer.add(feedbackTextObject);
            cursorY += 28;
            contentContainer.add(
                UiPanelFactory.createBrassButton(this, 40, cursorY, 260, 44, "SAVE RESPONSE", () => {
                    this.handleSaveShortAnswerResponse(
                        shortAnswerQuestion.questionText,
                        responseField,
                        feedbackTextObject,
                    );
                }),
            );
            cursorY += 60;
        }
        contentContainer.add(
            UiPanelFactory.createBrassButton(this, 40, cursorY, 240, 44, "BACK TO MODES", () => {
                this.showModeSelectionContent();
            }),
        );
        cursorY += 60;
        this.contentHeightPx = cursorY;
        this.applyScrollClamp();
    }

    private handleSaveShortAnswerResponse(
        questionText: string,
        responseField: StudentTextEntryField,
        feedbackTextObject: Phaser.GameObjects.Text,
    ): void {
        const responseText = responseField.getEnteredText().trim();
        if (responseText.length === 0) {
            feedbackTextObject.setText("Write a response before saving it to the journal.");
            return;
        }
        AssessmentManager.getInstance().addJournalEntry(
            0,
            0,
            "progress_check_short_answer",
            questionText,
            responseText,
        );
        feedbackTextObject.setText("Response saved to the journal.");
    }

    private buildDocumentBasedQuestion(): void {
        const contentContainer = this.rebuildContent();
        const documentBasedQuestion = ProgressCheckBank.DOCUMENT_BASED_QUESTION;
        let cursorY = 0;
        const promptTextObject = this.add.text(40, cursorY, documentBasedQuestion.promptText, {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "22px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
            wordWrap: { width: 1100, useAdvancedWrap: true },
            lineSpacing: 6,
        });
        contentContainer.add(promptTextObject);
        cursorY += promptTextObject.displayHeight + 24;
        let cardIndex = 0;
        for (const sourceIdentifier of documentBasedQuestion.documentSourceIdentifiers) {
            const primarySource = PrimarySources.findBySourceIdentifier(sourceIdentifier);
            if (primarySource === null) {
                continue;
            }
            const columnIndex = cardIndex % 2;
            const rowIndex = Math.floor(cardIndex / 2);
            const cardX = 40 + columnIndex * 620;
            const cardY = cursorY + rowIndex * 186;
            contentContainer.add(this.buildDocumentCard(cardX, cardY, primarySource));
            cardIndex += 1;
        }
        cursorY += Math.ceil(cardIndex / 2) * 186 + 10;
        const essayPromptTextObject = UiPanelFactory.createBodyText(
            this,
            40,
            cursorY,
            this.getProgressCheckContentWidth(),
            "Write your essay below, using at least six of the documents.",
        );
        contentContainer.add(essayPromptTextObject);
        cursorY += essayPromptTextObject.displayHeight + 14;
        const essayField = new StudentTextEntryField(this, 40, cursorY, this.getProgressCheckContentWidth(), 220);
        this.textEntryFields.push(essayField);
        contentContainer.add(essayField.getFieldContainer());
        cursorY += 232;
        const feedbackTextObject = UiPanelFactory.createTypewriterText(
            this,
            40,
            cursorY,
            this.getProgressCheckContentWidth(),
            "",
        );
        contentContainer.add(feedbackTextObject);
        cursorY += 28;
        contentContainer.add(
            UiPanelFactory.createBrassButton(this, 40, cursorY, 260, 44, "SAVE ESSAY", () => {
                this.handleSaveDocumentBasedEssay(documentBasedQuestion.promptText, essayField, feedbackTextObject);
            }),
        );
        cursorY += 60;
        this.contentHeightPx = cursorY;
        this.applyScrollClamp();
    }

    private buildDocumentCard(x: number, y: number, primarySource: PrimarySource): Phaser.GameObjects.Container {
        const cardContainer = UiPanelFactory.createPanelContainer(this, x, y, 590, 170, PanelVariant.PARCHMENT);
        const titleTextObject = this.add.text(16, 12, primarySource.sourceDisplayTitle, {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "16px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            wordWrap: { width: 558, useAdvancedWrap: true },
        });
        cardContainer.add(titleTextObject);
        const attributionTextObject = this.add.text(
            16,
            12 + titleTextObject.displayHeight + 4,
            `${primarySource.authorOrOrigin} — ${primarySource.dateText}`,
            {
                fontFamily: FontFamilies.TYPEWRITER_BODY,
                fontSize: "14px",
                color: UiPalette.DEEP_PARCHMENT_CSS,
                wordWrap: { width: 558, useAdvancedWrap: true },
            },
        );
        cardContainer.add(attributionTextObject);
        const excerptTextObject = this.add.text(
            16,
            12 + titleTextObject.displayHeight + 4 + attributionTextObject.displayHeight + 6,
            this.buildExcerptText(primarySource.excerptText),
            {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "14px",
                color: UiPalette.NEAR_BLACK_LEATHER_CSS,
                wordWrap: { width: 558, useAdvancedWrap: true },
                lineSpacing: 3,
            },
        );
        cardContainer.add(excerptTextObject);
        return cardContainer;
    }

    private buildExcerptText(excerptText: string): string {
        const maximumExcerptLength = 150;
        if (excerptText.length <= maximumExcerptLength) {
            return excerptText;
        }
        return excerptText.slice(0, maximumExcerptLength).trimEnd() + "...";
    }

    private handleSaveDocumentBasedEssay(
        promptText: string,
        responseField: StudentTextEntryField,
        feedbackTextObject: Phaser.GameObjects.Text,
    ): void {
        const responseText = responseField.getEnteredText().trim();
        if (responseText.length === 0) {
            feedbackTextObject.setText("Write your essay before saving it to the journal.");
            return;
        }
        AssessmentManager.getInstance().addJournalEntry(
            0,
            0,
            "progress_check_document_based",
            promptText,
            responseText,
        );
        feedbackTextObject.setText("Essay saved to the journal.");
    }
}
