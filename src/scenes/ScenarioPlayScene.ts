import Phaser from "phaser";
import {
    CausalChainPayload,
    DecisionMadePayload,
    EventBus,
    GameEventTypes,
    MechanicCompletedPayload,
    NavigationRequestedPayload,
    NewspaperRequestPayload,
    PhaseChangePayload,
    TelegramRequestPayload,
} from "../core/EventBus";
import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { PrimarySources } from "../data/PrimarySources";
import { Rubrics } from "../data/Rubrics";
import type { Scenario, DecisionRecord } from "../domain/scenarios/Scenario";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import { WorldStatePresent } from "../domain/WorldStatePresent";
import { FontFamilies } from "../managers/FontManager";
import { ResourceType } from "../types/ResourceType";
import { BottomBarComponent } from "../ui/BottomBarComponent";
import { CausalArgumentBuilderComponent } from "../ui/CausalArgumentBuilderComponent";
import { CausalChainComponent } from "../ui/CausalChainComponent";
import { CasualtyChartComponent } from "../ui/CasualtyChartComponent";
import { ComparisonToolComponent } from "../ui/ComparisonToolComponent";
import { ComplexArgumentBuilderComponent } from "../ui/ComplexArgumentBuilderComponent";
import { ContinuityChangeChartComponent } from "../ui/ContinuityChangeChartComponent";
import { DecisionPanelComponent } from "../ui/DecisionPanelComponent";
import { GovernmentInterventionMeterComponent } from "../ui/GovernmentInterventionMeterComponent";
import { LeftSidebarComponent, MapModeOption } from "../ui/LeftSidebarComponent";
import { MapCameraController } from "../ui/MapCameraController";
import { NewspaperPopupComponent } from "../ui/NewspaperPopupComponent";
import { ProvincePanelComponent } from "../ui/ProvincePanelComponent";
import { QuickwriteComponent } from "../ui/QuickwriteComponent";
import { RelationshipComponent } from "../ui/RelationshipComponent";
import { RightSidebarComponent } from "../ui/RightSidebarComponent";
import { ScenarioHeaderComponent } from "../ui/ScenarioHeaderComponent";
import { SharedInquiryComponent } from "../ui/SharedInquiryComponent";
import { SocraticSeminarComponent } from "../ui/SocraticSeminarComponent";
import { TelegramPopupComponent } from "../ui/TelegramPopupComponent";
import { TerritorialHoldingsChartComponent } from "../ui/TerritorialHoldingsChartComponent";
import { TestimonyPanelComponent } from "../ui/TestimonyPanelComponent";
import { TopBarComponent } from "../ui/TopBarComponent";
import { UiPalette } from "../ui/UiPalette";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";
import { ScenarioSelectionPayload } from "./ScenarioBriefingScene";

class TurnPhaseLabel {
    public static readonly PHASE_LABELS: string[] = [
        "Briefing",
        "Intelligence",
        "Decision",
        "Resolution",
        "Event",
        "Debrief",
        "Journal",
    ];
}

export class ScenarioPlayScene extends Phaser.Scene {
    private scenarioNumber: number;
    private scenario: Scenario | null;
    private phaseIndex: number;
    private lastConsequenceText: string;
    private mapContainer: Phaser.GameObjects.Container | null;
    private provinceTilesByProvinceIdentifier: Map<string, Phaser.GameObjects.Rectangle>;
    private phasePanelContainer: Phaser.GameObjects.Container | null;
    private mechanicOverlayContainer: Phaser.GameObjects.Container | null;
    private rightSidebarComponent: RightSidebarComponent | null;
    private bottomBarComponent: BottomBarComponent | null;
    private topBarComponent: TopBarComponent | null;
    private mapCameraController: MapCameraController | null;
    private activeMapModeCode: string;
    private boundNewspaperHandler: (payload: unknown) => void;
    private boundTelegramHandler: (payload: unknown) => void;
    private boundNavigationHandler: (payload: unknown) => void;
    private boundMapModeHandler: (payload: unknown) => void;
    private boundDecisionHandler: (payload: unknown) => void;
    private boundMechanicHandler: (payload: unknown) => void;
    private boundPhaseHandler: (payload: unknown) => void;

    constructor() {
        super({ key: SceneKeys.SCENARIO_PLAY });
        this.scenarioNumber = 1;
        this.scenario = null;
        this.phaseIndex = 0;
        this.lastConsequenceText = "";
        this.mapContainer = null;
        this.provinceTilesByProvinceIdentifier = new Map<string, Phaser.GameObjects.Rectangle>();
        this.phasePanelContainer = null;
        this.mechanicOverlayContainer = null;
        this.rightSidebarComponent = null;
        this.bottomBarComponent = null;
        this.topBarComponent = null;
        this.mapCameraController = null;
        this.activeMapModeCode = MapModeOption.POLITICAL.getMapModeCode();
        this.boundNewspaperHandler = () => undefined;
        this.boundTelegramHandler = () => undefined;
        this.boundNavigationHandler = () => undefined;
        this.boundMapModeHandler = () => undefined;
        this.boundDecisionHandler = () => undefined;
        this.boundMechanicHandler = () => undefined;
        this.boundPhaseHandler = () => undefined;
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
        this.phaseIndex = 0;
        this.lastConsequenceText = "";
        this.provinceTilesByProvinceIdentifier = new Map<string, Phaser.GameObjects.Rectangle>();
        this.mechanicOverlayContainer = null;
        this.phasePanelContainer = null;
    }

