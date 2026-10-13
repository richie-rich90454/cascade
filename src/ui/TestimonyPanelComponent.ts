import Phaser from "phaser";

import { EventBus, GameEventTypes, MechanicCompletedPayload } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { TestimonyRecord } from "../domain/scenarios/Scenario";
import { AssessmentManager } from "../managers/AssessmentManager";
import { FontFamilies } from "../managers/FontManager";
import { StudentTextEntryField } from "./QuickwriteComponent";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class TestimonyPanelComponent extends Phaser.GameObjects.Container {
    private readonly panelWidth: number;
    private readonly panelHeight: number;

    private records: TestimonyRecord[] = [];
    private readonly responseTextsByRecordIndex: string[] = [];
    private readonly savedResponseByRecordIndex: boolean[] = [];
    private currentPageIndex: number = 0;
    private responseField: StudentTextEntryField | null = null;
    private feedbackTextObject: Phaser.GameObjects.Text | null = null;
    private hasPublishedCompletion: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.panelWidth = width;
        this.panelHeight = height;
        scene.add.existing(this);
        this.setSize(width, height);
    }

    public setTestimonyRecords(records: TestimonyRecord[], scenarioNumber: number, gameState: GameState): void {
        this.destroyResponseField();
        this.removeAll(true);
        this.feedbackTextObject = null;
        this.records = [...records];
        this.responseTextsByRecordIndex.length = 0;
        this.savedResponseByRecordIndex.length = 0;
        for (let recordIndex = 0; recordIndex < this.records.length; recordIndex++) {
            this.responseTextsByRecordIndex.push("");
            this.savedResponseByRecordIndex.push(false);
        }
        this.currentPageIndex = 0;
        this.hasPublishedCompletion = false;
        this.buildCurrentPage(scenarioNumber, gameState);
    }

    private buildCurrentPage(scenarioNumber: number, gameState: GameState): void {
        this.destroyResponseField();
        this.removeAll(true);
        this.feedbackTextObject = null;
        if (this.records.length === 0) {
            const emptyTextObject = UiPanelFactory.createBodyText(
                this.scene,
                16,
                56,
                this.panelWidth - 32,
                "No testimony records are available.",
                14,
                UiPalette.AGED_PARCHMENT_CSS,
            );
            this.add(emptyTextObject);
            return;
        }
        const currentRecord = this.records[this.currentPageIndex];
        const titleTextObject = UiPanelFactory.createSectionHeader(this.scene, 16, 12, "Testimony", 20);
        this.add(titleTextObject);
        const accentLineGraphics = this.scene.add.graphics();
        accentLineGraphics.lineStyle(2, UiPalette.BLOOD_RED, 0.9);
        accentLineGraphics.lineBetween(16, 44, this.panelWidth - 16, 44);
        this.add(accentLineGraphics);
        const pageIndicatorTextObject = this.scene.add.text(
            16,
            54,
            "Testimony " + (this.currentPageIndex + 1) + " of " + this.records.length,
            {
                fontFamily: FontFamilies.SMALL_CAPS,
                fontSize: "13px",
                color: UiPalette.AGED_PARCHMENT_CSS,
            },
        );
        this.add(pageIndicatorTextObject);
        const recordTitleTextObject = this.scene.add.text(16, 80, currentRecord.testimonyTitle, {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "16px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
            wordWrap: { width: this.panelWidth - 32, useAdvancedWrap: true },
        });
        this.add(recordTitleTextObject);
        const frameTopY = recordTitleTextObject.y + recordTitleTextObject.height + 10;
        const testimonyTextObject = this.scene.add.text(26, frameTopY + 12, currentRecord.testimonySourceText, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontStyle: "italic",
            fontSize: "14px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            wordWrap: { width: this.panelWidth - 52, useAdvancedWrap: true },
            lineSpacing: 3,
        });
        const frameGraphics = this.scene.add.graphics();
        frameGraphics.fillStyle(UiPalette.PARCHMENT, 1);
        frameGraphics.fillRect(16, frameTopY, this.panelWidth - 32, testimonyTextObject.height + 24);
        frameGraphics.lineStyle(2, UiPalette.DEEP_BRASS, 0.9);
        frameGraphics.strokeRect(17, frameTopY + 1, this.panelWidth - 34, testimonyTextObject.height + 22);
        this.add(frameGraphics);
        this.add(testimonyTextObject);
        const promptTopY = frameTopY + testimonyTextObject.height + 34;
        const reflectionPromptTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            promptTopY,
            this.panelWidth - 32,
            currentRecord.reflectionPrompt,
            14,
            UiPalette.HIGHLIGHT_BRASS_CSS,
        );
        this.add(reflectionPromptTextObject);
        const fieldTopY = promptTopY + reflectionPromptTextObject.height + 10;
        const fieldHeight = Math.max(80, this.panelHeight - fieldTopY - 110);
        this.responseField = new StudentTextEntryField(this.scene, 16, fieldTopY, this.panelWidth - 32, fieldHeight);
        this.responseField.setEnteredText(this.responseTextsByRecordIndex[this.currentPageIndex]);
        this.add(this.responseField.getFieldContainer());
        const buttonTopY = this.panelHeight - 48;
        const previousButton = UiPanelFactory.createBrassButton(this.scene, 16, buttonTopY, 120, 36, "Previous", () => {
            this.handlePageChange(-1, scenarioNumber, gameState);
        });
        const nextButton = UiPanelFactory.createBrassButton(this.scene, 148, buttonTopY, 120, 36, "Next", () => {
            this.handlePageChange(1, scenarioNumber, gameState);
        });
        const saveButton = UiPanelFactory.createBrassButton(
            this.scene,
            280,
            buttonTopY,
            200,
            36,
            "Save reflection",
            () => {
                this.handleSaveReflection(scenarioNumber, gameState);
            },
        );
        this.add(previousButton);
        this.add(nextButton);
        this.add(saveButton);
        this.feedbackTextObject = UiPanelFactory.createBodyText(
            this.scene,
            492,
            buttonTopY + 8,
            Math.max(80, this.panelWidth - 508),
            "",
            13,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(this.feedbackTextObject);
        if (this.savedResponseByRecordIndex[this.currentPageIndex]) {
            this.feedbackTextObject.setText("This reflection has already been saved.");
        }
    }

    private destroyResponseField(): void {
        if (this.responseField !== null) {
            this.responseField.destroy();
            this.responseField = null;
        }
    }

    private handlePageChange(pageDelta: number, scenarioNumber: number, gameState: GameState): void {
        if (this.responseField !== null) {
            this.responseTextsByRecordIndex[this.currentPageIndex] = this.responseField.getEnteredText();
        }
        const requestedPageIndex = this.currentPageIndex + pageDelta;
        if (requestedPageIndex < 0 || requestedPageIndex >= this.records.length) {
            return;
        }
        this.currentPageIndex = requestedPageIndex;
        this.buildCurrentPage(scenarioNumber, gameState);
    }

    private handleSaveReflection(scenarioNumber: number, gameState: GameState): void {
        if (this.records.length === 0) {
            return;
        }
        const responseText = this.responseField === null ? "" : this.responseField.getEnteredText();
        if (responseText.trim().length === 0) {
            if (this.feedbackTextObject !== null) {
                this.feedbackTextObject.setText("Please write a reflection before saving it to the journal.");
            }
            return;
        }
        const currentRecord = this.records[this.currentPageIndex];
        this.responseTextsByRecordIndex[this.currentPageIndex] = responseText;
        this.savedResponseByRecordIndex[this.currentPageIndex] = true;
        AssessmentManager.getInstance().addJournalEntry(
            scenarioNumber,
            0,
            "testimony",
            currentRecord.reflectionPrompt,
            responseText,
        );
        if (this.feedbackTextObject !== null) {
            this.feedbackTextObject.setText("Your reflection has been saved to the journal.");
        }
        let hasSavedEveryReflection = true;
        for (const hasSavedResponse of this.savedResponseByRecordIndex) {
            if (!hasSavedResponse) {
                hasSavedEveryReflection = false;
            }
        }
        if (!hasSavedEveryReflection || this.hasPublishedCompletion) {
            return;
        }
        this.hasPublishedCompletion = true;
        gameState.setScenarioFlag("testimony_s" + scenarioNumber + "_saved");
        EventBus.getInstance().publish(
            GameEventTypes.MECHANIC_COMPLETED,
            new MechanicCompletedPayload("testimony", scenarioNumber),
        );
    }
}
