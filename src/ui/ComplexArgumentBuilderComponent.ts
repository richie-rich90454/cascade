import Phaser from "phaser";

import { EventBus, GameEventTypes, MechanicCompletedPayload } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { ComplexArgumentRubric } from "../data/Rubrics";
import type { AssessmentManager } from "../managers/AssessmentManager";
import { FontFamilies } from "../managers/FontManager";
import { StudentTextEntryField } from "./QuickwriteComponent";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class ComplexArgumentBuilderComponent extends Phaser.GameObjects.Container {
    private readonly assessmentManager: AssessmentManager;
    private readonly panelWidth: number;
    private readonly responseFields: StudentTextEntryField[] = [];

    private feedbackTextObject: Phaser.GameObjects.Text | null = null;
    private hasSubmittedArgument: boolean = false;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        assessmentManager: AssessmentManager,
    ) {
        super(scene, x, y);
        this.assessmentManager = assessmentManager;
        this.panelWidth = width;
        scene.add.existing(this);
        this.setSize(width, height);
    }

    public setComplexArgumentPrompt(
        rubric: ComplexArgumentRubric,
        promptText: string,
        scenarioNumber: number,
        gameState: GameState,
    ): void {
        this.destroyResponseFields();
        this.removeAll(true);
        this.feedbackTextObject = null;
        this.hasSubmittedArgument = false;
        const titleTextObject = UiPanelFactory.createSectionHeader(this.scene, 16, 12, "Complex Argument", 20);
        this.add(titleTextObject);
        const rubricDescriptionTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            46,
            this.panelWidth - 32,
            rubric.descriptionText,
            13,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(rubricDescriptionTextObject);
        let cursorY = 46 + rubricDescriptionTextObject.height + 12;
        const promptTextObject = this.scene.add.text(16, cursorY, promptText, {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "15px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
            wordWrap: { width: this.panelWidth - 32, useAdvancedWrap: true },
            lineSpacing: 3,
        });
        this.add(promptTextObject);
        cursorY += promptTextObject.height + 12;
        for (let criterionIndex = 0; criterionIndex < rubric.criteria.length; criterionIndex++) {
            const criterionTextObject = this.scene.add.text(
                16,
                cursorY,
                criterionIndex + 1 + ". " + rubric.criteria[criterionIndex],
                {
                    fontFamily: FontFamilies.SMALL_CAPS,
                    fontSize: "13px",
                    color: UiPalette.HIGHLIGHT_BRASS_CSS,
                    wordWrap: { width: this.panelWidth - 32, useAdvancedWrap: true },
                    lineSpacing: 3,
                },
            );
            this.add(criterionTextObject);
            cursorY += criterionTextObject.height + 6;
            const responseField = new StudentTextEntryField(this.scene, 16, cursorY, this.panelWidth - 32, 70);
            this.responseFields.push(responseField);
            this.add(responseField.getFieldContainer());
            cursorY += 80;
        }
        const submitButton = UiPanelFactory.createBrassButton(
            this.scene,
            16,
            cursorY,
            220,
            40,
            "Submit argument",
            () => {
                this.handleSubmitArgument(rubric, promptText, scenarioNumber, gameState);
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

    private handleSubmitArgument(
        rubric: ComplexArgumentRubric,
        promptText: string,
        scenarioNumber: number,
        gameState: GameState,
    ): void {
        if (this.hasSubmittedArgument) {
            return;
        }
        let allSectionsMeetMinimumLength = true;
        for (const responseField of this.responseFields) {
            if (responseField.getEnteredText().trim().length < 15) {
                allSectionsMeetMinimumLength = false;
            }
        }
        if (!allSectionsMeetMinimumLength) {
            if (this.feedbackTextObject !== null) {
                this.feedbackTextObject.setText(
                    "Please write at least fifteen characters in every section before submitting.",
                );
            }
            return;
        }
        const combinedResponseLines: string[] = [];
        for (let criterionIndex = 0; criterionIndex < rubric.criteria.length; criterionIndex++) {
            combinedResponseLines.push(rubric.criteria[criterionIndex]);
            combinedResponseLines.push(this.responseFields[criterionIndex].getEnteredText());
            combinedResponseLines.push("");
        }
        this.assessmentManager.addJournalEntry(
            scenarioNumber,
            0,
            "complex_argument",
            promptText,
            combinedResponseLines.join("\n"),
        );
        this.hasSubmittedArgument = true;
        gameState.setScenarioFlag("argument_s" + scenarioNumber + "_complete");
        if (this.feedbackTextObject !== null) {
            this.feedbackTextObject.setText("Your complex argument has been saved to the journal.");
        }
        EventBus.getInstance().publish(
            GameEventTypes.ARGUMENT_COMPLETED,
            new MechanicCompletedPayload("complex_argument", scenarioNumber),
        );
    }
}