    public create(): void {
        const gameSession = GameSession.getInstance();
        const scenario = ScenarioRegistry.getInstance().getScenarioByNumber(this.scenarioNumber);
        if (scenario === null || !gameSession.isScenarioActive()) {
            this.scene.start(SceneKeys.MAIN_MENU);
            return;
        }
        this.scenario = scenario;
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        this.add.rectangle(0, 0, screenWidth, screenHeight, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        this.renderProvinceMap();
        this.renderPersistentChrome();
        this.renderMechanicLauncher();
        this.renderPhasePanel();
        this.subscribeToGameEvents();
        gameSession.getAudioManager().playMusicTrack(`ambient_scenario_${scenario.getScenarioNumber()}`);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.unsubscribeFromGameEvents();
        });
    }

    public override update(): void {
        if (this.mapCameraController !== null) {
            this.mapCameraController.update();
        }
    }

    private renderProvinceMap(): void {
        const gameState = GameSession.getInstance().getGameState();
        const allProvinces = gameState.getAllProvinces();
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        this.mapContainer = this.add.container(0, 64);
        if (allProvinces.length === 0) {
            const documentationPanel = UiPanelFactory.createPanelContainer(
                this,
                24,
                12,
                screenWidth - 380,
                screenHeight - 220,
                PanelVariant.PARCHMENT,
                UiPalette.UI_DEPTH_BASE,
            );
            documentationPanel.add(
                UiPanelFactory.createSectionHeader(this, 20, 18, this.scenario === null ? "" : this.scenario.getScenarioTitle(), 24),
            );
            documentationPanel.add(
                UiPanelFactory.createBodyText(
                    this,
                    20,
                    58,
                    screenWidth - 440,
                    "This scenario is presented through documentation, testimony, and argument rather than a map. Use the mechanics below to work through the historical record.",
                    17,
                    UiPalette.NEAR_BLACK_LEATHER_CSS,
                ),
            );
            this.mapContainer.add(documentationPanel);
            return;
        }
        const tilePixelSize = 56;
        for (const province of allProvinces) {
            const ownerNation = gameState.getNation(province.getOwnerNationIdentifier());
            const ownerColor =
                ownerNation === null ? UiPalette.FIELD_GRAY : UiPalette.getFactionColorForNationCode(ownerNation.getNationCode());
            const tileRectangle = this.add.rectangle(
                province.getColumnIndex() * tilePixelSize,
                province.getRowIndex() * tilePixelSize,
                tilePixelSize - 2,
                tilePixelSize - 2,
                ownerColor,
            );
            tileRectangle.setOrigin(0, 0);
            tileRectangle.setInteractive({ useHandCursor: true });
            tileRectangle.on("pointerover", () => {
                tileRectangle.setStrokeStyle(2, UiPalette.HIGHLIGHT_BRASS);
            });
            tileRectangle.on("pointerout", () => {
                tileRectangle.setStrokeStyle(0);
            });
            tileRectangle.on("pointerup", () => {
                this.onProvinceSelected(province.getIdentifier());
            });
            this.provinceTilesByProvinceIdentifier.set(province.getIdentifier(), tileRectangle);
            this.mapContainer.add(tileRectangle);
            if (province.isCapital()) {
                const capitalMarker = this.add.text(
                    province.getColumnIndex() * tilePixelSize + tilePixelSize / 2,
                    province.getRowIndex() * tilePixelSize + tilePixelSize / 2,
                    "*",
                    { fontFamily: FontFamilies.DISPLAY_SERIF, fontSize: "20px", color: UiPalette.HIGHLIGHT_BRASS_CSS },
                );
                capitalMarker.setOrigin(0.5, 0.5);
                this.mapContainer.add(capitalMarker);
            }
        }
        const mapPixelWidth = 24 * tilePixelSize;
        const mapPixelHeight = 15 * tilePixelSize;
        this.mapCameraController = new MapCameraController(this, mapPixelWidth, mapPixelHeight);
        this.mapCameraController.enablePanning();
        this.mapCameraController.enableZoom();
        this.cameras.main.setBounds(0, 0, mapPixelWidth, Math.max(mapPixelHeight, this.scale.height));
        this.applyMapMode(this.activeMapModeCode);
    }

    private renderPersistentChrome(): void {
        const gameSession = GameSession.getInstance();
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        this.topBarComponent = new TopBarComponent(this, 0, 0, screenWidth, gameSession.getGameState());
        const scenarioHeaderComponent = new ScenarioHeaderComponent(this, 8, 52, 560);
        if (this.scenario !== null) {
            scenarioHeaderComponent.setScenario(this.scenario);
        }
        new LeftSidebarComponent(this, 0, 88, screenHeight - 220, this.activeMapModeCode);
        this.rightSidebarComponent = new RightSidebarComponent(this, screenWidth - 320, 88, 320, screenHeight - 220);
        this.rightSidebarComponent.setContentToEmptyPrompt();
        this.bottomBarComponent = new BottomBarComponent(this, 0, screenHeight - 56, screenWidth, 56);
        this.bottomBarComponent.setTurnDisplay(gameSession.getCurrentTurnNumber(), gameSession.getTotalTurnCount());
        this.bottomBarComponent.setPhaseDisplay(TurnPhaseLabel.PHASE_LABELS[this.phaseIndex]);
    }

    private renderMechanicLauncher(): void {
        if (this.scenario === null) {
            return;
        }
        const screenWidth = this.scale.width;
        const launcherContainer = this.add.container(600, 96);
        launcherContainer.setDepth(UiPalette.UI_DEPTH_SIDEBAR);
        const launcherEntries: Array<{ labelText: string; onActivated: () => void }> = [];
        if (this.scenario.getCausalChainDefinitions().length > 0) {
            launcherEntries.push({ labelText: "CAUSAL CHAINS", onActivated: () => this.openCausalChainsOverlay() });
        }
        if (this.scenario.getComparisonDefinition() !== null) {
            launcherEntries.push({ labelText: "COMPARISON", onActivated: () => this.openComparisonOverlay() });
        }
        if (this.scenario.getContinuityChangeDefinition() !== null) {
            launcherEntries.push({ labelText: "CHART", onActivated: () => this.openContinuityChartOverlay() });
        }
        if (this.scenario.getScenarioNumber() === 5) {
            launcherEntries.push({ labelText: "HOLDINGS", onActivated: () => this.openTerritorialHoldingsOverlay() });
        }
        if (this.scenario.getPrimarySourceIdentifiers().length > 0) {
            launcherEntries.push({
                labelText: "SOURCES",
                onActivated: () => this.scene.start(SceneKeys.SOURCE_ANALYSIS, new ScenarioSelectionPayload(this.scenarioNumber)),
            });
        }
        if (this.scenario.getScenarioNumber() === 5) {
            launcherEntries.push({ labelText: "QUICKWRITE", onActivated: () => this.openQuickwriteOverlay() });
        }
        if (this.scenario.getScenarioNumber() === 4) {
            launcherEntries.push({ labelText: "SHARED INQUIRY", onActivated: () => this.openSharedInquiryOverlay() });
            launcherEntries.push({ labelText: "INTERVENTION", onActivated: () => this.openInterventionMeterOverlay() });
        }
        if (this.scenario.getScenarioNumber() === 7) {
            launcherEntries.push({ labelText: "SEMINAR", onActivated: () => this.openSocraticSeminarOverlay() });
        }
        if (this.scenario.getArgumentDefinition() !== null) {
            launcherEntries.push({ labelText: "ARGUMENT", onActivated: () => this.openArgumentBuilderOverlay() });
        }
        if (this.scenario.getScenarioNumber() === 10) {
            launcherEntries.push({ labelText: "COMPLEX ARGUMENT", onActivated: () => this.openComplexArgumentOverlay() });
        }
        if (this.scenario.getTestimonyRecords().length > 0) {
            launcherEntries.push({ labelText: "TESTIMONY", onActivated: () => this.openTestimonyOverlay() });
        }
        if (this.scenario.getRelationshipPromptTexts().length > 0) {
            launcherEntries.push({ labelText: "RELATIONSHIPS", onActivated: () => this.openRelationshipOverlay() });
        }
        if ([3, 7, 8].includes(this.scenario.getScenarioNumber())) {
            launcherEntries.push({ labelText: "CASUALTIES", onActivated: () => this.openCasualtyChartOverlay() });
        }
        if (this.scenario.getFocusTreeDefinition() !== null) {
            launcherEntries.push({ labelText: "FOCUS TREE", onActivated: () => this.scene.start(SceneKeys.FOCUS_TREE) });
        }
        if (this.scenario.supportsProductionQueue()) {
            launcherEntries.push({ labelText: "PRODUCTION", onActivated: () => this.scene.start(SceneKeys.PRODUCTION_QUEUE) });
        }
        if (this.scenario.supportsDivisionDesigner()) {
            launcherEntries.push({ labelText: "DIVISIONS", onActivated: () => this.scene.start(SceneKeys.DIVISION_DESIGNER) });
        }
        if ([2, 3, 7, 8].includes(this.scenario.getScenarioNumber())) {
            launcherEntries.push({ labelText: "WAR SCORE", onActivated: () => this.scene.start(SceneKeys.WAR_SCORE) });
        }
        if (this.scenario.supportsDiplomaticPlay()) {
            launcherEntries.push({ labelText: "DIPLOMACY", onActivated: () => this.scene.start(SceneKeys.DIPLOMATIC_PLAY) });
        }
        const chipPixelWidth = 156;
        const chipsPerRow = Math.max(1, Math.floor((screenWidth - 640) / (chipPixelWidth + 8)));
        launcherEntries.forEach((launcherEntry, launcherIndex) => {
            const rowIndex = Math.floor(launcherIndex / chipsPerRow);
            const columnIndex = launcherIndex % chipsPerRow;
            const chipButton = UiPanelFactory.createBrassButton(
                this,
                columnIndex * (chipPixelWidth + 8),
                rowIndex * 44,
                chipPixelWidth,
                38,
                launcherEntry.labelText,
                launcherEntry.onActivated,
            );
            launcherContainer.add(chipButton);
        });
    }

    private renderPhasePanel(): void {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        if (this.phasePanelContainer !== null) {
            this.phasePanelContainer.destroy(true);
        }
        this.phasePanelContainer = this.add.container(600, 240);
        this.phasePanelContainer.setDepth(UiPalette.UI_DEPTH_PANEL);
        const panelWidth = Math.max(560, screenWidth - 960);
        const panelHeight = screenHeight - 400;
        const phasePanel = UiPanelFactory.createPanelContainer(this, 0, 0, panelWidth, panelHeight, PanelVariant.LEATHER);
        this.phasePanelContainer.add(phasePanel);
        const currentPhaseLabel = TurnPhaseLabel.PHASE_LABELS[this.phaseIndex];
        phasePanel.add(UiPanelFactory.createSectionHeader(this, 20, 16, `TURN PHASE: ${currentPhaseLabel.toUpperCase()}`, 20));
        if (this.scenario === null) {
            return;
        }
        switch (currentPhaseLabel) {
            case "Briefing":
                this.renderBriefingPhaseContent(phasePanel, panelWidth);
                break;
            case "Intelligence":
                this.renderIntelligencePhaseContent(phasePanel, panelWidth);
                break;
            case "Decision":
                this.renderDecisionPhaseContent(phasePanel, panelWidth);
                break;
            case "Resolution":
                this.renderResolutionPhaseContent(phasePanel, panelWidth);
                break;
            case "Event":
                this.renderEventPhaseContent(phasePanel, panelWidth);
                break;
            case "Debrief":
                this.renderDebriefPhaseContent(phasePanel, panelWidth);
                break;
            case "Journal":
                this.renderJournalPhaseContent(phasePanel, panelWidth);
                break;
            default:
                break;
        }
    }

    private renderBriefingPhaseContent(phasePanel: Phaser.GameObjects.Container, panelWidth: number): void {
        if (this.scenario === null) {
            return;
        }
        phasePanel.add(
            UiPanelFactory.createBodyText(
                this,
                20,
                52,
                panelWidth - 40,
                this.scenario.getBriefingParagraphs()[0],
                16,
                UiPalette.PARCHMENT_CSS,
            ),
        );
        let objectiveOffsetY = 170;
        for (const objectiveSummary of this.scenario.getObjectiveSummaries()) {
            phasePanel.add(UiPanelFactory.createBodyText(this, 28, objectiveOffsetY, panelWidth - 60, `- ${objectiveSummary}`, 14, UiPalette.AGED_PARCHMENT_CSS));
            objectiveOffsetY += 30;
        }
        phasePanel.add(this.createContinuePhaseButton(panelWidth));
    }

    private renderIntelligencePhaseContent(phasePanel: Phaser.GameObjects.Container, panelWidth: number): void {
        if (this.scenario === null) {
            return;
        }
        const intelligenceManager = GameSession.getInstance().getIntelligenceManager();
        phasePanel.add(
            UiPanelFactory.createBodyText(
                this,
                20,
                52,
                panelWidth - 40,
                "Primary sources arrive as intelligence. Analyze each source's point of view, purpose, historical situation, and audience to draw reliable conclusions. A misread source yields misleading intelligence.",
                15,
                UiPalette.PARCHMENT_CSS,
            ),
        );
        phasePanel.add(
            UiPanelFactory.createTypewriterText(
                this,
                20,
                150,
                panelWidth - 40,
                `Sources analyzed: ${intelligenceManager.getAnalyzedSourceCount()} | Correctly analyzed: ${intelligenceManager.getCorrectlyAnalyzedSourceCount()}`,
                14,
            ),
        );
        phasePanel.add(
            UiPanelFactory.createBrassButton(this, 20, 190, 240, 44, "OPEN SOURCE ANALYSIS", () => {
                this.scene.start(SceneKeys.SOURCE_ANALYSIS, new ScenarioSelectionPayload(this.scenarioNumber));
            }),
        );
        phasePanel.add(this.createContinuePhaseButton(panelWidth));
    }

    private renderDecisionPhaseContent(phasePanel: Phaser.GameObjects.Container, panelWidth: number): void {
        if (this.scenario === null) {
            return;
        }
        const gameState = GameSession.getInstance().getGameState();
        const pendingDecision = this.findNextPendingDecision(gameState);
        if (pendingDecision === null) {
            phasePanel.add(
                UiPanelFactory.createBodyText(this, 20, 52, panelWidth - 40, "Every decision for this turn has been made.", 16, UiPalette.PARCHMENT_CSS),
            );
            phasePanel.add(this.createContinuePhaseButton(panelWidth));
            return;
        }
        const decisionPanelComponent = new DecisionPanelComponent(this, 12, 46, panelWidth - 24, this.scale.height - 480);
        decisionPanelComponent.setDecision(pendingDecision, gameState);
        phasePanel.add(decisionPanelComponent);
        phasePanel.add(this.createContinuePhaseButton(panelWidth));
    }

    private findNextPendingDecision(gameState: ReturnType<GameSession["getGameState"]>): DecisionRecord | null {
        if (this.scenario === null) {
            return null;
        }
        for (const decisionRecord of this.scenario.getDecisionRecords()) {
            const hasAnyOptionFlagBeenSet = decisionRecord.options.some((decisionOption) =>
                gameState.isScenarioFlagSet(decisionOption.resultingFlagIdentifier),
            );
            if (!hasAnyOptionFlagBeenSet) {
                return decisionRecord;
            }
        }
        return null;
    }

    private renderResolutionPhaseContent(phasePanel: Phaser.GameObjects.Container, panelWidth: number): void {
        const resolutionText =
            this.lastConsequenceText.length > 0
                ? this.lastConsequenceText
                : "No decisions were made this turn. The simulation has advanced on its own momentum.";
        phasePanel.add(UiPanelFactory.createBodyText(this, 20, 52, panelWidth - 40, resolutionText, 16, UiPalette.PARCHMENT_CSS));
        phasePanel.add(
            UiPanelFactory.createTypewriterText(
                this,
                20,
                170,
                panelWidth - 40,
                this.buildResourceSummaryLine(),
                14,
            ),
        );
        phasePanel.add(this.createContinuePhaseButton(panelWidth));
    }

    private renderEventPhaseContent(phasePanel: Phaser.GameObjects.Container, panelWidth: number): void {
        if (this.scenario === null) {
            return;
        }
        const gameSession = GameSession.getInstance();
        const currentTurnNumber = gameSession.getCurrentTurnNumber();
        const matchingEventRecord = this.scenario
            .getScenarioEventSchedule()
            .find((scenarioEventRecord) => scenarioEventRecord.turnNumber === currentTurnNumber);
        if (matchingEventRecord === undefined) {
            phasePanel.add(
                UiPanelFactory.createBodyText(this, 20, 52, panelWidth - 40, "No dispatch arrived this turn. The world holds its breath.", 16, UiPalette.PARCHMENT_CSS),
            );
            phasePanel.add(this.createContinuePhaseButton(panelWidth));
            return;
        }
        phasePanel.add(UiPanelFactory.createSectionHeader(this, 20, 52, matchingEventRecord.headline, 18));
        phasePanel.add(
            UiPanelFactory.createBodyText(
                this,
                20,
                92,
                panelWidth - 40,
                `A dispatch from ${matchingEventRecord.nationCode}. Read the newspaper for the full report.`,
                15,
                UiPalette.AGED_PARCHMENT_CSS,
            ),
        );
        phasePanel.add(
            UiPanelFactory.createBrassButton(this, 20, 140, 260, 44, "READ THE DISPATCH", () => {
                this.showNewspaperForEventRecord(matchingEventRecord.headline, matchingEventRecord.nationCode, matchingEventRecord.illustrationAssetIdentifier);
            }),
        );
        phasePanel.add(this.createContinuePhaseButton(panelWidth));
    }

    private renderDebriefPhaseContent(phasePanel: Phaser.GameObjects.Container, panelWidth: number): void {
        phasePanel.add(
            UiPanelFactory.createBodyText(
                this,
                20,
                52,
                panelWidth - 40,
                "The debrief asks you to explain what happened and why it mattered. Answer the short-answer questions and write your contextualization paragraph before recording your result.",
                15,
                UiPalette.PARCHMENT_CSS,
            ),
        );
        phasePanel.add(
            UiPanelFactory.createBrassButton(this, 20, 130, 260, 44, "OPEN DEBRIEF", () => {
                this.scene.start(SceneKeys.DEBRIEF, new ScenarioSelectionPayload(this.scenarioNumber));
            }),
        );
        phasePanel.add(this.createContinuePhaseButton(panelWidth));
    }

    private renderJournalPhaseContent(phasePanel: Phaser.GameObjects.Container, panelWidth: number): void {
        if (this.scenario === null) {
            return;
        }
        const journalPrompts = this.scenario.getJournalPrompts();
        const activeJournalPrompt = journalPrompts[GameSession.getInstance().getCurrentTurnNumber() % journalPrompts.length];
        phasePanel.add(UiPanelFactory.createSectionHeader(this, 20, 52, "THIS TURN'S REFLECTION PROMPT", 17));
        phasePanel.add(UiPanelFactory.createBodyText(this, 20, 84, panelWidth - 40, activeJournalPrompt, 15, UiPalette.AGED_PARCHMENT_CSS));
        phasePanel.add(
            UiPanelFactory.createBrassButton(this, 20, 150, 260, 44, "WRITE IN JOURNAL", () => {
                this.scene.start(SceneKeys.JOURNAL);
            }),
        );
        phasePanel.add(this.createContinuePhaseButton(panelWidth));
    }

    private createContinuePhaseButton(panelWidth: number): Phaser.GameObjects.Container {
        const continueButtonLabel = this.phaseIndex >= TurnPhaseLabel.PHASE_LABELS.length - 1 ? "END TURN" : "CONTINUE";
        return UiPanelFactory.createBrassButton(this, panelWidth - 180, this.scale.height - 470, 160, 44, continueButtonLabel, () => {
            this.advancePhase();
        });
    }

    private advancePhase(): void {
        const gameSession = GameSession.getInstance();
        if (this.phaseIndex >= TurnPhaseLabel.PHASE_LABELS.length - 1) {
            if (gameSession.isFinalTurn()) {
                this.scene.start(SceneKeys.DEBRIEF, new ScenarioSelectionPayload(this.scenarioNumber));
                return;
            }
            gameSession.advanceScenarioTurn();
            this.phaseIndex = 0;
        } else {
            this.phaseIndex += 1;
        }
        if (this.topBarComponent !== null) {
            this.topBarComponent.refreshValues();
        }
        if (this.bottomBarComponent !== null) {
            this.bottomBarComponent.setTurnDisplay(gameSession.getCurrentTurnNumber(), gameSession.getTotalTurnCount());
            this.bottomBarComponent.setPhaseDisplay(TurnPhaseLabel.PHASE_LABELS[this.phaseIndex]);
        }
        this.renderPhasePanel();
    }

    private buildResourceSummaryLine(): string {
        if (this.scenario === null) {
            return "";
        }
        const gameState = GameSession.getInstance().getGameState();
        const summaryParts: string[] = [];
        for (const resourceCode of this.scenario.getScenarioResourceCodes()) {
            const resolvedResourceType = ResourceType.findByResourceTypeCode(resourceCode);
            if (resolvedResourceType === null) {
                continue;
            }
            summaryParts.push(`${resolvedResourceType.getDisplayName()}: ${gameState.getResourceQuantity(resolvedResourceType)}`);
        }
        return summaryParts.join("  |  ");
    }

    private onProvinceSelected(provinceIdentifier: string): void {
        if (this.rightSidebarComponent === null) {
            return;
        }
        const gameState = GameSession.getInstance().getGameState();
        const province = gameState.getProvince(provinceIdentifier);
        if (province === null) {
            return;
        }
        const ownerNation = gameState.getNation(province.getOwnerNationIdentifier());
        this.rightSidebarComponent.clearContextContent();
        const provincePanelComponent = new ProvincePanelComponent(this, 0, 0, 300);
        provincePanelComponent.setProvince(province, ownerNation);
        this.rightSidebarComponent.addContextContent(provincePanelComponent);
    }

    private applyMapMode(mapModeCode: string): void {
        this.activeMapModeCode = mapModeCode;
        const gameState = GameSession.getInstance().getGameState();
        const playerNation = gameState.getNation(gameState.getPlayerNationIdentifier());
        for (const province of gameState.getAllProvinces()) {
            const tileRectangle = this.provinceTilesByProvinceIdentifier.get(province.getIdentifier());
            if (tileRectangle === undefined) {
                continue;
            }
            const ownerNation = gameState.getNation(province.getOwnerNationIdentifier());
            switch (mapModeCode) {
                case "terrain":
                    tileRectangle.setFillStyle(this.getTerrainColorForCode(province.getTerrainTypeCode()));
                    break;
                case "resource":
                    tileRectangle.setFillStyle(province.getVictoryPointValue() >= 20 ? UiPalette.BRIGHT_BRASS : UiPalette.DEEP_BRASS);
                    break;
                case "diplomatic": {
                    if (playerNation === null || ownerNation === null || ownerNation === playerNation) {
                        tileRectangle.setFillStyle(UiPalette.MID_OLIVE);
                        break;
                    }
                    const relationScore = GameSession.getInstance().getDiplomacyManager().getRelationScore(playerNation, ownerNation);
                    tileRectangle.setFillStyle(relationScore >= 50 ? 0x2d4a8b : relationScore >= 0 ? UiPalette.FIELD_GRAY : UiPalette.BLOOD_RED);
                    break;
                }
                case "war": {
                    const isAtWar = playerNation !== null && ownerNation !== null && playerNation.isAtWarWith(ownerNation);
                    tileRectangle.setFillStyle(isAtWar ? UiPalette.BRIGHT_BLOOD : UiPalette.FIELD_GRAY);
                    break;
                }
                case "casualties": {
                    const casualtiesForNation = ownerNation === null ? 0 : GameSession.getInstance().getMilitaryManager().getTotalCasualtiesForNation(ownerNation.getIdentifier());
                    tileRectangle.setFillStyle(casualtiesForNation > 100 ? UiPalette.BLOOD_RED : UiPalette.MID_OLIVE);
                    break;
                }
                case "supply":
                    tileRectangle.setFillStyle(province.getSupplyValue() >= 10 ? UiPalette.DEEP_BRASS : UiPalette.DARK_OLIVE);
                    break;
                case "intelligence": {
                    const intelligenceValue = GameSession.getInstance().getIntelligenceManager().getCorrectlyAnalyzedSourceCount();
                    tileRectangle.setFillStyle(province.isCapital() && intelligenceValue >= 2 ? UiPalette.BRIGHT_BRASS : UiPalette.NEAR_BLACK_LEATHER);
                    break;
                }
                case "political":
                case "faction":
                default: {
                    const ownerColor = ownerNation === null ? UiPalette.FIELD_GRAY : UiPalette.getFactionColorForNationCode(ownerNation.getNationCode());
                    tileRectangle.setFillStyle(ownerColor);
                    break;
                }
            }
        }
    }

    private getTerrainColorForCode(terrainTypeCode: string): number {
        switch (terrainTypeCode) {
            case "plains":
                return 0x5a6b42;
            case "forest":
                return 0x3d5233;
            case "mountains":
                return 0x6e6a5c;
            case "desert":
                return 0xb6a472;
            case "ocean":
                return 0x22364f;
            case "coastal":
                return 0x2d4a6b;
            case "urban":
                return 0x7d6634;
            case "industrial":
                return 0x4a4a4a;
            case "tundra":
                return 0x8b8b7e;
            case "swamp":
                return 0x4a5540;
            default:
                return 0x5a6b42;
        }
    }

    private openMechanicOverlay(overlayTitleText: string, buildOverlayContent: (overlayPanel: Phaser.GameObjects.Container, panelWidth: number, panelHeight: number) => void): void {
        this.closeMechanicOverlay();
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        this.mechanicOverlayContainer = this.add.container(0, 0);
        this.mechanicOverlayContainer.setDepth(UiPalette.UI_DEPTH_POPUP);
        const overlayRectangle = this.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.72).setOrigin(0, 0);
        overlayRectangle.setInteractive();
        this.mechanicOverlayContainer.add(overlayRectangle);
        const panelWidth = Math.min(1080, screenWidth - 100);
        const panelHeight = Math.min(680, screenHeight - 100);
        const overlayPanel = UiPanelFactory.createPanelContainer(
            this,
            (screenWidth - panelWidth) / 2,
            (screenHeight - panelHeight) / 2,
            panelWidth,
            panelHeight,
            PanelVariant.LEATHER,
        );
        overlayPanel.add(UiPanelFactory.createSectionHeader(this, 20, 16, overlayTitleText, 22));
        overlayPanel.add(
            UiPanelFactory.createBrassButton(this, panelWidth - 150, 14, 130, 38, "CLOSE", () => {
                this.closeMechanicOverlay();
            }),
        );
        buildOverlayContent(overlayPanel, panelWidth, panelHeight);
        this.mechanicOverlayContainer.add(overlayPanel);
    }

    private closeMechanicOverlay(): void {
        if (this.mechanicOverlayContainer !== null) {
            this.mechanicOverlayContainer.destroy(true);
            this.mechanicOverlayContainer = null;
        }
    }

    private openCausalChainsOverlay(): void {
        if (this.scenario === null) {
            return;
        }
        const gameState = GameSession.getInstance().getGameState();
        const causalChainDefinitions = this.scenario.getCausalChainDefinitions();
        let activeChainIndex = 0;
        const renderChainInto = (overlayPanel: Phaser.GameObjects.Container, panelWidth: number, panelHeight: number): void => {
            const activeChain = causalChainDefinitions[activeChainIndex];
            overlayPanel.add(
                UiPanelFactory.createBodyText(
                    this,
                    20,
                    52,
                    panelWidth - 40,
                    "Order the causes from the deepest, longest-term strains to the immediate events. Correct ordering unlocks the path forward.",
                    15,
                    UiPalette.PARCHMENT_CSS,
                ),
            );
            const chainSelectorContainer = this.add.container(20, 96);
            causalChainDefinitions.forEach((causalChainDefinition, chainIndex) => {
                const isCompleted = gameState.isScenarioFlagSet(`${causalChainDefinition.chainIdentifier}_complete`);
                const chainButton = UiPanelFactory.createBrassButton(
                    this,
                    chainIndex * 190,
                    0,
                    180,
                    36,
                    `${isCompleted ? "* " : ""}${causalChainDefinition.chainTitle.substring(0, 22)}`,
                    () => {
                        activeChainIndex = chainIndex;
                        this.openCausalChainsOverlay();
                    },
                );
                chainSelectorContainer.add(chainButton);
            });
            overlayPanel.add(chainSelectorContainer);
            const causalChainComponent = new CausalChainComponent(this, 16, 146, panelWidth - 32, panelHeight - 210);
            causalChainComponent.setChainDefinition(activeChain, gameState);
            overlayPanel.add(causalChainComponent);
        };
        this.openMechanicOverlay("CAUSAL CHAINS", renderChainInto);
    }

    private openComparisonOverlay(): void {
        if (this.scenario === null) {
            return;
        }
        const comparisonDefinition = this.scenario.getComparisonDefinition();
        if (comparisonDefinition === null) {
            return;
        }
        const gameState = GameSession.getInstance().getGameState();
        this.openMechanicOverlay("COMPARISON", (overlayPanel, panelWidth, panelHeight) => {
            const comparisonToolComponent = new ComparisonToolComponent(this, 16, 52, panelWidth - 32, panelHeight - 90);
            comparisonToolComponent.setComparisonDefinition(comparisonDefinition, this.scenarioNumber, gameState);
            overlayPanel.add(comparisonToolComponent);
        });
    }

    private openContinuityChartOverlay(): void {
        if (this.scenario === null) {
            return;
        }
        const continuityChangeDefinition = this.scenario.getContinuityChangeDefinition();
        if (continuityChangeDefinition === null) {
            return;
        }
        const gameState = GameSession.getInstance().getGameState();
        this.openMechanicOverlay("CONTINUITY AND CHANGE", (overlayPanel, panelWidth, panelHeight) => {
            const continuityChangeChartComponent = new ContinuityChangeChartComponent(this, 16, 52, panelWidth - 32, panelHeight - 90);
            continuityChangeChartComponent.setContinuityChangeDefinition(continuityChangeDefinition, this.scenarioNumber, gameState);
            overlayPanel.add(continuityChangeChartComponent);
        });
    }

    private openTerritorialHoldingsOverlay(): void {
        const gameState = GameSession.getInstance().getGameState();
        const territorialHoldingsRows = WorldStatePresent.getTerritorialHoldingsRowsForContinuityAndChangeChart();
        this.openMechanicOverlay("TERRITORIAL HOLDINGS, 1900 TO PRESENT", (overlayPanel, panelWidth, panelHeight) => {
            const territorialHoldingsChartComponent = new TerritorialHoldingsChartComponent(this, 16, 52, panelWidth - 32, panelHeight - 90);
            territorialHoldingsChartComponent.setTerritorialHoldingsRows(territorialHoldingsRows, this.scenarioNumber, gameState);
            overlayPanel.add(territorialHoldingsChartComponent);
        });
    }

    private openQuickwriteOverlay(): void {
        const gameState = GameSession.getInstance().getGameState();
        const assessmentManager = GameSession.getInstance().getAssessmentManager();
        const quickwritePromptText = Rubrics.QUICKWRITE_RUBRIC.descriptionText;
        this.openMechanicOverlay("QUICKWRITE", (overlayPanel, panelWidth, panelHeight) => {
            const quickwriteComponent = new QuickwriteComponent(this, 16, 52, panelWidth - 32, panelHeight - 90, assessmentManager);
            quickwriteComponent.setQuickwritePrompt(quickwritePromptText, this.scenarioNumber, gameState);
            overlayPanel.add(quickwriteComponent);
        });
    }

    private openSharedInquiryOverlay(): void {
        const gameState = GameSession.getInstance().getGameState();
        const assessmentManager = GameSession.getInstance().getAssessmentManager();
        const leftSource = PrimarySources.findBySourceIdentifier("cardenas_speech_to_the_nation_1938");
        const rightSource = PrimarySources.findBySourceIdentifier("stalin_industrialization_1928");
        if (leftSource === null || rightSource === null) {
            return;
        }
        this.openMechanicOverlay("SHARED INQUIRY", (overlayPanel, panelWidth, panelHeight) => {
            const sharedInquiryComponent = new SharedInquiryComponent(this, 16, 52, panelWidth - 32, panelHeight - 90, assessmentManager);
            sharedInquiryComponent.setInquiryDocuments(leftSource, rightSource, this.scenarioNumber, gameState);
            overlayPanel.add(sharedInquiryComponent);
        });
    }

    private openInterventionMeterOverlay(): void {
        const gameState = GameSession.getInstance().getGameState();
        const domesticManager = GameSession.getInstance().getDomesticManager();
        const playerNationIdentifier = gameState.getPlayerNationIdentifier();
        this.openMechanicOverlay("LAISSEZ-FAIRE TO INTERVENTION", (overlayPanel) => {
            overlayPanel.add(
                UiPanelFactory.createBodyText(
                    this,
                    20,
                    56,
                    900,
                    "After 1919, and especially after the onset of the Great Depression, governments took a more active role in economic life. The meter tracks how far the state has moved from laissez-faire toward direction of the economy.",
                    16,
                    UiPalette.PARCHMENT_CSS,
                ),
            );
            const interventionMeterComponent = new GovernmentInterventionMeterComponent(this, 20, 150, 700);
            interventionMeterComponent.setInterventionLevel(domesticManager.getGovernmentInterventionLevel(playerNationIdentifier));
            overlayPanel.add(interventionMeterComponent);
        });
    }

    private openSocraticSeminarOverlay(): void {
        const gameState = GameSession.getInstance().getGameState();
        const assessmentManager = GameSession.getInstance().getAssessmentManager();
        this.openMechanicOverlay("SOCRATIC SEMINAR", (overlayPanel, panelWidth, panelHeight) => {
            const socraticSeminarComponent = new SocraticSeminarComponent(this, 16, 52, panelWidth - 32, panelHeight - 90, assessmentManager);
            socraticSeminarComponent.setSeminarRubric(Rubrics.SOCRATIC_SEMINAR_RUBRIC, this.scenarioNumber, gameState);
            overlayPanel.add(socraticSeminarComponent);
        });
    }

    private openArgumentBuilderOverlay(): void {
        if (this.scenario === null) {
            return;
        }
        const argumentDefinition = this.scenario.getArgumentDefinition();
        if (argumentDefinition === null) {
            return;
        }
        const gameState = GameSession.getInstance().getGameState();
        this.openMechanicOverlay("ARGUMENT BUILDER", (overlayPanel, panelWidth, panelHeight) => {
            const causalArgumentBuilderComponent = new CausalArgumentBuilderComponent(this, 16, 52, panelWidth - 32, panelHeight - 90);
            causalArgumentBuilderComponent.setArgumentDefinition(argumentDefinition, this.scenarioNumber, gameState);
            overlayPanel.add(causalArgumentBuilderComponent);
        });
    }

    private openComplexArgumentOverlay(): void {
        if (this.scenario === null) {
            return;
        }
        const argumentDefinition = this.scenario.getArgumentDefinition();
        const gameState = GameSession.getInstance().getGameState();
        const assessmentManager = GameSession.getInstance().getAssessmentManager();
        const complexArgumentPromptText =
            argumentDefinition !== null && argumentDefinition.argumentPrompts.length > 0
                ? argumentDefinition.argumentPrompts[0].promptText
                : "Evaluate the extent to which global conflicts between 1900 and 1945 were caused by the collapse of traditional empires.";
        this.openMechanicOverlay("COMPLEX ARGUMENT", (overlayPanel, panelWidth, panelHeight) => {
            const complexArgumentBuilderComponent = new ComplexArgumentBuilderComponent(
                this,
                16,
                52,
                panelWidth - 32,
                panelHeight - 90,
                assessmentManager,
            );
            complexArgumentBuilderComponent.setComplexArgumentPrompt(
                Rubrics.COMPLEX_ARGUMENT_RUBRIC,
                complexArgumentPromptText,
                this.scenarioNumber,
                gameState,
            );
            overlayPanel.add(complexArgumentBuilderComponent);
        });
    }

    private openTestimonyOverlay(): void {
        if (this.scenario === null) {
            return;
        }
        const testimonyRecords = this.scenario.getTestimonyRecords();
        const gameState = GameSession.getInstance().getGameState();
        this.openMechanicOverlay("TESTIMONY", (overlayPanel, panelWidth, panelHeight) => {
            const testimonyPanelComponent = new TestimonyPanelComponent(this, 16, 52, panelWidth - 32, panelHeight - 90);
            testimonyPanelComponent.setTestimonyRecords(testimonyRecords, this.scenarioNumber, gameState);
            overlayPanel.add(testimonyPanelComponent);
        });
    }

    private openRelationshipOverlay(): void {
        if (this.scenario === null) {
            return;
        }
        const relationshipPromptTexts = this.scenario.getRelationshipPromptTexts();
        const gameState = GameSession.getInstance().getGameState();
        this.openMechanicOverlay("RELATIONSHIP ANALYSIS", (overlayPanel, panelWidth, panelHeight) => {
            const relationshipComponent = new RelationshipComponent(this, 16, 52, panelWidth - 32, panelHeight - 90);
            relationshipComponent.setRelationshipPrompts(relationshipPromptTexts, this.scenarioNumber, gameState);
            overlayPanel.add(relationshipComponent);
        });
    }

    private openCasualtyChartOverlay(): void {
        const gameState = GameSession.getInstance().getGameState();
        const playerNationIdentifier = gameState.getPlayerNationIdentifier();
        const playerNation = gameState.getNation(playerNationIdentifier);
        const casualtiesByCategory = GameSession.getInstance().getMilitaryManager().getCasualtiesByCategory(playerNationIdentifier);
        this.openMechanicOverlay("CASUALTIES BY ARM", (overlayPanel, panelWidth, panelHeight) => {
            const casualtyChartComponent = new CasualtyChartComponent(this, 16, 52, panelWidth - 32, panelHeight - 90);
            casualtyChartComponent.setCasualtyData(
                casualtiesByCategory,
                playerNation === null ? "Casualties" : `Casualties: ${playerNation.getDisplayName()}`,
            );
            overlayPanel.add(casualtyChartComponent);
            if (casualtiesByCategory.size === 0) {
                overlayPanel.add(
                    UiPanelFactory.createBodyText(
                        this,
                        24,
                        160,
                        panelWidth - 60,
                        "No casualties have been recorded yet. Casualties accumulate as battles are fought through the military manager.",
                        15,
                        UiPalette.AGED_PARCHMENT_CSS,
                    ),
                );
            }
        });
    }

    private showNewspaperForEventRecord(headlineText: string, nationCode: string, illustrationAssetIdentifier: string): void {
        const newspaperPopupComponent = new NewspaperPopupComponent(this, 0, 0, this.scale.width);
        newspaperPopupComponent.showNewspaper(
            `newspaper_masthead_${nationCode === "GER" ? "germany" : nationCode === "ENG" ? "britain" : nationCode === "FRA" ? "france" : nationCode === "USA" ? "usa" : nationCode === "RUS" ? "ussr" : nationCode === "JAP" ? "japan" : "default"}`,
            headlineText,
            [
                `Dispatch carried by cable and wireless from the offices of the ${nationCode} press.`,
                `The editors note that the full meaning of these events will be taught in the debrief that follows.`,
                illustrationAssetIdentifier.length > 0 ? "An illustration accompanies this report in the printed edition." : "",
            ].filter((paragraph) => paragraph.length > 0),
            nationCode,
        );
    }

    private subscribeToGameEvents(): void {
        const eventBus = EventBus.getInstance();
        this.boundNewspaperHandler = (payload: unknown) => {
            const newspaperRequestPayload = payload as NewspaperRequestPayload;
            const newspaperPopupComponent = new NewspaperPopupComponent(this, 0, 0, this.scale.width);
            newspaperPopupComponent.showNewspaper(
                newspaperRequestPayload.newspaperAssetId,
                newspaperRequestPayload.headline,
                ["The wire services report the following from the capitals of Europe and beyond.", "Read carefully: the examination of causes follows in the debrief."],
                newspaperRequestPayload.nationCode,
            );
        };
        this.boundTelegramHandler = (payload: unknown) => {
            const telegramRequestPayload = payload as TelegramRequestPayload;
            const telegramPopupComponent = new TelegramPopupComponent(this, 0, 0, this.scale.width);
            telegramPopupComponent.showTelegram(
                telegramRequestPayload.classification,
                telegramRequestPayload.subject,
                telegramRequestPayload.bodyLines,
            );
        };
        this.boundNavigationHandler = (payload: unknown) => {
            const navigationRequestedPayload = payload as NavigationRequestedPayload;
            switch (navigationRequestedPayload.destinationSceneKey) {
                case "journal":
                    this.scene.start(SceneKeys.JOURNAL);
                    break;
                case "ledger":
                    this.scene.start(SceneKeys.LEDGER);
                    break;
                case "focus_tree":
                    this.scene.start(SceneKeys.FOCUS_TREE);
                    break;
                case "menu":
                    this.scene.start(SceneKeys.MAIN_MENU);
                    break;
                default:
                    break;
            }
        };
        this.boundMapModeHandler = (payload: unknown) => {
            const mapModeSelectedPayload = payload as { mapModeCode: string };
            this.applyMapMode(mapModeSelectedPayload.mapModeCode);
        };
        this.boundDecisionHandler = (payload: unknown) => {
            const decisionMadePayload = payload as DecisionMadePayload;
            this.lastConsequenceText = `Decision recorded: ${decisionMadePayload.chosenOptionIdentifier}. The consequence will be assessed in the resolution phase.`;
            GameSession.getInstance().getAudioManager().playSoundEffect("sfx_diplomacy");
        };
        this.boundMechanicHandler = (payload: unknown) => {
            const mechanicCompletedPayload = payload as MechanicCompletedPayload;
            void mechanicCompletedPayload;
            this.checkForVictory();
        };
        this.boundPhaseHandler = (payload: unknown) => {
            const phaseChangePayload = payload as PhaseChangePayload;
            void phaseChangePayload;
        };
        eventBus.subscribe(GameEventTypes.NEWSPAPER_REQUESTED, this.boundNewspaperHandler);
        eventBus.subscribe(GameEventTypes.TELEGRAM_REQUESTED, this.boundTelegramHandler);
        eventBus.subscribe(GameEventTypes.UI_NAVIGATION_REQUESTED, this.boundNavigationHandler);
        eventBus.subscribe(GameEventTypes.UI_MAP_MODE_SELECTED, this.boundMapModeHandler);
        eventBus.subscribe(GameEventTypes.DECISION_MADE, this.boundDecisionHandler);
        eventBus.subscribe(GameEventTypes.MECHANIC_COMPLETED, this.boundMechanicHandler);
        eventBus.subscribe(GameEventTypes.TURN_PHASE_CHANGED, this.boundPhaseHandler);
        eventBus.subscribe(GameEventTypes.CAUSAL_CHAIN_COMPLETED, (payload: unknown) => {
            const causalChainPayload = payload as CausalChainPayload;
            void causalChainPayload;
            this.checkForVictory();
        });
        eventBus.subscribe(GameEventTypes.FOCUS_NODE_COMPLETED, () => {
            this.checkForVictory();
        });
    }

    private unsubscribeFromGameEvents(): void {
        const eventBus = EventBus.getInstance();
        eventBus.unsubscribe(GameEventTypes.NEWSPAPER_REQUESTED, this.boundNewspaperHandler);
        eventBus.unsubscribe(GameEventTypes.TELEGRAM_REQUESTED, this.boundTelegramHandler);
        eventBus.unsubscribe(GameEventTypes.UI_NAVIGATION_REQUESTED, this.boundNavigationHandler);
        eventBus.unsubscribe(GameEventTypes.UI_MAP_MODE_SELECTED, this.boundMapModeHandler);
        eventBus.unsubscribe(GameEventTypes.DECISION_MADE, this.boundDecisionHandler);
        eventBus.unsubscribe(GameEventTypes.MECHANIC_COMPLETED, this.boundMechanicHandler);
        eventBus.unsubscribe(GameEventTypes.TURN_PHASE_CHANGED, this.boundPhaseHandler);
    }

    private checkForVictory(): void {
        const gameSession = GameSession.getInstance();
        const scenarioEvaluationResult = gameSession.evaluateCurrentScenario();
        if (scenarioEvaluationResult === null || !scenarioEvaluationResult.isVictory) {
            return;
        }
        gameSession.getAudioManager().playSoundEffect("sfx_success");
        this.scene.start(SceneKeys.DEBRIEF, new ScenarioSelectionPayload(this.scenarioNumber));
    }
}
