import Phaser from "phaser";

import type { GameState } from "../core/GameState";
import { PrimarySources } from "../data/PrimarySources";
import type { Scenario } from "../domain/scenarios/Scenario";
import { FontFamilies } from "../managers/FontManager";
import type { IntelligenceManager } from "../managers/IntelligenceManager";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";
import { UiScrollHelper } from "./UiScrollHelper";

export class QuestObjectiveRecord {
    public readonly objectiveIdentifier: string;
    public readonly objectiveTitle: string;
    public readonly isCompleted: boolean;
    public readonly mechanicKey: string;

    constructor(objectiveIdentifier: string, objectiveTitle: string, isCompleted: boolean, mechanicKey: string) {
        this.objectiveIdentifier = objectiveIdentifier;
        this.objectiveTitle = objectiveTitle;
        this.isCompleted = isCompleted;
        this.mechanicKey = mechanicKey;
    }
}

export class QuestTrackerComponent extends Phaser.GameObjects.Container {
    private readonly panelWidth: number;
    private readonly panelHeight: number;
    private readonly onMechanicRequested: (mechanicKey: string) => void;
    private readonly contentContainer: Phaser.GameObjects.Container;
    private readonly progressBarGraphics: Phaser.GameObjects.Graphics;
    private readonly progressLabelText: Phaser.GameObjects.Text;
    private readonly nextStepButtonHolder: Phaser.GameObjects.Container;

