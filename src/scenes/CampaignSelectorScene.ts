import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import type { CampaignDefinition } from "../domain/ScenarioRegistry";
import type { Scenario } from "../domain/scenarios/Scenario";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "../ui/UiPalette";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";

export class CampaignSelectorScene extends Phaser.Scene {
    private static readonly CARD_WIDTH_PX = 250;
    private static readonly CARD_HEIGHT_PX = 168;
    private static readonly CARD_HORIZONTAL_GAP_PX = 24;
    private static readonly CARD_ROW_VERTICAL_GAP_PX = 24;
    private static readonly CONTENT_SIDE_MARGIN_PX = 40;
    private static readonly CARD_INNER_MARGIN_PX = 14;

    public constructor() {
        super({ key: SceneKeys.CAMPAIGN_SELECTOR });
    }

    public create(): void {
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        this.add.rectangle(0, 0, this.scale.width, 76, UiPalette.DARK_OLIVE).setOrigin(0, 0).setAlpha(0.85);
        const screenCenterX = this.scale.width / 2;
        const headerText = UiPanelFactory.createSectionHeader(this, screenCenterX, 20, "SELECT A CAMPAIGN", 34);
        headerText.setOrigin(0.5, 0);
        UiPanelFactory.createBrassButton(this, 24, 18, 200, 44, "BACK TO MENU", () => {
            this.scene.start(SceneKeys.MAIN_MENU);
        });
        GameSession.getInstance().getAudioManager().playMusicTrack("menu_campaign");
        let layoutCursorY = 96;
        for (const campaignDefinition of ScenarioRegistry.getInstance().getCampaigns()) {
            layoutCursorY = this.renderCampaignSection(campaignDefinition, layoutCursorY);
        }
    }

    private renderCampaignSection(campaignDefinition: CampaignDefinition, startY: number): number {
        const screenCenterX = this.scale.width / 2;
        const campaignHeaderText = UiPanelFactory.createSectionHeader(
            this,
            screenCenterX,
            startY,
            campaignDefinition.campaignDisplayName,
            24,
        );
        campaignHeaderText.setOrigin(0.5, 0);
        const campaignSubtitleText = UiPanelFactory.createBodyText(
            this,
            screenCenterX,
            startY + 34,
            this.scale.width - 96,
            campaignDefinition.campaignSubtitle,
            15,
            UiPalette.PARCHMENT_CSS,
        );
        campaignSubtitleText.setOrigin(0.5, 0);
        const cardsPerRow = this.getCardsPerRow();
        let cardTopY = startY + 66;
        const scenarioNumbers = campaignDefinition.scenarioNumbers;
        for (let rowStartIndex = 0; rowStartIndex < scenarioNumbers.length; rowStartIndex += cardsPerRow) {
            const rowScenarioNumbers = scenarioNumbers.slice(rowStartIndex, rowStartIndex + cardsPerRow);
            const rowWidthPx =
                rowScenarioNumbers.length * CampaignSelectorScene.CARD_WIDTH_PX +
                (rowScenarioNumbers.length - 1) * CampaignSelectorScene.CARD_HORIZONTAL_GAP_PX;
            let cardLeftX = (this.scale.width - rowWidthPx) / 2;
            for (const scenarioNumber of rowScenarioNumbers) {
                const scenario = ScenarioRegistry.getInstance().getScenarioByNumber(scenarioNumber);
                if (scenario !== null) {
                    this.createScenarioCard(scenario, cardLeftX, cardTopY);
                }
                cardLeftX += CampaignSelectorScene.CARD_WIDTH_PX + CampaignSelectorScene.CARD_HORIZONTAL_GAP_PX;
            }
            cardTopY += CampaignSelectorScene.CARD_HEIGHT_PX + CampaignSelectorScene.CARD_ROW_VERTICAL_GAP_PX;
        }
        return cardTopY + 16;
    }

