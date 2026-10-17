import Phaser from "phaser";

import type { GameState } from "../core/GameState";
import { PrimarySources } from "../data/PrimarySources";
import type { Scenario } from "../domain/scenarios/Scenario";
import { FontFamilies } from "../managers/FontManager";
import type { IntelligenceManager } from "../managers/IntelligenceManager";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";
import { ScrollRegion, UiPointerRouting } from "./UiPointerRouting";
import { UiScrollInput } from "./UiScrollInput";

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
    private readonly onMechanicRequested: (mechanicKey: string) => void;
    private readonly contentContainer: Phaser.GameObjects.Container;
    private readonly progressBarGraphics: Phaser.GameObjects.Graphics;
    private readonly progressLabelText: Phaser.GameObjects.Text;
    private readonly scrollHintText: Phaser.GameObjects.Text;
    private readonly scrollBarGraphics: Phaser.GameObjects.Graphics;
    private readonly maskGraphics: Phaser.GameObjects.Graphics;
    private readonly nextStepButtonHolder: Phaser.GameObjects.Container;
    private readonly allToolsButton: Phaser.GameObjects.Container;
    private readonly viewportHeight: number;

    private requiredObjectives: QuestObjectiveRecord[];
    private pointerRegion: ScrollRegion | null;
    private recommendedObjectives: QuestObjectiveRecord[];
    private currentScenarioNumber: number;
    private contentHeight: number;
    private scrollOffset: number;
    private showAllScenarioOneObjectives: boolean;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        onMechanicRequested: (mechanicKey: string) => void,
        onHideRequested: () => void,
    ) {
        super(scene, x, y);
        this.panelWidth = width;
        this.onMechanicRequested = onMechanicRequested;
        this.requiredObjectives = [];
        this.recommendedObjectives = [];
        this.pointerRegion = null;
        this.currentScenarioNumber = 0;
        this.contentHeight = 0;
        this.scrollOffset = 0;
        this.showAllScenarioOneObjectives = false;
        this.viewportHeight = Math.max(80, height - 84 - 136);

        const panelBackground = UiPanelFactory.createPanelContainer(scene, 0, 0, width, height, PanelVariant.LEATHER);
        this.add(panelBackground);
        const blockingZone = scene.add.zone(0, 0, width, height).setOrigin(0, 0);
        blockingZone.setInteractive();
        this.add(blockingZone);

        const headerText = UiPanelFactory.createSectionHeader(scene, 16, 12, "CAMPAIGN PROGRESS", 13);
        headerText.setWordWrapWidth(Math.max(96, width - 176), true);
        this.add(headerText);
        this.add(UiPanelFactory.createBrassButton(scene, width - 144, 8, 128, 34, "HIDE OBJECTIVES", onHideRequested));
        this.progressLabelText = scene.add.text(width - 16, 60, "", {
            fontFamily: FontFamilies.TYPEWRITER_BODY,
            fontSize: "12px",
            color: UiPalette.AGED_PARCHMENT_CSS,
        });
        this.progressLabelText.setOrigin(1, 0);
        this.add(this.progressLabelText);
        this.scrollHintText = scene.add.text(16, 61, "SCROLL FOR MORE", {
            fontFamily: FontFamilies.TYPEWRITER_BODY,
            fontSize: "11px",
            color: UiPalette.AGED_PARCHMENT_CSS,
        });
        this.add(this.scrollHintText);
        this.progressBarGraphics = scene.add.graphics();
        this.add(this.progressBarGraphics);

        this.scrollBarGraphics = scene.add.graphics();
        this.add(this.scrollBarGraphics);

        this.contentContainer = scene.add.container(0, 84);
        this.add(this.contentContainer);
        this.maskGraphics = scene.add.graphics();
        this.maskGraphics.fillStyle(0xffffff, 1);
        this.maskGraphics.fillRect(x + 8, y + 84, width - 16, this.viewportHeight);
        this.maskGraphics.setVisible(false);
        this.contentContainer.setMask(this.maskGraphics.createGeometryMask());

        this.nextStepButtonHolder = scene.add.container(16, height - 108);
        this.add(this.nextStepButtonHolder);
        this.allToolsButton = UiPanelFactory.createBrassButton(
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
        this.add(this.allToolsButton);

        this.pointerRegion = new ScrollRegion(x, y, width, height);
        UiPointerRouting.registerScrollRegion(this.pointerRegion);
        scene.input.on("wheel", this.handleWheel);
        scene.input.keyboard?.on("keydown", this.handleKeyDown);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            scene.input.off("wheel", this.handleWheel);
            scene.input.keyboard?.off("keydown", this.handleKeyDown);
            if (this.pointerRegion !== null) {
                UiPointerRouting.unregisterScrollRegion(this.pointerRegion);
                this.pointerRegion = null;
            }
            this.contentContainer.clearMask(false);
            this.maskGraphics.destroy();
        });
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_SIDEBAR);
    }

    public refreshFromScenario(
        scenario: Scenario,
        gameState: GameState,
        intelligenceManager: IntelligenceManager,
        scenarioNumber: number,
    ): void {
        this.currentScenarioNumber = scenarioNumber;
        this.allToolsButton.setVisible(scenarioNumber !== 1);
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
                    scenarioNumber === 1
                        ? `Make all five chapter choices (${completedDecisionCount} of ${decisionRecords.length})`
                        : `Make your decisions (${completedDecisionCount} of ${decisionRecords.length})`,
                    completedDecisionCount >= decisionRecords.length,
                    "decision",
                ),
            );
        }
        if (scenarioNumber === 1) {
            for (const sourceIdentifier of scenario.getPrimarySourceIdentifiers()) {
                const source = PrimarySources.findBySourceIdentifier(sourceIdentifier);
                if (source === null) {
                    continue;
                }
                objectives.push(
                    new QuestObjectiveRecord(
                        `source_${sourceIdentifier}`,
                        `Analyze source: ${source.sourceDisplayTitle}`,
                        intelligenceManager.getSourceAnalysisResult(sourceIdentifier) === true,
                        "sources",
                    ),
                );
            }
            const dispatch = scenario
                .getScenarioEventSchedule()
                .find((eventRecord) => eventRecord.eventIdentifier === "assassination_at_sarajevo");
            if (dispatch !== undefined) {
                objectives.push(
                    new QuestObjectiveRecord(
                        "event_s1_sarajevo_read",
                        "Read the documented Sarajevo dispatch from 1914",
                        gameState.isScenarioFlagSet("event_s1_sarajevo_read"),
                        "chapter_route",
                    ),
                );
            }
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
        if (scenarioNumber === 1) {
            return recommendedObjectives;
        }
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
        const listWidth = this.panelWidth - 48;
        const guidanceText = this.scene.add.text(
            16,
            0,
            this.currentScenarioNumber === 1
                ? this.showAllScenarioOneObjectives
                    ? "Required activities. The chapter panel shows the next action."
                    : "Your next action is the highlighted chapter button below the map."
                : "Select a task to open it, or start the next objective for a guided route.",
            {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "14px",
                color: UiPalette.AGED_PARCHMENT_CSS,
                wordWrap: { width: listWidth, useAdvancedWrap: true },
            },
        );
        this.contentContainer.add(guidanceText);
        let rowOffsetY = guidanceText.displayHeight + 12;
        if (this.currentScenarioNumber === 1 && !this.showAllScenarioOneObjectives) {
            rowOffsetY = this.renderCampaignProgressSummary(rowOffsetY, listWidth);
        } else {
            this.contentContainer.add(
                this.createObjectiveSectionLabel("REQUIRED LEARNING GOALS", rowOffsetY, UiPalette.HIGHLIGHT_BRASS_CSS),
            );
            rowOffsetY += 26;
            for (const requiredObjective of this.requiredObjectives) {
                const rowHeight = this.createObjectiveRow(requiredObjective, rowOffsetY, listWidth);
                rowOffsetY += rowHeight + 4;
            }
        }
        if (this.recommendedObjectives.length > 0) {
            rowOffsetY += 8;
            this.contentContainer.add(
                this.createObjectiveSectionLabel("RECOMMENDED", rowOffsetY, UiPalette.BRASS_TAN_CSS),
            );
            rowOffsetY += 26;
            for (const recommendedObjective of this.recommendedObjectives) {
                const rowHeight = this.createObjectiveRow(recommendedObjective, rowOffsetY, listWidth);
                rowOffsetY += rowHeight + 4;
            }
        }
        this.contentHeight = rowOffsetY + 8;
        this.scrollOffset = 0;
        this.contentContainer.y = 84;
        this.updateScrollControls();
    }

    private renderCampaignProgressSummary(startY: number, rowWidth: number): number {
        const decisionsObjective = this.requiredObjectives.find(
            (objective) => objective.objectiveIdentifier === "decisions",
        );
        const decisionsProgress = decisionsObjective?.objectiveTitle.match(/\((\d+) of (\d+)\)/);
        const sourceObjectives = this.requiredObjectives.filter((objective) =>
            objective.objectiveIdentifier.startsWith("source_"),
        );
        const causeObjectives = this.requiredObjectives.filter((objective) =>
            objective.objectiveIdentifier.startsWith("causal_chain_"),
        );
        const synthesisObjectives = this.requiredObjectives.filter(
            (objective) =>
                objective.objectiveIdentifier.startsWith("event_s1_") ||
                objective.objectiveIdentifier.startsWith("continuity_chart_") ||
                objective.objectiveIdentifier.startsWith("contextualization_"),
        );
        const groups = [
            {
                label: "POLICY DECISIONS",
                completed: Number(decisionsProgress?.[1] ?? (decisionsObjective?.isCompleted ? 1 : 0)),
                total: Number(decisionsProgress?.[2] ?? 5),
            },
            {
                label: "PRIMARY SOURCES",
                completed: sourceObjectives.filter((objective) => objective.isCompleted).length,
                total: sourceObjectives.length,
            },
            {
                label: "CAUSE AND EFFECT",
                completed: causeObjectives.filter((objective) => objective.isCompleted).length,
                total: causeObjectives.length,
            },
            {
                label: "HISTORICAL SYNTHESIS",
                completed: synthesisObjectives.filter((objective) => objective.isCompleted).length,
                total: synthesisObjectives.length,
            },
        ];
        let rowOffsetY = startY + 16;
        for (const group of groups) {
            const card = this.scene.add.container(12, rowOffsetY);
            const cardHeight = 57;
            const cardGraphics = this.scene.add.graphics();
            cardGraphics.fillStyle(UiPalette.MID_OLIVE, 0.86);
            cardGraphics.fillRect(0, 0, rowWidth - 12, cardHeight);
            cardGraphics.lineStyle(1, UiPalette.FIELD_GRAY, 0.7);
            cardGraphics.strokeRect(0.5, 0.5, rowWidth - 13, cardHeight - 1);
            card.add(cardGraphics);
            const label = this.scene.add.text(12, 8, group.label, {
                fontFamily: FontFamilies.SMALL_CAPS,
                fontSize: "13px",
                color: UiPalette.PARCHMENT_CSS,
            });
            const count = this.scene.add.text(rowWidth - 36, 8, `${group.completed} / ${group.total}`, {
                fontFamily: FontFamilies.TYPEWRITER_BODY,
                fontSize: "13px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
            });
            count.setOrigin(1, 0);
            card.add([label, count]);
            const progressTrack = this.scene.add.graphics();
            progressTrack.fillStyle(UiPalette.NEAR_BLACK_LEATHER, 1);
            progressTrack.fillRect(12, 34, rowWidth - 38, 8);
            const progressRatio = group.total > 0 ? group.completed / group.total : 0;
            progressTrack.fillStyle(UiPalette.BRIGHT_BRASS, 1);
            progressTrack.fillRect(12, 34, Math.max(0, (rowWidth - 38) * progressRatio), 8);
            card.add(progressTrack);
            this.contentContainer.add(card);
            rowOffsetY += cardHeight + 8;
        }
        return rowOffsetY;
    }

    private handleWheel = (
        pointer: Phaser.Input.Pointer,
        _currentlyOver: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number,
    ): void => {
        const pointerPosition = UiScrollInput.getCssPointerPosition(pointer);
        if (
            this.visible &&
            pointerPosition.x >= this.x + 8 &&
            pointerPosition.x <= this.x + this.panelWidth - 8 &&
            pointerPosition.y >= this.y + 84 &&
            pointerPosition.y <= this.y + 84 + this.viewportHeight
        ) {
            this.scrollObjectives(UiScrollInput.getWheelDeltaPx(pointer, deltaY, this.viewportHeight));
        }
    };

    private handleKeyDown = (event: KeyboardEvent): void => {
        if (this.visible && event.key === "PageDown") {
            event.preventDefault();
            this.scrollObjectives(this.viewportHeight * 0.8);
        } else if (this.visible && event.key === "PageUp") {
            event.preventDefault();
            this.scrollObjectives(-this.viewportHeight * 0.8);
        }
    };

    private scrollObjectives(distancePx: number): void {
        this.scrollOffset = Phaser.Math.Clamp(
            this.scrollOffset + distancePx,
            0,
            Math.max(0, this.contentHeight - this.viewportHeight),
        );
        this.contentContainer.y = 84 - this.scrollOffset;
        this.updateScrollControls();
    }

    private updateScrollControls(): void {
        const maximumScrollOffset = Math.max(0, this.contentHeight - this.viewportHeight);
        const canScroll = maximumScrollOffset > 0;
        this.scrollHintText.setVisible(canScroll);
        this.scrollBarGraphics.clear();
        if (!canScroll) {
            return;
        }
        const trackX = this.panelWidth - 10;
        const trackY = 84;
        this.scrollBarGraphics.fillStyle(UiPalette.DARK_OLIVE, 1);
        this.scrollBarGraphics.fillRect(trackX, trackY, 4, this.viewportHeight);
        const thumbHeight = Math.max(28, this.viewportHeight * (this.viewportHeight / this.contentHeight));
        const thumbY = trackY + (this.viewportHeight - thumbHeight) * (this.scrollOffset / maximumScrollOffset);
        this.scrollBarGraphics.fillStyle(UiPalette.HIGHLIGHT_BRASS, 1);
        this.scrollBarGraphics.fillRect(trackX, thumbY, 4, thumbHeight);
    }

    private createObjectiveSectionLabel(labelText: string, offsetY: number, colorCss: string): Phaser.GameObjects.Text {
        const sectionLabel = this.scene.add.text(16, offsetY, labelText, {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "14px",
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
            lineSpacing: 1,
        });
        if (objectiveRecord.isCompleted) {
        }
        rowContainer.add(objectiveText);
        const rowHeight = Math.max(24, objectiveText.displayHeight + 4);
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
            this.onMechanicRequested(this.currentScenarioNumber === 1 ? "chapter_route" : objectiveRecord.mechanicKey);
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
            this.currentScenarioNumber === 1
                ? this.showAllScenarioOneObjectives
                    ? "SHOW PROGRESS SUMMARY"
                    : "VIEW ALL LEARNING GOALS"
                : nextIncompleteObjective === undefined
                  ? "OPEN FINAL DEBRIEF"
                  : "START NEXT OBJECTIVE";
        const nextStepButton = UiPanelFactory.createBrassButton(
            this.scene,
            0,
            0,
            this.panelWidth - 32,
            44,
            buttonLabelText,
            () => {
                if (this.currentScenarioNumber === 1) {
                    this.showAllScenarioOneObjectives = !this.showAllScenarioOneObjectives;
                    this.renderObjectivesList();
                    this.renderNextStepButton();
                    return;
                }
                this.onMechanicRequested(
                    nextIncompleteObjective === undefined ? "debrief" : nextIncompleteObjective.mechanicKey,
                );
            },
        );
        this.nextStepButtonHolder.add(nextStepButton);
    }
}
