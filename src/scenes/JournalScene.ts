import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { AssessmentManager } from "../managers/AssessmentManager";
import { JournalEntryComponent } from "../ui/JournalEntryComponent";
import { StudentTextEntryField } from "../ui/QuickwriteComponent";
import { UiPalette } from "../ui/UiPalette";
import { UiPanelFactory } from "../ui/UiPanelFactory";

export class JournalScene extends Phaser.Scene {
    private getJournalListWidth(): number {
        return Math.min(520, Math.round(this.scale.width * 0.42));
    }

    private getReflectionColumnX(): number {
        return Math.max(480, Math.round(this.scale.width * 0.46));
    }

    private getReflectionColumnWidth(): number {
        return Math.max(320, this.scale.width - this.getReflectionColumnX() - 40);
    }

    private static readonly JOURNAL_LIST_X: number = 40;
    private static readonly JOURNAL_LIST_BASE_Y: number = 150;

    private static readonly REFLECTION_FIELD_HEIGHT: number = 64;
    private static readonly MAXIMUM_DISPLAYED_ENTRY_COUNT: number = 6;
    private static readonly ENTRY_SPACING_PX: number = 16;

    private journalListContainer: Phaser.GameObjects.Container | null;
    private reflectionFeedbackTextObject: Phaser.GameObjects.Text | null;
    private exportFeedbackTextObject: Phaser.GameObjects.Text | null;
    private reflectionFields: StudentTextEntryField[];
    private reflectionPrompts: string[];
    private listScrollOffsetY: number;
    private listContentHeightPx: number;

    constructor() {
        super({ key: SceneKeys.JOURNAL });
        this.journalListContainer = null;
        this.reflectionFeedbackTextObject = null;
        this.exportFeedbackTextObject = null;
        this.reflectionFields = [];
        this.reflectionPrompts = [];
        this.listScrollOffsetY = 0;
        this.listContentHeightPx = 0;
    }

