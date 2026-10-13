import Phaser from "phaser";

import { EventBus, GameEventTypes, MechanicCompletedPayload } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { DiscussionRubric } from "../data/Rubrics";
import type { AssessmentManager } from "../managers/AssessmentManager";
import { FontFamilies } from "../managers/FontManager";
import { StudentTextEntryField } from "./QuickwriteComponent";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class SocraticSeminarComponent extends Phaser.GameObjects.Container {
    private readonly assessmentManager: AssessmentManager;
    private readonly panelWidth: number;
    private readonly responseFields: StudentTextEntryField[] = [];

    private feedbackTextObject: Phaser.GameObjects.Text | null = null;
    private hasSavedResponses: boolean = false;

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

    public setSeminarRubric(rubric: DiscussionRubric, scenarioNumber: number, gameState: GameState): void {
        this.destroyResponseFields();
        this.removeAll(true);
        this.feedbackTextObject = null;
        this.hasSavedResponses = false;
        const titleTextObject = UiPanelFactory.createSectionHeader(this.scene, 16, 12, "Socratic Seminar", 20);
        this.add(titleTextObject);
        const descriptionTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            48,
            this.panelWidth - 32,
            rubric.descriptionText,
            14,
        );
        this.add(descriptionTextObject);
        let cursorY = 48 + descriptionTextObject.displayHeight + 14;
        for (let questionIndex = 0; questionIndex < rubric.guidingQuestions.length; questionIndex++) {
            const questionTextObject = this.scene.add.text(
                16,
                cursorY,
                questionIndex + 1 + ". " + rubric.guidingQuestions[questionIndex],
                {
                    fontFamily: FontFamilies.BODY_SERIF,
                    fontSize: "14px",
                    color: UiPalette.HIGHLIGHT_BRASS_CSS,
                    wordWrap: { width: this.panelWidth - 32, useAdvancedWrap: true },
                    lineSpacing: 3,
                },
            );
            this.add(questionTextObject);
            const fieldTopY = cursorY + questionTextObject.displayHeight + 6;
            const responseField = new StudentTextEntryField(this.scene, 16, fieldTopY, this.panelWidth - 32, 96);
            this.responseFields.push(responseField);
            this.add(responseField.getFieldContainer());
            cursorY = fieldTopY + 96 + 14;
        }
        const saveButton = UiPanelFactory.createBrassButton(
            this.scene,
            16,
            cursorY,
            260,
            40,
            "Save seminar responses",
            () => {
                this.handleSaveSeminarResponses(rubric, scenarioNumber, gameState);
            },
        );
        this.add(saveButton);
        this.feedbackTextObject = UiPanelFactory.createBodyText(
            this.scene,
            292,
            cursorY + 10,
            this.panelWidth - 308,
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

    private setFeedbackText(feedbackText: string): void {
        if (this.feedbackTextObject !== null) {
            this.feedbackTextObject.setText(feedbackText);
        }
    }

    private handleSaveSeminarResponses(rubric: DiscussionRubric, scenarioNumber: number, gameState: GameState): void {
        if (this.hasSavedResponses) {
            return;
        }
        let answeredQuestionCount = 0;
        for (const responseField of this.responseFields) {
            if (responseField.getEnteredText().trim().length > 0) {
                answeredQuestionCount += 1;
            }
        }
        if (answeredQuestionCount === 0) {
            this.setFeedbackText("Please answer at least one guiding question before saving.");
            return;
        }
        for (let questionIndex = 0; questionIndex < this.responseFields.length; questionIndex++) {
            const responseText = this.responseFields[questionIndex].getEnteredText();
            this.assessmentManager.addJournalEntry(
                scenarioNumber,
                0,
                "socratic_seminar",
                rubric.guidingQuestions[questionIndex],
                responseText,
            );
        }
        gameState.setScenarioFlag("socratic_seminar_s" + scenarioNumber + "_saved");
        this.hasSavedResponses = true;
        this.setFeedbackText("Your seminar responses have been saved to the journal.");
        EventBus.getInstance().publish(
            GameEventTypes.SOCRATIC_SEMINAR_COMPLETED,
            new MechanicCompletedPayload("socratic_seminar", scenarioNumber),
        );
    }
}
