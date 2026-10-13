import Phaser from "phaser";

import {
    CausalChainPayload,
    DecisionMadePayload,
    EventBus,
    GameEventTypes,
    MechanicCompletedPayload,
    NavigationRequestedPayload,
    NewspaperRequestPayload,
    SourceAnalysisPayload,
    TelegramRequestPayload,
} from "../core/EventBus";
import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { PrimarySources } from "../data/PrimarySources";
import { Rubrics } from "../data/Rubrics";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import type { DecisionRecord, Scenario } from "../domain/scenarios/Scenario";
import { WorldStatePresent } from "../domain/WorldStatePresent";
import { FontFamilies } from "../managers/FontManager";
import { ResourceType } from "../types/ResourceType";
import { BottomBarComponent } from "../ui/BottomBarComponent";
import { CasualtyChartComponent } from "../ui/CasualtyChartComponent";
import { CausalArgumentBuilderComponent } from "../ui/CausalArgumentBuilderComponent";
import { CausalChainComponent } from "../ui/CausalChainComponent";
import { ComparisonToolComponent } from "../ui/ComparisonToolComponent";
import { ComplexArgumentBuilderComponent } from "../ui/ComplexArgumentBuilderComponent";
import { ContinuityChangeChartComponent } from "../ui/ContinuityChangeChartComponent";
import { DecisionPanelComponent } from "../ui/DecisionPanelComponent";
import { GovernmentInterventionMeterComponent } from "../ui/GovernmentInterventionMeterComponent";
import { LeftSidebarComponent, MapModeOption } from "../ui/LeftSidebarComponent";
import { MapCameraController } from "../ui/MapCameraController";
import { NewspaperPopupComponent } from "../ui/NewspaperPopupComponent";
import { ProvincePanelComponent } from "../ui/ProvincePanelComponent";
import { QuestTrackerComponent } from "../ui/QuestTrackerComponent";
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
    public static readonly PHASE_GUIDANCE: string[] = [
        "Read the situation. The map shows the world you are about to change.",
        "Analyze at least one primary source. A source read correctly becomes reliable intelligence.",
        "Choose one option for the open decision. Each choice is a piece of the history.",
        "See what your decision set in motion, then continue.",
        "A dispatch has arrived from the capitals of the world. Read the newspaper.",
        "Answer the short-answer questions in the debrief to record what you learned.",
        "Write a short reflection in the journal, then end the turn.",
    ];
}

class LayoutRect {
    public readonly leftX: number;
    public readonly topY: number;
    public readonly width: number;
    public readonly height: number;

    constructor(leftX: number, topY: number, width: number, height: number) {
        this.leftX = leftX;
        this.topY = topY;
        this.width = width;
        this.height = height;
    }
}

export class ScenarioPlayScene extends Phaser.Scene {
    private static readonly ONBOARDING_STORAGE_KEY = "cascade.onboarding.seen";

    private scenarioNumber: number;
    private scenario: Scenario | null;
    private phaseIndex: number;
    private lastConsequenceText: string;
    private provinceTilesByProvinceIdentifier: Map<string, Phaser.GameObjects.Rectangle>;
    private phaseCardContainer: Phaser.GameObjects.Container | null;
    private mechanicOverlayContainer: Phaser.GameObjects.Container | null;
    private toastContainer: Phaser.GameObjects.Container | null;
    private questTrackerComponent: QuestTrackerComponent | null;
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
    private boundSourceHandler: (payload: unknown) => void;

