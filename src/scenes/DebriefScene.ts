import Phaser from "phaser";
import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { Rubrics, ShortAnswerRubricItem } from "../data/Rubrics";
import type { ScenarioEvaluationResult } from "../domain/scenarios/Scenario";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import { FontFamilies } from "../managers/FontManager";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";
import { StudentTextEntryField } from "../ui/QuickwriteComponent";
import { UiPalette } from "../ui/UiPalette";
import { ScenarioSelectionPayload } from "./ScenarioBriefingScene";

export class DebriefScene extends Phaser.Scene {
    private scenarioNumber: number;
    private debriefResponseFields: StudentTextEntryField[];
    private contextualizationField: StudentTextEntryField | null;
    private resultPanelContainer: Phaser.GameObjects.Container | null;

    constructor() {
        super({ key: SceneKeys.DEBRIEF });
        this.scenarioNumber = 1;
        this.debriefResponseFields = [];
        this.contextualizationField = null;
        this.resultPanelContainer = null;
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
        this.debriefResponseFields = [];
        this.contextualizationField = null;
        this.resultPanelContainer = null;
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
        UiPanelFactory.createSectionHeader(this, screenWidth / 2 - 90, 20, "DEBRIEF", 28);
        UiPanelFactory.createBrassButton(this, 24, 18, 170, 44, "BACK TO MAP", () => {
            this.scene.start(SceneKeys.SCENARIO_PLAY, new ScenarioSelectionPayload(this.scenarioNumber));
        });
        gameSession.getAudioManager().playMusicTrack("menu_debrief");

        const debriefPanel = UiPanelFactory.createPanelContainer(this, 30, 80, screenWidth - 60, screenHeight - 180, PanelVariant.LEATHER);
        debriefPanel.add(
            UiPanelFactory.createBodyText(
                this,
                20,
                14,
                screenWidth - 120,
                "Answer each question below in full sentences. Your responses are saved to the journal and scored against the AP-style criteria. When you finish, press Complete Debrief to record your scenario result.",
                16,
                UiPalette.PARCHMENT_CSS,
            ),
        );

        const rubricItems = Rubrics.getRubricItemsForScenario(this.scenarioNumber);
        let layoutOffsetY = 68;
        scenario.getDebriefQuestionPrompts().forEach((debriefPrompt, questionIndex) => {
            const matchingRubricItem = rubricItems.find((rubricItem) => rubricItem.promptText === debriefPrompt);
            debriefPanel.add(UiPanelFactory.createSectionHeader(this, 20, layoutOffsetY, `QUESTION ${questionIndex + 1}`, 18));
            layoutOffsetY += 28;
            debriefPanel.add(
                UiPanelFactory.createBodyText(this, 20, layoutOffsetY, screenWidth - 120, debriefPrompt, 16, UiPalette.AGED_PARCHMENT_CSS),
            );
            layoutOffsetY += 62;
            const responseField = new StudentTextEntryField(this, 20, layoutOffsetY, screenWidth - 130, 84, "Write your response here...");
            debriefPanel.add(responseField.getFieldContainer());
            this.debriefResponseFields.push(responseField);
            const scoreLabel = this.add.text(20, layoutOffsetY + 92, "", {
                fontFamily: FontFamilies.TYPEWRITER_BODY,
                fontSize: "13px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
            });
            debriefPanel.add(scoreLabel);
            debriefPanel.add(
                UiPanelFactory.createBrassButton(this, screenWidth - 320, layoutOffsetY + 90, 180, 38, "SAVE RESPONSE", () => {
                    this.saveDebriefResponse(debriefPrompt, responseField, matchingRubricItem, scoreLabel);
                }),
            );
            layoutOffsetY += 150;
        });

        debriefPanel.add(UiPanelFactory.createHorizontalDivider(this, 20, layoutOffsetY, screenWidth - 120));
        layoutOffsetY += 16;
        debriefPanel.add(UiPanelFactory.createSectionHeader(this, 20, layoutOffsetY, "CONTEXTUALIZATION PARAGRAPH (SKILL 4.B)", 18));
        layoutOffsetY += 28;
        debriefPanel.add(
            UiPanelFactory.createBodyText(
                this,
                20,
                layoutOffsetY,
                screenWidth - 120,
                "Write three to five sentences explaining how a specific development from this scenario is situated within the broader historical context.",
                15,
                UiPalette.AGED_PARCHMENT_CSS,
            ),
        );
        layoutOffsetY += 50;
        this.contextualizationField = new StudentTextEntryField(
            this,
            20,
            layoutOffsetY,
            screenWidth - 130,
            96,
            "Write your contextualization paragraph here...",
        );
        debriefPanel.add(this.contextualizationField.getFieldContainer());
        const contextualizationScoreLabel = this.add.text(20, layoutOffsetY + 104, "", {
            fontFamily: FontFamilies.TYPEWRITER_BODY,
            fontSize: "13px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        debriefPanel.add(contextualizationScoreLabel);
        debriefPanel.add(
            UiPanelFactory.createBrassButton(this, screenWidth - 380, layoutOffsetY + 102, 240, 38, "SAVE CONTEXTUALIZATION", () => {
                this.saveContextualizationParagraph(contextualizationScoreLabel);
            }),
        );

        UiPanelFactory.createBrassButton(this, screenWidth / 2 - 160, screenHeight - 84, 320, 54, "COMPLETE DEBRIEF", () => {
            this.completeDebriefAndRecordResult();
        });
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
            scoreLabel.setColor(UiPalette.BRIGHT_BLOOD_CSS);
            return;
        }
        const gameSession = GameSession.getInstance();
        gameSession.getAssessmentManager().addJournalEntry(
            this.scenarioNumber,
            gameSession.getCurrentTurnNumber(),
            "debrief",
            debriefPrompt,
            responseText,
        );
        if (matchingRubricItem !== undefined) {
            const earnedPoints = gameSession.getAssessmentManager().scoreShortAnswerResponse(matchingRubricItem, responseText);
            scoreLabel.setText(`Saved. Criteria met: ${earnedPoints} of ${matchingRubricItem.maximumPointValue}.`);
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
            scoreLabel.setColor(UiPalette.BRIGHT_BLOOD_CSS);
            return;
        }
        const gameSession = GameSession.getInstance();
        const achievedScore = gameSession.getAssessmentManager().scoreContextualizationParagraph(responseText);
        gameSession.getAssessmentManager().addJournalEntry(
            this.scenarioNumber,
            gameSession.getCurrentTurnNumber(),
            "contextualization",
            "Contextualization paragraph (Skill 4.B)",
            responseText,
        );
        if (achievedScore >= 3) {
            gameSession.getGameState().setScenarioFlag(`contextualization_s${this.scenarioNumber}_scored`);
            scoreLabel.setText(`Saved. Contextualization scored ${achievedScore} of 3. Criterion met.`);
        } else {
            scoreLabel.setText(`Saved. Contextualization scored ${achievedScore} of 3. Revise for a stronger connection to context.`);
        }
        scoreLabel.setColor(achievedScore >= 3 ? UiPalette.HIGHLIGHT_BRASS_CSS : UiPalette.AGED_PARCHMENT_CSS);
    }

    private completeDebriefAndRecordResult(): void {
        const gameSession = GameSession.getInstance();
        const scenarioEvaluationResult = gameSession.evaluateCurrentScenario();
        if (scenarioEvaluationResult === null) {
            return;
        }
        gameSession.recordScenarioCompletion(scenarioEvaluationResult);
        this.renderResultPanel(scenarioEvaluationResult);
        gameSession
            .getAudioManager()
            .playMusicTrack(scenarioEvaluationResult.isVictory ? "jingle_victory" : "jingle_defeat", false);
    }

    private renderResultPanel(scenarioEvaluationResult: ScenarioEvaluationResult): void {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        if (this.resultPanelContainer !== null) {
            this.resultPanelContainer.destroy(true);
        }
        this.resultPanelContainer = this.add.container(0, 0);
        this.resultPanelContainer.setDepth(UiPalette.UI_DEPTH_POPUP);
        const overlayRectangle = this.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.72).setOrigin(0, 0);
        overlayRectangle.setInteractive();
        this.resultPanelContainer.add(overlayRectangle);
        const resultPanelWidth = Math.min(760, screenWidth - 80);
        const resultPanelHeight = Math.min(560, screenHeight - 120);
        const resultPanel = UiPanelFactory.createPanelContainer(
            this,
            (screenWidth - resultPanelWidth) / 2,
            (screenHeight - resultPanelHeight) / 2,
            resultPanelWidth,
            resultPanelHeight,
            scenarioEvaluationResult.isVictory ? PanelVariant.PARCHMENT : PanelVariant.LEATHER,
        );
        const resultTitle = scenarioEvaluationResult.isVictory
            ? `SCENARIO ${scenarioEvaluationResult.scenarioNumber} COMPLETE - VICTORY`
            : `SCENARIO ${scenarioEvaluationResult.scenarioNumber} INCOMPLETE`;
        resultPanel.add(
            UiPanelFactory.createSectionHeader(
                this,
                24,
                20,
                resultTitle,
                24,
            ),
        );
        const resultBodyColorCss = scenarioEvaluationResult.isVictory ? UiPalette.NEAR_BLACK_LEATHER_CSS : UiPalette.PARCHMENT_CSS;
        resultPanel.add(
            UiPanelFactory.createBodyText(
                this,
                24,
                64,
                resultPanelWidth - 48,
                `Score: ${scenarioEvaluationResult.earnedScore} of ${scenarioEvaluationResult.maximumScore} criteria.`,
                18,
                resultBodyColorCss,
            ),
        );
        let criteriaOffsetY = 104;
        resultPanel.add(UiPanelFactory.createSectionHeader(this, 24, criteriaOffsetY, "MET", 16));
        criteriaOffsetY += 26;
        for (const satisfiedCriterion of scenarioEvaluationResult.satisfiedCriteria) {
            resultPanel.add(UiPanelFactory.createBodyText(this, 36, criteriaOffsetY, resultPanelWidth - 70, `+ ${satisfiedCriterion}`, 14, resultBodyColorCss));
            criteriaOffsetY += 24;
        }
        if (scenarioEvaluationResult.unmetCriteria.length > 0) {
            criteriaOffsetY += 10;
            resultPanel.add(UiPanelFactory.createSectionHeader(this, 24, criteriaOffsetY, "NOT YET MET", 16));
            criteriaOffsetY += 26;
            for (const unmetCriterion of scenarioEvaluationResult.unmetCriteria) {
                resultPanel.add(UiPanelFactory.createBodyText(this, 36, criteriaOffsetY, resultPanelWidth - 70, `- ${unmetCriterion}`, 14, resultBodyColorCss));
                criteriaOffsetY += 24;
            }
        }
        resultPanel.add(
            UiPanelFactory.createBrassButton(this, 24, resultPanelHeight - 66, 220, 46, "RETURN TO MAP", () => {
                this.scene.start(SceneKeys.SCENARIO_PLAY, new ScenarioSelectionPayload(this.scenarioNumber));
            }),
        );
        resultPanel.add(
            UiPanelFactory.createBrassButton(this, 260, resultPanelHeight - 66, 220, 46, "CAMPAIGNS", () => {
                this.scene.start(SceneKeys.CAMPAIGN_SELECTOR);
            }),
        );
        resultPanel.add(
            UiPanelFactory.createBrassButton(this, 496, resultPanelHeight - 66, 220, 46, "JOURNAL", () => {
                this.scene.start(SceneKeys.JOURNAL);
            }),
        );
        this.resultPanelContainer.add(resultPanel);
    }
}
