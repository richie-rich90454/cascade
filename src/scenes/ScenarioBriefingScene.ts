import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { TeacherSettings } from "../core/TeacherSettings";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import { FontFamilies } from "../managers/FontManager";
import { ResourceType } from "../types/ResourceType";
import { TitleCardComponent } from "../ui/TitleCardComponent";
import { FlowCursor } from "../ui/UiFlowLayout";
import { UiPalette } from "../ui/UiPalette";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";

export class ScenarioSelectionPayload {
    public readonly scenarioNumber: number;

    constructor(scenarioNumber: number) {
        this.scenarioNumber = scenarioNumber;
    }
}

export class ScenarioBriefingScene extends Phaser.Scene {
    private scenarioNumber: number;
    private briefingContentCamera: Phaser.Cameras.Scene2D.Camera | null;
    private briefingContentHeightPx: number;

    constructor() {
        super({ key: SceneKeys.SCENARIO_BRIEFING });
        this.scenarioNumber = 1;
        this.briefingContentCamera = null;
        this.briefingContentHeightPx = 0;
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

        UiPanelFactory.createBrassButton(this, 24, 24, 150, 44, "BACK", () => {
            this.scene.start(SceneKeys.CAMPAIGN_SELECTOR);
        });
        this.add
            .text(196, 46, `${scenario.getScenarioTitle()} - ${scenario.getScenarioSubtitle()}`, {
                fontFamily: FontFamilies.DISPLAY_SERIF,
                fontSize: "24px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
            })
            .setOrigin(0, 0.5);

        const panelLeftX = 40;
        const panelTopY = 96;
        const panelWidth = screenWidth - 80;
        const panelHeight = screenHeight - 200;
        UiPanelFactory.createPanelContainer(this, panelLeftX, panelTopY, panelWidth, panelHeight, PanelVariant.LEATHER);

        const contentContainer = this.add.container(panelLeftX, panelTopY);
        contentContainer.setDepth(UiPalette.UI_DEPTH_PANEL + 1);
        const contentWrapWidth = panelWidth - 64;
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

        UiPanelFactory.createBrassButton(
            this,
            screenWidth / 2 - 170,
            screenHeight - 84,
            340,
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

        const fixedObjects = this.children.list.filter((gameObject) => gameObject !== contentContainer);
        this.cameras.main.ignore(contentContainer);
        this.briefingContentCamera = this.cameras.add(panelLeftX, panelTopY, panelWidth, panelHeight);
        this.briefingContentCamera.ignore(fixedObjects);
        this.briefingContentCamera.setBounds(
            0,
            0,
            screenWidth,
            panelTopY + Math.max(panelHeight, totalContentHeightPx),
        );
        this.briefingContentCamera.scrollY = panelTopY;
        this.input.on("wheel", this.handleBriefingWheel, this);
        this.input.keyboard?.on("keydown-PAGEDOWN", this.scrollBriefingDown, this);
        this.input.keyboard?.on("keydown-PAGEUP", this.scrollBriefingUp, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off("wheel", this.handleBriefingWheel, this);
            this.input.keyboard?.off("keydown-PAGEDOWN", this.scrollBriefingDown, this);
            this.input.keyboard?.off("keydown-PAGEUP", this.scrollBriefingUp, this);
            this.briefingContentCamera?.destroy();
            this.briefingContentCamera = null;
        });
    }

    private handleBriefingWheel(
        pointer: Phaser.Input.Pointer,
        _currentlyOver: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number,
    ): void {
        const panelTopY = 96;
        const panelBottomY = this.scale.height - 104;
        if (pointer.y >= panelTopY && pointer.y <= panelBottomY) {
            this.scrollBriefingBy(deltaY);
        }
    }

    private scrollBriefingBy(distancePx: number): void {
        const camera = this.briefingContentCamera;
        if (camera === null) {
            return;
        }
        const minimumScrollY = 96;
        const maximumScrollY = Math.max(minimumScrollY, minimumScrollY + this.briefingContentHeightPx - camera.height);
        camera.scrollY = Phaser.Math.Clamp(camera.scrollY + distancePx, minimumScrollY, maximumScrollY);
    }

    private scrollBriefingDown(): void {
        this.scrollBriefingBy(this.scale.height * 0.72);
    }

    private scrollBriefingUp(): void {
        this.scrollBriefingBy(-this.scale.height * 0.72);
    }
}
