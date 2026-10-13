import Phaser from "phaser";

import { EventBus, GameEventTypes, MechanicCompletedPayload } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { ArgumentDefinition } from "../domain/scenarios/Scenario";
import { FontFamilies } from "../managers/FontManager";
import { StudentTextEntryField } from "./QuickwriteComponent";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class CausalArgumentBuilderComponent extends Phaser.GameObjects.Container {
    private readonly panelWidth: number;
    private readonly responseFields: StudentTextEntryField[] = [];

    private feedbackTextObject: Phaser.GameObjects.Text | null = null;
    private hasSubmittedArgument: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.panelWidth = width;
        scene.add.existing(this);
        this.setSize(width, height);
    }

    public setArgumentDefinition(definition: ArgumentDefinition, scenarioNumber: number, gameState: GameState): void {
        this.destroyResponseFields();
        this.removeAll(true);
        this.feedbackTextObject = null;
        this.hasSubmittedArgument = false;
        const titleTextObject = UiPanelFactory.createSectionHeader(this.scene, 16, 12, definition.argumentTitle, 20);
        this.add(titleTextObject);
        let cursorY = 54;
        for (const argumentPrompt of definition.argumentPrompts) {
            const promptTextObject = this.scene.add.text(16, cursorY, argumentPrompt.promptText, {
                fontFamily: FontFamilies.DISPLAY_SERIF,
                fontSize: "15px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
                wordWrap: { width: this.panelWidth - 32, useAdvancedWrap: true },
                lineSpacing: 3,
            });
            this.add(promptTextObject);
            cursorY += promptTextObject.height + 10;
            cursorY = this.addLabeledField("Thesis", cursorY);
            if (argumentPrompt.evidencePrompts.length > 0) {
                cursorY = this.addSectionLabel("Evidence", cursorY);
                for (const evidencePromptText of argumentPrompt.evidencePrompts) {
                    cursorY = this.addSupportingPrompt(evidencePromptText, cursorY);
                    cursorY = this.addLabeledField("", cursorY);
                }
            }
            if (argumentPrompt.counterargumentPrompts.length > 0) {
                cursorY = this.addSectionLabel("Counterargument", cursorY);
                for (const counterargumentPromptText of argumentPrompt.counterargumentPrompts) {
                    cursorY = this.addSupportingPrompt(counterargumentPromptText, cursorY);
                    cursorY = this.addLabeledField("", cursorY);
                }
            }
            const separatorGraphics = this.scene.add.graphics();
            separatorGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.6);
            separatorGraphics.lineBetween(16, cursorY + 6, this.panelWidth - 16, cursorY + 6);
            this.add(separatorGraphics);
            cursorY += 20;
        }
        const submitButton = UiPanelFactory.createBrassButton(
            this.scene,
            16,
            cursorY,
            220,
            40,
            "Submit argument",
            () => {
                this.handleSubmitArgument(scenarioNumber, gameState);
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

    private addSectionLabel(sectionLabel: string, cursorY: number): number {
        const sectionLabelTextObject = this.scene.add.text(16, cursorY, sectionLabel, {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "13px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        this.add(sectionLabelTextObject);
        return cursorY + 22;
    }

    private addSupportingPrompt(supportingPromptText: string, cursorY: number): number {
        const supportingPromptTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            cursorY,
            this.panelWidth - 32,
            supportingPromptText,
            13,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(supportingPromptTextObject);
        return cursorY + supportingPromptTextObject.height + 6;
    }

    private addLabeledField(labelText: string, cursorY: number): number {
        if (labelText.length > 0) {
            cursorY = this.addSectionLabel(labelText, cursorY);
        }
        const responseField = new StudentTextEntryField(this.scene, 16, cursorY, this.panelWidth - 32, 56);
        this.responseFields.push(responseField);
        this.add(responseField.getFieldContainer());
        return cursorY + 66;
    }

    private destroyResponseFields(): void {
        for (const responseField of this.responseFields) {
            responseField.destroy();
        }
        this.responseFields.length = 0;
    }

    private handleSubmitArgument(scenarioNumber: number, gameState: GameState): void {
        if (this.hasSubmittedArgument) {
            return;
        }
        let allFieldsMeetMinimumLength = true;
        for (const responseField of this.responseFields) {
            if (responseField.getEnteredText().trim().length < 15) {
                allFieldsMeetMinimumLength = false;
            }
        }
        if (!allFieldsMeetMinimumLength) {
            if (this.feedbackTextObject !== null) {
                this.feedbackTextObject.setText(
                    "Please write at least fifteen characters in every field before submitting.",
                );
            }
            return;
        }
        this.hasSubmittedArgument = true;
        gameState.setScenarioFlag("argument_s" + scenarioNumber + "_complete");
        if (this.feedbackTextObject !== null) {
            this.feedbackTextObject.setText("Your causal argument has been submitted.");
        }
        EventBus.getInstance().publish(
            GameEventTypes.ARGUMENT_COMPLETED,
            new MechanicCompletedPayload("argument", scenarioNumber),
        );
    }
}