    constructor() {
        super({ key: SceneKeys.SCENARIO_PLAY });
        this.scenarioNumber = 1;
        this.scenario = null;
        this.phaseIndex = 0;
        this.lastConsequenceText = "";
        this.provinceTilesByProvinceIdentifier = new Map<string, Phaser.GameObjects.Rectangle>();
        this.phaseCardContainer = null;
        this.mechanicOverlayContainer = null;
        this.toastContainer = null;
        this.questTrackerComponent = null;
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
        this.boundSourceHandler = () => undefined;
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
        this.phaseCardContainer = null;
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
        this.renderPhaseCard();
        this.subscribeToGameEvents();
        gameSession.getAudioManager().playMusicTrack(`ambient_scenario_${scenario.getScenarioNumber()}`);
        this.maybeShowOnboardingOverlay();
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.unsubscribeFromGameEvents();
        });
    }

    public override update(): void {
        if (this.mapCameraController !== null) {
            this.mapCameraController.update();
        }
    }

    private getLayoutRects(): {
        map: LayoutRect;
        questTracker: LayoutRect;
        contextPanel: LayoutRect;
        phaseCard: LayoutRect;
    } {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        const contentLeftX = 140;
        const contentRightX = screenWidth - 344;
        const contentWidth = Math.max(360, contentRightX - contentLeftX);
        const phaseCardHeight = this.phaseIndex === 2 ? 380 : 216;
        const rightColumnTopY = 96;
        const rightColumnBottomY = screenHeight - 64;
        const rightColumnHeight = rightColumnBottomY - rightColumnTopY;
        const questTrackerHeight = Math.max(220, Math.round(rightColumnHeight * 0.58));
        return {
            map: new LayoutRect(contentLeftX, 96, contentWidth, screenHeight - 96 - phaseCardHeight - 16),
            questTracker: new LayoutRect(screenWidth - 340, rightColumnTopY, 324, questTrackerHeight),
            contextPanel: new LayoutRect(
                screenWidth - 340,
                rightColumnTopY + questTrackerHeight + 8,
                324,
                rightColumnHeight - questTrackerHeight - 8,
            ),
            phaseCard: new LayoutRect(
                contentLeftX,
                screenHeight - 64 - phaseCardHeight - 4,
                contentWidth,
                phaseCardHeight,
            ),
        };
    }

    private renderProvinceMap(): void {
        const gameState = GameSession.getInstance().getGameState();
        const allProvinces = gameState.getAllProvinces();
        const layoutRects = this.getLayoutRects();
        if (allProvinces.length === 0) {
            const documentationPanel = UiPanelFactory.createPanelContainer(
                this,
                layoutRects.map.leftX,
                layoutRects.map.topY,
                layoutRects.map.width,
                layoutRects.map.height,
                PanelVariant.PARCHMENT,
                UiPalette.UI_DEPTH_BASE,
            );
            documentationPanel.add(
                UiPanelFactory.createSectionHeader(
                    this,
                    20,
                    18,
                    this.scenario === null ? "" : this.scenario.getScenarioTitle(),
                    24,
                ),
            );
            documentationPanel.add(
                UiPanelFactory.createBodyText(
                    this,
                    20,
                    58,
                    layoutRects.map.width - 40,
                    "This scenario is presented through documentation, testimony, and argument rather than a map. Use the progress checklist on the right to work through the historical record.",
                    17,
                    UiPalette.NEAR_BLACK_LEATHER_CSS,
                ),
            );
            return;
        }
        const tilePixelSize = 56;
        const mapContainer = this.add.container(0, 64);
        for (const province of allProvinces) {
            const ownerNation = gameState.getNation(province.getOwnerNationIdentifier());
            const ownerColor =
                ownerNation === null
                    ? UiPalette.FIELD_GRAY
                    : UiPalette.getFactionColorForNationCode(ownerNation.getNationCode());
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
            mapContainer.add(tileRectangle);
            if (province.isCapital()) {
                const capitalMarker = this.add.text(
                    province.getColumnIndex() * tilePixelSize + tilePixelSize / 2,
                    province.getRowIndex() * tilePixelSize + tilePixelSize / 2,
                    "*",
                    { fontFamily: FontFamilies.DISPLAY_SERIF, fontSize: "20px", color: UiPalette.HIGHLIGHT_BRASS_CSS },
                );
                capitalMarker.setOrigin(0.5, 0.5);
                mapContainer.add(capitalMarker);
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
        const layoutRects = this.getLayoutRects();
        this.topBarComponent = new TopBarComponent(this, 0, 0, screenWidth, gameSession.getGameState());
        const scenarioHeaderComponent = new ScenarioHeaderComponent(this, 8, 52, 560);
        if (this.scenario !== null) {
            scenarioHeaderComponent.setScenario(this.scenario);
        }
        new LeftSidebarComponent(this, 0, 96, screenHeight - 160, this.activeMapModeCode);
        this.questTrackerComponent = new QuestTrackerComponent(
            this,
            layoutRects.questTracker.leftX,
            layoutRects.questTracker.topY,
            layoutRects.questTracker.width,
            layoutRects.questTracker.height,
            (mechanicKey: string) => {
                this.openMechanicByKey(mechanicKey);
            },
        );
        this.rightSidebarComponent = new RightSidebarComponent(
            this,
            layoutRects.contextPanel.leftX,
            layoutRects.contextPanel.topY,
            layoutRects.contextPanel.width,
            layoutRects.contextPanel.height,
        );
        this.rightSidebarComponent.setContentToEmptyPrompt();
        this.bottomBarComponent = new BottomBarComponent(this, 0, screenHeight - 56, screenWidth, 56);
        this.bottomBarComponent.setTurnDisplay(gameSession.getCurrentTurnNumber(), gameSession.getTotalTurnCount());
        this.bottomBarComponent.setPhaseDisplay(TurnPhaseLabel.PHASE_LABELS[this.phaseIndex]);
        this.refreshQuestTracker();
    }

    private refreshQuestTracker(): void {
        if (this.questTrackerComponent === null || this.scenario === null) {
            return;
        }
        this.questTrackerComponent.refreshFromScenario(
            this.scenario,
            GameSession.getInstance().getGameState(),
            GameSession.getInstance().getIntelligenceManager(),
            this.scenarioNumber,
        );
    }

    private renderPhaseCard(): void {
        const layoutRects = this.getLayoutRects();
        if (this.phaseCardContainer !== null) {
            this.phaseCardContainer.destroy(true);
        }
        this.phaseCardContainer = this.add.container(layoutRects.phaseCard.leftX, layoutRects.phaseCard.topY);
        this.phaseCardContainer.setDepth(UiPalette.UI_DEPTH_SIDEBAR);
        const phasePanel = UiPanelFactory.createPanelContainer(
            this,
            0,
            0,
            layoutRects.phaseCard.width,
            layoutRects.phaseCard.height,
            PanelVariant.LEATHER,
        );
        this.phaseCardContainer.add(phasePanel);
        const blockingZone = this.add
            .zone(0, 0, layoutRects.phaseCard.width, layoutRects.phaseCard.height)
            .setOrigin(0, 0);
        blockingZone.setInteractive();
        this.phaseCardContainer.add(blockingZone);
        const currentPhaseLabel = TurnPhaseLabel.PHASE_LABELS[this.phaseIndex];
        phasePanel.add(
            UiPanelFactory.createSectionHeader(
                this,
                20,
                14,
                `TURN ${GameSession.getInstance().getCurrentTurnNumber()} - ${currentPhaseLabel.toUpperCase()}`,
                20,
            ),
        );
        phasePanel.add(
            UiPanelFactory.createBodyText(
                this,
                20,
                48,
                layoutRects.phaseCard.width - 40,
                TurnPhaseLabel.PHASE_GUIDANCE[this.phaseIndex],
                15,
                UiPalette.AGED_PARCHMENT_CSS,
            ),
        );
        if (this.scenario === null) {
            return;
        }
        switch (currentPhaseLabel) {
            case "Briefing":
                this.renderBriefingPhaseContent(phasePanel, layoutRects.phaseCard);
                break;
            case "Intelligence":
                this.renderIntelligencePhaseContent(phasePanel, layoutRects.phaseCard);
                break;
            case "Decision":
                this.renderDecisionPhaseContent(phasePanel, layoutRects.phaseCard);
                break;
            case "Resolution":
                this.renderResolutionPhaseContent(phasePanel, layoutRects.phaseCard);
                break;
            case "Event":
                this.renderEventPhaseContent(phasePanel, layoutRects.phaseCard);
                break;
            case "Debrief":
                this.renderDebriefPhaseContent(phasePanel, layoutRects.phaseCard);
                break;
            case "Journal":
                this.renderJournalPhaseContent(phasePanel, layoutRects.phaseCard);
                break;
            default:
                break;
        }
        this.phaseCardContainer.add(
            UiPanelFactory.createBrassButton(
                this,
                layoutRects.phaseCard.width - 190,
                layoutRects.phaseCard.height - 58,
                170,
                44,
                this.phaseIndex >= TurnPhaseLabel.PHASE_LABELS.length - 1 ? "END TURN" : "CONTINUE",
                () => {
                    this.advancePhase();
                },
            ),
        );
    }

    private renderBriefingPhaseContent(phasePanel: Phaser.GameObjects.Container, phaseCardRect: LayoutRect): void {
        if (this.scenario === null) {
            return;
        }
        let objectiveOffsetY = 80;
        for (const objectiveSummary of this.scenario.getObjectiveSummaries()) {
            phasePanel.add(
                UiPanelFactory.createBodyText(
                    this,
                    28,
                    objectiveOffsetY,
                    phaseCardRect.width - 240,
                    `- ${objectiveSummary}`,
                    14,
                    UiPalette.PARCHMENT_CSS,
                ),
            );
            objectiveOffsetY += 28;
        }
    }

    private renderIntelligencePhaseContent(phasePanel: Phaser.GameObjects.Container, phaseCardRect: LayoutRect): void {
        const intelligenceManager = GameSession.getInstance().getIntelligenceManager();
        phasePanel.add(
            UiPanelFactory.createTypewriterText(
                this,
                20,
                82,
                phaseCardRect.width - 220,
                `Sources analyzed: ${intelligenceManager.getAnalyzedSourceCount()} | Correctly analyzed: ${intelligenceManager.getCorrectlyAnalyzedSourceCount()}`,
                14,
            ),
        );
        phasePanel.add(
            UiPanelFactory.createBrassButton(this, 20, 116, 260, 44, "OPEN SOURCE ANALYSIS", () => {
                this.scene.start(SceneKeys.SOURCE_ANALYSIS, new ScenarioSelectionPayload(this.scenarioNumber));
            }),
        );
    }

    private renderDecisionPhaseContent(phasePanel: Phaser.GameObjects.Container, phaseCardRect: LayoutRect): void {
        if (this.scenario === null) {
            return;
        }
        const gameState = GameSession.getInstance().getGameState();
        const pendingDecision = this.findNextPendingDecision(gameState);
        if (pendingDecision === null) {
            phasePanel.add(
                UiPanelFactory.createBodyText(
                    this,
                    20,
                    82,
                    phaseCardRect.width - 40,
                    "Every decision for this scenario has been made. Use the progress checklist to finish the remaining objectives.",
                    16,
                    UiPalette.PARCHMENT_CSS,
                ),
            );
            return;
        }
        const decisionPanelComponent = new DecisionPanelComponent(
            this,
            12,
            78,
            phaseCardRect.width - 24,
            phaseCardRect.height - 150,
        );
        decisionPanelComponent.setDecision(pendingDecision, gameState);
        phasePanel.add(decisionPanelComponent);
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

    private renderResolutionPhaseContent(phasePanel: Phaser.GameObjects.Container, phaseCardRect: LayoutRect): void {
        const resolutionText =
            this.lastConsequenceText.length > 0
                ? this.lastConsequenceText
                : "No decisions were made this turn. The simulation has advanced on its own momentum.";
        phasePanel.add(
            UiPanelFactory.createBodyText(
                this,
                20,
                82,
                phaseCardRect.width - 220,
                resolutionText,
                15,
                UiPalette.PARCHMENT_CSS,
            ),
        );
        phasePanel.add(
            UiPanelFactory.createTypewriterText(
                this,
                20,
                138,
                phaseCardRect.width - 220,
                this.buildResourceSummaryLine(),
                14,
            ),
        );
    }

    private renderEventPhaseContent(phasePanel: Phaser.GameObjects.Container, phaseCardRect: LayoutRect): void {
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
                UiPanelFactory.createBodyText(
                    this,
                    20,
                    82,
                    phaseCardRect.width - 220,
                    "No dispatch arrived this turn. The world holds its breath.",
                    15,
                    UiPalette.PARCHMENT_CSS,
                ),
            );
            return;
        }
        phasePanel.add(UiPanelFactory.createSectionHeader(this, 20, 78, matchingEventRecord.headline, 17));
        phasePanel.add(
            UiPanelFactory.createBrassButton(this, 20, 116, 260, 44, "READ THE DISPATCH", () => {
                this.showNewspaperForEventRecord(
                    matchingEventRecord.headline,
                    matchingEventRecord.nationCode,
                    matchingEventRecord.illustrationAssetIdentifier,
                );
            }),
        );
    }

    private renderDebriefPhaseContent(phasePanel: Phaser.GameObjects.Container, phaseCardRect: LayoutRect): void {
        phasePanel.add(
            UiPanelFactory.createBodyText(
                this,
                20,
                82,
                phaseCardRect.width - 220,
                "The debrief asks you to explain what happened and why it mattered. Answer the questions and write your contextualization paragraph.",
                15,
                UiPalette.PARCHMENT_CSS,
            ),
        );
        phasePanel.add(
            UiPanelFactory.createBrassButton(this, 20, 132, 260, 44, "OPEN DEBRIEF", () => {
                this.scene.start(SceneKeys.DEBRIEF, new ScenarioSelectionPayload(this.scenarioNumber));
            }),
        );
    }

    private renderJournalPhaseContent(phasePanel: Phaser.GameObjects.Container, phaseCardRect: LayoutRect): void {
        if (this.scenario === null) {
            return;
        }
        const journalPrompts = this.scenario.getJournalPrompts();
        const activeJournalPrompt =
            journalPrompts[GameSession.getInstance().getCurrentTurnNumber() % journalPrompts.length];
        phasePanel.add(
            UiPanelFactory.createBodyText(
                this,
                20,
                82,
                phaseCardRect.width - 220,
                activeJournalPrompt,
                15,
                UiPalette.AGED_PARCHMENT_CSS,
            ),
        );
        phasePanel.add(
            UiPanelFactory.createBrassButton(this, 20, 136, 260, 44, "WRITE IN JOURNAL", () => {
                this.scene.start(SceneKeys.JOURNAL);
            }),
        );
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
            this.showToast("A new turn begins. The world has moved.");
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
        this.renderPhaseCard();
        this.refreshQuestTracker();
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
            summaryParts.push(
                `${resolvedResourceType.getDisplayName()}: ${gameState.getResourceQuantity(resolvedResourceType)}`,
            );
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
                    tileRectangle.setFillStyle(
                        province.getVictoryPointValue() >= 20 ? UiPalette.BRIGHT_BRASS : UiPalette.DEEP_BRASS,
                    );
                    break;
                case "diplomatic": {
                    if (playerNation === null || ownerNation === null || ownerNation === playerNation) {
                        tileRectangle.setFillStyle(UiPalette.MID_OLIVE);
                        break;
                    }
                    const relationScore = GameSession.getInstance()
                        .getDiplomacyManager()
                        .getRelationScore(playerNation, ownerNation);
                    tileRectangle.setFillStyle(
                        relationScore >= 50
                            ? 0x2d4a8b
                            : relationScore >= 0
                              ? UiPalette.FIELD_GRAY
                              : UiPalette.BLOOD_RED,
                    );
                    break;
                }
                case "war": {
                    const isAtWar =
                        playerNation !== null && ownerNation !== null && playerNation.isAtWarWith(ownerNation);
                    tileRectangle.setFillStyle(isAtWar ? UiPalette.BRIGHT_BLOOD : UiPalette.FIELD_GRAY);
                    break;
                }
                case "casualties": {
                    const casualtiesForNation =
                        ownerNation === null
                            ? 0
                            : GameSession.getInstance()
                                  .getMilitaryManager()
                                  .getTotalCasualtiesForNation(ownerNation.getIdentifier());
                    tileRectangle.setFillStyle(casualtiesForNation > 100 ? UiPalette.BLOOD_RED : UiPalette.MID_OLIVE);
                    break;
                }
                case "supply":
                    tileRectangle.setFillStyle(
                        province.getSupplyValue() >= 10 ? UiPalette.DEEP_BRASS : UiPalette.DARK_OLIVE,
                    );
                    break;
                case "intelligence": {
                    const intelligenceValue = GameSession.getInstance()
                        .getIntelligenceManager()
                        .getCorrectlyAnalyzedSourceCount();
                    tileRectangle.setFillStyle(
                        province.isCapital() && intelligenceValue >= 2
                            ? UiPalette.BRIGHT_BRASS
                            : UiPalette.NEAR_BLACK_LEATHER,
                    );
                    break;
                }
                case "political":
                case "faction":
                default: {
                    const ownerColor =
                        ownerNation === null
                            ? UiPalette.FIELD_GRAY
                            : UiPalette.getFactionColorForNationCode(ownerNation.getNationCode());
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

    private openMechanicByKey(mechanicKey: string): void {
        switch (mechanicKey) {
            case "decision":
                this.phaseIndex = 2;
                if (this.bottomBarComponent !== null) {
                    this.bottomBarComponent.setPhaseDisplay(TurnPhaseLabel.PHASE_LABELS[this.phaseIndex]);
                }
                this.renderPhaseCard();
                break;
            case "debrief":
                this.scene.start(SceneKeys.DEBRIEF, new ScenarioSelectionPayload(this.scenarioNumber));
                break;
            case "sources":
                this.scene.start(SceneKeys.SOURCE_ANALYSIS, new ScenarioSelectionPayload(this.scenarioNumber));
                break;
            case "causal_chain":
                this.openCausalChainsOverlay();
                break;
            case "comparison":
                this.openComparisonOverlay();
                break;
            case "chart":
                this.openContinuityChartOverlay();
                break;
            case "territorial_chart":
                this.openTerritorialHoldingsOverlay();
                break;
            case "quickwrite":
                this.openQuickwriteOverlay();
                break;
            case "shared_inquiry":
                this.openSharedInquiryOverlay();
                break;
            case "intervention":
                this.openInterventionMeterOverlay();
                break;
            case "seminar":
                this.openSocraticSeminarOverlay();
                break;
            case "argument":
                this.openArgumentBuilderOverlay();
                break;
            case "complex_argument":
                this.openComplexArgumentOverlay();
                break;
            case "testimony":
                this.openTestimonyOverlay();
                break;
            case "relationship":
                this.openRelationshipOverlay();
                break;
            case "casualties":
                this.openCasualtyChartOverlay();
                break;
            case "focus_tree":
                this.scene.start(SceneKeys.FOCUS_TREE);
                break;
            case "production":
                this.scene.start(SceneKeys.PRODUCTION_QUEUE);
                break;
            case "divisions":
                this.scene.start(SceneKeys.DIVISION_DESIGNER);
                break;
            case "war_score":
                this.scene.start(SceneKeys.WAR_SCORE);
                break;
            case "diplomacy":
                this.scene.start(SceneKeys.DIPLOMATIC_PLAY);
                break;
            case "ledger":
                this.scene.start(SceneKeys.LEDGER);
                break;
            case "all_tools":
                this.openToolsDrawerOverlay();
                break;
            default:
                break;
        }
    }

    private openToolsDrawerOverlay(): void {
        if (this.scenario === null) {
            return;
        }
        const scenario = this.scenario;
        this.openMechanicOverlay("ALL TOOLS AND VIEWS", (overlayPanel, panelWidth) => {
            overlayPanel.add(
                UiPanelFactory.createBodyText(
                    this,
                    20,
                    54,
                    panelWidth - 40,
                    "The essential actions live in the progress checklist. These are the full instruments of the game, always available.",
                    15,
                    UiPalette.PARCHMENT_CSS,
                ),
            );
            const toolEntries: Array<{ labelText: string; mechanicKey: string }> = [];
            if (scenario.getCausalChainDefinitions().length > 0) {
                toolEntries.push({ labelText: "CAUSAL CHAINS", mechanicKey: "causal_chain" });
            }
            if (scenario.getComparisonDefinition() !== null) {
                toolEntries.push({ labelText: "COMPARISON", mechanicKey: "comparison" });
            }
            if (scenario.getContinuityChangeDefinition() !== null) {
                toolEntries.push({ labelText: "CHART", mechanicKey: "chart" });
            }
            if (scenario.getPrimarySourceIdentifiers().length > 0) {
                toolEntries.push({ labelText: "SOURCES", mechanicKey: "sources" });
            }
            if (scenario.getFocusTreeDefinition() !== null) {
                toolEntries.push({ labelText: "FOCUS TREE", mechanicKey: "focus_tree" });
            }
            if (scenario.supportsProductionQueue()) {
                toolEntries.push({ labelText: "PRODUCTION", mechanicKey: "production" });
            }
            if (scenario.supportsDivisionDesigner()) {
                toolEntries.push({ labelText: "DIVISIONS", mechanicKey: "divisions" });
            }
            if ([2, 3, 7, 8].includes(scenario.getScenarioNumber())) {
                toolEntries.push({ labelText: "WAR SCORE", mechanicKey: "war_score" });
            }
            if (scenario.supportsDiplomaticPlay()) {
                toolEntries.push({ labelText: "DIPLOMACY", mechanicKey: "diplomacy" });
            }
            toolEntries.push({ labelText: "LEDGER", mechanicKey: "ledger" });
            toolEntries.push({ labelText: "JOURNAL", mechanicKey: "journal" });
            toolEntries.push({ labelText: "CASUALTIES", mechanicKey: "casualties" });
            toolEntries.push({ labelText: "INTERVENTION METER", mechanicKey: "intervention" });
            toolEntries.push({ labelText: "HOLDINGS CHART", mechanicKey: "territorial_chart" });
            toolEntries.push({ labelText: "QUICKWRITE", mechanicKey: "quickwrite" });
            toolEntries.push({ labelText: "SHARED INQUIRY", mechanicKey: "shared_inquiry" });
            toolEntries.push({ labelText: "SEMINAR", mechanicKey: "seminar" });
            toolEntries.push({ labelText: "TESTIMONY", mechanicKey: "testimony" });
            toolEntries.push({ labelText: "RELATIONSHIPS", mechanicKey: "relationship" });
            const buttonWidth = Math.floor((panelWidth - 72) / 3);
            toolEntries.forEach((toolEntry, toolIndex) => {
                const rowIndex = Math.floor(toolIndex / 3);
                const columnIndex = toolIndex % 3;
                const toolButton = UiPanelFactory.createBrassButton(
                    this,
                    24 + columnIndex * (buttonWidth + 12),
                    110 + rowIndex * 56,
                    buttonWidth,
                    44,
                    toolEntry.labelText,
                    () => {
                        this.closeMechanicOverlay();
                        this.openMechanicByKey(toolEntry.mechanicKey);
                    },
                );
                overlayPanel.add(toolButton);
            });
        });
    }

    private openMechanicOverlay(
        overlayTitleText: string,
        buildOverlayContent: (
            overlayPanel: Phaser.GameObjects.Container,
            panelWidth: number,
            panelHeight: number,
        ) => void,
    ): void {
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
        const renderChainInto = (
            overlayPanel: Phaser.GameObjects.Container,
            panelWidth: number,
            panelHeight: number,
        ): void => {
            const activeChain = causalChainDefinitions[activeChainIndex];
            overlayPanel.add(
                UiPanelFactory.createBodyText(
                    this,
                    20,
                    54,
                    panelWidth - 40,
                    "Drag each cause card into the matching time column: long-term (decades), intermediate (years), short-term (months). Correct ordering completes the objective.",
                    15,
                    UiPalette.PARCHMENT_CSS,
                ),
            );
            const chainSelectorContainer = this.add.container(20, 100);
            causalChainDefinitions.forEach((causalChainDefinition, chainIndex) => {
                const isCompleted = gameState.isScenarioFlagSet(`${causalChainDefinition.chainIdentifier}_complete`);
                const chainButton = UiPanelFactory.createBrassButton(
                    this,
                    chainIndex * 190,
                    0,
                    180,
                    36,
                    `${isCompleted ? "\u2713 " : ""}${causalChainDefinition.chainTitle.substring(0, 22)}`,
                    () => {
                        activeChainIndex = chainIndex;
                        this.openCausalChainsOverlay();
                    },
                );
                chainSelectorContainer.add(chainButton);
            });
            overlayPanel.add(chainSelectorContainer);
            const causalChainComponent = new CausalChainComponent(this, 16, 150, panelWidth - 32, panelHeight - 214);
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
            const comparisonToolComponent = new ComparisonToolComponent(
                this,
                16,
                52,
                panelWidth - 32,
                panelHeight - 90,
            );
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
            const continuityChangeChartComponent = new ContinuityChangeChartComponent(
                this,
                16,
                52,
                panelWidth - 32,
                panelHeight - 90,
            );
            continuityChangeChartComponent.setContinuityChangeDefinition(
                continuityChangeDefinition,
                this.scenarioNumber,
                gameState,
            );
            overlayPanel.add(continuityChangeChartComponent);
        });
    }

    private openTerritorialHoldingsOverlay(): void {
        const gameState = GameSession.getInstance().getGameState();
        const territorialHoldingsRows = WorldStatePresent.getTerritorialHoldingsRowsForContinuityAndChangeChart();
        this.openMechanicOverlay("TERRITORIAL HOLDINGS, 1900 TO PRESENT", (overlayPanel, panelWidth, panelHeight) => {
            const territorialHoldingsChartComponent = new TerritorialHoldingsChartComponent(
                this,
                16,
                52,
                panelWidth - 32,
                panelHeight - 90,
            );
            territorialHoldingsChartComponent.setTerritorialHoldingsRows(
                territorialHoldingsRows,
                this.scenarioNumber,
                gameState,
            );
            overlayPanel.add(territorialHoldingsChartComponent);
        });
    }

    private openQuickwriteOverlay(): void {
        const gameState = GameSession.getInstance().getGameState();
        const assessmentManager = GameSession.getInstance().getAssessmentManager();
        const quickwritePromptText = Rubrics.QUICKWRITE_RUBRIC.descriptionText;
        this.openMechanicOverlay("QUICKWRITE", (overlayPanel, panelWidth, panelHeight) => {
            const quickwriteComponent = new QuickwriteComponent(
                this,
                16,
                52,
                panelWidth - 32,
                panelHeight - 90,
                assessmentManager,
            );
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
            const sharedInquiryComponent = new SharedInquiryComponent(
                this,
                16,
                52,
                panelWidth - 32,
                panelHeight - 90,
                assessmentManager,
            );
            sharedInquiryComponent.setInquiryDocuments(leftSource, rightSource, this.scenarioNumber, gameState);
            overlayPanel.add(sharedInquiryComponent);
        });
    }

    private openInterventionMeterOverlay(): void {
        const gameState = GameSession.getInstance().getGameState();
        const domesticManager = GameSession.getInstance().getDomesticManager();
        const playerNationIdentifier = gameState.getPlayerNationIdentifier();
        this.openMechanicOverlay("LAISSEZ-FAIRE TO INTERVENTION", (overlayPanel, panelWidth) => {
            overlayPanel.add(
                UiPanelFactory.createBodyText(
                    this,
                    20,
                    56,
                    panelWidth - 40,
                    "After 1919, and especially after the Great Depression began, governments took a more active role in economic life. The meter tracks how far the state has moved from laissez-faire toward direction of the economy.",
                    16,
                    UiPalette.PARCHMENT_CSS,
                ),
            );
            const interventionMeterComponent = new GovernmentInterventionMeterComponent(this, 20, 150, 700);
            interventionMeterComponent.setInterventionLevel(
                domesticManager.getGovernmentInterventionLevel(playerNationIdentifier),
            );
            overlayPanel.add(interventionMeterComponent);
        });
    }

    private openSocraticSeminarOverlay(): void {
        const gameState = GameSession.getInstance().getGameState();
        const assessmentManager = GameSession.getInstance().getAssessmentManager();
        this.openMechanicOverlay("SOCRATIC SEMINAR", (overlayPanel, panelWidth, panelHeight) => {
            const socraticSeminarComponent = new SocraticSeminarComponent(
                this,
                16,
                52,
                panelWidth - 32,
                panelHeight - 90,
                assessmentManager,
            );
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
            const causalArgumentBuilderComponent = new CausalArgumentBuilderComponent(
                this,
                16,
                52,
                panelWidth - 32,
                panelHeight - 90,
            );
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
            const testimonyPanelComponent = new TestimonyPanelComponent(
                this,
                16,
                52,
                panelWidth - 32,
                panelHeight - 90,
            );
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
        const casualtiesByCategory = GameSession.getInstance()
            .getMilitaryManager()
            .getCasualtiesByCategory(playerNationIdentifier);
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

    private showNewspaperForEventRecord(
        headlineText: string,
        nationCode: string,
        illustrationAssetIdentifier: string,
    ): void {
        const newspaperPopupComponent = new NewspaperPopupComponent(this, 0, 0, this.scale.width);
        newspaperPopupComponent.showNewspaper(
            `newspaper_masthead_${nationCode === "GER" ? "germany" : nationCode === "ENG" ? "britain" : nationCode === "FRA" ? "france" : nationCode === "USA" ? "usa" : nationCode === "RUS" ? "ussr" : nationCode === "JAP" ? "japan" : "default"}`,
            headlineText,
            [
                `Dispatch carried by cable and wireless from the offices of the ${nationCode} press.`,
                `The editors note that the full meaning of these events will be examined in the debrief that follows.`,
                illustrationAssetIdentifier.length > 0
                    ? "An illustration accompanies this report in the printed edition."
                    : "",
            ].filter((paragraph) => paragraph.length > 0),
            nationCode,
        );
    }

    private showToast(messageText: string): void {
        if (this.toastContainer !== null) {
            this.toastContainer.destroy(true);
        }
        const screenWidth = this.scale.width;
        const toastWidthPx = Math.min(screenWidth - 80, 560);
        this.toastContainer = this.add.container(screenWidth / 2 - toastWidthPx / 2, 64);
        this.toastContainer.setDepth(UiPalette.UI_DEPTH_TOOLTIP);
        const toastBackground = this.add.graphics();
        toastBackground.fillStyle(UiPalette.PARCHMENT, 0.97);
        toastBackground.fillRect(0, 0, toastWidthPx, 46);
        toastBackground.lineStyle(2, UiPalette.BRIGHT_BRASS, 1);
        toastBackground.strokeRect(1, 1, toastWidthPx - 2, 44);
        this.toastContainer.add(toastBackground);
        const toastText = this.add.text(toastWidthPx / 2, 23, messageText, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "16px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
        });
        toastText.setOrigin(0.5, 0.5);
        this.toastContainer.add(toastText);
        this.toastContainer.setAlpha(0);
        this.tweens.add({
            targets: this.toastContainer,
            alpha: 1,
            y: 72,
            duration: 220,
            ease: "Sine.easeOut",
        });
        this.time.delayedCall(2400, () => {
            if (this.toastContainer !== null) {
                this.tweens.add({
                    targets: this.toastContainer,
                    alpha: 0,
                    duration: 320,
                    onComplete: () => {
                        if (this.toastContainer !== null) {
                            this.toastContainer.destroy(true);
                            this.toastContainer = null;
                        }
                    },
                });
            }
        });
    }

    private maybeShowOnboardingOverlay(): void {
        let hasSeenOnboarding = false;
        try {
            hasSeenOnboarding = window.localStorage.getItem(ScenarioPlayScene.ONBOARDING_STORAGE_KEY) === "true";
        } catch {
            hasSeenOnboarding = true;
        }
        if (hasSeenOnboarding) {
            return;
        }
        try {
            window.localStorage.setItem(ScenarioPlayScene.ONBOARDING_STORAGE_KEY, "true");
        } catch {
            return;
        }
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        const overlayContainer = this.add.container(0, 0);
        overlayContainer.setDepth(UiPalette.UI_DEPTH_POPUP);
        const overlayRectangle = this.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.78).setOrigin(0, 0);
        overlayRectangle.setInteractive();
        overlayContainer.add(overlayRectangle);
        const panelWidth = Math.min(880, screenWidth - 80);
        const panelHeight = Math.min(460, screenHeight - 80);
        const overlayPanel = UiPanelFactory.createPanelContainer(
            this,
            (screenWidth - panelWidth) / 2,
            (screenHeight - panelHeight) / 2,
            panelWidth,
            panelHeight,
            PanelVariant.LEATHER,
        );
        overlayPanel.add(UiPanelFactory.createSectionHeader(this, 28, 22, "HOW THIS GAME WORKS", 26));
        const steps: Array<{ stepTitle: string; stepBody: string }> = [
            {
                stepTitle: "1. FOLLOW THE CHECKLIST",
                stepBody:
                    "The progress panel on the right lists everything that wins the scenario. Press NEXT STEP and it opens the right tool for you.",
            },
            {
                stepTitle: "2. READ, THEN DECIDE",
                stepBody:
                    "Each turn walks through briefing, intelligence, decision, and reflection. Read the sources, then choose. Every choice teaches real history.",
            },
            {
                stepTitle: "3. WATCH THE MAP",
                stepBody:
                    "Click any province to inspect it. Use the left buttons to repaint the map: political, terrain, war, and more.",
            },
            {
                stepTitle: "4. WRITE TO WIN",
                stepBody:
                    "Answers you write are scored against AP-style criteria and saved to the journal your teacher can export.",
            },
        ];
        const stepCardWidth = (panelWidth - 96) / 2;
        steps.forEach((step, stepIndex) => {
            const rowIndex = Math.floor(stepIndex / 2);
            const columnIndex = stepIndex % 2;
            const stepCardLeftX = 28 + columnIndex * (stepCardWidth + 40);
            const stepCardTopY = 84 + rowIndex * 148;
            const stepCard = UiPanelFactory.createPanelContainer(
                this,
                stepCardLeftX,
                stepCardTopY,
                stepCardWidth,
                128,
                PanelVariant.PARCHMENT,
            );
            stepCard.add(UiPanelFactory.createSectionHeader(this, 14, 12, step.stepTitle, 16));
            stepCard.add(
                UiPanelFactory.createBodyText(
                    this,
                    14,
                    40,
                    stepCardWidth - 28,
                    step.stepBody,
                    14,
                    UiPalette.NEAR_BLACK_LEATHER_CSS,
                ),
            );
            overlayPanel.add(stepCard);
        });
        overlayPanel.add(
            UiPanelFactory.createBrassButton(
                this,
                panelWidth / 2 - 130,
                panelHeight - 66,
                260,
                48,
                "GOT IT - LET ME PLAY",
                () => {
                    overlayContainer.destroy(true);
                },
            ),
        );
        overlayContainer.add(overlayPanel);
    }

    private subscribeToGameEvents(): void {
        const eventBus = EventBus.getInstance();
        this.boundNewspaperHandler = (payload: unknown) => {
            const newspaperRequestPayload = payload as NewspaperRequestPayload;
            const newspaperPopupComponent = new NewspaperPopupComponent(this, 0, 0, this.scale.width);
            newspaperPopupComponent.showNewspaper(
                newspaperRequestPayload.newspaperAssetId,
                newspaperRequestPayload.headline,
                [
                    "The wire services report the following from the capitals of Europe and beyond.",
                    "Read carefully: the examination of causes follows in the debrief.",
                ],
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
            this.lastConsequenceText = `Decision recorded: ${decisionMadePayload.chosenOptionIdentifier}. The consequence is shown in the resolution phase.`;
            GameSession.getInstance().getAudioManager().playSoundEffect("sfx_diplomacy");
            this.showToast("Decision recorded. Progress updated.");
            this.refreshQuestTracker();
        };
        this.boundMechanicHandler = (payload: unknown) => {
            const mechanicCompletedPayload = payload as MechanicCompletedPayload;
            void mechanicCompletedPayload;
            this.showToast("Objective complete! Progress updated.");
            this.refreshQuestTracker();
            this.checkForVictory();
        };
        this.boundSourceHandler = (payload: unknown) => {
            const sourceAnalysisPayload = payload as SourceAnalysisPayload;
            if (sourceAnalysisPayload.wasAnalysisCorrect) {
                this.showToast("Intelligence confirmed: the source was read correctly.");
            } else {
                this.showToast("The source was misread. Review the model answers and try again.");
            }
            this.refreshQuestTracker();
            this.checkForVictory();
        };
        eventBus.subscribe(GameEventTypes.NEWSPAPER_REQUESTED, this.boundNewspaperHandler);
        eventBus.subscribe(GameEventTypes.TELEGRAM_REQUESTED, this.boundTelegramHandler);
        eventBus.subscribe(GameEventTypes.UI_NAVIGATION_REQUESTED, this.boundNavigationHandler);
        eventBus.subscribe(GameEventTypes.UI_MAP_MODE_SELECTED, this.boundMapModeHandler);
        eventBus.subscribe(GameEventTypes.DECISION_MADE, this.boundDecisionHandler);
        eventBus.subscribe(GameEventTypes.MECHANIC_COMPLETED, this.boundMechanicHandler);
        eventBus.subscribe(GameEventTypes.SOURCE_ANALYZED, this.boundSourceHandler);
        eventBus.subscribe(GameEventTypes.CAUSAL_CHAIN_COMPLETED, (payload: unknown) => {
            const causalChainPayload = payload as CausalChainPayload;
            void causalChainPayload;
            this.showToast("Causal chain complete. A focus path may have opened.");
            this.refreshQuestTracker();
            this.checkForVictory();
        });
        eventBus.subscribe(GameEventTypes.FOCUS_NODE_COMPLETED, () => {
            this.showToast("Focus completed.");
            this.refreshQuestTracker();
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
        eventBus.unsubscribe(GameEventTypes.SOURCE_ANALYZED, this.boundSourceHandler);
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
