import Phaser from "phaser";
import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { TeacherSettings } from "../core/TeacherSettings";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import { ResourceType } from "../types/ResourceType";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";
import { TitleCardComponent } from "../ui/TitleCardComponent";
import { UiPalette } from "../ui/UiPalette";

export class ScenarioSelectionPayload {
    public readonly scenarioNumber: number;

    constructor(scenarioNumber: number) {
        this.scenarioNumber = scenarioNumber;
    }
}

export class ScenarioBriefingScene extends Phaser.Scene {
    private scenarioNumber: number;

    constructor() {
        super({ key: SceneKeys.SCENARIO_BRIEFING });
        this.scenarioNumber = 1;
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

        const titleCardComponent = new TitleCardComponent(this, 0, 0, screenWidth);
        titleCardComponent.presentTitleCard(`Scenario ${scenario.getScenarioNumber()}`, scenario.getScenarioTitle(), scenario.getScenarioSubtitle());

        UiPanelFactory.createBrassButton(this, 24, 24, 160, 44, "BACK", () => {
            this.scene.start(SceneKeys.CAMPAIGN_SELECTOR);
        });

        const briefingPanel = UiPanelFactory.createPanelContainer(this, 40, 110, screenWidth - 80, screenHeight - 240, PanelVariant.LEATHER);
        briefingPanel.add(UiPanelFactory.createSectionHeader(this, 24, 16, "BRIEFING"));
        briefingPanel.add(
            UiPanelFactory.createBodyText(this, 24, 52, screenWidth - 220, scenario.getBriefingParagraphs().join("\n\n"), 17, UiPalette.PARCHMENT_CSS),
        );
        const objectiveHeader = UiPanelFactory.createSectionHeader(this, 24, 320, "OBJECTIVES");
        briefingPanel.add(objectiveHeader);
        let objectiveOffsetY = 356;
        for (const objectiveSummary of scenario.getObjectiveSummaries()) {
            briefingPanel.add(UiPanelFactory.createBodyText(this, 36, objectiveOffsetY, screenWidth - 240, `- ${objectiveSummary}`, 16, UiPalette.AGED_PARCHMENT_CSS));
            objectiveOffsetY += 46;
        }

        briefingPanel.add(UiPanelFactory.createHorizontalDivider(this, 24, objectiveOffsetY + 8, screenWidth - 140));
        const metadataLine = [
            `Topic ${scenario.getLearningObjective().getCedTopicCode()} | Learning Objective ${scenario.getLearningObjective().getCode()} | Thematic Focus ${scenario.getThematicFocus().getCode()} | Skill ${scenario.getSuggestedSkill().getCode()} | Reasoning Process: ${scenario.getReasoningProcess().getDisplayName()}`,
            `Perspectives: ${scenario.getPerspectiveLabels().join(", ")}`,
            `Duration: about ${scenario.getDurationInMinutes()} minutes across ${scenario.getTurnCount()} turns`,
            `Resources: ${scenario
                .getScenarioResourceCodes()
                .map((resourceCode) => ResourceType.findByResourceTypeCode(resourceCode)?.getDisplayName() ?? resourceCode)
                .join(", ")}`,
        ].join("\n");
        briefingPanel.add(UiPanelFactory.createTypewriterText(this, 24, objectiveOffsetY + 24, screenWidth - 140, metadataLine, 14));

        const thematicBadge = UiPanelFactory.createBadgeChip(this, 24, 84, scenario.getThematicFocus().getCode(), UiPalette.DEEP_BRASS);
        briefingPanel.add(thematicBadge);
        briefingPanel.add(UiPanelFactory.createBadgeChip(this, 96, 84, `Skill ${scenario.getSuggestedSkill().getCode()}`, UiPalette.MID_OLIVE));

        if (TeacherSettings.getInstance().isContentAdvisoryEnabled()) {
            const advisoryPanel = UiPanelFactory.createPanelContainer(this, screenWidth - 360, 84, 320, 120, PanelVariant.PARCHMENT);
            advisoryPanel.add(UiPanelFactory.createSectionHeader(this, 12, 10, "ADVISORY", 15));
            advisoryPanel.add(UiPanelFactory.createBodyText(this, 12, 38, 292, scenario.getContentAdvisoryNote(), 13, UiPalette.NEAR_BLACK_LEATHER_CSS));
            briefingPanel.add(advisoryPanel);
        }

        UiPanelFactory.createBrassButton(this, screenWidth / 2 - 170, screenHeight - 106, 340, 56, "BEGIN SCENARIO", () => {
            GameSession.getInstance().startScenario(scenario);
            GameSession.getInstance().getAudioManager().playMusicTrack(`ambient_scenario_${scenario.getScenarioNumber()}`);
            this.scene.start(SceneKeys.SCENARIO_PLAY, new ScenarioSelectionPayload(scenario.getScenarioNumber()));
        });
    }
}
