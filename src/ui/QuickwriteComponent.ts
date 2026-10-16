import Phaser from "phaser";

import { EventBus, GameEventTypes, MechanicCompletedPayload } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { AssessmentManager } from "../managers/AssessmentManager";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class StudentTextEntryField {
    public static readonly DEFAULT_PLACEHOLDER_TEXT: string = "Click here and type your response.";

    private static ACTIVE_FOCUSED_FIELD: StudentTextEntryField | null = null;

    private readonly ownedScene: Phaser.Scene;
    private readonly placeholderText: string;
    private readonly fieldContainer: Phaser.GameObjects.Container;
    private readonly contentTextObject: Phaser.GameObjects.Text;
    private readonly focusZone: Phaser.GameObjects.Zone;
    private readonly keydownHandler: (event: KeyboardEvent) => void;

    private contentText: string;
    private isFocusedOnField: boolean;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        placeholderText: string = StudentTextEntryField.DEFAULT_PLACEHOLDER_TEXT,
    ) {
        this.ownedScene = scene;
        this.placeholderText = placeholderText;
        this.contentText = "";
        this.isFocusedOnField = false;
        const fieldGraphics = scene.add.graphics();
        fieldGraphics.fillStyle(UiPalette.PARCHMENT, 1);
        fieldGraphics.fillRect(0, 0, width, height);
        fieldGraphics.lineStyle(2, UiPalette.DEEP_BRASS, 0.9);
        fieldGraphics.strokeRect(1, 1, width - 2, height - 2);
        this.contentTextObject = scene.add.text(8, 8, "", {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "15px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            wordWrap: { width: width - 16, useAdvancedWrap: true },
            lineSpacing: 3,
        });
        this.focusZone = scene.add.zone(0, 0, width, height).setOrigin(0, 0);
        this.focusZone.setInteractive({ useHandCursor: true });
        this.focusZone.on("pointerdown", () => {
            this.focusField();
        });
        this.keydownHandler = (event: KeyboardEvent): void => {
            this.handleKeydown(event);
        };
        if (scene.input.keyboard !== null) {
            scene.input.keyboard.on("keydown", this.keydownHandler);
        }
        this.fieldContainer = scene.add.container(x, y);
        this.fieldContainer.add(fieldGraphics);
        this.fieldContainer.add(this.contentTextObject);
        this.fieldContainer.add(this.focusZone);
        this.refreshDisplayedText();
    }

    public getFieldContainer(): Phaser.GameObjects.Container {
        return this.fieldContainer;
    }

    public getEnteredText(): string {
        return this.contentText;
    }

    public setEnteredText(enteredText: string): void {
        this.contentText = enteredText;
        this.refreshDisplayedText();
    }

    public focusField(): void {
        const previouslyFocusedField = StudentTextEntryField.ACTIVE_FOCUSED_FIELD;
        if (
            previouslyFocusedField !== null &&
            previouslyFocusedField !== this &&
            previouslyFocusedField.ownedScene === this.ownedScene
        ) {
            previouslyFocusedField.isFocusedOnField = false;
            previouslyFocusedField.refreshDisplayedText();
        }
        StudentTextEntryField.ACTIVE_FOCUSED_FIELD = this;
        this.isFocusedOnField = true;
        this.refreshDisplayedText();
    }

    public destroy(): void {
        if (StudentTextEntryField.ACTIVE_FOCUSED_FIELD === this) {
            StudentTextEntryField.ACTIVE_FOCUSED_FIELD = null;
        }
        if (this.ownedScene.input.keyboard !== null) {
            this.ownedScene.input.keyboard.off("keydown", this.keydownHandler);
        }
        this.fieldContainer.destroy();
    }

    private handleKeydown(event: KeyboardEvent): void {
        if (!this.isFocusedOnField) {
            return;
        }
        if (event.key === "Backspace") {
            if (this.contentText.length > 0) {
                this.contentText = this.contentText.slice(0, -1);
                this.refreshDisplayedText();
            }
            event.preventDefault();
            return;
        }
        if (event.key.length === 1) {
            this.contentText += event.key;
            this.refreshDisplayedText();
            event.preventDefault();
        }
    }

    private refreshDisplayedText(): void {
        if (this.contentText.length === 0) {
            this.contentTextObject.setColor(UiPalette.DEEP_PARCHMENT_CSS);
            this.contentTextObject.setText(this.isFocusedOnField ? "|" : this.placeholderText);
            return;
        }
        this.contentTextObject.setColor(UiPalette.NEAR_BLACK_LEATHER_CSS);
        this.contentTextObject.setText(this.isFocusedOnField ? this.contentText + "|" : this.contentText);
    }
}

export class QuickwriteComponent extends Phaser.GameObjects.Container {
    private readonly assessmentManager: AssessmentManager;
    private readonly panelWidth: number;
    private readonly panelHeight: number;

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
        this.panelHeight = height;
        scene.add.existing(this);
        this.setSize(width, height);
    }

    public setQuickwritePrompt(promptText: string, scenarioNumber: number, gameState: GameState): void {
        this.destroyResponseField();
        this.removeAll(true);
        this.feedbackTextObject = null;
        this.hasSavedResponse = false;
        const titleTextObject = UiPanelFactory.createSectionHeader(this.scene, 16, 12, "Quickwrite");
        this.add(titleTextObject);
        const promptTextObject = UiPanelFactory.createBodyText(this.scene, 16, 52, this.panelWidth - 32, promptText);
        this.add(promptTextObject);
        const fieldTopY = 52 + promptTextObject.displayHeight + 14;
        const fieldHeight = Math.max(120, this.panelHeight - fieldTopY - 76);
        this.responseField = new StudentTextEntryField(this.scene, 16, fieldTopY, this.panelWidth - 32, fieldHeight);
        this.add(this.responseField.getFieldContainer());
        const saveButton = UiPanelFactory.createBrassButton(
            this.scene,
            16,
            fieldTopY + fieldHeight + 12,
            220,
            40,
            "Save response",
            () => {
                this.handleSaveResponse(promptText, scenarioNumber, gameState);
            },
        );
        this.add(saveButton);
        this.feedbackTextObject = UiPanelFactory.createBodyText(
            this.scene,
            252,
            fieldTopY + fieldHeight + 22,
            this.panelWidth - 268,
            "",
            14,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(this.feedbackTextObject);
    }

    private destroyResponseField(): void {
        if (this.responseField !== null) {
            this.responseField.destroy();
            this.responseField = null;
        }
    }

    private handleSaveResponse(promptText: string, scenarioNumber: number, gameState: GameState): void {
        if (this.hasSavedResponse) {
            return;
        }
        const responseText = this.responseField === null ? "" : this.responseField.getEnteredText();
        this.assessmentManager.addJournalEntry(scenarioNumber, 0, "quickwrite", promptText, responseText);
        gameState.setScenarioFlag("quickwrite_s" + scenarioNumber + "_saved");
        this.hasSavedResponse = true;
        if (this.feedbackTextObject !== null) {
            this.feedbackTextObject.setText("Your response has been saved to the journal.");
        }
        EventBus.getInstance().publish(
            GameEventTypes.QUICKWRITE_COMPLETED,
            new MechanicCompletedPayload("quickwrite", scenarioNumber),
        );
    }
}
