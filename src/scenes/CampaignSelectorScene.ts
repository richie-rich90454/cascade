import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { HighDpiConfigurator } from "../core/HighDpiConfigurator";
import { SceneKeys } from "../core/SceneKeys";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import type { CampaignDefinition } from "../domain/ScenarioRegistry";
import type { Scenario } from "../domain/scenarios/Scenario";
import { FontFamilies } from "../managers/FontManager";
import { UiKeyboardFocus } from "../ui/UiKeyboardFocus";
import { UiPalette } from "../ui/UiPalette";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";
import { UiScrollInput } from "../ui/UiScrollInput";

export class CampaignSelectorScene extends Phaser.Scene {
    private static readonly CARD_WIDTH_PX = 280;
    private static readonly CARD_HEIGHT_PX = 206;
    private static readonly CARD_HORIZONTAL_GAP_PX = 20;
    private static readonly CARD_ROW_VERTICAL_GAP_PX = 18;
    private static readonly CONTENT_SIDE_MARGIN_PX = 40;
    private static readonly CARD_INNER_MARGIN_PX = 14;
    private static readonly STANDARD_HEADER_HEIGHT_PX = 100;
    private static readonly COMPACT_HEADER_HEIGHT_PX = 132;

    private campaignContentContainer: Phaser.GameObjects.Container | null;
    private campaignContentHeightPx: number;
    private campaignTouchPointerId: number | null;
    private campaignTouchStartY: number;
    private campaignTouchLastY: number;
    private campaignTouchHasDragged: boolean;
    private lastCampaignTouchDragAtMs: number;

    public constructor() {
        super({ key: SceneKeys.CAMPAIGN_SELECTOR });
        this.campaignContentContainer = null;
        this.campaignContentHeightPx = 0;
        this.campaignTouchPointerId = null;
        this.campaignTouchStartY = 0;
        this.campaignTouchLastY = 0;
        this.campaignTouchHasDragged = false;
        this.lastCampaignTouchDragAtMs = 0;
    }

