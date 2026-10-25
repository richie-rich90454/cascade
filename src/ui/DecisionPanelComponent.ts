import Phaser from "phaser";

import { DecisionMadePayload, EventBus, GameEventTypes } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import { HighDpiConfigurator } from "../core/HighDpiConfigurator";
import type { DecisionOption, DecisionRecord } from "../domain/scenarios/Scenario";
import { FontFamilies } from "../managers/FontManager";
import { ResourceType } from "../types/ResourceType";
import { ContextSectionComponent } from "./ContextSectionComponent";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";
import { ScrollRegion, UiPointerRouting } from "./UiPointerRouting";
import { UiScrollInput } from "./UiScrollInput";

export class DecisionPanelComponent extends Phaser.GameObjects.Container {
    private readonly panelWidth: number;
    private readonly panelHeight: number;

    private currentDecision: DecisionRecord | null = null;
    private currentGameState: GameState | null = null;
    private selectedOption: DecisionOption | null = null;
    private isShowingReasoningGuide = false;
    private reasoningPageIndex = 0;
    private hasDecisionBeenMade = false;
    private scrollContentContainer: Phaser.GameObjects.Container | null = null;
    private fixedControlsContainer: Phaser.GameObjects.Container | null = null;
    private scrollMaskGraphics: Phaser.GameObjects.Graphics | null = null;
    private scrollHintTextObject: Phaser.GameObjects.Text | null = null;
    private activeScrollRegion: ScrollRegion | null = null;
    private scrollContentHeightPx = 0;
    private scrollViewportHeightPx = 0;
    private scrollOffsetPx = 0;
    private contentStartY = 52;
    private activeTouchPointerId: number | null = null;
    private touchStartY = 0;
    private touchLastY = 0;
    private ignoreTouchActivationUntilMs = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.panelWidth = width;
        this.panelHeight = height;
        scene.add.existing(this);
        this.setSize(width, height);
        scene.input.on("wheel", this.handleScrollWheel, this);
        scene.input.on("pointerdown", this.handleTouchStart, this);
        scene.input.on("pointermove", this.handleTouchMove, this);
        scene.input.on("pointerup", this.handleTouchEnd, this);
        scene.input.on("pointerupoutside", this.handleTouchEnd, this);
        scene.input.keyboard?.on("keydown", this.handleScrollKeyDown, this);
        this.once("destroy", this.handleDestroy);
    }

    public setDecision(decision: DecisionRecord, gameState: GameState): void {
        this.currentDecision = decision;
        this.currentGameState = gameState;
        this.selectedOption = null;
        this.isShowingReasoningGuide = false;
        this.reasoningPageIndex = 0;
        this.hasDecisionBeenMade = false;
        this.renderContent();
    }

    private renderContent(): void {
        const decision = this.currentDecision;
        if (decision === null) {
            return;
        }

        this.resetContentContainers();
        const decisionTitle = UiPanelFactory.createSectionHeader(this.scene, 16, 12, decision.decisionTitle, 22);
        HighDpiConfigurator.getInstance().setCssWordWrapWidth(decisionTitle, this.panelWidth - 32, true);
        this.addToContent(decisionTitle);
        this.contentStartY = Math.max(52, 12 + decisionTitle.displayHeight + 12);

        if (this.isShowingReasoningGuide) {
            this.renderReasoningGuide(decision);
            return;
        }

        let cursorY = this.contentStartY;
        const contextSection = new ContextSectionComponent(this.scene, 16, cursorY, this.panelWidth - 32);
        contextSection.setContextText(decision.contextParagraph);
        this.addToContent(contextSection);
        cursorY += contextSection.displayHeight + 8;

        const historyNote = UiPanelFactory.createBodyText(
            this.scene,
            16,
            cursorY,
            this.panelWidth - 32,
            "Documented history provides the context. Your choice creates a hypothetical outcome to compare with the record.",
            13,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.addToContent(historyNote);
        cursorY += historyNote.displayHeight + 12;

        if (this.selectedOption !== null) {
            this.renderOutcome(this.selectedOption, cursorY);
            return;
        }

        const choiceHeading = UiPanelFactory.createSectionHeader(this.scene, 16, cursorY, "Choose a policy", 18);
        this.addToContent(choiceHeading);
        cursorY += choiceHeading.displayHeight + 8;

        const guideButtonWidth = this.panelWidth < 480 ? this.panelWidth - 32 : Math.min(250, this.panelWidth - 32);
        this.addToContent(
            UiPanelFactory.createBrassButton(
                this.scene,
                16,
                cursorY,
                guideButtonWidth,
                38,
                "Show the reasoning guide",
                () => {
                    if (!this.canActivate()) return;
                    this.isShowingReasoningGuide = true;
                    this.renderContent();
                },
            ),
        );
        cursorY += 46;

        const compactWidth = this.panelWidth < 520;
        const optionHeight = compactWidth ? 68 : 48;
        const optionGap = compactWidth ? 8 : 10;
        for (const option of decision.options) {
            const optionButton = UiPanelFactory.createBrassButton(
                this.scene,
                16,
                cursorY,
                this.panelWidth - 32,
                optionHeight,
                option.optionLabelText,
                () => this.handleOptionChosen(decision, option),
            );
            this.addToContent(optionButton);
            cursorY += optionHeight + optionGap;
        }
        this.updateScrollViewport(cursorY);
    }

    private renderReasoningGuide(decision: DecisionRecord): void {
        const reasoningSections: Array<[string, string]> = [
            ["Cause and effect", decision.causationSummary],
            ["Comparison", decision.comparisonSummary],
            ["Continuity and change", decision.continuityChangeSummary],
            ["Source perspective", decision.sourcingSummary],
        ];
        const lensesPerPage = this.panelWidth < 360 || this.panelHeight < 480 ? 1 : 2;
        const pageCount = Math.ceil(reasoningSections.length / lensesPerPage);
        this.reasoningPageIndex = Phaser.Math.Clamp(this.reasoningPageIndex, 0, pageCount - 1);
        const intro = UiPanelFactory.createBodyText(
            this.scene,
            16,
            this.contentStartY,
            this.panelWidth - 32,
            "Use these historical reasoning lenses to weigh the options. Swipe or scroll if a lens continues below; the buttons let you move between lenses or return to the choices.",
            14,
            UiPalette.PARCHMENT_CSS,
        );
        this.addToContent(intro);

        const currentLenses = reasoningSections.slice(
            this.reasoningPageIndex * lensesPerPage,
            (this.reasoningPageIndex + 1) * lensesPerPage,
        );
        let cursorY = this.contentStartY + intro.displayHeight + 12;
        for (const [label, summary] of currentLenses) {
            const labelText = this.scene.add.text(16, cursorY, label, {
                fontFamily: FontFamilies.TYPEWRITER_HEADER,
                fontSize: "14px",
                fontStyle: "bold",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
            });
            this.addToContent(labelText);
            cursorY += 22;
            const summaryText = UiPanelFactory.createBodyText(
                this.scene,
                16,
                cursorY,
                this.panelWidth - 32,
                summary,
                13,
                UiPalette.PARCHMENT_CSS,
            );
            this.addToContent(summaryText);
            cursorY += summaryText.displayHeight + 8;
        }

        const footerTopY = this.panelHeight - 92;
        const backToChoices = (): void => {
            if (!this.canActivate()) return;
            this.isShowingReasoningGuide = false;
            this.renderContent();
        };
        const goToPreviousLens = (): void => {
            if (!this.canActivate()) return;
            this.reasoningPageIndex = Math.max(0, this.reasoningPageIndex - 1);
            this.renderContent();
        };
        const goToNextLens = (): void => {
            if (!this.canActivate()) return;
            this.reasoningPageIndex = Math.min(pageCount - 1, this.reasoningPageIndex + 1);
            this.renderContent();
        };
        const navigationWidth = this.panelWidth - 32;
        if (pageCount > 1 && this.reasoningPageIndex > 0 && this.reasoningPageIndex < pageCount - 1) {
            const halfWidth = Math.floor((navigationWidth - 8) / 2);
            this.addToFixedControls(
                UiPanelFactory.createBrassButton(
                    this.scene,
                    16,
                    footerTopY,
                    halfWidth,
                    38,
                    "Previous lens",
                    goToPreviousLens,
                ),
            );
            this.addToFixedControls(
                UiPanelFactory.createBrassButton(
                    this.scene,
                    24 + halfWidth,
                    footerTopY,
                    navigationWidth - halfWidth - 8,
                    38,
                    "Next lens",
                    goToNextLens,
                ),
            );
        } else if (pageCount > 1) {
            const isLastPage = this.reasoningPageIndex === pageCount - 1;
            this.addToFixedControls(
                UiPanelFactory.createBrassButton(
                    this.scene,
                    16,
                    footerTopY,
                    navigationWidth,
                    38,
                    isLastPage ? "Previous lens" : "Next lens",
                    isLastPage ? goToPreviousLens : goToNextLens,
                ),
            );
        }
        this.addToFixedControls(
            UiPanelFactory.createBrassButton(
                this.scene,
                16,
                this.panelHeight - 48,
                navigationWidth,
                38,
                "Back to policy choices",
                backToChoices,
            ),
        );
        this.updateScrollViewport(cursorY, 92);
    }

    private renderOutcome(option: DecisionOption, topY: number): void {
        const outcomeTitle = UiPanelFactory.createSectionHeader(
            this.scene,
            16,
            topY,
            "Your alternate-history outcome",
            18,
        );
        this.addToContent(outcomeTitle);
        const outcomeText = UiPanelFactory.createBodyText(
            this.scene,
            16,
            topY + outcomeTitle.displayHeight + 8,
            this.panelWidth - 32,
            `${option.consequenceText}\n\nCompare this outcome with the documented record and sources.`,
            15,
            UiPalette.PARCHMENT_CSS,
        );
        this.addToContent(outcomeText);
        const guideButtonTopY = topY + outcomeTitle.displayHeight + outcomeText.displayHeight + 20;
        this.addToContent(
            UiPanelFactory.createBrassButton(
                this.scene,
                16,
                guideButtonTopY,
                Math.min(250, this.panelWidth - 32),
                40,
                "Review the reasoning guide",
                () => {
                    if (!this.canActivate()) return;
                    this.isShowingReasoningGuide = true;
                    this.renderContent();
                },
            ),
        );
        this.updateScrollViewport(guideButtonTopY + 40);
    }

    private handleOptionChosen(decision: DecisionRecord, option: DecisionOption): void {
        if (!this.canActivate() || this.hasDecisionBeenMade || this.currentGameState === null) {
            return;
        }
        this.hasDecisionBeenMade = true;
        this.selectedOption = option;
        this.currentGameState.setScenarioFlag(option.resultingFlagIdentifier);
        const resultingResourceType = ResourceType.findByResourceTypeCode(option.resultingResourceCode);
        if (resultingResourceType !== null) {
            this.currentGameState.addToResource(resultingResourceType, option.resultingResourceDelta);
        }
        this.renderContent();
        EventBus.getInstance().publish(
            GameEventTypes.DECISION_MADE,
            new DecisionMadePayload(decision.decisionIdentifier, option.optionIdentifier),
        );
    }

    private resetContentContainers(): void {
        this.scrollContentContainer?.clearMask(true);
        this.scrollContentContainer?.destroy(true);
        this.fixedControlsContainer?.destroy(true);
        this.scrollContentContainer = this.scene.add.container(0, 0);
        this.fixedControlsContainer = this.scene.add.container(0, 0);
        this.add(this.scrollContentContainer);
        this.add(this.fixedControlsContainer);
        this.scrollHintTextObject = null;
        this.scrollContentHeightPx = 0;
        this.scrollViewportHeightPx = 0;
        this.scrollOffsetPx = 0;
    }

    private addToContent<T extends Phaser.GameObjects.GameObject>(gameObject: T): T {
        this.scrollContentContainer?.add(gameObject);
        return gameObject;
    }

    private addToFixedControls<T extends Phaser.GameObjects.GameObject>(gameObject: T): T {
        this.fixedControlsContainer?.add(gameObject);
        return gameObject;
    }

    private updateScrollViewport(contentHeightPx: number, fixedFooterHeightPx: number = 0): void {
        this.scrollContentHeightPx = Math.max(0, contentHeightPx + 8);
        const wouldOverflowWithoutHint = this.scrollContentHeightPx > this.panelHeight - fixedFooterHeightPx;
        const scrollHintHeightPx = wouldOverflowWithoutHint && fixedFooterHeightPx === 0 ? 30 : 0;
        this.scrollViewportHeightPx = Math.max(96, this.panelHeight - fixedFooterHeightPx - scrollHintHeightPx);
        const maximumOffsetPx = Math.max(0, this.scrollContentHeightPx - this.scrollViewportHeightPx);
        this.scrollOffsetPx = Phaser.Math.Clamp(this.scrollOffsetPx, 0, maximumOffsetPx);
        this.scrollContentContainer?.setPosition(0, -this.scrollOffsetPx);

        const viewportOrigin = this.getViewportOrigin();
        if (this.scrollMaskGraphics === null) {
            this.scrollMaskGraphics = this.scene.add.graphics();
        }
        this.scrollMaskGraphics.clear();
        this.scrollMaskGraphics.fillStyle(0xffffff, 1);
        this.scrollMaskGraphics.fillRect(
            viewportOrigin.x,
            viewportOrigin.y,
            this.panelWidth,
            this.scrollViewportHeightPx,
        );
        this.scrollMaskGraphics.setVisible(false);
        this.scrollContentContainer?.setMask(this.scrollMaskGraphics.createGeometryMask());

        if (this.activeScrollRegion !== null) {
            UiPointerRouting.unregisterScrollRegion(this.activeScrollRegion);
        }
        this.activeScrollRegion = new ScrollRegion(
            viewportOrigin.x,
            viewportOrigin.y,
            this.panelWidth,
            this.panelHeight,
        );
        UiPointerRouting.registerScrollRegion(this.activeScrollRegion);

        const canScroll = maximumOffsetPx > 1 && fixedFooterHeightPx === 0;
        if (canScroll && this.scrollHintTextObject === null) {
            this.scrollHintTextObject = this.scene.add.text(
                this.panelWidth / 2,
                this.panelHeight - 6,
                "Swipe or scroll to read",
                {
                    fontFamily: FontFamilies.TYPEWRITER_BODY,
                    fontSize: "12px",
                    color: UiPalette.PARCHMENT_CSS,
                    backgroundColor: UiPalette.NEAR_BLACK_LEATHER_CSS,
                    padding: { x: 6, y: 3 },
                },
            );
            this.scrollHintTextObject.setOrigin(0.5, 1);
            this.addToFixedControls(this.scrollHintTextObject);
        }
        this.scrollHintTextObject?.setVisible(canScroll);
    }

    private getViewportOrigin(): { x: number; y: number } {
        let x = 0;
        let y = 0;
        let currentContainer: Phaser.GameObjects.Container | null = this;
        while (currentContainer !== null) {
            x += currentContainer.x;
            y += currentContainer.y;
            currentContainer = currentContainer.parentContainer;
        }
        return { x, y };
    }

    private scrollBy(distancePx: number): void {
        const maximumOffsetPx = Math.max(0, this.scrollContentHeightPx - this.scrollViewportHeightPx);
        this.scrollOffsetPx = Phaser.Math.Clamp(this.scrollOffsetPx + distancePx, 0, maximumOffsetPx);
        this.scrollContentContainer?.setPosition(0, -this.scrollOffsetPx);
        this.scrollHintTextObject?.setVisible(maximumOffsetPx > 1);
    }

    private handleScrollWheel = (
        pointer: Phaser.Input.Pointer,
        _currentlyOver: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number,
    ): void => {
        if (this.activeScrollRegion === null || this.scrollContentHeightPx <= this.scrollViewportHeightPx) return;
        const pointerPosition = UiScrollInput.getCssPointerPosition(pointer);
        const viewportOrigin = this.getViewportOrigin();
        if (
            this.activeScrollRegion.containsPoint(pointerPosition.x, pointerPosition.y) &&
            pointerPosition.y <= viewportOrigin.y + this.scrollViewportHeightPx
        ) {
            this.scrollBy(UiScrollInput.getWheelDeltaPx(pointer, deltaY, this.scrollViewportHeightPx));
        }
    };

    private handleScrollKeyDown = (event: KeyboardEvent): void => {
        if (this.scrollContentHeightPx <= this.scrollViewportHeightPx) return;
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
        if (event.key === "PageDown") {
            event.preventDefault();
            this.scrollBy(this.scrollViewportHeightPx * 0.8);
        } else if (event.key === "PageUp") {
            event.preventDefault();
            this.scrollBy(-this.scrollViewportHeightPx * 0.8);
        }
    };

    private handleTouchStart = (pointer: Phaser.Input.Pointer): void => {
        if (!pointer.wasTouch || this.activeScrollRegion === null) return;
        const pointerPosition = UiScrollInput.getCssPointerPosition(pointer);
        const viewportOrigin = this.getViewportOrigin();
        if (
            !this.activeScrollRegion.containsPoint(pointerPosition.x, pointerPosition.y) ||
            pointerPosition.y > viewportOrigin.y + this.scrollViewportHeightPx
        ) {
            return;
        }
        this.activeTouchPointerId = pointer.id;
        this.touchStartY = pointerPosition.y;
        this.touchLastY = pointerPosition.y;
    };

    private handleTouchMove = (pointer: Phaser.Input.Pointer): void => {
        if (!pointer.wasTouch || pointer.id !== this.activeTouchPointerId) return;
        const pointerPosition = UiScrollInput.getCssPointerPosition(pointer);
        const totalDistancePx = pointerPosition.y - this.touchStartY;
        if (Math.abs(totalDistancePx) > 7) {
            this.ignoreTouchActivationUntilMs = Date.now() + 250;
            this.scrollBy(this.touchLastY - pointerPosition.y);
        }
        this.touchLastY = pointerPosition.y;
    };

    private handleTouchEnd = (pointer: Phaser.Input.Pointer): void => {
        if (pointer.id === this.activeTouchPointerId) {
            this.activeTouchPointerId = null;
        }
    };

    private canActivate(): boolean {
        return Date.now() >= this.ignoreTouchActivationUntilMs;
    }

    private handleDestroy = (): void => {
        this.scene.input.off("wheel", this.handleScrollWheel, this);
        this.scene.input.off("pointerdown", this.handleTouchStart, this);
        this.scene.input.off("pointermove", this.handleTouchMove, this);
        this.scene.input.off("pointerup", this.handleTouchEnd, this);
        this.scene.input.off("pointerupoutside", this.handleTouchEnd, this);
        this.scene.input.keyboard?.off("keydown", this.handleScrollKeyDown, this);
        if (this.activeScrollRegion !== null) {
            UiPointerRouting.unregisterScrollRegion(this.activeScrollRegion);
            this.activeScrollRegion = null;
        }
        this.scrollContentContainer?.clearMask(true);
        this.scrollMaskGraphics?.destroy();
        this.scrollMaskGraphics = null;
    };
}
