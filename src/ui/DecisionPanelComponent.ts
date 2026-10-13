import Phaser from "phaser";

import { DecisionMadePayload, EventBus, GameEventTypes } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { DecisionOption, DecisionRecord } from "../domain/scenarios/Scenario";
import { FontFamilies } from "../managers/FontManager";
import { ResourceType } from "../types/ResourceType";
import { ContextSectionComponent } from "./ContextSectionComponent";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class DecisionPanelComponent extends Phaser.GameObjects.Container {
    private readonly panelWidth: number;

    private confirmationTextObject: Phaser.GameObjects.Text | null = null;
    private hasDecisionBeenMade: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.panelWidth = width;
        scene.add.existing(this);
        this.setSize(width, height);
    }

    public setDecision(decision: DecisionRecord, gameState: GameState): void {
        this.removeAll(true);
        this.confirmationTextObject = null;
        this.hasDecisionBeenMade = false;
        const titleTextObject = UiPanelFactory.createSectionHeader(this.scene, 16, 12, decision.decisionTitle, 22);
        this.add(titleTextObject);
        const contextSection = new ContextSectionComponent(this.scene, 16, 52, this.panelWidth - 32);
        contextSection.setContextText(decision.contextParagraph);
        this.add(contextSection);
        const skillsTopY = 52 + contextSection.displayHeight + 18;
        const skillColumnWidth = (this.panelWidth - 40) / 2;
        const skillRowHeight = 104;
        this.addSkillSection("Causation", decision.causationSummary, 16, skillsTopY, skillColumnWidth);
        this.addSkillSection(
            "Comparison",
            decision.comparisonSummary,
            24 + skillColumnWidth,
            skillsTopY,
            skillColumnWidth,
        );
        this.addSkillSection(
            "Continuity and Change",
            decision.continuityChangeSummary,
            16,
            skillsTopY + skillRowHeight,
            skillColumnWidth,
        );
        this.addSkillSection(
            "Sourcing",
            decision.sourcingSummary,
            24 + skillColumnWidth,
            skillsTopY + skillRowHeight,
            skillColumnWidth,
        );
        const optionsTopY = skillsTopY + 2 * skillRowHeight + 6;
        let optionY = optionsTopY;
        for (const option of decision.options) {
            const optionButton = UiPanelFactory.createBrassButton(
                this.scene,
                16,
                optionY,
                this.panelWidth - 32,
                42,
                option.optionLabelText,
                () => {
                    this.handleOptionChosen(decision, option, gameState);
                },
            );
            this.add(optionButton);
            optionY += 52;
        }
        this.confirmationTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            optionY + 4,
            this.panelWidth - 32,
            "",
            14,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(this.confirmationTextObject);
    }

    private addSkillSection(
        sectionLabel: string,
        sectionSummary: string,
        x: number,
        y: number,
        sectionWidth: number,
    ): void {
        const labelTextObject = this.scene.add.text(x, y, sectionLabel, {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "14px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        const summaryTextObject = this.scene.add.text(x, y + 24, sectionSummary, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "13px",
            color: UiPalette.PARCHMENT_CSS,
            wordWrap: { width: sectionWidth, useAdvancedWrap: true },
            lineSpacing: 3,
        });
        this.add(labelTextObject);
        this.add(summaryTextObject);
    }

    private handleOptionChosen(decision: DecisionRecord, option: DecisionOption, gameState: GameState): void {
        if (this.hasDecisionBeenMade) {
            return;
        }
        this.hasDecisionBeenMade = true;
        gameState.setScenarioFlag(option.resultingFlagIdentifier);
        const resultingResourceType = ResourceType.findByResourceTypeCode(option.resultingResourceCode);
        if (resultingResourceType !== null) {
            gameState.addToResource(resultingResourceType, option.resultingResourceDelta);
        }
        if (this.confirmationTextObject !== null) {
            this.confirmationTextObject.setText(option.consequenceText);
        }
        EventBus.getInstance().publish(
            GameEventTypes.DECISION_MADE,
            new DecisionMadePayload(decision.decisionIdentifier, option.optionIdentifier),
        );
    }
}
