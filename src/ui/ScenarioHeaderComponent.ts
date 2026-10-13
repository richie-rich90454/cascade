import Phaser from "phaser";

import type { Scenario } from "../domain/scenarios/Scenario";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class ScenarioHeaderComponent extends Phaser.GameObjects.Container {
    private readonly titleTextObject: Phaser.GameObjects.Text;
    private readonly subtitleTextObject: Phaser.GameObjects.Text;
    private readonly badgeChipContainer: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_PANEL);

        this.titleTextObject = scene.add.text(0, 0, "", {
            fontFamily: FontFamilies.GOTHIC,
            fontSize: "28px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
            wordWrap: { width: width - 24, useAdvancedWrap: true },
        });
        this.subtitleTextObject = scene.add.text(0, 38, "", {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "16px",
            fontStyle: "italic",
            color: UiPalette.AGED_PARCHMENT_CSS,
        });
        this.badgeChipContainer = scene.add.container(0, 68);
        this.add(this.titleTextObject);
        this.add(this.subtitleTextObject);
        this.add(this.badgeChipContainer);
    }

    public setScenario(scenario: Scenario): void {
        this.titleTextObject.setText(scenario.getScenarioTitle());
        this.subtitleTextObject.setText(`${scenario.getStartYear()}-${scenario.getEndYear()}`);
        this.badgeChipContainer.removeAll(true);
        let badgeLeftX = 0;
        const thematicFocusBadge = UiPanelFactory.createBadgeChip(
            this.scene,
            badgeLeftX,
            0,
            scenario.getThematicFocus().getCode(),
            UiPalette.DEEP_BRASS,
        );
        this.badgeChipContainer.add(thematicFocusBadge);
        badgeLeftX += ScenarioHeaderComponent.getBadgeEstimatedWidth(scenario.getThematicFocus().getCode()) + 8;
        const suggestedSkillLabel = "Skill " + scenario.getSuggestedSkill().getCode();
        const suggestedSkillBadge = UiPanelFactory.createBadgeChip(
            this.scene,
            badgeLeftX,
            0,
            suggestedSkillLabel,
            UiPalette.BLOOD_RED,
        );
        this.badgeChipContainer.add(suggestedSkillBadge);
        badgeLeftX += ScenarioHeaderComponent.getBadgeEstimatedWidth(suggestedSkillLabel) + 8;
        const reasoningProcessLabel = scenario.getReasoningProcess().getDisplayName();
        const reasoningProcessBadge = UiPanelFactory.createBadgeChip(
            this.scene,
            badgeLeftX,
            0,
            reasoningProcessLabel,
            UiPalette.MID_OLIVE,
        );
        this.badgeChipContainer.add(reasoningProcessBadge);
    }

    private static getBadgeEstimatedWidth(badgeLabelText: string): number {
        return Math.max(56, badgeLabelText.length * 10 + 20);
    }
}
