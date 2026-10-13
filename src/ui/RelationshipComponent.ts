import Phaser from "phaser";

import { EventBus, GameEventTypes, MechanicCompletedPayload } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import { FontFamilies } from "../managers/FontManager";
import { StudentTextEntryField } from "./QuickwriteComponent";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class RelationshipComponent extends Phaser.GameObjects.Container {
    private readonly panelWidth: number;
    private readonly responseFields: StudentTextEntryField[] = [];

    private feedbackTextObject: Phaser.GameObjects.Text | null = null;
    private hasSubmittedAnalysis: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.panelWidth = width;
        scene.add.existing(this);
        this.setSize(width, height);
    }

    public setRelationshipPrompts(promptTexts: string[], scenarioNumber: number, gameState: GameState): void {
        this.destroyResponseFields();
        this.removeAll(true);
        this.feedbackTextObject = null;
        this.hasSubmittedAnalysis = false;
        const titleTextObject = UiPanelFactory.createSectionHeader(this.scene, 16, 12, "Relationship Analysis", 20);
        this.add(titleTextObject);
        const instructionTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            48,
            this.panelWidth - 32,
            "Write a response of at least fifteen characters to each prompt below.",
            13,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(instructionTextObject);
        let cursorY = 48 + instructionTextObject.displayHeight + 14;
        for (const promptText of promptTexts) {
            const promptTextObject = this.scene.add.text(16, cursorY, promptText, {
                fontFamily: FontFamilies.DISPLAY_SERIF,
                fontSize: "14px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
                wordWrap: { width: this.panelWidth - 32, useAdvancedWrap: true },
                lineSpacing: 3,
            });
            this.add(promptTextObject);
            cursorY += promptTextObject.displayHeight + 8;
            const responseField = new StudentTextEntryField(this.scene, 16, cursorY, this.panelWidth - 32, 80);
            this.responseFields.push(responseField);
            this.add(responseField.getFieldContainer());
            cursorY += 94;
        }
        const submitButton = UiPanelFactory.createBrassButton(
            this.scene,
            16,
            cursorY,
            220,
            40,
            "Submit analysis",
            () => {
                this.handleSubmitAnalysis(scenarioNumber, gameState);
            },
        );
        this.add(submitButton);
        this.feedbackTextObject = UiPanelFactory.createBodyText(
            this.scene,
            252,
            cursorY + 10,
            this.panelWidth - 268,
            "",
            14,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(this.feedbackTextObject);
    }

    private destroyResponseFields(): void {
        for (const responseField of this.responseFields) {
            responseField.destroy();
        }
        this.responseFields.length = 0;
    }

    private handleSubmitAnalysis(scenarioNumber: number, gameState: GameState): void {
        if (this.hasSubmittedAnalysis) {
            return;
        }
        let allPromptsMeetMinimumLength = true;
        for (const responseField of this.responseFields) {
            if (responseField.getEnteredText().trim().length < 15) {
                allPromptsMeetMinimumLength = false;
            }
        }
        if (!allPromptsMeetMinimumLength) {
            if (this.feedbackTextObject !== null) {
                this.feedbackTextObject.setText(
                    "Please write at least fifteen characters for every prompt before submitting.",
                );
            }
            return;
        }
        this.hasSubmittedAnalysis = true;
        gameState.setScenarioFlag("relationship_s" + scenarioNumber + "_complete");
        if (this.feedbackTextObject !== null) {
            this.feedbackTextObject.setText("Your relationship analysis has been submitted.");
        }
        EventBus.getInstance().publish(
            GameEventTypes.RELATIONSHIP_COMPLETED,
            new MechanicCompletedPayload("relationship", scenarioNumber),
        );
    }
}
