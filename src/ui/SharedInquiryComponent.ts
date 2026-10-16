import Phaser from "phaser";

import { EventBus, GameEventTypes, MechanicCompletedPayload } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { PrimarySource } from "../data/PrimarySource";
import { Rubrics } from "../data/Rubrics";
import type { AssessmentManager } from "../managers/AssessmentManager";
import { FontFamilies } from "../managers/FontManager";
import { StudentTextEntryField } from "./QuickwriteComponent";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class SharedInquiryComponent extends Phaser.GameObjects.Container {
    private readonly assessmentManager: AssessmentManager;
    private readonly panelWidth: number;

    private responseField: StudentTextEntryField | null = null;
    private feedbackTextObject: Phaser.GameObjects.Text | null = null;
    private hasSavedResponse: boolean = false;

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

    public setInquiryDocuments(
        leftSource: PrimarySource,
        rightSource: PrimarySource,
        scenarioNumber: number,
        gameState: GameState,
    ): void {
        if (this.responseField !== null) {
            this.responseField.destroy();
            this.responseField = null;
        }
        this.removeAll(true);
        this.feedbackTextObject = null;
        this.hasSavedResponse = false;
        const titleTextObject = UiPanelFactory.createSectionHeader(this.scene, 16, 12, "Shared Inquiry", 20);
        this.add(titleTextObject);
        const instructionTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            46,
            this.panelWidth - 32,
            "Read both excerpts below, discuss the guiding questions with a partner, " +
                "then write and save your shared inquiry response.",
            13,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(instructionTextObject);
        const sourcePanelTopY = 84;
        const sourcePanelWidth = (this.panelWidth - 40) / 2;
        const sourcePanelHeight = 196;
        this.addSourcePanel(leftSource, 16, sourcePanelTopY, sourcePanelWidth, sourcePanelHeight);
        this.addSourcePanel(rightSource, 24 + sourcePanelWidth, sourcePanelTopY, sourcePanelWidth, sourcePanelHeight);
        let cursorY = sourcePanelTopY + sourcePanelHeight + 16;
        const guidingHeaderTextObject = this.scene.add.text(16, cursorY, "Guiding Questions", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "14px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        this.add(guidingHeaderTextObject);
        cursorY += 24;
        const guidingQuestionCount = Rubrics.SHARED_INQUIRY_RUBRIC.guidingQuestions.length;
        for (let questionIndex = 0; questionIndex < guidingQuestionCount; questionIndex++) {
            const questionTextObject = UiPanelFactory.createBodyText(
                this.scene,
                16,
                cursorY,
                this.panelWidth - 32,
                questionIndex + 1 + ". " + Rubrics.SHARED_INQUIRY_RUBRIC.guidingQuestions[questionIndex],
                14,
            );
            this.add(questionTextObject);
            cursorY += questionTextObject.displayHeight + 8;
        }
        cursorY += 8;
        const responseFieldHeight = 150;
        this.responseField = new StudentTextEntryField(
            this.scene,
            16,
            cursorY,
            this.panelWidth - 32,
            responseFieldHeight,
        );
        this.add(this.responseField.getFieldContainer());
        const saveButton = UiPanelFactory.createBrassButton(
            this.scene,
            16,
            cursorY + responseFieldHeight + 12,
            220,
            40,
            "Save response",
            () => {
                this.handleSaveResponse(scenarioNumber, gameState);
            },
        );
        this.add(saveButton);
        this.feedbackTextObject = UiPanelFactory.createBodyText(
            this.scene,
            252,
            cursorY + responseFieldHeight + 22,
            this.panelWidth - 268,
            "",
            14,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(this.feedbackTextObject);
    }

    private addSourcePanel(
        source: PrimarySource,
        panelX: number,
        panelY: number,
        panelWidth: number,
        panelHeight: number,
    ): void {
        const sourcePanel = UiPanelFactory.createPanelContainer(
            this.scene,
            panelX,
            panelY,
            panelWidth,
            panelHeight,
            PanelVariant.PARCHMENT,
        );
        const sourceTitleTextObject = this.scene.add.text(10, 10, source.sourceDisplayTitle, {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "14px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            wordWrap: { width: panelWidth - 20, useAdvancedWrap: true },
        });
        const sourceMetaTextObject = this.scene.add.text(10, 38, source.authorOrOrigin + ", " + source.dateText + ".", {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "14px",
            color: UiPalette.DEEP_PARCHMENT_CSS,
            wordWrap: { width: panelWidth - 20, useAdvancedWrap: true },
        });
        const sourceExcerptTextObject = this.scene.add.text(10, 74, source.excerptText, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "12px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            wordWrap: { width: panelWidth - 20, useAdvancedWrap: true },
            lineSpacing: 3,
        });
        sourcePanel.add(sourceTitleTextObject);
        sourcePanel.add(sourceMetaTextObject);
        sourcePanel.add(sourceExcerptTextObject);
        this.add(sourcePanel);
    }

    private handleSaveResponse(scenarioNumber: number, gameState: GameState): void {
        if (this.hasSavedResponse) {
            return;
        }
        const responseText = this.responseField === null ? "" : this.responseField.getEnteredText();
        this.assessmentManager.addJournalEntry(
            scenarioNumber,
            0,
            "shared_inquiry",
            "Shared inquiry on Cardenas and Stalin",
            responseText,
        );
        gameState.setScenarioFlag("shared_inquiry_s" + scenarioNumber + "_saved");
        this.hasSavedResponse = true;
        if (this.feedbackTextObject !== null) {
            this.feedbackTextObject.setText("Your shared inquiry response has been saved to the journal.");
        }
        EventBus.getInstance().publish(
            GameEventTypes.SHARED_INQUIRY_COMPLETED,
            new MechanicCompletedPayload("shared_inquiry", scenarioNumber),
        );
    }
}
