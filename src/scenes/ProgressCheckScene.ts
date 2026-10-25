import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { CED_UNIT_SEVEN_TOPICS } from "../data/CedUnitSevenCoverage";
import type { PrimarySource } from "../data/PrimarySource";
import { PrimarySources } from "../data/PrimarySources";
import { ProgressCheckBank, type MultipleChoiceQuestion } from "../data/ProgressCheckBank";
import { AssessmentManager } from "../managers/AssessmentManager";
import { FontFamilies } from "../managers/FontManager";
import { StudentTextEntryField } from "../ui/QuickwriteComponent";
import { UiPalette } from "../ui/UiPalette";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";
import { UiScrollInput } from "../ui/UiScrollInput";

export class ProgressCheckScene extends Phaser.Scene {
    private getProgressCheckContentWidth(): number {
        return Math.min(980, this.scale.width - 80);
    }

    private contentBaseY: number;
    private currentMultipleChoiceQuestionIndex: number;
    private currentMultipleChoiceQuestions: MultipleChoiceQuestion[];
    private multipleChoiceMode: "full" | "quick";
    private currentQuestionBottomY: number;
    private hasCurrentQuestionBeenAnswered: boolean;
    private selectedAnswerIndexesByQuestionIdentifier: Map<string, number>;
    private answerOptionIndexesByQuestionIdentifier: Map<string, number[]>;
    private contentContainer: Phaser.GameObjects.Container | null;
    private contentMaskGraphics: Phaser.GameObjects.Graphics | null;
    private scrollHintTextObject: Phaser.GameObjects.Text | null;
    private textEntryFields: StudentTextEntryField[];
    private contentHeightPx: number;
    private scrollOffsetY: number;
    private activeTouchPointerId: number | null;
    private touchLastY: number;
    private touchStartY: number;
    private ignoreTouchActivationUntilMs: number;

    constructor() {
        super({ key: SceneKeys.PROGRESS_CHECK });
        this.contentBaseY = 170;
        this.currentMultipleChoiceQuestionIndex = 0;
        this.currentMultipleChoiceQuestions = [];
        this.multipleChoiceMode = "full";
        this.currentQuestionBottomY = 0;
        this.hasCurrentQuestionBeenAnswered = false;
        this.selectedAnswerIndexesByQuestionIdentifier = new Map<string, number>();
        this.answerOptionIndexesByQuestionIdentifier = new Map<string, number[]>();
        this.contentContainer = null;
        this.contentMaskGraphics = null;
        this.scrollHintTextObject = null;
        this.textEntryFields = [];
        this.contentHeightPx = 0;
        this.scrollOffsetY = 0;
        this.activeTouchPointerId = null;
        this.touchLastY = 0;
        this.touchStartY = 0;
        this.ignoreTouchActivationUntilMs = 0;
    }

