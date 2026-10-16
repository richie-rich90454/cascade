import Phaser from "phaser";

import { prefersReducedMotion } from "../core/AccessibilityPreferences";
import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { Rubrics, ShortAnswerRubricItem } from "../data/Rubrics";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import type { ScenarioEvaluationResult } from "../domain/scenarios/Scenario";
import { FontFamilies } from "../managers/FontManager";
import { StudentTextEntryField } from "../ui/QuickwriteComponent";
import { FlowCursor, FlowLayout } from "../ui/UiFlowLayout";
import { UiPalette } from "../ui/UiPalette";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";
import { ScenarioSelectionPayload } from "./ScenarioBriefingScene";

export class DebriefScene extends Phaser.Scene {
    private scenarioNumber: number;
    private contextualizationField: StudentTextEntryField | null;
    private resultOverlayContainer: Phaser.GameObjects.Container | null;

    constructor() {
        super({ key: SceneKeys.DEBRIEF });
        this.scenarioNumber = 1;
        this.contextualizationField = null;
        this.resultOverlayContainer = null;
    }

    public init(data: unknown): void {
        const selectionPayload = data as ScenarioSelectionPayload;
        const sessionScenario = GameSession.getInstance().getCurrentScenario();
        this.scenarioNumber =
            typeof selectionPayload.scenarioNumber === "number"
                ? selectionPayload.scenarioNumber
                : sessionScenario === null
                  ? 1
                  : sessionScenario.getScenarioNumber();
        this.contextualizationField = null;
        this.resultOverlayContainer = null;
    }