    public create(): void {
        this.journalListContainer = null;
        this.reflectionFeedbackTextObject = null;
        this.exportFeedbackTextObject = null;
        this.reflectionFields = [];
        this.reflectionPrompts = [];
        this.listScrollOffsetY = 0;
        this.listContentHeightPx = 0;

        this.add.rectangle(0, 0, this.scale.width, this.scale.height, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        const headerTextObject = UiPanelFactory.createSectionHeader(this, this.scale.width / 2, 20, "JOURNAL", 28);
        headerTextObject.setOrigin(0.5, 0);
        UiPanelFactory.createBrassButton(this, 24, 24, 200, 40, "BACK TO MENU", () => {
            this.scene.start(SceneKeys.MAIN_MENU);
        });
        GameSession.getInstance().getAudioManager().playMusicTrack("menu_journal");

        this.buildJournalList();
        this.buildReflectionColumn();
        this.buildExportControls();
        this.input.on(
            "wheel",
            (
                _pointer: Phaser.Input.Pointer,
                _currentlyOver: Phaser.GameObjects.GameObject[],
                _deltaX: number,
                deltaY: number,
                _deltaZ: number,
            ) => {
                this.handleListScroll(deltaY);
            },
        );
    }

    private buildJournalList(): void {
        if (this.journalListContainer !== null) {
            this.journalListContainer.destroy(true);
            this.journalListContainer = null;
        }
        const listContainer = this.add.container(JournalScene.JOURNAL_LIST_X, JournalScene.JOURNAL_LIST_BASE_Y);
        this.journalListContainer = listContainer;
        const journalEntries = AssessmentManager.getInstance().getJournalEntries();
        if (journalEntries.length === 0) {
            this.listContentHeightPx = 0;
            listContainer.add(
                UiPanelFactory.createBodyText(
                    this,
                    0,
                    0,
                    this.getJournalListWidth(),
                    "No journal entries yet. Responses you save in scenarios will appear here.",
                ),
            );
            return;
        }
        if (journalEntries.length > JournalScene.MAXIMUM_DISPLAYED_ENTRY_COUNT) {
            listContainer.add(
                UiPanelFactory.createTypewriterText(
                    this,
                    0,
                    -46,
                    this.getJournalListWidth(),
                    "(showing the 6 most recent entries; export for the full record)",
                ),
            );
        }
        const visibleJournalEntries =
            journalEntries.length > JournalScene.MAXIMUM_DISPLAYED_ENTRY_COUNT
                ? journalEntries.slice(journalEntries.length - JournalScene.MAXIMUM_DISPLAYED_ENTRY_COUNT)
                : journalEntries;
        let cursorY = 0;
        for (const journalEntry of visibleJournalEntries) {
            const entryComponent = new JournalEntryComponent(this, 0, cursorY, this.getJournalListWidth());
            entryComponent.setJournalEntry(journalEntry);
            listContainer.add(entryComponent);
            cursorY += this.getRenderedEntryHeightPx(entryComponent) + JournalScene.ENTRY_SPACING_PX;
        }
        this.listContentHeightPx = cursorY;
        this.applyListScrollClamp();
    }

    private getRenderedEntryHeightPx(entryComponent: JournalEntryComponent): number {
        const innerContentContainer = entryComponent.getAt(0) as Phaser.GameObjects.Container;
        const panelContainer = innerContentContainer.getAt(0) as Phaser.GameObjects.Container;
        return panelContainer.height;
    }

    private handleListScroll(deltaY: number): void {
        this.listScrollOffsetY -= deltaY * 0.5;
        this.applyListScrollClamp();
    }

    private applyListScrollClamp(): void {
        if (this.journalListContainer === null) {
            return;
        }
        const availableHeightPx = this.scale.height - JournalScene.JOURNAL_LIST_BASE_Y - 24;
        const minimumOffsetY = Math.min(0, availableHeightPx - this.listContentHeightPx);
        this.listScrollOffsetY = Phaser.Math.Clamp(this.listScrollOffsetY, minimumOffsetY, 0);
        this.journalListContainer.setY(JournalScene.JOURNAL_LIST_BASE_Y + this.listScrollOffsetY);
    }

    private buildReflectionColumn(): void {
        UiPanelFactory.createSectionHeader(this, this.getReflectionColumnX(), 96, "REFLECTION", 20);
        const currentScenario = GameSession.getInstance().getCurrentScenario();
        if (currentScenario === null) {
            UiPanelFactory.createBodyText(
                this,
                this.getReflectionColumnX(),
                140,
                this.getReflectionColumnWidth(),
                "Start a scenario to write reflections.",
            );
            return;
        }
        let cursorY = 140;
        for (const journalPromptText of currentScenario.getJournalPrompts()) {
            const promptTextObject = UiPanelFactory.createBodyText(
                this,
                this.getReflectionColumnX(),
                cursorY,
                this.getReflectionColumnWidth(),
                journalPromptText,
            );
            cursorY += promptTextObject.displayHeight + 8;
            const reflectionField = new StudentTextEntryField(
                this,
                this.getReflectionColumnX(),
                cursorY,
                this.getReflectionColumnWidth(),
                JournalScene.REFLECTION_FIELD_HEIGHT,
            );
            this.reflectionFields.push(reflectionField);
            this.reflectionPrompts.push(journalPromptText);
            cursorY += JournalScene.REFLECTION_FIELD_HEIGHT + 18;
        }
        UiPanelFactory.createBrassButton(
            this,
            this.getReflectionColumnX(),
            cursorY,
            280,
            44,
            "SAVE REFLECTIONS",
            () => {
                this.handleSaveReflections();
            },
        );
        cursorY += 58;
        this.reflectionFeedbackTextObject = UiPanelFactory.createTypewriterText(
            this,
            this.getReflectionColumnX(),
            cursorY,
            this.getReflectionColumnWidth(),
            "",
        );
    }

    private handleSaveReflections(): void {
        const gameSession = GameSession.getInstance();
        const currentScenario = gameSession.getCurrentScenario();
        if (currentScenario === null) {
            return;
        }
        let savedEntryCount = 0;
        for (let reflectionIndex = 0; reflectionIndex < this.reflectionFields.length; reflectionIndex += 1) {
            const responseText = this.reflectionFields[reflectionIndex].getEnteredText().trim();
            if (responseText.length === 0) {
                continue;
            }
            AssessmentManager.getInstance().addJournalEntry(
                currentScenario.getScenarioNumber(),
                gameSession.getCurrentTurnNumber(),
                "journal",
                this.reflectionPrompts[reflectionIndex],
                responseText,
            );
            this.reflectionFields[reflectionIndex].setEnteredText("");
            savedEntryCount += 1;
        }
        if (this.reflectionFeedbackTextObject !== null) {
            if (savedEntryCount === 1) {
                this.reflectionFeedbackTextObject.setText("1 reflection saved to the journal.");
            } else if (savedEntryCount > 1) {
                this.reflectionFeedbackTextObject.setText(`${savedEntryCount} reflections saved to the journal.`);
            } else {
                this.reflectionFeedbackTextObject.setText("Write a reflection before saving.");
            }
        }
        this.buildJournalList();
    }

    private buildExportControls(): void {
        const exportButtonY = this.scale.height - 64;
        UiPanelFactory.createBrassButton(
            this,
            this.getReflectionColumnX(),
            exportButtonY,
            240,
            44,
            "EXPORT JOURNAL",
            () => {
                void this.handleExportJournal();
            },
        );
        UiPanelFactory.createBrassButton(
            this,
            this.getReflectionColumnX() + 260,
            exportButtonY,
            240,
            44,
            "DOWNLOAD AS FILE",
            () => {
                this.handleDownloadJournal();
            },
        );
        this.exportFeedbackTextObject = UiPanelFactory.createTypewriterText(
            this,
            this.getReflectionColumnX(),
            exportButtonY - 30,
            this.getReflectionColumnWidth(),
            "",
        );
    }

    private async handleExportJournal(): Promise<void> {
        const exportText = AssessmentManager.getInstance().exportJournalAsPlainText();
        try {
            await navigator.clipboard.writeText(exportText);
            this.setExportFeedbackText("Journal copied to the clipboard.");
        } catch {
            this.setExportFeedbackText("Could not copy the journal to the clipboard. Use DOWNLOAD AS FILE instead.");
        }
    }

    private handleDownloadJournal(): void {
        const exportText = AssessmentManager.getInstance().exportJournalAsPlainText();
        const journalBlob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
        const objectUrl = URL.createObjectURL(journalBlob);
        const downloadAnchor = document.createElement("a");
        downloadAnchor.href = objectUrl;
        downloadAnchor.download = "cascade-journal.txt";
        downloadAnchor.click();
        URL.revokeObjectURL(objectUrl);
        this.setExportFeedbackText("Journal downloaded as cascade-journal.txt.");
    }

    private setExportFeedbackText(feedbackText: string): void {
        if (this.exportFeedbackTextObject !== null) {
            this.exportFeedbackTextObject.setText(feedbackText);
        }
    }
}