    public create(): void {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        const isCompactHeader = screenWidth < 900;
        const headerHeight =
            screenWidth < 520
                ? CampaignSelectorScene.COMPACT_HEADER_HEIGHT_PX
                : CampaignSelectorScene.STANDARD_HEADER_HEIGHT_PX;
        const background = this.add
            .rectangle(0, 0, screenWidth, screenHeight, UiPalette.NEAR_BLACK_LEATHER)
            .setOrigin(0, 0);
        const headerBackground = this.add
            .rectangle(0, 0, screenWidth, headerHeight, UiPalette.DARK_OLIVE)
            .setOrigin(0, 0)
            .setAlpha(0.85);
        const screenCenterX = screenWidth / 2;
        const backButtonWidth = isCompactHeader ? Math.min(200, Math.max(72, screenWidth * 0.3)) : 200;
        const backButton = UiPanelFactory.createBrassButton(this, 12, 14, backButtonWidth, 42, "BACK TO MENU", () => {
            this.scene.start(SceneKeys.MAIN_MENU);
        });
        const titleSafeLeft = isCompactHeader ? backButtonWidth + 24 : 0;
        const titleSafeWidth = Math.max(1, screenWidth - titleSafeLeft - (isCompactHeader ? 12 : 0));
        const titleCenterX = isCompactHeader ? titleSafeLeft + titleSafeWidth / 2 : screenCenterX;
        const headerText = UiPanelFactory.createSectionHeader(
            this,
            titleCenterX,
            screenWidth < 520 ? 10 : 20,
            "SELECT A CAMPAIGN",
            screenWidth < 360 ? 17 : screenWidth < 520 ? 21 : isCompactHeader ? 28 : 34,
        );
        headerText.setOrigin(0.5, 0);
        HighDpiConfigurator.getInstance().setCssWordWrapWidth(headerText, titleSafeWidth, true);
        headerText.setAlign("center");
        const campaignGuidance = this.add.text(
            screenCenterX,
            screenWidth < 520 ? 76 : isCompactHeader ? 76 : 64,
            "Tap The Powder Keg to begin. Finish each scenario to unlock the next.",
            {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: screenWidth < 360 ? "12px" : "13px",
                color: UiPalette.PARCHMENT_CSS,
                wordWrap: { width: screenWidth - 32, useAdvancedWrap: true },
                align: "center",
            },
        );
        campaignGuidance.setOrigin(0.5, 0);
        const scrollHint =
            screenWidth < 520
                ? this.add.text(screenCenterX, headerHeight - 14, "Swipe to browse · Page Up / Down", {
                      fontFamily: FontFamilies.TYPEWRITER_BODY,
                      fontSize: "12px",
                      color: UiPalette.PARCHMENT_CSS,
                      wordWrap: { width: screenWidth - 24, useAdvancedWrap: true },
                      align: "center",
                  })
                : this.add.text(
                      screenWidth - 16,
                      isCompactHeader ? 58 : 32,
                      "Scroll to explore · mouse wheel or Page Up / Down",
                      {
                          fontFamily: FontFamilies.TYPEWRITER_BODY,
                          fontSize: isCompactHeader ? "11px" : "13px",
                          color: UiPalette.PARCHMENT_CSS,
                      },
                  );
        scrollHint.setOrigin(screenWidth < 520 ? 0.5 : 1, 0.5);
        background.setDepth(-100);
        headerBackground.setDepth(1001);
        headerText.setDepth(1002);
        campaignGuidance.setDepth(1002);
        backButton.setDepth(1002);
        scrollHint.setDepth(1002);
        GameSession.getInstance().getAudioManager().playMusicTrack("menu_campaign");
        const contentContainer = this.add.container(0, 0);
        contentContainer.setDepth(UiPalette.UI_DEPTH_BASE + 1);
        this.campaignContentContainer = contentContainer;
        let layoutCursorY = headerHeight + 20;
        for (const campaignDefinition of ScenarioRegistry.getInstance().getCampaigns()) {
            layoutCursorY = this.renderCampaignSection(contentContainer, campaignDefinition, layoutCursorY);
        }
        this.campaignContentHeightPx = layoutCursorY;
        this.input.on("wheel", this.handleCampaignWheel, this);
        this.input.on("pointerdown", this.handleCampaignTouchStart, this);
        this.input.on("pointermove", this.handleCampaignTouchMove, this);
        this.input.on("pointerup", this.handleCampaignTouchEnd, this);
        this.input.keyboard?.on("keydown-PAGEDOWN", this.scrollCampaignDown, this);
        this.input.keyboard?.on("keydown-PAGEUP", this.scrollCampaignUp, this);
        this.input.keyboard?.on("keydown-HOME", this.scrollCampaignToTop, this);
        this.input.keyboard?.on("keydown-END", this.scrollCampaignToBottom, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off("wheel", this.handleCampaignWheel, this);
            this.input.off("pointerdown", this.handleCampaignTouchStart, this);
            this.input.off("pointermove", this.handleCampaignTouchMove, this);
            this.input.off("pointerup", this.handleCampaignTouchEnd, this);
            this.input.keyboard?.off("keydown-PAGEDOWN", this.scrollCampaignDown, this);
            this.input.keyboard?.off("keydown-PAGEUP", this.scrollCampaignUp, this);
            this.input.keyboard?.off("keydown-HOME", this.scrollCampaignToTop, this);
            this.input.keyboard?.off("keydown-END", this.scrollCampaignToBottom, this);
            this.campaignContentContainer = null;
        });
    }

    private renderCampaignSection(
        contentContainer: Phaser.GameObjects.Container,
        campaignDefinition: CampaignDefinition,
        startY: number,
    ): number {
        const screenCenterX = this.scale.width / 2;
        const sectionTitleWidth = Math.max(160, this.scale.width - 32);
        const campaignHeaderText = UiPanelFactory.createSectionHeader(
            this,
            screenCenterX,
            startY,
            campaignDefinition.campaignDisplayName,
            this.scale.width < 520 ? (this.scale.width < 360 ? 19 : 21) : 24,
        );
        campaignHeaderText.setOrigin(0.5, 0);
        HighDpiConfigurator.getInstance().setCssWordWrapWidth(campaignHeaderText, sectionTitleWidth, true);
        campaignHeaderText.setAlign("center");
        const subtitleTopY = Math.max(30, campaignHeaderText.displayHeight + 4);
        const campaignSubtitleText = UiPanelFactory.createBodyText(
            this,
            screenCenterX,
            startY + subtitleTopY,
            Math.max(160, this.scale.width - 48),
            campaignDefinition.campaignSubtitle,
            this.scale.width < 520 ? 14 : 15,
            UiPalette.PARCHMENT_CSS,
        );
        campaignSubtitleText.setOrigin(0.5, 0);
        campaignSubtitleText.setAlign("center");
        const sectionHeaderHeight = Math.max(58, subtitleTopY + campaignSubtitleText.displayHeight + 8);
        const sectionHeaderPanel = UiPanelFactory.createPanelContainer(
            this,
            0,
            startY - 2,
            this.scale.width,
            sectionHeaderHeight,
            PanelVariant.LEATHER,
            UiPalette.UI_DEPTH_BASE + 1,
        );
        sectionHeaderPanel.setAlpha(0.7);
        contentContainer.add(sectionHeaderPanel);
        contentContainer.add(campaignHeaderText);
        contentContainer.add(campaignSubtitleText);
        const cardsPerRow = this.getCardsPerRow();
        const fullGridWidthPx =
            cardsPerRow * CampaignSelectorScene.CARD_WIDTH_PX +
            (cardsPerRow - 1) * CampaignSelectorScene.CARD_HORIZONTAL_GAP_PX;
        let cardTopY = startY + sectionHeaderHeight + 14;
        const scenarioNumbers = campaignDefinition.scenarioNumbers;
        for (let rowStartIndex = 0; rowStartIndex < scenarioNumbers.length; rowStartIndex += cardsPerRow) {
            const rowScenarioNumbers = scenarioNumbers.slice(rowStartIndex, rowStartIndex + cardsPerRow);
            let cardLeftX = (this.scale.width - fullGridWidthPx) / 2;
            for (const scenarioNumber of rowScenarioNumbers) {
                const scenario = ScenarioRegistry.getInstance().getScenarioByNumber(scenarioNumber);
                if (scenario !== null) {
                    this.createScenarioCard(contentContainer, scenario, cardLeftX, cardTopY);
                }
                cardLeftX += CampaignSelectorScene.CARD_WIDTH_PX + CampaignSelectorScene.CARD_HORIZONTAL_GAP_PX;
            }
            cardTopY += CampaignSelectorScene.CARD_HEIGHT_PX + CampaignSelectorScene.CARD_ROW_VERTICAL_GAP_PX;
        }
        return cardTopY + 16;
    }

    private createScenarioCard(
        contentContainer: Phaser.GameObjects.Container,
        scenario: Scenario,
        cardLeftX: number,
        cardTopY: number,
    ): void {
        const panelContainer = UiPanelFactory.createPanelContainer(
            this,
            cardLeftX,
            cardTopY,
            CampaignSelectorScene.CARD_WIDTH_PX,
            CampaignSelectorScene.CARD_HEIGHT_PX,
            PanelVariant.LEATHER,
        );
        contentContainer.add(panelContainer);
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
        const focusOutlineGraphics = this.add.graphics();
        focusOutlineGraphics.lineStyle(3, UiPalette.HIGHLIGHT_BRASS, 1);
        focusOutlineGraphics.strokeRect(
            1.5,
            1.5,
            CampaignSelectorScene.CARD_WIDTH_PX - 3,
            CampaignSelectorScene.CARD_HEIGHT_PX - 3,
        );
        focusOutlineGraphics.setVisible(false);
        panelContainer.add(focusOutlineGraphics);
        const cardInnerWidthPx = CampaignSelectorScene.CARD_WIDTH_PX - CampaignSelectorScene.CARD_INNER_MARGIN_PX * 2;
        const titleText = UiPanelFactory.createSectionHeader(
            this,
            CampaignSelectorScene.CARD_INNER_MARGIN_PX,
            10,
            scenario.getScenarioTitle(),
            17,
        );
        HighDpiConfigurator.getInstance().setCssWordWrapWidth(titleText, cardInnerWidthPx, true);
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
            `Thematic focus · ${scenario.getThematicFocus().getDisplayName()}`,
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
        const footerLineY = CampaignSelectorScene.CARD_HEIGHT_PX - 34;
        if (!ScenarioRegistry.getInstance().isScenarioUnlocked(scenario.getScenarioNumber())) {
            const unlockRequirementText = UiPanelFactory.createTypewriterText(
                this,
                CampaignSelectorScene.CARD_INNER_MARGIN_PX,
                footerLineY,
                cardInnerWidthPx,
                "LOCKED · COMPLETE PREVIOUS SCENARIO",
                12,
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
            .zone(0, 0, CampaignSelectorScene.CARD_WIDTH_PX, CampaignSelectorScene.CARD_HEIGHT_PX)
            .setOrigin(0, 0);
        panelContainer.add(cardInteractionZone);
        cardInteractionZone.setInteractive({ useHandCursor: true });
        let isKeyboardFocused = false;
        const focusHandle = UiKeyboardFocus.register(this, {
            container: panelContainer,
            setFocused: (isFocused) => {
                isKeyboardFocused = isFocused;
                focusOutlineGraphics.setVisible(isFocused);
                hoverTintRectangle.setVisible(isFocused);
                if (isFocused) {
                    this.scrollScenarioCardIntoView(panelContainer);
                }
            },
            activate: () => this.openScenarioBriefing(scenario),
        });
        cardInteractionZone.on("pointerdown", () => {
            focusHandle.focus();
        });
        cardInteractionZone.on("pointerover", () => {
            hoverTintRectangle.setVisible(true);
        });
        cardInteractionZone.on("pointerout", () => {
            hoverTintRectangle.setVisible(isKeyboardFocused);
        });
        cardInteractionZone.on("pointerup", () => {
            this.openScenarioBriefing(scenario, true);
        });
    }

    private openScenarioBriefing(scenario: Scenario, isPointerActivation: boolean = false): void {
        if (isPointerActivation && Date.now() - this.lastCampaignTouchDragAtMs < 250) {
            return;
        }
        this.scene.start(SceneKeys.SCENARIO_BRIEFING, { scenarioNumber: scenario.getScenarioNumber() });
    }

    private scrollScenarioCardIntoView(card: Phaser.GameObjects.Container): void {
        const cardBounds = card.getBounds();
        const headerHeight =
            this.scale.width < 520
                ? CampaignSelectorScene.COMPACT_HEADER_HEIGHT_PX
                : CampaignSelectorScene.STANDARD_HEADER_HEIGHT_PX;
        const viewportBottom = this.scale.height - 12;
        if (cardBounds.top < headerHeight) {
            this.scrollCampaignBy(cardBounds.top - headerHeight);
        } else if (cardBounds.bottom > viewportBottom) {
            this.scrollCampaignBy(cardBounds.bottom - viewportBottom);
        }
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
        const pointerPosition = UiScrollInput.getCssPointerPosition(pointer);
        const headerHeightPx =
            this.scale.width < 520
                ? CampaignSelectorScene.COMPACT_HEADER_HEIGHT_PX
                : CampaignSelectorScene.STANDARD_HEADER_HEIGHT_PX;
        if (pointerPosition.y < headerHeightPx) {
            return;
        }
        this.scrollCampaignBy(UiScrollInput.getWheelDeltaPx(pointer, deltaY, this.scale.height));
    }

    private handleCampaignTouchStart = (pointer: Phaser.Input.Pointer): void => {
        if (!pointer.wasTouch || this.campaignContentContainer === null) {
            return;
        }
        const maximumScrollY = Math.max(0, this.campaignContentHeightPx - this.scale.height);
        const pointerPosition = UiScrollInput.getCssPointerPosition(pointer);
        const compactHeaderHeight =
            this.scale.width < 520
                ? CampaignSelectorScene.COMPACT_HEADER_HEIGHT_PX
                : CampaignSelectorScene.STANDARD_HEADER_HEIGHT_PX;
        if (maximumScrollY <= 0 || pointerPosition.y < compactHeaderHeight) {
            return;
        }
        this.campaignTouchPointerId = pointer.id;
        this.campaignTouchStartY = pointerPosition.y;
        this.campaignTouchLastY = pointerPosition.y;
        this.campaignTouchHasDragged = false;
    };

    private handleCampaignTouchMove = (pointer: Phaser.Input.Pointer): void => {
        if (!pointer.wasTouch || pointer.id !== this.campaignTouchPointerId) {
            return;
        }
        const pointerY = UiScrollInput.getCssPointerPosition(pointer).y;
        const distanceFromStart = Math.abs(pointerY - this.campaignTouchStartY);
        if (distanceFromStart >= 6) {
            this.campaignTouchHasDragged = true;
        }
        if (this.campaignTouchHasDragged) {
            this.scrollCampaignBy(this.campaignTouchLastY - pointerY);
        }
        this.campaignTouchLastY = pointerY;
    };

    private handleCampaignTouchEnd = (pointer: Phaser.Input.Pointer): void => {
        if (pointer.id !== this.campaignTouchPointerId) {
            return;
        }
        if (this.campaignTouchHasDragged) {
            this.lastCampaignTouchDragAtMs = Date.now();
        }
        this.campaignTouchPointerId = null;
        this.campaignTouchHasDragged = false;
    };

    private scrollCampaignBy(distancePx: number): void {
        const contentContainer = this.campaignContentContainer;
        if (contentContainer === null) {
            return;
        }
        const maximumScrollY = Math.max(0, this.campaignContentHeightPx - this.scale.height);
        contentContainer.y = -Phaser.Math.Clamp(-contentContainer.y + distancePx, 0, maximumScrollY);
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