    public create(): void {
        const scenario = ScenarioRegistry.getInstance().getScenarioByNumber(this.scenarioNumber);
        const gameSession = GameSession.getInstance();
        if (scenario === null || !gameSession.isScenarioActive()) {
            this.scene.start(SceneKeys.MAIN_MENU);
            return;
        }
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        this.add.rectangle(0, 0, screenWidth, screenHeight, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        this.add.rectangle(0, 0, screenWidth, 96, UiPalette.DARK_OLIVE).setOrigin(0, 0).setAlpha(0.6);
        UiPanelFactory.createBrassButton(this, 24, 24, 170, 44, "BACK TO MAP", () => {
            this.scene.start(SceneKeys.SCENARIO_PLAY, new ScenarioSelectionPayload(this.scenarioNumber));
        });
        this.add
            .text(214, 46, `DEBRIEF - ${scenario.getScenarioTitle()}`, {
                fontFamily: FontFamilies.DISPLAY_SERIF,
                fontSize: "24px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
            })
            .setOrigin(0, 0.5);
        gameSession.getAudioManager().playMusicTrack("menu_debrief");

        const panelLeftX = 40;
        const panelTopY = 96;
        const panelWidth = screenWidth - 80;
        const panelHeight = screenHeight - 200;
        UiPanelFactory.createPanelContainer(this, panelLeftX, panelTopY, panelWidth, panelHeight, PanelVariant.LEATHER);
        const contentContainer = this.add.container(panelLeftX, panelTopY);
        contentContainer.setDepth(UiPalette.UI_DEPTH_PANEL + 1);
        const contentWrapWidth = panelWidth - 72;
        const flowCursor = new FlowCursor(36, 22);

        flowCursor.placeText(
            contentContainer,
            UiPanelFactory.createBodyText(
                this,
                0,
                0,
                contentWrapWidth,
                "Answer each question in complete sentences. Your responses are saved to the journal and checked against the AP-style criteria. When you are done, press COMPLETE DEBRIEF to record your scenario result.",
                16,
                UiPalette.PARCHMENT_CSS,
            ),
            20,
        );

        const rubricItems = Rubrics.getRubricItemsForScenario(this.scenarioNumber);
        const debriefQuestionPrompts = scenario.getDebriefQuestionPrompts();
        debriefQuestionPrompts.forEach((debriefPrompt, questionIndex) => {
            const matchingRubricItem = rubricItems.find((rubricItem) => rubricItem.promptText === debriefPrompt);
            flowCursor.placeText(
                contentContainer,
                UiPanelFactory.createSectionHeader(
                    this,
                    0,
                    0,
                    `QUESTION ${questionIndex + 1} OF ${debriefQuestionPrompts.length}`,
                    18,
                ),
                8,
            );
            flowCursor.placeText(
                contentContainer,
                UiPanelFactory.createBodyText(
                    this,
                    0,
                    0,
                    contentWrapWidth,
                    debriefPrompt,
                    17,
                    UiPalette.AGED_PARCHMENT_CSS,
                ),
                10,
            );
            const responseField = new StudentTextEntryField(
                this,
                0,
                0,
                contentWrapWidth,
                92,
                "Write your response here...",
            );
            const responseFieldContainer = responseField.getFieldContainer();
            responseFieldContainer.setSize(contentWrapWidth, 92);
            flowCursor.placeContainer(contentContainer, responseFieldContainer, 6);
            const scoreLabel = UiPanelFactory.createTypewriterText(
                this,
                0,
                0,
                contentWrapWidth - 220,
                "",
                13,
                UiPalette.HIGHLIGHT_BRASS_CSS,
            );
            const saveButton = UiPanelFactory.createBrassButton(this, 0, 0, 200, 40, "SAVE RESPONSE", () => {
                this.saveDebriefResponse(debriefPrompt, responseField, matchingRubricItem, scoreLabel);
            });
            saveButton.setSize(200, 40);
            flowCursor.placeContainer(contentContainer, saveButton, 4);
            flowCursor.placeText(contentContainer, scoreLabel, 18);
            flowCursor.placeGraphics(
                contentContainer,
                UiPanelFactory.createHorizontalDivider(this, 0, 0, contentWrapWidth),
                18,
            );
        });

        flowCursor.placeText(
            contentContainer,
            UiPanelFactory.createSectionHeader(this, 0, 0, "CONTEXTUALIZATION PARAGRAPH · HISTORICAL CONTEXT", 18),
            8,
        );
        flowCursor.placeText(
            contentContainer,
            UiPanelFactory.createBodyText(
                this,
                0,
                0,
                contentWrapWidth,
                "Write three to five sentences explaining how a specific development from this scenario is situated within the broader historical context.",
                16,
                UiPalette.AGED_PARCHMENT_CSS,
            ),
            10,
        );
        this.contextualizationField = new StudentTextEntryField(
            this,
            0,
            0,
            contentWrapWidth,
            104,
            "Write your contextualization paragraph here...",
        );
        const contextualizationFieldContainer = this.contextualizationField.getFieldContainer();
        contextualizationFieldContainer.setSize(contentWrapWidth, 104);
        flowCursor.placeContainer(contentContainer, contextualizationFieldContainer, 6);
        const contextualizationScoreLabel = UiPanelFactory.createTypewriterText(
            this,
            0,
            0,
            contentWrapWidth - 260,
            "",
            13,
            UiPalette.HIGHLIGHT_BRASS_CSS,
        );
        const contextualizationSaveButton = UiPanelFactory.createBrassButton(
            this,
            0,
            0,
            240,
            40,
            "SAVE CONTEXTUALIZATION",
            () => {
                this.saveContextualizationParagraph(contextualizationScoreLabel);
            },
        );
        contextualizationSaveButton.setSize(240, 40);
        flowCursor.placeContainer(contentContainer, contextualizationSaveButton, 4);
        flowCursor.placeText(contentContainer, contextualizationScoreLabel, 24);

        FlowLayout.fitContentIntoViewport(contentContainer, flowCursor.getCurrentY() + 24, panelHeight - 24);

        UiPanelFactory.createBrassButton(
            this,
            screenWidth / 2 - 160,
            screenHeight - 84,
            320,
            54,
            "COMPLETE DEBRIEF",
            () => {
                this.completeDebriefAndRecordResult();
            },
        );
    }

    private saveDebriefResponse(
        debriefPrompt: string,
        responseField: StudentTextEntryField,
        matchingRubricItem: ShortAnswerRubricItem | undefined,
        scoreLabel: Phaser.GameObjects.Text,
    ): void {
        const responseText = responseField.getEnteredText().trim();
        if (responseText.length === 0) {
            scoreLabel.setText("Write a response before saving.");
            scoreLabel.setColor(UiPalette.ALERT_TEXT_ON_DARK_CSS);
            return;
        }
        const gameSession = GameSession.getInstance();
        gameSession
            .getAssessmentManager()
            .addJournalEntry(
                this.scenarioNumber,
                gameSession.getCurrentTurnNumber(),
                "debrief",
                debriefPrompt,
                responseText,
            );
        if (matchingRubricItem !== undefined) {
            const practiceFeedback = gameSession
                .getAssessmentManager()
                .getShortAnswerPracticeFeedback(matchingRubricItem, responseText);
            const detectedCriteria = practiceFeedback.criteria
                .map((criterion) => `${criterion.wasSignalDetected ? "✓" : "○"} ${criterion.criterionText}`)
                .join("\n");
            scoreLabel.setText(
                `Saved. Practice estimate: ${practiceFeedback.detectedSignalCount} of ${practiceFeedback.maximumSignalCount} criterion signals detected. This keyword-based check can miss valid wording; ask your teacher to review.\n${detectedCriteria}`,
            );
        } else {
            scoreLabel.setText("Saved to journal.");
        }
        scoreLabel.setColor(UiPalette.HIGHLIGHT_BRASS_CSS);
    }

    private saveContextualizationParagraph(scoreLabel: Phaser.GameObjects.Text): void {
        if (this.contextualizationField === null) {
            return;
        }
        const responseText = this.contextualizationField.getEnteredText().trim();
        if (responseText.length === 0) {
            scoreLabel.setText("Write a paragraph before saving.");
            scoreLabel.setColor(UiPalette.ALERT_TEXT_ON_DARK_CSS);
            return;
        }
        const gameSession = GameSession.getInstance();
        const achievedScore = gameSession.getAssessmentManager().scoreContextualizationParagraph(responseText);
        gameSession
            .getAssessmentManager()
            .addJournalEntry(
                this.scenarioNumber,
                gameSession.getCurrentTurnNumber(),
                "contextualization",
                "Contextualization paragraph",
                responseText,
            );
        if (achievedScore >= 3) {
            gameSession.getGameState().setScenarioFlag(`contextualization_s${this.scenarioNumber}_scored`);
            scoreLabel.setText(
                `Saved. Practice estimate: ${achievedScore} of 3 contextualization signals detected. This automatic check cannot judge historical accuracy or nuance; ask your teacher to review. Check for broader context, an explicit connection, and an explanation of significance.`,
            );
            scoreLabel.setColor(UiPalette.HIGHLIGHT_BRASS_CSS);
            return;
        }
        scoreLabel.setText(
            `Saved. Practice estimate: ${achievedScore} of 3 contextualization signals detected. This automatic check can miss valid wording; ask your teacher to review. Check for broader context, an explicit connection, and an explanation of significance.`,
        );
        scoreLabel.setColor(UiPalette.AGED_PARCHMENT_CSS);
    }

    private completeDebriefAndRecordResult(): void {
        const gameSession = GameSession.getInstance();
        const scenarioEvaluationResult = gameSession.evaluateCurrentScenario();
        if (scenarioEvaluationResult === null) {
            return;
        }
        gameSession.recordScenarioCompletion(scenarioEvaluationResult);
        this.renderResultOverlay(scenarioEvaluationResult);
        gameSession
            .getAudioManager()
            .playMusicTrack(scenarioEvaluationResult.isVictory ? "jingle_victory" : "jingle_defeat", false);
        if (scenarioEvaluationResult.isVictory) {
            this.spawnVictoryCelebrationParticles();
        }
    }

    private renderResultOverlay(scenarioEvaluationResult: ScenarioEvaluationResult): void {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        if (this.resultOverlayContainer !== null) {
            this.resultOverlayContainer.destroy(true);
        }
        this.resultOverlayContainer = this.add.container(0, 0);
        this.resultOverlayContainer.setDepth(UiPalette.UI_DEPTH_POPUP);
        const overlayRectangle = this.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.72).setOrigin(0, 0);
        overlayRectangle.setInteractive();
        this.resultOverlayContainer.add(overlayRectangle);

        const resultPanelWidth = Math.min(780, screenWidth - 80);
        const resultPanelHeight = Math.min(600, screenHeight - 100);
        const resultPanelLeftX = (screenWidth - resultPanelWidth) / 2;
        const resultPanelTopY = (screenHeight - resultPanelHeight) / 2;
        const resultPanel = UiPanelFactory.createPanelContainer(
            this,
            resultPanelLeftX,
            resultPanelTopY,
            resultPanelWidth,
            resultPanelHeight,
            scenarioEvaluationResult.isVictory ? PanelVariant.PARCHMENT : PanelVariant.LEATHER,
        );
        const resultBodyColorCss = scenarioEvaluationResult.isVictory
            ? UiPalette.NEAR_BLACK_LEATHER_CSS
            : UiPalette.PARCHMENT_CSS;
        resultPanel.add(
            UiPanelFactory.createSectionHeader(
                this,
                28,
                22,
                scenarioEvaluationResult.isVictory
                    ? `SCENARIO ${scenarioEvaluationResult.scenarioNumber} COMPLETE - VICTORY`
                    : `SCENARIO ${scenarioEvaluationResult.scenarioNumber} INCOMPLETE`,
                24,
                resultBodyColorCss,
            ),
        );
        resultPanel.add(
            UiPanelFactory.createBodyText(
                this,
                28,
                62,
                resultPanelWidth - 56,
                `Score: ${scenarioEvaluationResult.earnedScore} of ${scenarioEvaluationResult.maximumScore} criteria met.`,
                18,
                resultBodyColorCss,
            ),
        );

        const criteriaContainer = this.add.container(resultPanelLeftX, resultPanelTopY);
        criteriaContainer.setDepth(UiPalette.UI_DEPTH_POPUP + 1);
        const criteriaCursor = new FlowCursor(32, 104);
        criteriaCursor.placeText(
            criteriaContainer,
            UiPanelFactory.createSectionHeader(this, 0, 0, "MET", 16, resultBodyColorCss),
            8,
        );
        for (const satisfiedCriterion of scenarioEvaluationResult.satisfiedCriteria) {
            criteriaCursor.placeText(
                criteriaContainer,
                UiPanelFactory.createBodyText(
                    this,
                    0,
                    0,
                    resultPanelWidth - 80,
                    `+ ${satisfiedCriterion}`,
                    15,
                    resultBodyColorCss,
                ),
                6,
            );
        }
        if (scenarioEvaluationResult.unmetCriteria.length > 0) {
            criteriaCursor.addGap(10);
            criteriaCursor.placeText(
                criteriaContainer,
                UiPanelFactory.createSectionHeader(this, 0, 0, "NOT YET MET", 16, resultBodyColorCss),
                8,
            );
            for (const unmetCriterion of scenarioEvaluationResult.unmetCriteria) {
                criteriaCursor.placeText(
                    criteriaContainer,
                    UiPanelFactory.createBodyText(
                        this,
                        0,
                        0,
                        resultPanelWidth - 80,
                        `- ${unmetCriterion}`,
                        15,
                        resultBodyColorCss,
                    ),
                    6,
                );
            }
        }
        FlowLayout.fitContentIntoViewport(
            criteriaContainer,
            criteriaCursor.getCurrentY() + 24,
            resultPanelHeight - 190,
        );

        const buttonRowLeftX = 28;
        const buttonRowTopY = resultPanelHeight - 70;
        resultPanel.add(
            UiPanelFactory.createBrassButton(this, buttonRowLeftX, buttonRowTopY, 220, 48, "RETURN TO MAP", () => {
                this.scene.start(SceneKeys.SCENARIO_PLAY, new ScenarioSelectionPayload(this.scenarioNumber));
            }),
        );
        resultPanel.add(
            UiPanelFactory.createBrassButton(this, buttonRowLeftX + 240, buttonRowTopY, 220, 48, "CAMPAIGNS", () => {
                this.scene.start(SceneKeys.CAMPAIGN_SELECTOR);
            }),
        );
        resultPanel.add(
            UiPanelFactory.createBrassButton(this, buttonRowLeftX + 480, buttonRowTopY, 220, 48, "JOURNAL", () => {
                this.scene.start(SceneKeys.JOURNAL);
            }),
        );
        this.resultOverlayContainer.add(resultPanel);
    }

    private spawnVictoryCelebrationParticles(): void {
        if (prefersReducedMotion()) {
            return;
        }
        const particleTextureKey = "asset-status_star_full";
        if (!this.textures.exists(particleTextureKey)) {
            return;
        }
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        const celebrationEmitter = this.add.particles(screenWidth / 2, screenHeight / 2, particleTextureKey, {
            speed: { min: 180, max: 420 },
            angle: { min: 0, max: 360 },
            gravityY: 320,
            lifespan: 1600,
            quantity: 48,
            scale: { start: 1.4, end: 0.2 },
            tint: [UiPalette.HIGHLIGHT_BRASS, UiPalette.BRIGHT_BRASS, UiPalette.PARCHMENT, UiPalette.BRIGHT_BLOOD],
            emitting: false,
        });
        celebrationEmitter.setDepth(UiPalette.UI_DEPTH_TOOLTIP);
        celebrationEmitter.explode(48);
    }
}
