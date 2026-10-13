import Phaser from "phaser";

import { EventBus, GameEventTypes, SourceAnalysisPayload } from "../core/EventBus";
import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { PrimarySource } from "../data/PrimarySource";
import { PrimarySources } from "../data/PrimarySources";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import { FontFamilies } from "../managers/FontManager";
import { SourceAnalysisComponent } from "../ui/SourceAnalysisComponent";
import { UiPalette } from "../ui/UiPalette";
import { UiPanelFactory } from "../ui/UiPanelFactory";
import { ScenarioSelectionPayload } from "./ScenarioBriefingScene";

export class SourceAnalysisScene extends Phaser.Scene {
    private scenarioNumber: number;
    private selectedSourceIndex: number;
    private sourceListContainer: Phaser.GameObjects.Container | null;
    private analysisHostContainer: Phaser.GameObjects.Container | null;

    constructor() {
        super({ key: SceneKeys.SOURCE_ANALYSIS });
        this.scenarioNumber = 1;
        this.selectedSourceIndex = 0;
        this.sourceListContainer = null;
        this.analysisHostContainer = null;
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
        this.selectedSourceIndex = 0;
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
        UiPanelFactory.createSectionHeader(this, screenWidth / 2 - 110, 22, "SOURCE ANALYSIS", 28);
        UiPanelFactory.createBrassButton(this, 24, 20, 170, 44, "BACK TO MAP", () => {
            this.scene.start(SceneKeys.SCENARIO_PLAY, new ScenarioSelectionPayload(this.scenarioNumber));
        });

        this.renderSourceList();
        this.renderSelectedSourceAnalysis();

        EventBus.getInstance().subscribe(GameEventTypes.SOURCE_ANALYZED, (payload: unknown) => {
            const sourceAnalysisPayload = payload as SourceAnalysisPayload;
            this.renderSourceList();
            this.refreshDerivedSourceFlags(sourceAnalysisPayload.wasAnalysisCorrect);
        });
    }

    private getScenarioSources(): PrimarySource[] {
        const scenario = ScenarioRegistry.getInstance().getScenarioByNumber(this.scenarioNumber);
        if (scenario === null) {
            return [];
        }
        const resolvedSources: PrimarySource[] = [];
        for (const sourceIdentifier of scenario.getPrimarySourceIdentifiers()) {
            const resolvedSource = PrimarySources.findBySourceIdentifier(sourceIdentifier);
            if (resolvedSource !== null) {
                resolvedSources.push(resolvedSource);
            }
        }
        return resolvedSources;
    }

    private renderSourceList(): void {
        const screenHeight = this.scale.height;
        if (this.sourceListContainer !== null) {
            this.sourceListContainer.destroy(true);
        }
        this.sourceListContainer = this.add.container(24, 92);
        const scenarioSources = this.getScenarioSources();
        const intelligenceManager = GameSession.getInstance().getIntelligenceManager();
        scenarioSources.forEach((scenarioSource, sourceIndex) => {
            const listEntryContainer = UiPanelFactory.createBrassButton(
                this,
                0,
                sourceIndex * 66,
                430,
                56,
                scenarioSource.sourceDisplayTitle.length > 46
                    ? `${scenarioSource.sourceDisplayTitle.substring(0, 44)}...`
                    : scenarioSource.sourceDisplayTitle,
                () => {
                    this.selectedSourceIndex = sourceIndex;
                    this.renderSelectedSourceAnalysis();
                },
            );
            this.sourceListContainer?.add(listEntryContainer);
            const analysisResult = intelligenceManager.getSourceAnalysisResult(scenarioSource.sourceIdentifier);
            const statusText =
                analysisResult === null
                    ? "Not yet analyzed"
                    : analysisResult
                      ? "Analyzed - intelligence reliable"
                      : "Analyzed - reading corrected";
            const statusColorCss =
                analysisResult === null
                    ? UiPalette.AGED_PARCHMENT_CSS
                    : analysisResult
                      ? UiPalette.HIGHLIGHT_BRASS_CSS
                      : UiPalette.BRIGHT_BLOOD_CSS;
            const statusLabel = this.add.text(12, 58, statusText, {
                fontFamily: FontFamilies.TYPEWRITER_BODY,
                fontSize: "12px",
                color: statusColorCss,
            });
            this.sourceListContainer?.add(statusLabel);
        });
        this.sourceListContainer.setDepth(UiPalette.UI_DEPTH_PANEL);
        if (scenarioSources.length === 0) {
            const emptyLabel = this.add.text(8, 8, "This scenario presents no primary sources.", {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "16px",
                color: UiPalette.PARCHMENT_CSS,
            });
            this.sourceListContainer.add(emptyLabel);
        }
        void screenHeight;
    }

    private renderSelectedSourceAnalysis(): void {
        if (this.analysisHostContainer !== null) {
            this.analysisHostContainer.destroy(true);
        }
        const scenarioSources = this.getScenarioSources();
        if (scenarioSources.length === 0) {
            return;
        }
        const selectedSource = scenarioSources[Math.min(this.selectedSourceIndex, scenarioSources.length - 1)];
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        this.analysisHostContainer = this.add.container(470, 92);
        const analysisComponent = new SourceAnalysisComponent(this, 0, 0, screenWidth - 510, screenHeight - 140);
        analysisComponent.setPrimarySource(
            selectedSource,
            this.scenarioNumber,
            GameSession.getInstance().getGameState(),
            GameSession.getInstance().getIntelligenceManager(),
        );
        this.analysisHostContainer.add(analysisComponent);
    }

    private refreshDerivedSourceFlags(wasAnalysisCorrect: boolean): void {
        void wasAnalysisCorrect;
        const gameState = GameSession.getInstance().getGameState();
        const intelligenceManager = GameSession.getInstance().getIntelligenceManager();
        const scenarioSources = this.getScenarioSources();
        let correctlyAnalyzedCount = 0;
        for (const scenarioSource of scenarioSources) {
            if (intelligenceManager.getSourceAnalysisResult(scenarioSource.sourceIdentifier) === true) {
                correctlyAnalyzedCount += 1;
            }
        }
        if (this.scenarioNumber === 3 && correctlyAnalyzedCount >= 3) {
            gameState.setScenarioFlag("sources_s3_three_correct");
        }
        if (this.scenarioNumber === 9 && correctlyAnalyzedCount >= 8) {
            gameState.setScenarioFlag("sources_s9_eight_correct");
        }
    }
}
