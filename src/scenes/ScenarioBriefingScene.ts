import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { HighDpiConfigurator } from "../core/HighDpiConfigurator";
import { SceneKeys } from "../core/SceneKeys";
import { TeacherSettings } from "../core/TeacherSettings";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import { ScenarioOne } from "../domain/scenarios/ScenarioOne";
import { FontFamilies } from "../managers/FontManager";
import { ResourceType } from "../types/ResourceType";
import { TitleCardComponent } from "../ui/TitleCardComponent";
import { FlowCursor } from "../ui/UiFlowLayout";
import { UiPalette } from "../ui/UiPalette";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";
import { UiScrollInput } from "../ui/UiScrollInput";

export class ScenarioSelectionPayload {
    public readonly scenarioNumber: number;
    public readonly returnSceneKey: string | null;
    public readonly phaseIndex?: number;
    public readonly sourceIdentifier?: string;

    constructor(
        scenarioNumber: number,
        returnSceneKey: string | null = null,
        phaseIndex?: number,
        sourceIdentifier?: string,
    ) {
        this.scenarioNumber = scenarioNumber;
        this.returnSceneKey = returnSceneKey;
        this.phaseIndex = phaseIndex;
        this.sourceIdentifier = sourceIdentifier;
    }
}

export class ScenarioBriefingScene extends Phaser.Scene {
    private scenarioNumber: number;
    private briefingContentContainer: Phaser.GameObjects.Container | null;
    private briefingMaskGraphics: Phaser.GameObjects.Graphics | null;
    private briefingViewportHeightPx: number;
    private briefingContentHeightPx: number;
    private briefingContentScrollPx: number;

    constructor() {
        super({ key: SceneKeys.SCENARIO_BRIEFING });
        this.scenarioNumber = 1;
        this.briefingContentContainer = null;
        this.briefingMaskGraphics = null;
        this.briefingViewportHeightPx = 0;
        this.briefingContentHeightPx = 0;
        this.briefingContentScrollPx = 0;
    }

    public init(data: unknown): void {
        const selectionPayload = data as ScenarioSelectionPayload;
        this.scenarioNumber = typeof selectionPayload.scenarioNumber === "number" ? selectionPayload.scenarioNumber : 1;
    }

