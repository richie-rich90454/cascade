import Phaser from "phaser";

import { prefersReducedMotion } from "../core/AccessibilityPreferences";
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
import { HighDpiConfigurator } from "../core/HighDpiConfigurator";
import { SceneKeys } from "../core/SceneKeys";
import { PrimarySources } from "../data/PrimarySources";
import { Rubrics } from "../data/Rubrics";
import { getWorldProvinceCoordinate } from "../data/WorldProvinceGeography";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import type { DecisionRecord, Scenario } from "../domain/scenarios/Scenario";
import { WorldStatePresent } from "../domain/WorldStatePresent";
import { AssetManager } from "../managers/AssetManager";
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
import { ScrollRegion, UiPointerRouting } from "../ui/UiPointerRouting";
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
        "Choose an option to create a scenario path, then compare its consequences with the documented history.",
        "See what your decision set in motion, then continue.",
        "DOCUMENTED HISTORY: a dispatch from the capitals has arrived. Compare it with the path your decisions are creating.",
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
    private provinceTilesByProvinceIdentifier: Map<string, Phaser.GameObjects.Arc>;
    private historicalMapImage: Phaser.GameObjects.Image | null;
    private historicalMapYearLabel: Phaser.GameObjects.Text | null;
    private disputedMapLegendText: Phaser.GameObjects.Text | null;
    private tibetHistoryNoteText: Phaser.GameObjects.Text | null;
    private taiwanHistoryNoteText: Phaser.GameObjects.Text | null;
    private provinceIdentifiersInMapOrder: string[];
    private selectedProvinceMapIndex: number;
    private lastMarkerDisplayScale: number;
    private lastHighlightedProvinceIdentifier: string | null;
    private phaseCardContainer: Phaser.GameObjects.Container | null;
    private mechanicOverlayContainer: Phaser.GameObjects.Container | null;
    private toastContainer: Phaser.GameObjects.Container | null;
    private questTrackerComponent: QuestTrackerComponent | null;
    private rightSidebarComponent: RightSidebarComponent | null;
    private leftSidebarComponent: LeftSidebarComponent | null;
    private mapModesToggleButton: Phaser.GameObjects.Container | null;
    private objectivesToggleButton: Phaser.GameObjects.Container | null;
    private bottomBarComponent: BottomBarComponent | null;
    private topBarComponent: TopBarComponent | null;
    private mapCameraController: MapCameraController | null;
    private activeMapModeCode: string;
    private registeredPointerRegions: ScrollRegion[];
    private phaseCardPointerRegion: ScrollRegion | null;
    private isMapModesPanelOpen: boolean;
    private areInformationPanelsOpen: boolean;
    private isPhaseDetailsExpanded: boolean;
    private boundNewspaperHandler: (payload: unknown) => void;
    private boundTelegramHandler: (payload: unknown) => void;
    private boundNavigationHandler: (payload: unknown) => void;
    private boundMapModeHandler: (payload: unknown) => void;
    private boundDecisionHandler: (payload: unknown) => void;
    private boundMechanicHandler: (payload: unknown) => void;
    private boundSourceHandler: (payload: unknown) => void;
    private readonly boundMapLeftKeyHandler: () => void;
    private readonly boundMapRightKeyHandler: () => void;
    private readonly boundMapEnterKeyHandler: () => void;
    private mapPointerDownPosition: { x: number; y: number } | null;

    constructor() {
        super({ key: SceneKeys.SCENARIO_PLAY });
        this.scenarioNumber = 1;
        this.scenario = null;
        this.phaseIndex = 0;
        this.lastConsequenceText = "";
        this.provinceTilesByProvinceIdentifier = new Map<string, Phaser.GameObjects.Arc>();
        this.historicalMapImage = null;
        this.historicalMapYearLabel = null;
        this.disputedMapLegendText = null;
        this.tibetHistoryNoteText = null;
        this.taiwanHistoryNoteText = null;
        this.provinceIdentifiersInMapOrder = [];
        this.selectedProvinceMapIndex = -1;
        this.lastMarkerDisplayScale = -1;
        this.lastHighlightedProvinceIdentifier = null;
        this.phaseCardContainer = null;
        this.mechanicOverlayContainer = null;
        this.toastContainer = null;
        this.questTrackerComponent = null;
        this.rightSidebarComponent = null;
        this.leftSidebarComponent = null;
        this.mapModesToggleButton = null;
        this.objectivesToggleButton = null;
        this.bottomBarComponent = null;
        this.topBarComponent = null;
        this.mapCameraController = null;
        this.activeMapModeCode = MapModeOption.POLITICAL.getMapModeCode();
        this.registeredPointerRegions = [];
        this.phaseCardPointerRegion = null;
        this.isMapModesPanelOpen = false;
        this.areInformationPanelsOpen = false;
        this.isPhaseDetailsExpanded = false;
        this.boundNewspaperHandler = () => undefined;
        this.boundTelegramHandler = () => undefined;
        this.boundNavigationHandler = () => undefined;
        this.boundMapModeHandler = () => undefined;
        this.boundDecisionHandler = () => undefined;
        this.boundMechanicHandler = () => undefined;
        this.boundSourceHandler = () => undefined;
        this.boundMapLeftKeyHandler = () => this.moveProvinceMapSelection(-1);
        this.boundMapRightKeyHandler = () => this.moveProvinceMapSelection(1);
        this.boundMapEnterKeyHandler = () => {
            if (this.mechanicOverlayContainer !== null) {
                return;
            }
            const identifier = this.provinceIdentifiersInMapOrder[this.selectedProvinceMapIndex];
            if (identifier !== undefined) {
                this.onProvinceSelected(identifier);
            }
        };
        this.mapPointerDownPosition = null;
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
        this.provinceTilesByProvinceIdentifier = new Map<string, Phaser.GameObjects.Arc>();
        this.historicalMapImage = null;
        this.historicalMapYearLabel = null;
        this.disputedMapLegendText = null;
        this.provinceIdentifiersInMapOrder = [];
        this.selectedProvinceMapIndex = -1;
        this.lastMarkerDisplayScale = -1;
        this.lastHighlightedProvinceIdentifier = null;
        this.mechanicOverlayContainer = null;
        this.phaseCardContainer = null;
        this.phaseCardPointerRegion = null;
        this.mapPointerDownPosition = null;
        this.isMapModesPanelOpen = false;
        this.areInformationPanelsOpen = false;
        this.isPhaseDetailsExpanded = false;
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
            this.updateProvinceMarkerDisplaySizes();
        }
    }

    private updateProvinceMarkerDisplaySizes(): void {
        const scale = this.mapCameraController?.getCurrentScale() ?? 1;
        const selectedIdentifier = this.provinceIdentifiersInMapOrder[this.selectedProvinceMapIndex] ?? null;
        if (scale === this.lastMarkerDisplayScale && selectedIdentifier === this.lastHighlightedProvinceIdentifier) {
            return;
        }
        for (const [identifier, marker] of this.provinceTilesByProvinceIdentifier) {
            const province = GameSession.getInstance().getGameState().getProvince(identifier);
            const isCapital = province?.isCapital() ?? false;
            const baseRadius = isCapital ? 4.3 : 3.4;
            marker.setRadius(baseRadius / scale);
            const isSelected = identifier === selectedIdentifier;
            marker.setStrokeStyle(
                (isSelected ? 2.2 : isCapital ? 1.4 : 1) / scale,
                isSelected ? UiPalette.HIGHLIGHT_BRASS : UiPalette.PARCHMENT,
                0.98,
            );
        }
        this.lastMarkerDisplayScale = scale;
        this.lastHighlightedProvinceIdentifier = selectedIdentifier;
    }

    private getNearestProvinceIdentifier(screenX: number, screenY: number, maximumDistancePx: number): string | null {
        let nearestIdentifier: string | null = null;
        let nearestDistancePx = maximumDistancePx;
        const screenPoint = new Phaser.Math.Vector2();
        for (const [identifier, marker] of this.provinceTilesByProvinceIdentifier) {
            marker.getWorldTransformMatrix().transformPoint(marker.displayOriginX, marker.displayOriginY, screenPoint);
            const distancePx = Phaser.Math.Distance.Between(screenX, screenY, screenPoint.x, screenPoint.y);
            if (distancePx < nearestDistancePx) {
                nearestIdentifier = identifier;
                nearestDistancePx = distancePx;
            }
        }
        return nearestIdentifier;
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
        const phaseCardHeight = this.isPhaseDetailsExpanded ? 216 : 84;
        const phaseCardTopY = screenHeight - 64 - phaseCardHeight - 4;
        const rightColumnTopY = 96;
        const rightColumnBottomY = screenHeight - 64;
        const rightColumnHeight = rightColumnBottomY - rightColumnTopY;
        const questTrackerHeight = Math.max(220, Math.round(rightColumnHeight * 0.58));
        return {
            map: new LayoutRect(contentLeftX, 96, contentWidth, Math.max(280, phaseCardTopY - 96 - 8)),
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
                    UiPalette.NEAR_BLACK_LEATHER_CSS,
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
        const mapPixelWidth = Math.min(layoutRects.map.width, layoutRects.map.height * 2);
        const mapPixelHeight = mapPixelWidth / 2;
        const mapLeftX = 0;
        const mapTopY = 0;
        const mapContainer = this.add.container(layoutRects.map.leftX, layoutRects.map.topY);
        const historicalMapYear = this.getHistoricalMapYearForCurrentTurn();
        const historicalMapTextureKey = AssetManager.getInstance().getTextureKey(`world_map_${historicalMapYear}`);
        if (this.textures.exists(historicalMapTextureKey)) {
            this.historicalMapImage = this.add
                .image(mapLeftX, mapTopY, historicalMapTextureKey)
                .setOrigin(0, 0)
                .setDisplaySize(mapPixelWidth, mapPixelHeight);
            mapContainer.add(this.historicalMapImage);
        }
        const provinceSelectionZone = this.add
            .zone(mapLeftX + mapPixelWidth / 2, mapTopY + mapPixelHeight / 2, mapPixelWidth, mapPixelHeight)
            .setInteractive({ useHandCursor: true });
        provinceSelectionZone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            this.mapPointerDownPosition = { x: pointer.x, y: pointer.y };
        });
        provinceSelectionZone.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            const pointerDownPosition = this.mapPointerDownPosition;
            this.mapPointerDownPosition = null;
            const devicePixelRatioValue = HighDpiConfigurator.getInstance().getDevicePixelRatio();
            const pointerCssX = HighDpiConfigurator.getInstance().toCssPixels(pointer.x);
            const pointerCssY = HighDpiConfigurator.getInstance().toCssPixels(pointer.y);
            if (
                pointerDownPosition === null ||
                Phaser.Math.Distance.Between(pointer.x, pointer.y, pointerDownPosition.x, pointerDownPosition.y) /
                    devicePixelRatioValue >
                    7
            ) {
                return;
            }
            const nearestProvinceIdentifier = this.getNearestProvinceIdentifier(pointerCssX, pointerCssY, 24);
            if (nearestProvinceIdentifier !== null) {
                this.onProvinceSelected(nearestProvinceIdentifier);
            }
        });
        mapContainer.add(provinceSelectionZone);
        const mapHudContainer = this.add
            .container(layoutRects.map.leftX, layoutRects.map.topY)
            .setDepth(UiPalette.UI_DEPTH_SIDEBAR);
        this.historicalMapYearLabel = this.add
            .text(
                mapPixelWidth - 18,
                14,
                mapPixelWidth < 620
                    ? `DOCUMENTED · ${historicalMapYear}`
                    : `DOCUMENTED BORDERS · ${historicalMapYear} · PRECISION VARIES BY REGION`,
                {
                    fontFamily: FontFamilies.TYPEWRITER_BODY,
                    fontSize: mapPixelWidth < 620 ? "12px" : "14px",
                    color: UiPalette.PARCHMENT_CSS,
                    backgroundColor: "#172128",
                    padding: { x: 10, y: 7 },
                },
            )
            .setOrigin(1, 0);
        mapHudContainer.add(this.historicalMapYearLabel);
        const mapInstructions = this.add.text(
            18,
            mapPixelHeight - (mapPixelWidth < 620 ? 95 : 58),
            mapPixelWidth < 620
                ? "DRAG · WHEEL · CLICK"
                : "DRAG TO PAN · WHEEL OR + / − TO ZOOM · CLICK A RING TO INSPECT · ← / → + ENTER SELECT",
            {
                fontFamily: FontFamilies.TYPEWRITER_BODY,
                fontSize: mapPixelWidth < 620 ? "12px" : "14px",
                color: UiPalette.PARCHMENT_CSS,
                backgroundColor: "#172128",
                padding: { x: 10, y: 7 },
            },
        );
        mapHudContainer.add(mapInstructions);
        this.disputedMapLegendText = this.add.text(
            18,
            mapPixelHeight - (mapPixelWidth < 620 ? 125 : 25),
            mapPixelWidth < 620
                ? "HATCHED · INDIA ADMIN. · CHINA CLAIM · MODERN REF."
                : "MODERN DISPUTE REFERENCE · HATCHED APPROXIMATE AREA · ADMINISTERED BY INDIA · CLAIMED BY CHINA",
            {
                fontFamily: FontFamilies.TYPEWRITER_BODY,
                fontSize: mapPixelWidth < 620 ? "12px" : "14px",
                color: UiPalette.PARCHMENT_CSS,
                backgroundColor: "#172128",
                padding: { x: 10, y: 7 },
            },
        );
        this.disputedMapLegendText.setVisible(true);
        mapHudContainer.add(this.disputedMapLegendText);
        this.tibetHistoryNoteText = this.add.text(
            18,
            48,
            mapPixelWidth < 620
                ? "TIBET · CHINESE ADMINISTRATION BY 1960"
                : "TIBET · ADMINISTERED BY THE PEOPLE'S REPUBLIC OF CHINA BY 1960 · 1951 ACCOUNTS DIFFER",
            {
                fontFamily: FontFamilies.TYPEWRITER_BODY,
                fontSize: mapPixelWidth < 620 ? "12px" : "14px",
                color: UiPalette.PARCHMENT_CSS,
                backgroundColor: "#172128",
                padding: { x: 10, y: 7 },
            },
        );
        this.tibetHistoryNoteText.setVisible(historicalMapYear >= 1960);
        this.tibetHistoryNoteText.setInteractive({ useHandCursor: true });
        this.tibetHistoryNoteText.on("pointerup", () => {
            this.showToast(
                "By 1960 the People's Republic of China administered Tibet. Sources from the People's Republic of China describe the 1951 agreement as peaceful liberation; Tibetan sources describe it as signed under duress.",
            );
        });
        mapHudContainer.add(this.tibetHistoryNoteText);
        this.taiwanHistoryNoteText = this.add.text(
            18,
            82,
            mapPixelWidth < 620
                ? "TAIWAN · SAME COLOR GROUP SINCE 1945 · REPUBLIC OF CHINA GOVERNMENT"
                : "TAIWAN · SAME COLOR GROUP FROM 1945 · GOVERNED BY REPUBLIC OF CHINA · CLAIMED BY PEOPLE'S REPUBLIC OF CHINA",
            {
                fontFamily: FontFamilies.TYPEWRITER_BODY,
                fontSize: mapPixelWidth < 620 ? "12px" : "14px",
                color: UiPalette.PARCHMENT_CSS,
                backgroundColor: "#172128",
                padding: { x: 10, y: 7 },
            },
        );
        this.taiwanHistoryNoteText.setVisible(historicalMapYear >= 1945);
        this.taiwanHistoryNoteText.setInteractive({ useHandCursor: true });
        this.taiwanHistoryNoteText.on("pointerup", () => {
            this.showToast(
                "Taiwan uses the China color group from 1945. The Republic of China has governed Taiwan since 1945; the People's Republic of China claims Taiwan.",
            );
        });
        mapHudContainer.add(this.taiwanHistoryNoteText);
        const zoomControlTopY = mapPixelHeight - 51;
        mapHudContainer.add(
            UiPanelFactory.createBrassButton(this, mapPixelWidth - 184, zoomControlTopY, 42, 38, "+", () => {
                this.mapCameraController?.zoomIn();
            }),
        );
        mapHudContainer.add(
            UiPanelFactory.createBrassButton(this, mapPixelWidth - 136, zoomControlTopY, 42, 38, "−", () => {
                this.mapCameraController?.zoomOut();
            }),
        );
        mapHudContainer.add(
            UiPanelFactory.createBrassButton(this, mapPixelWidth - 86, zoomControlTopY, 78, 38, "WORLD", () => {
                this.mapCameraController?.resetToOverview();
            }),
        );
        for (const province of allProvinces) {
            const ownerNation = gameState.getNation(province.getOwnerNationIdentifier());
            const ownerColor =
                ownerNation === null
                    ? UiPalette.FIELD_GRAY
                    : UiPalette.getFactionColorForNationCode(ownerNation.getNationCode());
            const coordinate = getWorldProvinceCoordinate(province.getIdentifier());
            if (coordinate === null) {
                continue;
            }
            const markerX = mapLeftX + ((coordinate.longitude + 180) / 360) * mapPixelWidth;
            const markerY = mapTopY + ((90 - coordinate.latitude) / 180) * mapPixelHeight;
            const provinceMarker = this.add
                .circle(markerX, markerY, province.isCapital() ? 4.3 : 3.4, ownerColor, 0.98)
                .setStrokeStyle(province.isCapital() ? 1.4 : 1, UiPalette.PARCHMENT, 0.95);
            this.provinceTilesByProvinceIdentifier.set(province.getIdentifier(), provinceMarker);
            this.provinceIdentifiersInMapOrder.push(province.getIdentifier());
            mapContainer.add(provinceMarker);
        }
        const disputedAreaMapZone = this.add
            .zone(((94.4 + 180) / 360) * mapPixelWidth, ((90 - 28.2) / 180) * mapPixelHeight, 54, 28)
            .setInteractive({ useHandCursor: true });
        disputedAreaMapZone.on("pointerup", () => {
            this.showToast(
                "Modern reference only: Arunachal Pradesh is administered by India and claimed by China. The hatched area is approximate, not a historical border.",
            );
        });
        mapContainer.add(disputedAreaMapZone);
        const taiwanStatusMapZone = this.add
            .zone(((121 + 180) / 360) * mapPixelWidth, ((90 - 23.7) / 180) * mapPixelHeight, 32, 24)
            .setInteractive({ useHandCursor: true });
        taiwanStatusMapZone.on("pointerup", () => {
            const selectedMapYear = this.getHistoricalMapYearForCurrentTurn();
            this.showToast(
                selectedMapYear >= 1960
                    ? "Taiwan is shown in the China color group. The Republic of China has governed Taiwan since 1945; the People's Republic of China claims Taiwan and has not administered the island."
                    : selectedMapYear >= 1945
                      ? "Taiwan is shown in the China color group. The Republic of China took control of Taiwan in 1945."
                      : "This historical snapshot shows Taiwan under Japanese rule, which began in 1895.",
            );
        });
        mapContainer.add(taiwanStatusMapZone);
        this.mapCameraController = new MapCameraController(this, mapPixelWidth, mapPixelHeight);
        this.mapCameraController.setViewport(
            layoutRects.map.leftX,
            layoutRects.map.topY,
            layoutRects.map.width,
            layoutRects.map.height,
        );
        this.mapCameraController.setTargetContainer(mapContainer);
        this.mapCameraController.enablePanning();
        this.mapCameraController.enableZoom();
        this.mapCameraController.update();
        this.applyMapMode(this.activeMapModeCode);
        this.input.keyboard?.on("keydown-LEFT", this.boundMapLeftKeyHandler);
        this.input.keyboard?.on("keydown-RIGHT", this.boundMapRightKeyHandler);
        this.input.keyboard?.on("keydown-ENTER", this.boundMapEnterKeyHandler);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard?.off("keydown-LEFT", this.boundMapLeftKeyHandler);
            this.input.keyboard?.off("keydown-RIGHT", this.boundMapRightKeyHandler);
            this.input.keyboard?.off("keydown-ENTER", this.boundMapEnterKeyHandler);
        });
    }

    private moveProvinceMapSelection(direction: number): void {
        if (this.provinceIdentifiersInMapOrder.length === 0 || this.mechanicOverlayContainer !== null) {
            return;
        }
        const previousIdentifier = this.provinceIdentifiersInMapOrder[this.selectedProvinceMapIndex];
        const previousMarker =
            previousIdentifier === undefined
                ? undefined
                : this.provinceTilesByProvinceIdentifier.get(previousIdentifier);
        const previousProvince =
            previousIdentifier === undefined
                ? null
                : GameSession.getInstance().getGameState().getProvince(previousIdentifier);
        previousMarker?.setStrokeStyle(previousProvince?.isCapital() ? 3 : 2, UiPalette.PARCHMENT, 0.95);
        this.selectedProvinceMapIndex =
            this.selectedProvinceMapIndex === -1
                ? direction > 0
                    ? 0
                    : this.provinceIdentifiersInMapOrder.length - 1
                : (this.selectedProvinceMapIndex + direction + this.provinceIdentifiersInMapOrder.length) %
                  this.provinceIdentifiersInMapOrder.length;
        this.updateProvinceMarkerDisplaySizes();
        const identifier = this.provinceIdentifiersInMapOrder[this.selectedProvinceMapIndex];
        const marker = this.provinceTilesByProvinceIdentifier.get(identifier);
        marker?.setStrokeStyle(4, UiPalette.HIGHLIGHT_BRASS, 1);
        if (marker !== undefined) {
            this.showToast(
                `Map focus: ${GameSession.getInstance().getGameState().getProvince(identifier)?.getDisplayName() ?? identifier}. Press Enter for details.`,
            );
        }
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
        this.leftSidebarComponent = new LeftSidebarComponent(this, 0, 196, screenHeight - 260, this.activeMapModeCode);
        this.leftSidebarComponent.setVisible(this.isMapModesPanelOpen);
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
        this.questTrackerComponent.setVisible(this.areInformationPanelsOpen);
        this.rightSidebarComponent = new RightSidebarComponent(
            this,
            layoutRects.contextPanel.leftX,
            layoutRects.contextPanel.topY,
            layoutRects.contextPanel.width,
            layoutRects.contextPanel.height,
        );
        this.rightSidebarComponent.setContentToEmptyPrompt();
        this.rightSidebarComponent.setVisible(this.areInformationPanelsOpen);
        this.registerPointerRegion(
            new ScrollRegion(
                layoutRects.contextPanel.leftX,
                layoutRects.contextPanel.topY,
                layoutRects.contextPanel.width,
                layoutRects.contextPanel.height,
            ),
        );
        const contextPanelBlockingZone = this.add.zone(
            layoutRects.contextPanel.leftX,
            layoutRects.contextPanel.topY,
            layoutRects.contextPanel.width,
            layoutRects.contextPanel.height,
        );
        contextPanelBlockingZone.setOrigin(0, 0);
        contextPanelBlockingZone.setInteractive();
        contextPanelBlockingZone.setDepth(UiPalette.UI_DEPTH_SIDEBAR);
        this.mapModesToggleButton = UiPanelFactory.createBrassButton(this, 8, 144, 128, 38, "SHOW MAP MODES", () =>
            this.setMapModesPanelOpen(!this.isMapModesPanelOpen),
        );
        this.mapModesToggleButton.setDepth(UiPalette.UI_DEPTH_POPUP);
        this.objectivesToggleButton = UiPanelFactory.createBrassButton(
            this,
            screenWidth - 166,
            100,
            158,
            38,
            "SHOW OBJECTIVES",
            () => this.setInformationPanelsOpen(!this.areInformationPanelsOpen),
        );
        this.objectivesToggleButton.setDepth(UiPalette.UI_DEPTH_POPUP);
        this.bottomBarComponent = new BottomBarComponent(this, 0, screenHeight - 56, screenWidth, 56);
        this.bottomBarComponent.setTurnDisplay(gameSession.getCurrentTurnNumber(), gameSession.getTotalTurnCount());
        this.bottomBarComponent.setPhaseDisplay(TurnPhaseLabel.PHASE_LABELS[this.phaseIndex]);
        this.refreshQuestTracker();
    }

    private setMapModesPanelOpen(isOpen: boolean): void {
        this.isMapModesPanelOpen = isOpen;
        this.leftSidebarComponent?.setVisible(isOpen);
        const buttonLabel = isOpen ? "HIDE MAP MODES" : "SHOW MAP MODES";
        this.mapModesToggleButton?.each((child: Phaser.GameObjects.GameObject) => {
            if (child instanceof Phaser.GameObjects.Text) {
                child.setText(buttonLabel);
            }
        });
    }

    private setInformationPanelsOpen(isOpen: boolean): void {
        this.areInformationPanelsOpen = isOpen;
        this.questTrackerComponent?.setVisible(isOpen);
        this.rightSidebarComponent?.setVisible(isOpen);
        const buttonLabel = isOpen ? "HIDE OBJECTIVES" : "SHOW OBJECTIVES";
        this.objectivesToggleButton?.each((child: Phaser.GameObjects.GameObject) => {
            if (child instanceof Phaser.GameObjects.Text) {
                child.setText(buttonLabel);
            }
        });
    }

    private registerPointerRegion(scrollRegion: ScrollRegion): void {
        UiPointerRouting.registerScrollRegion(scrollRegion);
        this.registeredPointerRegions.push(scrollRegion);
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
        if (this.phaseCardPointerRegion !== null) {
            UiPointerRouting.unregisterScrollRegion(this.phaseCardPointerRegion);
            this.phaseCardPointerRegion = null;
        }
        this.phaseCardPointerRegion = new ScrollRegion(
            layoutRects.phaseCard.leftX,
            layoutRects.phaseCard.topY,
            layoutRects.phaseCard.width,
            layoutRects.phaseCard.height,
        );
        UiPointerRouting.registerScrollRegion(this.phaseCardPointerRegion);
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
        if (!this.isPhaseDetailsExpanded) {
            phasePanel.add(
                UiPanelFactory.createBodyText(
                    this,
                    20,
                    46,
                    layoutRects.phaseCard.width - 380,
                    TurnPhaseLabel.PHASE_GUIDANCE[this.phaseIndex],
                    14,
                    UiPalette.PARCHMENT_CSS,
                ),
            );
            this.phaseCardContainer.add(
                UiPanelFactory.createBrassButton(
                    this,
                    layoutRects.phaseCard.width - 366,
                    20,
                    164,
                    44,
                    "OPEN DETAILS",
                    () => {
                        this.isPhaseDetailsExpanded = true;
                        this.renderPhaseCard();
                    },
                ),
            );
            this.phaseCardContainer.add(
                UiPanelFactory.createBrassButton(
                    this,
                    layoutRects.phaseCard.width - 190,
                    20,
                    170,
                    44,
                    this.phaseIndex >= TurnPhaseLabel.PHASE_LABELS.length - 1 ? "END TURN" : "CONTINUE",
                    () => this.advancePhase(),
                ),
            );
            return;
        }
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
                layoutRects.phaseCard.width - 366,
                layoutRects.phaseCard.height - 58,
                164,
                44,
                "HIDE DETAILS",
                () => {
                    this.isPhaseDetailsExpanded = false;
                    this.renderPhaseCard();
                },
            ),
        );
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
            UiPanelFactory.createBrassButton(
                this,
                20,
                phaseCardRect.height - 58,
                260,
                44,
                "OPEN SOURCE ANALYSIS",
                () => {
                    this.scene.start(SceneKeys.SOURCE_ANALYSIS, new ScenarioSelectionPayload(this.scenarioNumber));
                },
            ),
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
                    phaseCardRect.width - 220,
                    "Every decision for this scenario has been made. Use the progress checklist to finish the remaining objectives.",
                    15,
                    UiPalette.PARCHMENT_CSS,
                ),
            );
            return;
        }
        phasePanel.add(
            UiPanelFactory.createBodyText(
                this,
                20,
                82,
                phaseCardRect.width - 220,
                pendingDecision.decisionTitle,
                17,
                UiPalette.PARCHMENT_CSS,
            ),
        );
        phasePanel.add(
            UiPanelFactory.createBrassButton(this, 20, phaseCardRect.height - 58, 260, 44, "OPEN DECISION", () => {
                this.openDecisionOverlay(pendingDecision);
            }),
        );
    }

    private openDecisionOverlay(decisionRecord: DecisionRecord): void {
        const gameState = GameSession.getInstance().getGameState();
        this.openMechanicOverlay(
            `DECISION: ${decisionRecord.decisionTitle.toUpperCase()}`,
            (overlayPanel, panelWidth, panelHeight) => {
                const decisionPanelComponent = new DecisionPanelComponent(
                    this,
                    12,
                    50,
                    panelWidth - 24,
                    panelHeight - 80,
                );
                decisionPanelComponent.setDecision(decisionRecord, gameState);
                overlayPanel.add(decisionPanelComponent);
            },
        );
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
            UiPanelFactory.createBrassButton(this, 20, phaseCardRect.height - 58, 260, 44, "READ THE DISPATCH", () => {
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
            UiPanelFactory.createBrassButton(this, 20, phaseCardRect.height - 58, 260, 44, "OPEN DEBRIEF", () => {
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
            UiPanelFactory.createBrassButton(this, 20, phaseCardRect.height - 58, 260, 44, "WRITE IN JOURNAL", () => {
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
            this.refreshHistoricalMapSnapshot();
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

    private getHistoricalMapYearForCurrentTurn(): number {
        const mapYears = [1900, 1914, 1920, 1930, 1938, 1945, 1960, 1994, 2000, 2010];
        const gameSession = GameSession.getInstance();
        const scenario = this.scenario;
        if (scenario === null) {
            return mapYears[0];
        }
        const turnProgress =
            Math.max(0, gameSession.getCurrentTurnNumber() - 1) / Math.max(1, scenario.getTurnCount() - 1);
        const scenarioYear = scenario.getStartYear() + (scenario.getEndYear() - scenario.getStartYear()) * turnProgress;
        return mapYears.reduce((closestYear, candidateYear) =>
            Math.abs(candidateYear - scenarioYear) < Math.abs(closestYear - scenarioYear) ? candidateYear : closestYear,
        );
    }

    private refreshHistoricalMapSnapshot(): void {
        if (this.historicalMapImage === null || this.historicalMapYearLabel === null) {
            return;
        }
        const year = this.getHistoricalMapYearForCurrentTurn();
        const textureKey = AssetManager.getInstance().getTextureKey(`world_map_${year}`);
        if (this.textures.exists(textureKey)) {
            this.historicalMapImage.setTexture(textureKey);
        }
        const layoutRects = this.getLayoutRects();
        const mapPixelWidth = Math.min(layoutRects.map.width, layoutRects.map.height * 2);
        this.historicalMapYearLabel.setText(
            mapPixelWidth < 620 ? `DOCUMENTED · ${year}` : `DOCUMENTED BORDERS · ${year} · PRECISION VARIES BY REGION`,
        );
        this.disputedMapLegendText?.setVisible(true);
        this.tibetHistoryNoteText?.setVisible(year >= 1960);
        this.taiwanHistoryNoteText?.setVisible(year >= 1945);
        this.applyMapMode(this.activeMapModeCode);
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
        this.selectedProvinceMapIndex = this.provinceIdentifiersInMapOrder.indexOf(provinceIdentifier);
        this.updateProvinceMarkerDisplaySizes();
        const ownerNation = gameState.getNation(province.getOwnerNationIdentifier());
        this.rightSidebarComponent.clearContextContent();
        const provincePanelComponent = new ProvincePanelComponent(this, 0, 0, 300);
        provincePanelComponent.setProvince(province, ownerNation);
        this.rightSidebarComponent.addContextContent(provincePanelComponent);
        this.setInformationPanelsOpen(true);
    }

    private applyMapMode(mapModeCode: string): void {
        this.activeMapModeCode = mapModeCode;
        const gameState = GameSession.getInstance().getGameState();
        const playerNation = gameState.getNation(gameState.getPlayerNationIdentifier());
        for (const province of gameState.getAllProvinces()) {
            const provinceMarker = this.provinceTilesByProvinceIdentifier.get(province.getIdentifier());
            if (provinceMarker === undefined) {
                continue;
            }
            const ownerNation = gameState.getNation(province.getOwnerNationIdentifier());
            switch (mapModeCode) {
                case "terrain":
                    provinceMarker.setFillStyle(this.getTerrainColorForCode(province.getTerrainTypeCode()));
                    break;
                case "resource":
                    provinceMarker.setFillStyle(
                        province.getVictoryPointValue() >= 20 ? UiPalette.BRIGHT_BRASS : UiPalette.DEEP_BRASS,
                    );
                    break;
                case "diplomatic": {
                    if (playerNation === null || ownerNation === null || ownerNation === playerNation) {
                        provinceMarker.setFillStyle(UiPalette.MID_OLIVE);
                        break;
                    }
                    const relationScore = GameSession.getInstance()
                        .getDiplomacyManager()
                        .getRelationScore(playerNation, ownerNation);
                    provinceMarker.setFillStyle(
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
                    provinceMarker.setFillStyle(isAtWar ? UiPalette.BRIGHT_BLOOD : UiPalette.FIELD_GRAY);
                    break;
                }
                case "casualties": {
                    const casualtiesForNation =
                        ownerNation === null
                            ? 0
                            : GameSession.getInstance()
                                  .getMilitaryManager()
                                  .getTotalCasualtiesForNation(ownerNation.getIdentifier());
                    provinceMarker.setFillStyle(casualtiesForNation > 100 ? UiPalette.BLOOD_RED : UiPalette.MID_OLIVE);
                    break;
                }
                case "supply":
                    provinceMarker.setFillStyle(
                        province.getSupplyValue() >= 10 ? UiPalette.DEEP_BRASS : UiPalette.DARK_OLIVE,
                    );
                    break;
                case "intelligence": {
                    const intelligenceValue = GameSession.getInstance()
                        .getIntelligenceManager()
                        .getCorrectlyAnalyzedSourceCount();
                    provinceMarker.setFillStyle(
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
                    provinceMarker.setFillStyle(ownerColor);
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
        if (prefersReducedMotion()) {
            this.toastContainer.setAlpha(1);
        } else {
            this.toastContainer.setAlpha(0);
            this.tweens.add({
                targets: this.toastContainer,
                alpha: 1,
                y: 72,
                duration: 220,
                ease: "Sine.easeOut",
            });
        }
        this.time.delayedCall(2400, () => {
            if (this.toastContainer !== null) {
                if (prefersReducedMotion()) {
                    this.toastContainer.destroy(true);
                    this.toastContainer = null;
                    return;
                }
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
            stepCard.add(
                UiPanelFactory.createSectionHeader(this, 14, 12, step.stepTitle, 16, UiPalette.NEAR_BLACK_LEATHER_CSS),
            );
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
            this.closeMechanicOverlay();
            this.renderPhaseCard();
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
        for (const registeredPointerRegion of this.registeredPointerRegions) {
            UiPointerRouting.unregisterScrollRegion(registeredPointerRegion);
        }
        this.registeredPointerRegions = [];
        if (this.phaseCardPointerRegion !== null) {
            UiPointerRouting.unregisterScrollRegion(this.phaseCardPointerRegion);
            this.phaseCardPointerRegion = null;
        }
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
