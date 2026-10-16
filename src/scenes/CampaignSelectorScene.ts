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
    private static readonly CARD_WIDTH_PX = 280;
    private static readonly CARD_HEIGHT_PX = 206;
    private static readonly CARD_HORIZONTAL_GAP_PX = 20;
    private static readonly CARD_ROW_VERTICAL_GAP_PX = 18;
    private static readonly CONTENT_SIDE_MARGIN_PX = 40;
    private static readonly CARD_INNER_MARGIN_PX = 14;
    private static readonly HEADER_HEIGHT_PX = 76;

    private campaignContentCamera: Phaser.Cameras.Scene2D.Camera | null;
    private campaignContentHeightPx: number;

    public constructor() {
        super({ key: SceneKeys.CAMPAIGN_SELECTOR });
        this.campaignContentCamera = null;
        this.campaignContentHeightPx = 0;
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
        const scrollHint = this.add.text(
            this.scale.width - 24,
            32,
            "SCROLL TO EXPLORE · MOUSE WHEEL OR PAGE UP / DOWN",
            {
                fontFamily: FontFamilies.TYPEWRITER_BODY,
                fontSize: "13px",
                color: UiPalette.PARCHMENT_CSS,
            },
        );
        scrollHint.setOrigin(1, 0.5);
        const fixedHeaderObjects = [...this.children.list];
        GameSession.getInstance().getAudioManager().playMusicTrack("menu_campaign");
        const firstContentChildIndex = this.children.list.length;
        let layoutCursorY = 96;
        for (const campaignDefinition of ScenarioRegistry.getInstance().getCampaigns()) {
            layoutCursorY = this.renderCampaignSection(campaignDefinition, layoutCursorY);
        }
        this.campaignContentHeightPx = layoutCursorY;
        const campaignContentObjects = this.children.list.slice(firstContentChildIndex);
        const mainCamera = this.cameras.main;
        mainCamera.ignore(campaignContentObjects);
        this.campaignContentCamera = this.cameras.add(
            0,
            CampaignSelectorScene.HEADER_HEIGHT_PX,
            this.scale.width,
            Math.max(1, this.scale.height - CampaignSelectorScene.HEADER_HEIGHT_PX),
        );
        this.campaignContentCamera.ignore(fixedHeaderObjects);
        this.campaignContentCamera.setBounds(
            0,
            CampaignSelectorScene.HEADER_HEIGHT_PX,
            this.scale.width,
            Math.max(this.scale.height, this.campaignContentHeightPx),
        );
        this.campaignContentCamera.scrollY = CampaignSelectorScene.HEADER_HEIGHT_PX;
        this.input.on("wheel", this.handleCampaignWheel, this);
        this.input.keyboard?.on("keydown-PAGEDOWN", this.scrollCampaignDown, this);
        this.input.keyboard?.on("keydown-PAGEUP", this.scrollCampaignUp, this);
        this.input.keyboard?.on("keydown-HOME", this.scrollCampaignToTop, this);
        this.input.keyboard?.on("keydown-END", this.scrollCampaignToBottom, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off("wheel", this.handleCampaignWheel, this);
            this.input.keyboard?.off("keydown-PAGEDOWN", this.scrollCampaignDown, this);
            this.input.keyboard?.off("keydown-PAGEUP", this.scrollCampaignUp, this);
            this.input.keyboard?.off("keydown-HOME", this.scrollCampaignToTop, this);
            this.input.keyboard?.off("keydown-END", this.scrollCampaignToBottom, this);
            this.campaignContentCamera?.destroy();
            this.campaignContentCamera = null;
        });
    }

    private renderCampaignSection(campaignDefinition: CampaignDefinition, startY: number): number {
        const screenCenterX = this.scale.width / 2;
        const sectionHeaderPanel = UiPanelFactory.createPanelContainer(
            this,
            0,
            startY - 2,
            this.scale.width,
            58,
            PanelVariant.LEATHER,
            UiPalette.UI_DEPTH_BASE + 1,
        );
        sectionHeaderPanel.setAlpha(0.7);
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
        let cardTopY = startY + 72;
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
                fontSize: "14px",
                fontStyle: "italic",
                color: UiPalette.AGED_PARCHMENT_CSS,
            },
        );
        panelContainer.add(subtitleText);
        const focusLabel = this.add.text(
            CampaignSelectorScene.CARD_INNER_MARGIN_PX,
            subtitleText.y + subtitleText.displayHeight + 10,
            `THEMATIC FOCUS  ·  ${scenario.getThematicFocus().getDisplayName()}`,
            {
                fontFamily: FontFamilies.SMALL_CAPS,
                fontSize: "13px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
                wordWrap: { width: cardInnerWidthPx, useAdvancedWrap: true },
            },
        );
        panelContainer.add(focusLabel);
        const objectiveText = UiPanelFactory.createBodyText(
            this,
            CampaignSelectorScene.CARD_INNER_MARGIN_PX,
            focusLabel.y + focusLabel.displayHeight + 7,
            cardInnerWidthPx,
            scenario.getLearningObjective().getText(),
            13,
            UiPalette.PARCHMENT_CSS,
        );
        panelContainer.add(objectiveText);
        const footerLineY = CampaignSelectorScene.CARD_HEIGHT_PX - 26;
        if (!ScenarioRegistry.getInstance().isScenarioUnlocked(scenario.getScenarioNumber())) {
            const unlockRequirementText = UiPanelFactory.createTypewriterText(
                this,
                CampaignSelectorScene.CARD_INNER_MARGIN_PX,
                footerLineY,
                cardInnerWidthPx,
                "LOCKED · COMPLETE THE PREVIOUS SCENARIO TO UNLOCK",
                13,
                UiPalette.FIELD_GRAY_CSS,
            );
            panelContainer.add(unlockRequirementText);
            return;
        }
        const topicLineText = UiPanelFactory.createTypewriterText(
            this,
            CampaignSelectorScene.CARD_INNER_MARGIN_PX,
            footerLineY,
            cardInnerWidthPx,
            "WORLD HISTORY COURSE TOPIC " + scenario.getLearningObjective().getCedTopicCode(),
            13,
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

    private handleCampaignWheel(
        pointer: Phaser.Input.Pointer,
        _currentlyOver: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number,
    ): void {
        if (pointer.y < CampaignSelectorScene.HEADER_HEIGHT_PX) {
            return;
        }
        this.scrollCampaignBy(deltaY);
    }

    private scrollCampaignBy(distancePx: number): void {
        const camera = this.campaignContentCamera;
        if (camera === null) {
            return;
        }
        const maximumScrollY = Math.max(
            CampaignSelectorScene.HEADER_HEIGHT_PX,
            this.campaignContentHeightPx - camera.height,
        );
        camera.scrollY = Phaser.Math.Clamp(
            camera.scrollY + distancePx,
            CampaignSelectorScene.HEADER_HEIGHT_PX,
            maximumScrollY,
        );
    }

    private scrollCampaignDown(): void {
        this.scrollCampaignBy(this.scale.height * 0.72);
    }

    private scrollCampaignUp(): void {
        this.scrollCampaignBy(-this.scale.height * 0.72);
    }

    private scrollCampaignToTop(): void {
        this.scrollCampaignBy(-this.campaignContentHeightPx);
    }

    private scrollCampaignToBottom(): void {
        this.scrollCampaignBy(this.campaignContentHeightPx);
    }
}