    public create(): void {
        this.currentMultipleChoiceQuestionIndex = 0;
        this.currentMultipleChoiceQuestions = [];
        this.multipleChoiceMode = "full";
        this.currentQuestionBottomY = 0;
        this.hasCurrentQuestionBeenAnswered = false;
        this.selectedAnswerIndexesByQuestionIdentifier = new Map<string, number>();
        this.answerOptionIndexesByQuestionIdentifier = new Map<string, number[]>();
        this.contentContainer = null;
        this.contentMaskGraphics = null;
        this.scrollHintTextObject = null;
        this.textEntryFields = [];
        this.contentHeightPx = 0;
        this.scrollOffsetY = 0;
        this.activeTouchPointerId = null;
        this.touchLastY = 0;
        this.touchStartY = 0;
        this.ignoreTouchActivationUntilMs = 0;

        const screenWidth = this.scale.width;
        const isCompactLayout = screenWidth < 760;
        this.contentBaseY = isCompactLayout ? 246 : 170;
        this.add.rectangle(0, 0, screenWidth, this.scale.height, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        const contentViewportHeight = Math.max(0, this.scale.height - this.contentBaseY - 48);
        this.contentMaskGraphics = this.add.graphics();
        this.contentMaskGraphics.fillStyle(0xffffff, 1);
        this.contentMaskGraphics.fillRect(0, this.contentBaseY, screenWidth, contentViewportHeight);
        this.contentMaskGraphics.setVisible(false);
        this.scrollHintTextObject = this.add.text(
            screenWidth / 2,
            this.scale.height - 38,
            "Scroll for more · wheel, swipe, or Page Down",
            {
                fontFamily: FontFamilies.TYPEWRITER_BODY,
                fontSize: "14px",
                color: UiPalette.AGED_PARCHMENT_CSS,
                backgroundColor: UiPalette.NEAR_BLACK_LEATHER_CSS,
                padding: { x: 8, y: 4 },
                align: "center",
                wordWrap: { width: Math.max(120, screenWidth - 24), useAdvancedWrap: true },
            },
        );
        this.scrollHintTextObject.setOrigin(0.5, 0);
        this.scrollHintTextObject.setVisible(false);
        const headerTextObject = UiPanelFactory.createSectionHeader(
            this,
            screenWidth / 2,
            isCompactLayout ? 10 : 20,
            "Personal progress check 7",
            isCompactLayout ? 20 : 28,
        );
        headerTextObject.setOrigin(0.5, 0);
        this.createActionButton(
            this,
            isCompactLayout ? 12 : 24,
            isCompactLayout ? 48 : 24,
            isCompactLayout ? Math.min(180, screenWidth - 24) : 200,
            40,
            "Back to menu",
            () => {
                this.scene.start(SceneKeys.MAIN_MENU);
            },
        );
        GameSession.getInstance().getAudioManager().playMusicTrack("menu_progress_check");

        const modeButtonLabels = ["Multiple choice (25)", "Short answer (2)", "Document based (1)"];
        const modeButtonActions = [
            () => this.startMultipleChoiceMode(),
            () => this.startShortAnswerMode(),
            () => this.startDocumentBasedMode(),
        ];
        if (isCompactLayout) {
            const buttonWidth = Math.max(160, screenWidth - 24);
            modeButtonActions.forEach((activateMode, buttonIndex) => {
                this.createActionButton(
                    this,
                    12,
                    100 + buttonIndex * 46,
                    buttonWidth,
                    40,
                    modeButtonLabels[buttonIndex],
                    activateMode,
                );
            });
        } else {
            const horizontalMargin = Math.min(40, Math.floor(screenWidth * 0.05));
            const buttonGap = 10;
            const buttonWidth = (screenWidth - horizontalMargin * 2 - buttonGap * 2) / 3;
            modeButtonActions.forEach((activateMode, buttonIndex) => {
                this.createActionButton(
                    this,
                    horizontalMargin + buttonIndex * (buttonWidth + buttonGap),
                    104,
                    buttonWidth,
                    44,
                    modeButtonLabels[buttonIndex],
                    activateMode,
                );
            });
        }
        this.input.on(
            "wheel",
            (
                pointer: Phaser.Input.Pointer,
                _currentlyOver: Phaser.GameObjects.GameObject[],
                _deltaX: number,
                deltaY: number,
                _deltaZ: number,
            ) => {
                this.handleWheelScroll(UiScrollInput.getWheelDeltaPx(pointer, deltaY, this.scale.height));
            },
        );
        this.input.on("pointerdown", this.handleTouchScrollStart, this);
        this.input.on("pointermove", this.handleTouchScrollMove, this);
        this.input.on("pointerup", this.handleTouchScrollEnd, this);
        this.input.on("pointerupoutside", this.handleTouchScrollEnd, this);
        this.input.keyboard?.on("keydown", this.handlePageScroll, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off("pointerdown", this.handleTouchScrollStart, this);
            this.input.off("pointermove", this.handleTouchScrollMove, this);
            this.input.off("pointerup", this.handleTouchScrollEnd, this);
            this.input.off("pointerupoutside", this.handleTouchScrollEnd, this);
            this.input.keyboard?.off("keydown", this.handlePageScroll, this);
            this.contentContainer?.clearMask(true);
            this.contentMaskGraphics?.destroy();
            this.contentMaskGraphics = null;
            this.scrollHintTextObject?.destroy();
            this.scrollHintTextObject = null;
        });

        this.showModeSelectionContent();
    }