    private createScenarioCard(scenario: Scenario, cardLeftX: number, cardTopY: number): void {
        const panelContainer = UiPanelFactory.createPanelContainer(
            this,
            cardLeftX,
            cardTopY,
            CampaignSelectorScene.CARD_WIDTH_PX,
            CampaignSelectorScene.CARD_HEIGHT_PX,
            PanelVariant.LEATHER,
        );
        const hoverTintRectangle = this.add.rectangle(
            0,
            0,
            CampaignSelectorScene.CARD_WIDTH_PX,
            CampaignSelectorScene.CARD_HEIGHT_PX,
            UiPalette.HIGHLIGHT_BRASS,
            0.12,
        );
        hoverTintRectangle.setOrigin(0, 0);
        hoverTintRectangle.setVisible(false);
        panelContainer.add(hoverTintRectangle);
        const cardInnerWidthPx = CampaignSelectorScene.CARD_WIDTH_PX - CampaignSelectorScene.CARD_INNER_MARGIN_PX * 2;
        const titleText = UiPanelFactory.createSectionHeader(
            this,
            CampaignSelectorScene.CARD_INNER_MARGIN_PX,
            10,
            scenario.getScenarioTitle(),
            17,
        );
        titleText.setWordWrapWidth(cardInnerWidthPx, true);
        panelContainer.add(titleText);
        const subtitleText = this.add.text(
            CampaignSelectorScene.CARD_INNER_MARGIN_PX,
            titleText.y + titleText.displayHeight + 4,
            scenario.getScenarioSubtitle(),
            {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "13px",
                fontStyle: "italic",
                color: UiPalette.AGED_PARCHMENT_CSS,
            },
        );
        panelContainer.add(subtitleText);
        const thematicFocusCode = scenario.getThematicFocus().getCode();
        const badgeRowY = subtitleText.y + subtitleText.displayHeight + 10;
        const thematicFocusBadge = UiPanelFactory.createBadgeChip(
            this,
            CampaignSelectorScene.CARD_INNER_MARGIN_PX,
            badgeRowY,
            thematicFocusCode,
            UiPalette.DEEP_BRASS,
        );
        panelContainer.add(thematicFocusBadge);
        const learningObjectiveBadgeX =
            CampaignSelectorScene.CARD_INNER_MARGIN_PX + Math.max(56, thematicFocusCode.length * 10 + 20) + 8;
        const learningObjectiveBadge = UiPanelFactory.createBadgeChip(
            this,
            learningObjectiveBadgeX,
            badgeRowY,
            "LO " + scenario.getLearningObjective().getCode(),
            UiPalette.MID_OLIVE,
        );
        panelContainer.add(learningObjectiveBadge);
        const footerLineY = badgeRowY + 32;
        if (!ScenarioRegistry.getInstance().isScenarioUnlocked(scenario.getScenarioNumber())) {
            const unlockRequirementText = UiPanelFactory.createTypewriterText(
                this,
                CampaignSelectorScene.CARD_INNER_MARGIN_PX,
                footerLineY,
                cardInnerWidthPx,
                "Complete the previous scenario to unlock.",
                12,
                UiPalette.FIELD_GRAY_CSS,
            );
            panelContainer.add(unlockRequirementText);
            panelContainer.setAlpha(0.45);
            return;
        }
        const topicLineText = UiPanelFactory.createTypewriterText(
            this,
            CampaignSelectorScene.CARD_INNER_MARGIN_PX,
            footerLineY,
            cardInnerWidthPx,
            "Topic " + scenario.getLearningObjective().getCedTopicCode(),
            12,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        panelContainer.add(topicLineText);
        const cardInteractionZone = this.add
            .zone(cardLeftX, cardTopY, CampaignSelectorScene.CARD_WIDTH_PX, CampaignSelectorScene.CARD_HEIGHT_PX)
            .setOrigin(0, 0);
        cardInteractionZone.setInteractive({ useHandCursor: true });
        cardInteractionZone.on("pointerover", () => {
            hoverTintRectangle.setVisible(true);
        });
        cardInteractionZone.on("pointerout", () => {
            hoverTintRectangle.setVisible(false);
        });
        cardInteractionZone.on("pointerup", () => {
            this.scene.start(SceneKeys.SCENARIO_BRIEFING, { scenarioNumber: scenario.getScenarioNumber() });
        });
    }

    private getCardsPerRow(): number {
        const usableWidthPx = this.scale.width - CampaignSelectorScene.CONTENT_SIDE_MARGIN_PX * 2;
        const fittingCardCount = Math.floor(
            (usableWidthPx + CampaignSelectorScene.CARD_HORIZONTAL_GAP_PX) /
                (CampaignSelectorScene.CARD_WIDTH_PX + CampaignSelectorScene.CARD_HORIZONTAL_GAP_PX),
        );
        return Math.max(1, fittingCardCount);
    }
}
