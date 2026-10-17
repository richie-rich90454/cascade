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
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";
import { ScenarioSelectionPayload } from "./ScenarioBriefingScene";

export class SourceAnalysisScene extends Phaser.Scene {
    private scenarioNumber: number;
    private selectedSourceIndex: number;
    private sourceListContainer: Phaser.GameObjects.Container | null;
    private sourceRowsContainer: Phaser.GameObjects.Container | null;
    private sourceMaskGraphics: Phaser.GameObjects.Graphics | null;
    private sourceScrollHint: Phaser.GameObjects.Text | null;
    private sourceContentHeightPx: number;
    private sourceViewportHeightPx: number;
    private sourceScrollOffsetPx: number;
    private sourcePanelLeftX: number;
    private sourcePanelWidthPx: number;
    private sourcePanelTopY: number;
    private analysisPanelLeftX: number;
    private analysisPanelTopY: number;
    private analysisPanelWidthPx: number;
    private isCompactLayout: boolean;
    private lastScrollRegion: "sources" | "analysis";
    private analysisHostContainer: Phaser.GameObjects.Container | null;
    private analysisMaskGraphics: Phaser.GameObjects.Graphics | null;
    private analysisScrollHint: Phaser.GameObjects.Text | null;
    private analysisViewportHeightPx: number;
    private analysisContentHeightPx: number;
    private analysisScrollOffsetPx: number;
    private boundSourceAnalyzedHandler: (payload: unknown) => void;