    private rebuildContent(): Phaser.GameObjects.Container {
        for (const textEntryField of this.textEntryFields) {
            textEntryField.destroy();
        }
        this.textEntryFields = [];
        if (this.contentContainer !== null) {
            this.contentContainer.clearMask(true);
            this.contentContainer.destroy(true);
            this.contentContainer = null;
        }
        const contentContainer = this.add.container(0, this.contentBaseY);
        if (this.contentMaskGraphics !== null) {
            contentContainer.setMask(this.contentMaskGraphics.createGeometryMask());
        }
        this.contentContainer = contentContainer;
        this.contentHeightPx = 0;
        this.scrollOffsetY = 0;
        return contentContainer;
    }

    private handleWheelScroll(deltaY: number): void {
        if (this.contentContainer === null) {
            return;
        }
        this.scrollOffsetY -= deltaY;
        this.applyScrollClamp();
    }

    private handleTouchScrollStart(pointer: Phaser.Input.Pointer): void {
        if (
            !pointer.wasTouch ||
            this.contentContainer === null ||
            this.contentHeightPx <= this.scale.height - this.contentBaseY - 48 ||
            pointer.y < this.contentBaseY ||
            pointer.y > this.scale.height - 48
        ) {
            return;
        }
        this.activeTouchPointerId = pointer.id;
        this.touchStartY = pointer.y;
        this.touchLastY = pointer.y;
    }

    private handleTouchScrollMove(pointer: Phaser.Input.Pointer): void {
        if (!pointer.wasTouch || pointer.id !== this.activeTouchPointerId) {
            return;
        }
        const movementFromStart = pointer.y - this.touchStartY;
        if (Math.abs(movementFromStart) > 7) {
            this.ignoreTouchActivationUntilMs = Date.now() + 300;
            this.scrollOffsetY += pointer.y - this.touchLastY;
            this.applyScrollClamp();
        }
        this.touchLastY = pointer.y;
    }

    private handleTouchScrollEnd(pointer: Phaser.Input.Pointer): void {
        if (pointer.id === this.activeTouchPointerId) {
            this.activeTouchPointerId = null;
        }
    }

    private handlePageScroll(event: KeyboardEvent): void {
        if (
            this.contentContainer === null ||
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement
        ) {
            return;
        }
        if (event.key === "PageDown") {
            event.preventDefault();
            this.scrollOffsetY -= (this.scale.height - this.contentBaseY - 48) * 0.8;
            this.applyScrollClamp();
        } else if (event.key === "PageUp") {
            event.preventDefault();
            this.scrollOffsetY += (this.scale.height - this.contentBaseY - 48) * 0.8;
            this.applyScrollClamp();
        }
    }

    private canActivate(): boolean {
        return Date.now() >= this.ignoreTouchActivationUntilMs;
    }

    private createActionButton(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        label: string,
        onActivate: () => void,
    ): Phaser.GameObjects.Container {
        return UiPanelFactory.createBrassButton(scene, x, y, width, height, label, () => {
            if (this.canActivate()) {
                onActivate();
            }
        });
    }

    private applyScrollClamp(): void {
        if (this.contentContainer === null) {
            return;
        }
        const availableHeightPx = this.scale.height - this.contentBaseY - 48;
        const minimumOffsetY = Math.min(0, availableHeightPx - this.contentHeightPx);
        this.scrollOffsetY = Phaser.Math.Clamp(this.scrollOffsetY, minimumOffsetY, 0);
        this.contentContainer.setY(this.contentBaseY + this.scrollOffsetY);
        this.scrollHintTextObject?.setVisible(this.contentHeightPx > availableHeightPx);
    }