    private requiredObjectives: QuestObjectiveRecord[];
    private recommendedObjectives: QuestObjectiveRecord[];

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        onMechanicRequested: (mechanicKey: string) => void,
    ) {
        super(scene, x, y);
        this.panelWidth = width;
        this.panelHeight = height;
        this.onMechanicRequested = onMechanicRequested;
        this.requiredObjectives = [];
        this.recommendedObjectives = [];

        const panelBackground = UiPanelFactory.createPanelContainer(scene, 0, 0, width, height, PanelVariant.LEATHER);
        this.add(panelBackground);
        const blockingZone = scene.add.zone(0, 0, width, height).setOrigin(0, 0);
        blockingZone.setInteractive();
        this.add(blockingZone);

        const headerText = UiPanelFactory.createSectionHeader(scene, 16, 12, "SCENARIO PROGRESS", 18);
        this.add(headerText);
        this.progressLabelText = scene.add.text(width - 16, 16, "", {
            fontFamily: FontFamilies.TYPEWRITER_BODY,
            fontSize: "13px",
            color: UiPalette.AGED_PARCHMENT_CSS,
        });
        this.progressLabelText.setOrigin(1, 0);
        this.add(this.progressLabelText);
        this.progressBarGraphics = scene.add.graphics();
        this.add(this.progressBarGraphics);

        this.contentContainer = scene.add.container(0, 84);
        this.add(this.contentContainer);

        this.nextStepButtonHolder = scene.add.container(16, height - 108);
        this.add(this.nextStepButtonHolder);
        const allToolsButton = UiPanelFactory.createBrassButton(
            scene,
            16,
            height - 56,
            width - 32,
            42,
            "ALL TOOLS AND VIEWS",
            () => {
                this.onMechanicRequested("all_tools");
            },
        );
        this.add(allToolsButton);

        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_SIDEBAR);
    }

    public refreshFromScenario(
        scenario: Scenario,
        gameState: GameState,
        intelligenceManager: IntelligenceManager,
        scenarioNumber: number,
    ): void {
        this.requiredObjectives = this.buildRequiredObjectives(
            scenario,
            gameState,
            intelligenceManager,
            scenarioNumber,
        );
        this.recommendedObjectives = this.buildRecommendedObjectives(
            scenario,
            gameState,
            intelligenceManager,
            scenarioNumber,
        );
        this.renderObjectivesList();
        this.renderProgress();
        this.renderNextStepButton();
    }

    private buildRequiredObjectives(
        scenario: Scenario,
        gameState: GameState,
        intelligenceManager: IntelligenceManager,
        scenarioNumber: number,
    ): QuestObjectiveRecord[] {
        const objectives: QuestObjectiveRecord[] = [];
        const decisionRecords = scenario.getDecisionRecords();
        if (decisionRecords.length > 0) {
            const completedDecisionCount = decisionRecords.filter((decisionRecord) =>
                decisionRecord.options.some((decisionOption) =>
                    gameState.isScenarioFlagSet(decisionOption.resultingFlagIdentifier),
                ),
            ).length;
            objectives.push(
                new QuestObjectiveRecord(
                    "decisions",
                    `Make your decisions (${completedDecisionCount} of ${decisionRecords.length})`,
                    completedDecisionCount >= decisionRecords.length,
                    "decision",
                ),
            );
        }
        for (const causalChainDefinition of scenario.getCausalChainDefinitions()) {
            objectives.push(
                new QuestObjectiveRecord(
                    causalChainDefinition.chainIdentifier,
                    `Order the causes: ${causalChainDefinition.chainTitle}`,
                    gameState.isScenarioFlagSet(`${causalChainDefinition.chainIdentifier}_complete`),
                    "causal_chain",
                ),
            );
        }
        if (scenario.getComparisonDefinition() !== null) {
            objectives.push(
                new QuestObjectiveRecord(
                    `comparison_s${scenarioNumber}`,
                    "Complete the comparison table",
                    gameState.isScenarioFlagSet(`comparison_s${scenarioNumber}_complete`),
                    "comparison",
                ),
            );
        }
        if (scenario.getContinuityChangeDefinition() !== null) {
            objectives.push(
                new QuestObjectiveRecord(
                    `continuity_chart_s${scenarioNumber}`,
                    "Complete the Continuity and Change chart",
                    gameState.isScenarioFlagSet(`continuity_chart_s${scenarioNumber}_complete`),
                    "chart",
                ),
            );
        }
        if (scenarioNumber === 5) {
            objectives.push(
                new QuestObjectiveRecord(
                    "territorial_chart_s5",
                    "Complete the Territorial Holdings chart",
                    gameState.isScenarioFlagSet("territorial_chart_s5_complete"),
                    "territorial_chart",
                ),
            );
            objectives.push(
                new QuestObjectiveRecord(
                    "quickwrite_s5",
                    "Save the Clemenceau quickwrite",
                    gameState.isScenarioFlagSet("quickwrite_s5_saved"),
                    "quickwrite",
                ),
            );
        }
        if (scenarioNumber === 4) {
            const pathFlagIdentifiers = [
                "path_s4_soviet",
                "path_s4_new_deal",
                "path_s4_fascist_corporatist",
                "path_s4_brazil",
                "path_s4_mexico",
            ];
            const playedPathCount = pathFlagIdentifiers.filter((pathFlagIdentifier) =>
                gameState.isScenarioFlagSet(pathFlagIdentifier),
            ).length;
            objectives.push(
                new QuestObjectiveRecord(
                    "paths_s4",
                    `Play at least three responses to the crisis (${playedPathCount} of 3)`,
                    playedPathCount >= 3,
                    "decision",
                ),
            );
            objectives.push(
                new QuestObjectiveRecord(
                    "shared_inquiry_s4",
                    "Complete the shared inquiry on Cardenas and Stalin",
                    gameState.isScenarioFlagSet("shared_inquiry_s4_saved"),
                    "shared_inquiry",
                ),
            );
        }
        if (scenarioNumber === 3) {
            objectives.push(
                new QuestObjectiveRecord(
                    "sources_s3",
                    "Analyze at least three sources correctly",
                    gameState.isScenarioFlagSet("sources_s3_three_correct"),
                    "sources",
                ),
            );
        }
        if (scenarioNumber === 9) {
            objectives.push(
                new QuestObjectiveRecord(
                    "sources_s9",
                    "Analyze at least eight sources correctly",
                    gameState.isScenarioFlagSet("sources_s9_eight_correct"),
                    "sources",
                ),
            );
            objectives.push(
                new QuestObjectiveRecord(
                    "relationship_s9",
                    "Complete the relationship analysis",
                    gameState.isScenarioFlagSet("relationship_s9_complete"),
                    "relationship",
                ),
            );
        }
        if (scenarioNumber === 7 || scenarioNumber === 8) {
            const seminarOrCoalitionFlagIdentifier =
                scenarioNumber === 7 ? "socratic_seminar_s7_saved" : "coalition_s8_held";
            objectives.push(
                new QuestObjectiveRecord(
                    seminarOrCoalitionFlagIdentifier,
                    scenarioNumber === 7
                        ? "Save your Socratic seminar responses"
                        : "Hold the Grand Coalition to the final turn",
                    gameState.isScenarioFlagSet(seminarOrCoalitionFlagIdentifier),
                    scenarioNumber === 7 ? "seminar" : "decision",
                ),
            );
        }
        if (scenario.getArgumentDefinition() !== null) {
            objectives.push(
                new QuestObjectiveRecord(
                    `argument_s${scenarioNumber}`,
                    "Build your historical argument",
                    gameState.isScenarioFlagSet(`argument_s${scenarioNumber}_complete`),
                    scenarioNumber === 10 ? "complex_argument" : "argument",
                ),
            );
        }
        if (scenarioNumber === 2 || scenarioNumber === 6) {
            const consequencePrefix = `consequence_s${scenarioNumber}_`;
            const consequenceCount = gameState
                .getScenarioFlags()
                .filter((flagIdentifier) => flagIdentifier.startsWith(consequencePrefix)).length;
            objectives.push(
                new QuestObjectiveRecord(
                    `consequences_s${scenarioNumber}`,
                    `Identify the war's consequences (${consequenceCount} of 3)`,
                    consequenceCount >= 3,
                    "decision",
                ),
            );
        }
        const focusTreeDefinition = scenario.getFocusTreeDefinition();
        if (focusTreeDefinition !== null) {
            for (const focusNodeDefinition of focusTreeDefinition.focusNodes) {
                if (focusNodeDefinition.unlockedByCausalChainIdentifier.length === 0) {
                    continue;
                }
                const flagBase = focusNodeDefinition.nodeIdentifier.startsWith("focus_")
                    ? focusNodeDefinition.nodeIdentifier.substring(6)
                    : focusNodeDefinition.nodeIdentifier;
                objectives.push(
                    new QuestObjectiveRecord(
                        `focus_node_${flagBase}`,
                        `Unlock and complete the focus: ${focusNodeDefinition.nodeDisplayName}`,
                        gameState.isScenarioFlagSet(`focus_node_${flagBase}_complete`),
                        "focus_tree",
                    ),
                );
            }
        }
        objectives.push(
            new QuestObjectiveRecord(
                `contextualization_s${scenarioNumber}`,
                "Write the contextualization paragraph and finish the debrief",
                gameState.isScenarioFlagSet(`contextualization_s${scenarioNumber}_scored`),
                "debrief",
            ),
        );
        void intelligenceManager;
        return objectives;
    }

    private buildRecommendedObjectives(
        scenario: Scenario,
        gameState: GameState,
        intelligenceManager: IntelligenceManager,
        scenarioNumber: number,
    ): QuestObjectiveRecord[] {
        const recommendedObjectives: QuestObjectiveRecord[] = [];
        const scenarioSourceIdentifiers = scenario.getPrimarySourceIdentifiers();
        if (scenarioSourceIdentifiers.length > 0) {
            let correctlyAnalyzedCount = 0;
            for (const sourceIdentifier of scenarioSourceIdentifiers) {
                const resolvedSource = PrimarySources.findBySourceIdentifier(sourceIdentifier);
                if (
                    resolvedSource !== null &&
                    intelligenceManager.getSourceAnalysisResult(resolvedSource.sourceIdentifier) === true
                ) {
                    correctlyAnalyzedCount += 1;
                }
            }
            recommendedObjectives.push(
                new QuestObjectiveRecord(
                    `sources_overview_s${scenarioNumber}`,
                    `Sources read reliably: ${correctlyAnalyzedCount} of ${scenarioSourceIdentifiers.length}`,
                    correctlyAnalyzedCount >= scenarioSourceIdentifiers.length,
                    "sources",
                ),
            );
        }
        if (scenario.getTestimonyRecords().length > 0) {
            recommendedObjectives.push(
                new QuestObjectiveRecord(
                    `testimony_s${scenarioNumber}`,
                    "Read the testimony and record reflections",
                    gameState.isScenarioFlagSet(`testimony_s${scenarioNumber}_saved`),
                    "testimony",
                ),
            );
        }
        if (scenario.supportsDiplomaticPlay()) {
            recommendedObjectives.push(
                new QuestObjectiveRecord("diplomacy", "Practice a diplomatic play", false, "diplomacy"),
            );
        }
        if (scenario.supportsProductionQueue()) {
            recommendedObjectives.push(
                new QuestObjectiveRecord("production", "Queue wartime production", false, "production"),
            );
        }
        if (scenario.supportsDivisionDesigner()) {
            recommendedObjectives.push(new QuestObjectiveRecord("divisions", "Design a division", false, "divisions"));
        }
        recommendedObjectives.push(new QuestObjectiveRecord("ledger", "Study the ledger data tables", false, "ledger"));
        return recommendedObjectives;
    }

    private renderObjectivesList(): void {
        this.contentContainer.removeAll(true);
        const listWidth = this.panelWidth - 32;
        let rowOffsetY = 0;
        this.contentContainer.add(
            this.createObjectiveSectionLabel("VICTORY CHECKLIST", rowOffsetY, UiPalette.HIGHLIGHT_BRASS_CSS),
        );
        rowOffsetY += 26;
        for (const requiredObjective of this.requiredObjectives) {
            const rowHeight = this.createObjectiveRow(requiredObjective, rowOffsetY, listWidth);
            rowOffsetY += rowHeight + 6;
        }
        if (this.recommendedObjectives.length > 0) {
            rowOffsetY += 8;
            this.contentContainer.add(
                this.createObjectiveSectionLabel("RECOMMENDED", rowOffsetY, UiPalette.BRASS_TAN_CSS),
            );
            rowOffsetY += 26;
            for (const recommendedObjective of this.recommendedObjectives) {
                const rowHeight = this.createObjectiveRow(recommendedObjective, rowOffsetY, listWidth);
                rowOffsetY += rowHeight + 6;
            }
        }
        const listHeightPx = this.panelHeight - 84 - 120;
        UiScrollHelper.enableWheelScrolling(
            this.scene,
            this.x,
            this.y + 84,
            this.panelWidth,
            listHeightPx,
            this.contentContainer,
            rowOffsetY + 16,
        );
    }

    private createObjectiveSectionLabel(labelText: string, offsetY: number, colorCss: string): Phaser.GameObjects.Text {
        const sectionLabel = this.scene.add.text(16, offsetY, labelText, {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "13px",
            color: colorCss,
        });
        return sectionLabel;
    }

    private createObjectiveRow(objectiveRecord: QuestObjectiveRecord, offsetY: number, rowWidth: number): number {
        const rowContainer = this.scene.add.container(12, offsetY);
        rowContainer.setSize(rowWidth, 34);
        const checkGlyph = objectiveRecord.isCompleted ? "\u2713" : "\u2022";
        const checkGlyphColorCss = objectiveRecord.isCompleted
            ? UiPalette.HIGHLIGHT_BRASS_CSS
            : UiPalette.FIELD_GRAY_CSS;
        const checkText = this.scene.add.text(0, 2, checkGlyph, {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "16px",
            color: checkGlyphColorCss,
        });
        rowContainer.add(checkText);
        const objectiveText = this.scene.add.text(22, 0, objectiveRecord.objectiveTitle, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "14px",
            color: objectiveRecord.isCompleted ? UiPalette.AGED_PARCHMENT_CSS : UiPalette.PARCHMENT_CSS,
            wordWrap: { width: rowWidth - 34, useAdvancedWrap: true },
            lineSpacing: 2,
        });
        if (objectiveRecord.isCompleted) {
            objectiveText.setAlpha(0.65);
        }
        rowContainer.add(objectiveText);
        const rowHeight = Math.max(30, objectiveText.height + 6);
        const rowZone = this.scene.add.zone(0, 0, rowWidth, rowHeight).setOrigin(0, 0);
        rowZone.setInteractive({ useHandCursor: true });
        rowZone.on("pointerover", () => {
            objectiveText.setColor(UiPalette.HIGHLIGHT_BRASS_CSS);
        });
        rowZone.on("pointerout", () => {
            objectiveText.setColor(
                objectiveRecord.isCompleted ? UiPalette.AGED_PARCHMENT_CSS : UiPalette.PARCHMENT_CSS,
            );
        });
        rowZone.on("pointerup", () => {
            this.onMechanicRequested(objectiveRecord.mechanicKey);
        });
        rowContainer.add(rowZone);
        this.contentContainer.add(rowContainer);
        return rowHeight;
    }

    private renderProgress(): void {
        const completedCount = this.requiredObjectives.filter(
            (requiredObjective) => requiredObjective.isCompleted,
        ).length;
        const totalCount = Math.max(1, this.requiredObjectives.length);
        this.progressLabelText.setText(`${completedCount} of ${this.requiredObjectives.length} complete`);
        const progressRatio = completedCount / totalCount;
        this.progressBarGraphics.clear();
        this.progressBarGraphics.fillStyle(UiPalette.DARK_OLIVE, 1);
        this.progressBarGraphics.fillRect(16, 42, this.panelWidth - 32, 14);
        this.progressBarGraphics.fillStyle(UiPalette.BRIGHT_BRASS, 1);
        this.progressBarGraphics.fillRect(18, 44, Math.max(0, (this.panelWidth - 36) * progressRatio), 10);
        this.progressBarGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.9);
        this.progressBarGraphics.strokeRect(16, 42, this.panelWidth - 32, 14);
    }

    private renderNextStepButton(): void {
        this.nextStepButtonHolder.removeAll(true);
        const nextIncompleteObjective =
            this.requiredObjectives.find((requiredObjective) => !requiredObjective.isCompleted) ??
            this.requiredObjectives[this.requiredObjectives.length - 1];
        const buttonLabelText =
            nextIncompleteObjective === undefined
                ? "COMPLETE DEBRIEF"
                : `NEXT STEP: ${this.buildShortButtonLabel(nextIncompleteObjective.objectiveTitle)}`;
        const nextStepButton = UiPanelFactory.createBrassButton(
            this.scene,
            0,
            0,
            this.panelWidth - 32,
            44,
            buttonLabelText,
            () => {
                this.onMechanicRequested(
                    nextIncompleteObjective === undefined ? "debrief" : nextIncompleteObjective.mechanicKey,
                );
            },
        );
        this.nextStepButtonHolder.add(nextStepButton);
    }

    private buildShortButtonLabel(objectiveTitle: string): string {
        const maximumLabelLength = 26;
        if (objectiveTitle.length <= maximumLabelLength) {
            return objectiveTitle.toUpperCase();
        }
        return `${objectiveTitle.substring(0, maximumLabelLength - 3).toUpperCase()}...`;
    }
}