    public create(): void {
        const scenario = ScenarioRegistry.getInstance().getScenarioByNumber(this.scenarioNumber);
        if (scenario === null) {
            this.scene.start(SceneKeys.CAMPAIGN_SELECTOR);
            return;
        }
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        this.add.rectangle(0, 0, screenWidth, screenHeight, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        this.add.rectangle(0, 0, screenWidth, 96, UiPalette.DARK_OLIVE).setOrigin(0, 0).setAlpha(0.6);

        const titleCardComponent = new TitleCardComponent(this, 0, 0, screenWidth);
        titleCardComponent.presentTitleCard(
            `Scenario ${scenario.getScenarioNumber()}`,
            scenario.getScenarioTitle(),
            scenario.getScenarioSubtitle(),
        );

        const headerBackWidth = Math.min(150, Math.max(112, screenWidth * 0.22));
        UiPanelFactory.createBrassButton(this, 16, 20, headerBackWidth, 44, "BACK", () => {
            this.scene.start(SceneKeys.CAMPAIGN_SELECTOR);
        });
        const scenarioHeadingLeftX = headerBackWidth + 32;
        const scenarioHeadingWidth = Math.max(120, screenWidth - scenarioHeadingLeftX - 20);
        const scenarioHeading = this.add
            .text(scenarioHeadingLeftX, 46, `${scenario.getScenarioTitle()} - ${scenario.getScenarioSubtitle()}`, {
                fontFamily: FontFamilies.DISPLAY_SERIF,
                fontSize: screenWidth < 600 ? "19px" : "24px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
                wordWrap: { width: scenarioHeadingWidth, useAdvancedWrap: true },
            })
            .setOrigin(0, 0.5);
        scenarioHeading.setVisible(screenWidth >= 280);
        if (scenarioHeading.displayHeight > 52) {
            const fittedCssFontSizePx = HighDpiConfigurator.fitCssFontSize(
                HighDpiConfigurator.getInstance().getCssFontSize(scenarioHeading),
                scenarioHeading.displayWidth,
                scenarioHeadingWidth,
                15,
            );
            HighDpiConfigurator.getInstance().setCssFontSize(scenarioHeading, fittedCssFontSizePx);
        }

        const panelLeftX = Math.min(40, Math.max(12, Math.floor(screenWidth * 0.04)));
        const panelTopY = 96;
        const panelWidth = Math.max(180, screenWidth - panelLeftX * 2);
        const panelHeight = Math.max(140, screenHeight - 200);
        this.briefingViewportHeightPx = Math.max(80, panelHeight - 72);
        UiPanelFactory.createPanelContainer(this, panelLeftX, panelTopY, panelWidth, panelHeight, PanelVariant.LEATHER);

        const contentContainer = this.add.container(panelLeftX, panelTopY);
        contentContainer.setDepth(UiPalette.UI_DEPTH_PANEL + 1);
        this.briefingContentContainer = contentContainer;
        const contentWrapWidth = Math.max(120, panelWidth - 64);
        const flowCursor = new FlowCursor(32, 24);

        flowCursor.placeText(contentContainer, UiPanelFactory.createSectionHeader(this, 0, 0, "BRIEFING", 24), 12);

        flowCursor.placeText(contentContainer, UiPanelFactory.createSectionHeader(this, 0, 0, "KEY CONCEPT", 22), 12);
        const contextParagraph = [
            `Thematic focus: ${scenario.getThematicFocus().getDisplayName()}.`,
            `Learning objective: ${scenario.getLearningObjective().getText()}`,
        ].join("\n\n");
        flowCursor.placeText(
            contentContainer,
            UiPanelFactory.createBodyText(this, 0, 0, contentWrapWidth, contextParagraph, 19, UiPalette.PARCHMENT_CSS),
            18,
        );

        flowCursor.placeText(
            contentContainer,
            UiPanelFactory.createSectionHeader(this, 0, 0, "SKILL PRACTICE", 22),
            12,
        );
        flowCursor.placeText(
            contentContainer,
            UiPanelFactory.createBodyText(
                this,
                0,
                0,
                contentWrapWidth,
                scenario.getSuggestedSkill().getDescription(),
                19,
                UiPalette.PARCHMENT_CSS,
            ),
            18,
        );

        flowCursor.placeText(
            contentContainer,
            UiPanelFactory.createSectionHeader(this, 0, 0, "HISTORICAL BRIEFING", 22),
            12,
        );

        for (const briefingParagraph of scenario.getBriefingParagraphs()) {
            flowCursor.placeText(
                contentContainer,
                UiPanelFactory.createBodyText(
                    this,
                    0,
                    0,
                    contentWrapWidth,
                    briefingParagraph,
                    19,
                    UiPalette.PARCHMENT_CSS,
                ),
                16,
            );
        }

        flowCursor.addGap(6);
        const briefingDivider = UiPanelFactory.createHorizontalDivider(this, 0, 0, contentWrapWidth);
        flowCursor.placeGraphics(contentContainer, briefingDivider, 22);

        flowCursor.placeText(contentContainer, UiPanelFactory.createSectionHeader(this, 0, 0, "OBJECTIVES", 22), 14);
        for (const objectiveSummary of scenario.getObjectiveSummaries()) {
            flowCursor.placeText(
                contentContainer,
                UiPanelFactory.createBodyText(
                    this,
                    0,
                    0,
                    contentWrapWidth - 16,
                    `- ${objectiveSummary}`,
                    17,
                    UiPalette.AGED_PARCHMENT_CSS,
                ),
                12,
            );
        }

        flowCursor.addGap(6);
        const objectivesDivider = UiPanelFactory.createHorizontalDivider(this, 0, 0, contentWrapWidth);
        flowCursor.placeGraphics(contentContainer, objectivesDivider, 22);

        const metadataLineText = [
            `World History course topic ${scenario.getLearningObjective().getCedTopicCode()}`,
            `Historical reasoning: ${scenario.getReasoningProcess().getDisplayName()}`,
            `Perspectives represented: ${scenario.getPerspectiveLabels().join(", ")}`,
            `Estimated time: about ${scenario.getDurationInMinutes()} minutes across ${scenario.getTurnCount()} turns`,
            `Resources: ${scenario
                .getScenarioResourceCodes()
                .map(
                    (resourceCode) =>
                        ResourceType.findByResourceTypeCode(resourceCode)?.getDisplayName() ?? resourceCode,
                )
                .join(", ")}`,
        ].join("\n");
        flowCursor.placeText(
            contentContainer,
            UiPanelFactory.createBodyText(this, 0, 0, contentWrapWidth, metadataLineText, 17, UiPalette.PARCHMENT_CSS),
            18,
        );

        if (scenario instanceof ScenarioOne) {
            let isFullContextVisible = false;
            const fullContextContainer = this.add.container(0, 0);
            const contextCursor = new FlowCursor(0, 0);
            contextCursor.placeText(
                fullContextContainer,
                UiPanelFactory.createSectionHeader(this, 0, 0, "PERSPECTIVES AND HISTORICAL CONTEXT", 20),
                14,
            );
            for (const section of scenario.getPerspectiveBriefingSections()) {
                contextCursor.placeText(
                    fullContextContainer,
                    UiPanelFactory.createSectionHeader(this, 0, 0, section.heading, 17),
                    8,
                );
                contextCursor.placeText(
                    fullContextContainer,
                    UiPanelFactory.createBodyText(
                        this,
                        0,
                        0,
                        contentWrapWidth - 8,
                        section.paragraph,
                        17,
                        UiPalette.PARCHMENT_CSS,
                    ),
                    14,
                );
            }
            contextCursor.placeText(
                fullContextContainer,
                UiPanelFactory.createSectionHeader(this, 0, 0, "AP TERMS IN THIS SCENARIO", 18),
                8,
            );
            contextCursor.placeText(
                fullContextContainer,
                UiPanelFactory.createBodyText(
                    this,
                    0,
                    0,
                    contentWrapWidth - 8,
                    "Imperialism: extending a state’s power through political or economic control.\nNationalism: identification with a nation that may support unity, reform, or independence.\nSovereignty: a state’s authority to govern itself.\nCausation: explaining how and why events and conditions produce change.",
                    16,
                    UiPalette.PARCHMENT_CSS,
                ),
                16,
            );
            fullContextContainer.setSize(contentWrapWidth, contextCursor.getCurrentY());
            fullContextContainer.setVisible(false);
            const contextTopY =
                flowCursor.getCurrentY() + 58 + (TeacherSettings.getInstance().isContentAdvisoryEnabled() ? 112 : 0);
            fullContextContainer.setPosition(32, contextTopY);
            contentContainer.add(fullContextContainer);
            const contextToggleButton = UiPanelFactory.createBrassButton(
                this,
                0,
                0,
                contentWrapWidth,
                44,
                "OPEN FULL HISTORICAL CONTEXT",
                () => {
                    isFullContextVisible = !isFullContextVisible;
                    fullContextContainer.setVisible(isFullContextVisible);
                    contextToggleButton.each((child: Phaser.GameObjects.GameObject) => {
                        if (child instanceof Phaser.GameObjects.Text) {
                            child.setText(
                                isFullContextVisible ? "HIDE FULL HISTORICAL CONTEXT" : "OPEN FULL HISTORICAL CONTEXT",
                            );
                        }
                    });
                    this.briefingContentHeightPx =
                        contextTopY + (isFullContextVisible ? contextCursor.getCurrentY() : 0) + 36;
                    if (isFullContextVisible) {
                        this.scrollBriefingBy(contextCursor.getCurrentY());
                    } else {
                        this.briefingContentScrollPx = Math.min(
                            this.briefingContentScrollPx,
                            Math.max(0, this.briefingContentHeightPx - (this.scale.height - 200)),
                        );
                        this.scrollBriefingBy(0);
                    }
                },
            );
            flowCursor.placeContainer(contentContainer, contextToggleButton, 14);
        }

        if (TeacherSettings.getInstance().isContentAdvisoryEnabled()) {
            const advisoryContainer = this.add.container(0, 0);
            advisoryContainer.setSize(contentWrapWidth, 96);
            const advisoryBackground = this.add.graphics();
            advisoryBackground.fillStyle(UiPalette.NEAR_BLACK_LEATHER, 0.45);
            advisoryBackground.fillRect(0, 0, contentWrapWidth, 92);
            advisoryBackground.lineStyle(1, UiPalette.BLOOD_RED, 0.9);
            advisoryBackground.strokeRect(0.5, 0.5, contentWrapWidth - 1, 91);
            advisoryContainer.add(advisoryBackground);
            advisoryContainer.add(UiPanelFactory.createSectionHeader(this, 14, 10, "CONTENT ADVISORY", 15));
            advisoryContainer.add(
                UiPanelFactory.createBodyText(
                    this,
                    14,
                    36,
                    contentWrapWidth - 28,
                    scenario.getContentAdvisoryNote(),
                    14,
                    UiPalette.AGED_PARCHMENT_CSS,
                ),
            );
            flowCursor.placeContainer(contentContainer, advisoryContainer, 16);
        }

        const totalContentHeightPx = flowCursor.getCurrentY() + 32;
        this.briefingContentHeightPx = totalContentHeightPx;
        this.briefingMaskGraphics = this.add.graphics();
        this.briefingMaskGraphics.fillStyle(0xffffff, 1);
        this.briefingMaskGraphics.fillRect(
            panelLeftX + 8,
            panelTopY + 8,
            panelWidth - 16,
            this.briefingViewportHeightPx,
        );
        this.briefingMaskGraphics.setVisible(false);
        contentContainer.setMask(this.briefingMaskGraphics.createGeometryMask());

        const footerTopY = panelTopY + panelHeight - 48;
        const footerCover = this.add.rectangle(
            0,
            footerTopY,
            screenWidth,
            Math.max(1, screenHeight - footerTopY),
            UiPalette.NEAR_BLACK_LEATHER,
        );
        footerCover.setOrigin(0, 0);
        footerCover.setDepth(UiPalette.UI_DEPTH_PANEL + 5);
        const beginScenarioButtonWidth = Math.min(340, Math.max(200, screenWidth - 40));
        const beginScenarioButton = UiPanelFactory.createBrassButton(
            this,
            screenWidth / 2 - beginScenarioButtonWidth / 2,
            screenHeight - 84,
            beginScenarioButtonWidth,
            56,
            "BEGIN SCENARIO",
            () => {
                GameSession.getInstance().startScenario(scenario);
                GameSession.getInstance()
                    .getAudioManager()
                    .playMusicTrack(`ambient_scenario_${scenario.getScenarioNumber()}`);
                this.scene.start(SceneKeys.SCENARIO_PLAY, new ScenarioSelectionPayload(scenario.getScenarioNumber()));
            },
        );
        beginScenarioButton.setDepth(UiPalette.UI_DEPTH_PANEL + 6);

        const scrollHint = this.add.text(
            panelLeftX + panelWidth - 28,
            panelTopY + panelHeight - 14,
            "SCROLL TO READ · MOUSE WHEEL OR PAGE UP AND PAGE DOWN",
            {
                fontFamily: FontFamilies.TYPEWRITER_BODY,
                fontSize: "13px",
                color: UiPalette.PARCHMENT_CSS,
                backgroundColor: UiPalette.NEAR_BLACK_LEATHER_CSS,
                padding: { x: 7, y: 4 },
            },
        );
        scrollHint.setOrigin(1, 1);
        scrollHint.setDepth(UiPalette.UI_DEPTH_PANEL + 6);

        this.input.on("wheel", this.handleBriefingWheel, this);
        this.input.keyboard?.on("keydown-PAGEDOWN", this.scrollBriefingDown, this);
        this.input.keyboard?.on("keydown-PAGEUP", this.scrollBriefingUp, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off("wheel", this.handleBriefingWheel, this);
            this.input.keyboard?.off("keydown-PAGEDOWN", this.scrollBriefingDown, this);
            this.input.keyboard?.off("keydown-PAGEUP", this.scrollBriefingUp, this);
            this.briefingContentContainer?.clearMask(true);
            this.briefingMaskGraphics?.destroy();
            this.briefingMaskGraphics = null;
            this.briefingContentContainer = null;
            this.briefingContentScrollPx = 0;
        });
    }

    private handleBriefingWheel(
        pointer: Phaser.Input.Pointer,
        _currentlyOver: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number,
    ): void {
        this.scrollBriefingBy(UiScrollInput.getWheelDeltaPx(pointer, deltaY, this.briefingViewportHeightPx));
    }

    private scrollBriefingBy(distancePx: number): void {
        const contentContainer = this.briefingContentContainer;
        if (contentContainer === null) {
            return;
        }
        const minimumScrollY = 96;
        const maximumScrollY = Math.max(0, this.briefingContentHeightPx - this.briefingViewportHeightPx);
        this.briefingContentScrollPx = Phaser.Math.Clamp(this.briefingContentScrollPx + distancePx, 0, maximumScrollY);
        contentContainer.y = minimumScrollY - this.briefingContentScrollPx;
    }

    private scrollBriefingDown(): void {
        this.scrollBriefingBy(this.scale.height * 0.72);
    }

    private scrollBriefingUp(): void {
        this.scrollBriefingBy(-this.scale.height * 0.72);
    }
}