    private showModeSelectionContent(): void {
        const contentContainer = this.rebuildContent();
        const contentWidth = this.getProgressCheckContentWidth();
        const introduction = UiPanelFactory.createBodyText(
            this,
            40,
            0,
            contentWidth,
            "Choose a practice format. Quick review starts with topics you have not practiced or may want to revisit.",
            17,
        );
        contentContainer.add(introduction);
        const quickReviewButton = this.createActionButton(
            this,
            40,
            introduction.displayHeight + 18,
            Math.min(360, contentWidth),
            48,
            "Quick review · 3 questions",
            () => this.startQuickReviewMode(),
        );
        contentContainer.add(quickReviewButton);
        const quickReviewDescription = UiPanelFactory.createBodyText(
            this,
            40,
            introduction.displayHeight + 78,
            contentWidth,
            "Questions rotate across Unit 7 topics. Your answer positions change each time, and feedback explains why an option fits or misses the question.",
            15,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        contentContainer.add(quickReviewDescription);
        this.contentHeightPx = introduction.displayHeight + 90 + quickReviewDescription.displayHeight;
        this.applyScrollClamp();
    }

    private startMultipleChoiceMode(): void {
        this.multipleChoiceMode = "full";
        this.currentMultipleChoiceQuestions = ProgressCheckBank.getAllMultipleChoiceQuestions();
        this.prepareMultipleChoiceRun();
    }

    private startQuickReviewMode(): void {
        this.multipleChoiceMode = "quick";
        this.currentMultipleChoiceQuestions = this.chooseQuickReviewQuestions();
        this.prepareMultipleChoiceRun();
    }

    private prepareMultipleChoiceRun(): void {
        this.currentMultipleChoiceQuestionIndex = 0;
        this.selectedAnswerIndexesByQuestionIdentifier = new Map<string, number>();
        this.answerOptionIndexesByQuestionIdentifier = new Map<string, number[]>();
        const firstCorrectPosition = Math.floor(Math.random() * 4);
        this.currentMultipleChoiceQuestions.forEach((question, questionIndex) => {
            const optionCount = question.answerOptions.length;
            const correctPosition = (firstCorrectPosition + questionIndex) % optionCount;
            const incorrectOptionIndexes = question.answerOptions
                .map((_option, optionIndex) => optionIndex)
                .filter((optionIndex) => optionIndex !== question.correctAnswerIndex);
            for (let index = incorrectOptionIndexes.length - 1; index > 0; index -= 1) {
                const swapIndex = Math.floor(Math.random() * (index + 1));
                [incorrectOptionIndexes[index], incorrectOptionIndexes[swapIndex]] = [
                    incorrectOptionIndexes[swapIndex],
                    incorrectOptionIndexes[index],
                ];
            }
            const optionOrder = new Array<number>(optionCount);
            optionOrder[correctPosition] = question.correctAnswerIndex;
            let incorrectIndex = 0;
            for (let displayIndex = 0; displayIndex < optionCount; displayIndex += 1) {
                if (displayIndex !== correctPosition) {
                    optionOrder[displayIndex] = incorrectOptionIndexes[incorrectIndex];
                    incorrectIndex += 1;
                }
            }
            this.answerOptionIndexesByQuestionIdentifier.set(question.questionIdentifier, optionOrder);
        });
        this.buildMultipleChoiceQuestion();
    }

    private chooseQuickReviewQuestions(): MultipleChoiceQuestion[] {
        const questionBank = ProgressCheckBank.getAllMultipleChoiceQuestions();
        const assessmentManager = GameSession.getInstance().getAssessmentManager();
        const topicCandidates = CED_UNIT_SEVEN_TOPICS.map((topic) => {
            const topicQuestions = questionBank.filter((question) => question.cedTopicCode === topic.topicCode);
            const practiceSignal = assessmentManager.getTopicPracticeSignal(topic.topicCode);
            const accuracy = practiceSignal.getAccuracyPercentage();
            return {
                topicCode: topic.topicCode,
                topicQuestions,
                attemptCount: practiceSignal.attemptedQuestionCount,
                priority: practiceSignal.attemptedQuestionCount === 0 ? -1 : (accuracy ?? 0),
            };
        })
            .filter((candidate) => candidate.topicQuestions.length > 0)
            .sort(
                (first, second) =>
                    first.priority - second.priority ||
                    first.attemptCount - second.attemptCount ||
                    first.topicCode.localeCompare(second.topicCode),
            );

        return topicCandidates.slice(0, 3).map((candidate) => {
            const rotationIndex = candidate.attemptCount % candidate.topicQuestions.length;
            return candidate.topicQuestions[rotationIndex];
        });
    }

    private getActiveMultipleChoiceQuestions(): MultipleChoiceQuestion[] {
        return this.currentMultipleChoiceQuestions.length > 0
            ? this.currentMultipleChoiceQuestions
            : ProgressCheckBank.getAllMultipleChoiceQuestions();
    }

    private startShortAnswerMode(): void {
        this.buildShortAnswerQuestions();
    }

    private startDocumentBasedMode(): void {
        this.buildDocumentBasedQuestion();
    }

    private buildMultipleChoiceQuestion(): void {
        const multipleChoiceQuestions = this.getActiveMultipleChoiceQuestions();
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
                `${this.multipleChoiceMode === "quick" ? "Quick review" : "Progress check"} · question ${this.currentMultipleChoiceQuestionIndex + 1} ` +
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
        const optionOrder =
            this.answerOptionIndexesByQuestionIdentifier.get(question.questionIdentifier) ??
            question.answerOptions.map((_option, optionIndex) => optionIndex);
        for (let displayedOptionIndex = 0; displayedOptionIndex < optionOrder.length; displayedOptionIndex += 1) {
            const selectedAnswerIndex = optionOrder[displayedOptionIndex];
            contentContainer.add(
                this.createActionButton(
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
        const question = this.getActiveMultipleChoiceQuestions()[this.currentMultipleChoiceQuestionIndex];
        this.hasCurrentQuestionBeenAnswered = true;
        this.selectedAnswerIndexesByQuestionIdentifier.set(question.questionIdentifier, selectedAnswerIndex);
        const wasAnswerCorrect = question.isAnswerCorrect(selectedAnswerIndex);
        GameSession.getInstance()
            .getAssessmentManager()
            .recordTopicPracticeAttempt(question.cedTopicCode, wasAnswerCorrect);
        let cursorY = this.currentQuestionBottomY + 4;
        const topic = CED_UNIT_SEVEN_TOPICS.find((topicRecord) => topicRecord.topicCode === question.cedTopicCode);
        const correctionText = wasAnswerCorrect
            ? `\nWhy it fits: ${question.getResponseFeedback(selectedAnswerIndex)}`
            : `\nYour choice: ${question.answerOptions[selectedAnswerIndex]}\nWhy it misses: ${question.getResponseFeedback(selectedAnswerIndex)}\nStrongest answer: ${question.answerOptions[question.correctAnswerIndex]}\nWhy it fits: ${question.rationaleText}\nNext step: revisit ${topic?.topicTitle ?? question.cedTopicCode} in Scenario ${topic?.scenarioNumbers[0] ?? "linked"}, then connect the idea to a source or map detail.`;
        const feedbackPanelWidth = this.getProgressCheckContentWidth();
        const rationaleTextObject = UiPanelFactory.createBodyText(
            this,
            20,
            20,
            Math.max(120, feedbackPanelWidth - 40),
            `${wasAnswerCorrect ? "Correct." : "Not quite."}${correctionText}`,
            15,
            UiPalette.NEAR_BLACK_LEATHER_CSS,
        );
        const rationalePanel = UiPanelFactory.createPanelContainer(
            this,
            40,
            cursorY,
            feedbackPanelWidth,
            rationaleTextObject.displayHeight + 40,
            PanelVariant.PARCHMENT,
        );
        rationalePanel.add(rationaleTextObject);
        this.contentContainer.add(rationalePanel);
        cursorY += rationaleTextObject.displayHeight + 56;
        this.contentContainer.add(
            this.createActionButton(
                this,
                40,
                cursorY,
                Math.min(360, this.getProgressCheckContentWidth()),
                44,
                "Next question",
                () => {
                    this.advanceToNextMultipleChoiceQuestion();
                },
            ),
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
        const multipleChoiceQuestions = this.getActiveMultipleChoiceQuestions();
        const correctAnswerCount = multipleChoiceQuestions.filter((question) => {
            const selectedAnswerIndex = this.selectedAnswerIndexesByQuestionIdentifier.get(question.questionIdentifier);
            return selectedAnswerIndex !== undefined && question.isAnswerCorrect(selectedAnswerIndex);
        }).length;
        let cursorY = 0;
        contentContainer.add(
            UiPanelFactory.createTypewriterText(
                this,
                40,
                cursorY,
                this.getProgressCheckContentWidth(),
                this.multipleChoiceMode === "quick" ? "Quick review complete." : "Progress check complete.",
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
        if (this.multipleChoiceMode === "quick") {
            const reviewLines = multipleChoiceQuestions.map((question) => {
                const topicTitle =
                    CED_UNIT_SEVEN_TOPICS.find((topic) => topic.topicCode === question.cedTopicCode)?.topicTitle ??
                    question.cedTopicCode;
                const selectedAnswerIndex = this.selectedAnswerIndexesByQuestionIdentifier.get(
                    question.questionIdentifier,
                );
                const resultLabel =
                    selectedAnswerIndex !== undefined && question.isAnswerCorrect(selectedAnswerIndex)
                        ? "Correct this round"
                        : "Revisit this idea";
                return `Topic ${question.cedTopicCode} · ${topicTitle}: ${resultLabel}`;
            });
            const reviewFocusText = UiPanelFactory.createBodyText(
                this,
                40,
                cursorY,
                this.getProgressCheckContentWidth(),
                reviewLines.join("\n"),
                16,
            );
            contentContainer.add(reviewFocusText);
            cursorY += reviewFocusText.displayHeight + 20;
        }
        const practiceNote = UiPanelFactory.createBodyText(
            this,
            40,
            cursorY,
            this.getProgressCheckContentWidth(),
            this.multipleChoiceMode === "quick"
                ? "Quick review focuses on the topics you have practiced least or answered less accurately. Try another round to revisit a different set of questions. This score is a practice signal, not an AP exam prediction."
                : "Use the topic breakdown in the teacher dashboard to decide what to review next. This practice score is not an AP exam prediction.",
            15,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        contentContainer.add(practiceNote);
        cursorY += practiceNote.displayHeight + 18;
        const resultActionWidth = Math.min(360, this.getProgressCheckContentWidth());
        const resultActionsAreStacked = this.scale.width < 640;
        contentContainer.add(
            this.createActionButton(
                this,
                40,
                cursorY,
                resultActionsAreStacked ? resultActionWidth : 220,
                44,
                this.multipleChoiceMode === "quick" ? "Try another review" : "Retry full check",
                () => this.restartMultipleChoiceMode(),
            ),
        );
        contentContainer.add(
            this.createActionButton(
                this,
                resultActionsAreStacked ? 40 : 280,
                cursorY + (resultActionsAreStacked ? 52 : 0),
                resultActionsAreStacked ? resultActionWidth : Math.min(360, this.getProgressCheckContentWidth() - 240),
                44,
                "Back to practice menu",
                () => this.showModeSelectionContent(),
            ),
        );
        cursorY += resultActionsAreStacked ? 112 : 60;
        this.contentHeightPx = cursorY;
        this.applyScrollClamp();
    }

    private restartMultipleChoiceMode(): void {
        if (this.multipleChoiceMode === "quick") {
            this.currentMultipleChoiceQuestions = this.chooseQuickReviewQuestions();
        }
        this.prepareMultipleChoiceRun();
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
                    Math.max(120, this.getProgressCheckContentWidth() - 40),
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
                this.createActionButton(this, 40, cursorY, 260, 44, "Save response", () => {
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
            this.createActionButton(this, 40, cursorY, 240, 44, "Back to practice modes", () => {
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
        const contentWidth = this.getProgressCheckContentWidth();
        const promptTextObject = this.add.text(40, cursorY, documentBasedQuestion.promptText, {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "22px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
            wordWrap: { width: contentWidth, useAdvancedWrap: true },
            lineSpacing: 6,
        });
        contentContainer.add(promptTextObject);
        cursorY += promptTextObject.displayHeight + 24;
        const documents: PrimarySource[] = [];
        for (const sourceIdentifier of documentBasedQuestion.documentSourceIdentifiers) {
            const primarySource = PrimarySources.findBySourceIdentifier(sourceIdentifier);
            if (primarySource === null) {
                continue;
            }
            documents.push(primarySource);
        }
        const columnCount = contentWidth >= 700 ? 2 : 1;
        const cardGap = 16;
        const cardWidth = (contentWidth - cardGap * (columnCount - 1)) / columnCount;
        for (let rowStart = 0; rowStart < documents.length; rowStart += columnCount) {
            let rowHeight = 0;
            for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
                const primarySource = documents[rowStart + columnIndex];
                if (primarySource === undefined) {
                    continue;
                }
                const cardX = 40 + columnIndex * (cardWidth + cardGap);
                const card = this.buildDocumentCard(cardX, cursorY, cardWidth, primarySource);
                contentContainer.add(card.container);
                rowHeight = Math.max(rowHeight, card.height);
            }
            cursorY += rowHeight + cardGap;
        }
        cursorY += 2;
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
            this.createActionButton(this, 40, cursorY, 260, 44, "Save essay", () => {
                this.handleSaveDocumentBasedEssay(documentBasedQuestion.promptText, essayField, feedbackTextObject);
            }),
        );
        cursorY += 60;
        this.contentHeightPx = cursorY;
        this.applyScrollClamp();
    }

    private buildDocumentCard(
        x: number,
        y: number,
        width: number,
        primarySource: PrimarySource,
    ): { container: Phaser.GameObjects.Container; height: number } {
        const textWidth = Math.max(120, width - 32);
        const cardContainer = UiPanelFactory.createPanelContainer(this, x, y, width, 0, PanelVariant.PARCHMENT);
        cardContainer.setName("progress-check-document-card");
        const titleTextObject = this.add.text(16, 12, primarySource.sourceDisplayTitle, {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "16px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            wordWrap: { width: textWidth, useAdvancedWrap: true },
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
                wordWrap: { width: textWidth, useAdvancedWrap: true },
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
                wordWrap: { width: textWidth, useAdvancedWrap: true },
                lineSpacing: 3,
            },
        );
        cardContainer.add(excerptTextObject);
        const cardHeight =
            12 +
            titleTextObject.displayHeight +
            4 +
            attributionTextObject.displayHeight +
            6 +
            excerptTextObject.displayHeight +
            12;
        cardContainer.setSize(width, cardHeight);
        const cardBackground = cardContainer.getAt(0);
        if (cardBackground instanceof Phaser.GameObjects.Graphics) {
            cardBackground.clear();
            cardBackground.fillStyle(UiPalette.PARCHMENT, 1);
            cardBackground.fillRect(0, 0, width, cardHeight);
            cardBackground.lineStyle(2, UiPalette.DEEP_BRASS, 0.9);
            cardBackground.strokeRect(1, 1, width - 2, cardHeight - 2);
        }
        return { container: cardContainer, height: cardHeight };
    }

    private buildExcerptText(excerptText: string): string {
        const maximumExcerptLength = 260;
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