    constructor() {
        super({ key: SceneKeys.SOURCE_ANALYSIS });
        this.scenarioNumber = 1;
        this.selectedSourceIndex = 0;
        this.sourceListContainer = null;
        this.sourceRowsContainer = null;
        this.sourceMaskGraphics = null;
        this.sourceScrollHint = null;
        this.sourceContentHeightPx = 0;
        this.sourceViewportHeightPx = 0;
        this.sourceScrollOffsetPx = 0;
        this.sourcePanelLeftX = 16;
        this.sourcePanelWidthPx = 438;
        this.sourcePanelTopY = 80;
        this.analysisPanelLeftX = 466;
        this.analysisPanelTopY = 80;
        this.analysisPanelWidthPx = 0;
        this.isCompactLayout = false;
        this.lastScrollRegion = "analysis";
        this.analysisHostContainer = null;
        this.analysisMaskGraphics = null;
        this.analysisScrollHint = null;
        this.analysisViewportHeightPx = 0;
        this.analysisContentHeightPx = 0;
        this.analysisScrollOffsetPx = 0;
        this.boundSourceAnalyzedHandler = () => undefined;
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
        const requestedSourceIdentifier = selectionPayload.sourceIdentifier;
        const requestedSourceIndex =
            typeof requestedSourceIdentifier === "string"
                ? this.getScenarioSources().findIndex((source) => source.sourceIdentifier === requestedSourceIdentifier)
                : -1;
        this.selectedSourceIndex = requestedSourceIndex >= 0 ? requestedSourceIndex : 0;
        this.analysisScrollOffsetPx = 0;
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
        this.isCompactLayout = screenWidth < 960;
        const headerHeight = screenWidth < 360 ? 112 : 68;
        const panelBottomInset = 16;
        this.sourcePanelLeftX = this.isCompactLayout ? 12 : 16;
        this.sourcePanelTopY = this.isCompactLayout ? headerHeight + 12 : headerHeight + 12;
        this.sourcePanelWidthPx = this.isCompactLayout
            ? Math.max(160, screenWidth - 24)
            : Phaser.Math.Clamp(Math.floor(screenWidth * 0.32), 320, 438);
        this.analysisPanelLeftX = this.isCompactLayout
            ? 12
            : this.sourcePanelLeftX + this.sourcePanelWidthPx + 12;
        this.analysisPanelTopY = this.isCompactLayout ? this.sourcePanelTopY + 124 : this.sourcePanelTopY;
        this.analysisPanelWidthPx = Math.max(160, screenWidth - this.analysisPanelLeftX - (this.isCompactLayout ? 12 : 16));
        const sourcePanelHeight = Math.max(96, screenHeight - this.sourcePanelTopY - panelBottomInset);
        const analysisPanelHeight = Math.max(120, screenHeight - this.analysisPanelTopY - panelBottomInset);
        this.analysisViewportHeightPx = Math.max(96, analysisPanelHeight - 56);
        this.add.rectangle(0, 0, screenWidth, screenHeight, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        const sourceHeaderBand = this.add.rectangle(0, 0, screenWidth, headerHeight, UiPalette.DARK_OLIVE).setOrigin(0, 0);
        sourceHeaderBand.setDepth(UiPalette.UI_DEPTH_TOOLTIP + 100);
        const isVeryNarrow = screenWidth < 360;
        const titleLeftX = isVeryNarrow ? 12 : screenWidth < 600 ? 160 : 0;
        const titleWidth = isVeryNarrow ? screenWidth - 24 : screenWidth < 600 ? screenWidth - titleLeftX - 12 : screenWidth - 24;
        const titleCenterX = isVeryNarrow ? screenWidth / 2 : screenWidth < 600 ? titleLeftX + titleWidth / 2 : screenWidth / 2;
        const sourceHeaderTitle = UiPanelFactory.createSectionHeader(
            this,
            titleCenterX,
            isVeryNarrow ? 10 : 18,
            "SOURCE ANALYSIS",
            screenWidth < 520 ? 20 : 26,
        );
        sourceHeaderTitle.setOrigin(0.5, 0);
        sourceHeaderTitle.setWordWrapWidth(titleWidth, true);
        sourceHeaderTitle.setAlign("center");
        sourceHeaderTitle.setDepth(UiPalette.UI_DEPTH_TOOLTIP + 102);
        const backButtonWidth = isVeryNarrow ? Math.min(180, screenWidth - 24) : Math.min(144, screenWidth < 600 ? 136 : 160);
        const backToMapButton = UiPanelFactory.createBrassButton(
            this,
            12,
            isVeryNarrow ? 58 : 12,
            backButtonWidth,
            44,
            "BACK TO MAP",
            () => {
            this.scene.start(SceneKeys.SCENARIO_PLAY, new ScenarioSelectionPayload(this.scenarioNumber));
            },
        );
        backToMapButton.setDepth(UiPalette.UI_DEPTH_TOOLTIP + 102);

        UiPanelFactory.createPanelContainer(
            this,
            this.sourcePanelLeftX,
            this.sourcePanelTopY,
            this.sourcePanelWidthPx,
            sourcePanelHeight,
            PanelVariant.LEATHER,
        );
        UiPanelFactory.createPanelContainer(
            this,
            this.analysisPanelLeftX,
            this.analysisPanelTopY,
            this.analysisPanelWidthPx,
            analysisPanelHeight,
            PanelVariant.LEATHER,
        );
        this.analysisMaskGraphics = this.add.graphics();
        this.analysisMaskGraphics.fillStyle(0xffffff, 1);
        this.analysisMaskGraphics.fillRect(
            this.analysisPanelLeftX,
            this.analysisPanelTopY,
            this.analysisPanelWidthPx,
            this.analysisViewportHeightPx,
        );
        this.analysisMaskGraphics.setVisible(false);
        if (!this.isCompactLayout) {
            this.sourceViewportHeightPx = Math.max(72, sourcePanelHeight - 84);
            this.sourceMaskGraphics = this.add.graphics();
            this.sourceMaskGraphics.fillStyle(0xffffff, 1);
            this.sourceMaskGraphics.fillRect(
                this.sourcePanelLeftX + 10,
                this.sourcePanelTopY + 74,
                this.sourcePanelWidthPx - 20,
                this.sourceViewportHeightPx,
            );
            this.sourceMaskGraphics.setVisible(false);
        }
        this.analysisScrollHint = this.add.text(screenWidth - 24, screenHeight - 18, "SCROLL TO READ · PAGE UP / DOWN", {
            fontFamily: FontFamilies.TYPEWRITER_BODY,
            fontSize: "12px",
            color: UiPalette.PARCHMENT_CSS,
            backgroundColor: UiPalette.NEAR_BLACK_LEATHER_CSS,
            padding: { x: 6, y: 3 },
        });
        this.analysisScrollHint.setOrigin(1, 1);
        this.analysisScrollHint.setVisible(false);
        this.sourceScrollHint = !this.isCompactLayout && this.getScenarioSources().length > 1
            ? this.add.text(
                  this.sourcePanelLeftX + this.sourcePanelWidthPx - 14,
                  this.sourcePanelTopY + sourcePanelHeight - 12,
                  "SCROLL SOURCES · WHEEL OR PAGE UP / DOWN",
                  {
                      fontFamily: FontFamilies.TYPEWRITER_BODY,
                      fontSize: "11px",
                      color: UiPalette.PARCHMENT_CSS,
                      backgroundColor: UiPalette.NEAR_BLACK_LEATHER_CSS,
                      padding: { x: 5, y: 3 },
                  },
              )
            : null;
        this.sourceScrollHint?.setOrigin(1, 1);
        this.sourceScrollHint?.setVisible(false);
        const sourceFooterCover = this.add
            .rectangle(this.analysisPanelLeftX, screenHeight - 52, this.analysisPanelWidthPx, 52, UiPalette.DARK_OLIVE)
            .setOrigin(0, 0)
            .setDepth(UiPalette.UI_DEPTH_TOOLTIP + 100);
        this.analysisScrollHint.setDepth(UiPalette.UI_DEPTH_TOOLTIP + 102);
        this.sourceScrollHint?.setDepth(UiPalette.UI_DEPTH_TOOLTIP + 102);

        this.renderSourceList();
        this.renderSelectedSourceAnalysis();
        sourceHeaderBand.setDepth(UiPalette.UI_DEPTH_TOOLTIP + 100);
        sourceFooterCover.setDepth(UiPalette.UI_DEPTH_TOOLTIP + 100);
        sourceHeaderTitle.setDepth(UiPalette.UI_DEPTH_TOOLTIP + 102);
        backToMapButton.setDepth(UiPalette.UI_DEPTH_TOOLTIP + 102);

        this.input.on("wheel", this.handleAnalysisWheel, this);
        this.input.keyboard?.on("keydown", this.handleAnalysisKeyDown, this);

        this.boundSourceAnalyzedHandler = (payload: unknown) => {
            const sourceAnalysisPayload = payload as SourceAnalysisPayload;
            this.renderSourceList();
            this.refreshDerivedSourceFlags(sourceAnalysisPayload.wasAnalysisCorrect);
        };
        EventBus.getInstance().subscribe(GameEventTypes.SOURCE_ANALYZED, this.boundSourceAnalyzedHandler);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off("wheel", this.handleAnalysisWheel, this);
            this.input.keyboard?.off("keydown", this.handleAnalysisKeyDown, this);
            EventBus.getInstance().unsubscribe(GameEventTypes.SOURCE_ANALYZED, this.boundSourceAnalyzedHandler);
            this.analysisHostContainer?.clearMask(true);
            this.analysisMaskGraphics?.destroy();
            this.analysisMaskGraphics = null;
            this.sourceRowsContainer?.clearMask(true);
            this.sourceMaskGraphics?.destroy();
            this.sourceMaskGraphics = null;
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
        if (this.sourceListContainer !== null) {
            this.sourceListContainer.destroy(true);
        }
        if (this.sourceRowsContainer !== null) {
            this.sourceRowsContainer.destroy(true);
        }
        this.sourceListContainer = this.add.container(this.sourcePanelLeftX + 10, this.sourcePanelTopY + 10);
        const scenarioSources = this.getScenarioSources();
        const intelligenceManager = GameSession.getInstance().getIntelligenceManager();
        this.sourceListContainer.add(
            UiPanelFactory.createSectionHeader(this, 8, 0, "PRIMARY SOURCES", this.isCompactLayout ? 16 : 18),
        );
        if (this.isCompactLayout) {
            this.sourceListContainer.add(
                UiPanelFactory.createTypewriterText(
                    this,
                    8,
                    24,
                    this.sourcePanelWidthPx - 36,
                    `DOCUMENT ${this.selectedSourceIndex + 1} OF ${Math.max(1, scenarioSources.length)}`,
                    12,
                    UiPalette.PARCHMENT_CSS,
                ).setAlign("center"),
            );
            const buttonWidth = Math.max(64, Math.floor((this.sourcePanelWidthPx - 36) / 2));
            this.sourceListContainer.add(
                UiPanelFactory.createBrassButton(this, 8, 52, buttonWidth, 40, "PREVIOUS SOURCE", () => {
                    this.selectSource(this.selectedSourceIndex - 1);
                }),
            );
            this.sourceListContainer.add(
                UiPanelFactory.createBrassButton(
                    this,
                    this.sourcePanelWidthPx - 20 - buttonWidth,
                    52,
                    buttonWidth,
                    40,
                    "NEXT SOURCE",
                    () => this.selectSource(this.selectedSourceIndex + 1),
                ),
            );
            this.sourceListContainer.setDepth(UiPalette.UI_DEPTH_PANEL + 2);
            return;
        }
        this.sourceListContainer.add(
            UiPanelFactory.createBodyText(
                this,
                8,
                28,
                this.sourcePanelWidthPx - 36,
                "Choose a document to inspect its evidence and sourcing prompts.",
                13,
                UiPalette.AGED_PARCHMENT_CSS,
            ),
        );
        this.sourceRowsContainer = this.add.container(this.sourcePanelLeftX + 12, this.sourcePanelTopY + 74);
        this.sourceRowsContainer.setDepth(UiPalette.UI_DEPTH_PANEL + 1);
        if (this.sourceMaskGraphics !== null) {
            this.sourceRowsContainer.setMask(this.sourceMaskGraphics.createGeometryMask());
        }
        this.sourceContentHeightPx = scenarioSources.length * 94;
        scenarioSources.forEach((scenarioSource, sourceIndex) => {
            const entryTopY = sourceIndex * 94;
            const listEntryContainer = UiPanelFactory.createBrassButton(
                this,
                0,
                entryTopY,
                this.sourcePanelWidthPx - 24,
                54,
                scenarioSource.sourceDisplayTitle,
                () => {
                    this.selectSource(sourceIndex);
                },
            );
            this.sourceRowsContainer?.add(listEntryContainer);
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
                      : UiPalette.ALERT_TEXT_ON_DARK_CSS;
            const statusLabel = this.add.text(8, entryTopY + 58, statusText, {
                fontFamily: FontFamilies.TYPEWRITER_BODY,
                fontSize: "14px",
                color: statusColorCss,
            });
            this.sourceRowsContainer?.add(statusLabel);
        });
        this.sourceListContainer.setDepth(UiPalette.UI_DEPTH_PANEL);
        if (scenarioSources.length === 0) {
            const emptyLabel = this.add.text(8, 8, "This scenario presents no primary sources.", {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "16px",
                color: UiPalette.PARCHMENT_CSS,
            });
            this.sourceRowsContainer?.add(emptyLabel);
        }
        this.sourceScrollHint?.setVisible(this.sourceContentHeightPx > this.sourceViewportHeightPx);
        this.updateSourceScrollPosition();
    }

    private selectSource(sourceIndex: number): void {
        const sourceCount = this.getScenarioSources().length;
        if (sourceCount === 0) {
            return;
        }
        this.selectedSourceIndex = Phaser.Math.Wrap(sourceIndex, 0, sourceCount);
        this.renderSourceList();
        this.renderSelectedSourceAnalysis();
    }

    private renderSelectedSourceAnalysis(): void {
        if (this.analysisHostContainer !== null) {
            this.analysisHostContainer.clearMask(true);
            this.analysisHostContainer.destroy(true);
        }
        this.analysisScrollOffsetPx = 0;
        const scenarioSources = this.getScenarioSources();
        if (scenarioSources.length === 0) {
            return;
        }
        const selectedSource = scenarioSources[Math.min(this.selectedSourceIndex, scenarioSources.length - 1)];
        this.analysisHostContainer = this.add.container(this.analysisPanelLeftX + 8, this.analysisPanelTopY);
        const analysisComponent = new SourceAnalysisComponent(
            this,
            0,
            0,
            this.analysisPanelWidthPx - 16,
            this.analysisViewportHeightPx,
        );
        analysisComponent.setPrimarySource(
            selectedSource,
            this.scenarioNumber,
            GameSession.getInstance().getGameState(),
            GameSession.getInstance().getIntelligenceManager(),
        );
        this.analysisHostContainer.add(analysisComponent);
        this.analysisHostContainer.setDepth(UiPalette.UI_DEPTH_SIDEBAR + 1);
        if (this.analysisMaskGraphics !== null) {
            this.analysisHostContainer.setMask(this.analysisMaskGraphics.createGeometryMask());
        }
        this.analysisContentHeightPx = analysisComponent.getContentHeightPx();
        this.updateAnalysisScrollPosition();
    }

    private handleAnalysisWheel(
        pointer: Phaser.Input.Pointer,
        _currentlyOver: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number,
    ): void {
        if (!this.isCompactLayout && pointer.x >= this.sourcePanelLeftX && pointer.x <= this.sourcePanelLeftX + this.sourcePanelWidthPx) {
            this.lastScrollRegion = "sources";
            this.scrollSourcesBy(deltaY);
        } else if (
            pointer.x >= this.analysisPanelLeftX &&
            pointer.x <= this.analysisPanelLeftX + this.analysisPanelWidthPx
        ) {
            this.lastScrollRegion = "analysis";
            this.scrollAnalysisBy(deltaY);
        }
    }

    private handleAnalysisKeyDown = (event: KeyboardEvent): void => {
        if (event.key === "PageDown") {
            event.preventDefault();
            if (this.lastScrollRegion === "sources" && !this.isCompactLayout) {
                this.scrollSourcesBy(this.sourceViewportHeightPx * 0.8);
            } else {
                this.scrollAnalysisBy(this.analysisViewportHeightPx * 0.8);
            }
        } else if (event.key === "PageUp") {
            event.preventDefault();
            if (this.lastScrollRegion === "sources" && !this.isCompactLayout) {
                this.scrollSourcesBy(-this.sourceViewportHeightPx * 0.8);
            } else {
                this.scrollAnalysisBy(-this.analysisViewportHeightPx * 0.8);
            }
        }
    };

    private scrollAnalysisBy(distancePx: number): void {
        this.analysisScrollOffsetPx = Phaser.Math.Clamp(
            this.analysisScrollOffsetPx + distancePx,
            0,
            Math.max(0, this.analysisContentHeightPx - this.analysisViewportHeightPx),
        );
        this.updateAnalysisScrollPosition();
    }

    private scrollSourcesBy(distancePx: number): void {
        this.sourceScrollOffsetPx = Phaser.Math.Clamp(
            this.sourceScrollOffsetPx + distancePx,
            0,
            Math.max(0, this.sourceContentHeightPx - this.sourceViewportHeightPx),
        );
        this.updateSourceScrollPosition();
    }

    private updateSourceScrollPosition(): void {
        this.sourceRowsContainer?.setPosition(
            this.sourcePanelLeftX + 12,
            this.sourcePanelTopY + 74 - this.sourceScrollOffsetPx,
        );
        this.sourceScrollHint?.setVisible(
            !this.isCompactLayout && this.sourceContentHeightPx > this.sourceViewportHeightPx,
        );
    }

    private updateAnalysisScrollPosition(): void {
        this.analysisHostContainer?.setPosition(
            this.analysisPanelLeftX + 8,
            this.analysisPanelTopY - this.analysisScrollOffsetPx,
        );
        const canScroll = this.analysisContentHeightPx > this.analysisViewportHeightPx;
        this.analysisScrollHint?.setVisible(canScroll);
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
