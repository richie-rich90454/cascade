import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { TeacherSettings } from "../core/TeacherSettings";
import { CED_UNIT_SEVEN_TOPICS } from "../data/CedUnitSevenCoverage";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import { AssessmentManager } from "../managers/AssessmentManager";
import { UiPalette } from "../ui/UiPalette";
import { UiPanelFactory } from "../ui/UiPanelFactory";

export class TeacherDashboardScene extends Phaser.Scene {
    private static readonly CONTENT_BASE_Y: number = 170;
    private static readonly BOTTOM_FEEDBACK_RESERVE_PX: number = 56;

    private contentContainer: Phaser.GameObjects.Container | null;
    private feedbackTextObject: Phaser.GameObjects.Text | null;
    private contentHeightPx: number;
    private scrollOffsetY: number;

    constructor() {
        super({ key: SceneKeys.TEACHER_DASHBOARD });
        this.contentContainer = null;
        this.feedbackTextObject = null;
        this.contentHeightPx = 0;
        this.scrollOffsetY = 0;
    }

    public create(): void {
        this.contentContainer = null;
        this.feedbackTextObject = null;
        this.contentHeightPx = 0;
        this.scrollOffsetY = 0;

        this.add.rectangle(0, 0, this.scale.width, this.scale.height, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        const headerTextObject = UiPanelFactory.createSectionHeader(
            this,
            this.scale.width / 2,
            20,
            "TEACHER DASHBOARD",
            28,
        );
        headerTextObject.setOrigin(0.5, 0);
        UiPanelFactory.createBrassButton(this, 24, 24, 200, 40, "BACK TO MENU", () => {
            this.scene.start(SceneKeys.MAIN_MENU);
        });
        GameSession.getInstance().getAudioManager().playMusicTrack("menu_teacher");

        this.rebuildDashboardContent();
        this.feedbackTextObject = UiPanelFactory.createTypewriterText(
            this,
            40,
            this.scale.height - 40,
            1100,
            "",
            15,
            UiPalette.BRIGHT_BRASS_CSS,
        );
        this.input.on(
            "wheel",
            (
                _pointer: Phaser.Input.Pointer,
                _currentlyOver: Phaser.GameObjects.GameObject[],
                _deltaX: number,
                deltaY: number,
                _deltaZ: number,
            ) => {
                this.handleWheelScroll(deltaY);
            },
        );
    }

    private rebuildDashboardContent(): void {
        if (this.contentContainer !== null) {
            this.contentContainer.destroy(true);
            this.contentContainer = null;
        }
        const contentContainer = this.add.container(0, TeacherDashboardScene.CONTENT_BASE_Y);
        this.contentContainer = contentContainer;
        let cursorY = 0;
        cursorY = this.buildStudentProgressSection(contentContainer, cursorY);
        cursorY = this.buildLearningProgressSection(contentContainer, cursorY);
        cursorY = this.buildExportSection(contentContainer, cursorY);
        cursorY = this.buildContentControlsSection(contentContainer, cursorY);
        cursorY = this.buildCedResourcesSection(contentContainer, cursorY);
        this.contentHeightPx = cursorY;
        this.applyScrollClamp();
    }

    private buildStudentProgressSection(contentContainer: Phaser.GameObjects.Container, startY: number): number {
        contentContainer.add(UiPanelFactory.createSectionHeader(this, 40, startY, "STUDENT PROGRESS", 22));
        let cursorY = startY + 40;
        const assessmentManager = AssessmentManager.getInstance();
        const tableGraphics = this.add.graphics();
        tableGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.8);
        contentContainer.add(tableGraphics);
        const headerLabels: string[] = ["SCENARIO", "TITLE", "STATUS", "VICTORY", "ENTRIES"];
        const columnOffsets: number[] = [0, 70, 500, 660, 830];
        const columnWrapWidths: number[] = [70, 420, 150, 160, 110];
        for (let columnIndex = 0; columnIndex < headerLabels.length; columnIndex += 1) {
            contentContainer.add(
                UiPanelFactory.createTypewriterText(
                    this,
                    40 + columnOffsets[columnIndex],
                    cursorY,
                    columnWrapWidths[columnIndex],
                    headerLabels[columnIndex],
                    13,
                ),
            );
        }
        tableGraphics.lineBetween(40, cursorY + 24, 1180, cursorY + 24);
        cursorY += 34;
        for (const registeredScenario of ScenarioRegistry.getInstance().getAllScenarios()) {
            const scenarioNumber = registeredScenario.getScenarioNumber();
            const journalEntryCount = assessmentManager.getJournalEntriesForScenario(scenarioNumber).length;
            const isCompleted = assessmentManager.isScenarioCompleted(scenarioNumber);
            const statusText = isCompleted ? "Completed" : journalEntryCount > 0 ? "In progress" : "Not started";
            const victoryText = isCompleted
                ? assessmentManager.wasScenarioCompletedWithVictory(scenarioNumber)
                    ? "Victory"
                    : "Not achieved"
                : "-";
            const rowTexts: string[] = [
                String(scenarioNumber),
                registeredScenario.getScenarioTitle(),
                statusText,
                victoryText,
                String(journalEntryCount),
            ];
            for (let columnIndex = 0; columnIndex < rowTexts.length; columnIndex += 1) {
                contentContainer.add(
                    UiPanelFactory.createTypewriterText(
                        this,
                        40 + columnOffsets[columnIndex],
                        cursorY,
                        columnWrapWidths[columnIndex],
                        rowTexts[columnIndex],
                        14,
                    ),
                );
            }
            cursorY += 24;
            tableGraphics.lineBetween(40, cursorY, 1180, cursorY);
            cursorY += 8;
        }
        cursorY += 12;
        contentContainer.add(
            UiPanelFactory.createTypewriterText(
                this,
                40,
                cursorY,
                1100,
                `Completed: ${assessmentManager.getCompletedScenarioCount()} of 10 scenarios; ` +
                    `Victories: ${assessmentManager.getVictoryCount()}.`,
            ),
        );
        return cursorY + 40;
    }

    private buildExportSection(contentContainer: Phaser.GameObjects.Container, startY: number): number {
        contentContainer.add(UiPanelFactory.createSectionHeader(this, 40, startY, "EXPORT", 22));
        const cursorY = startY + 40;
        contentContainer.add(
            UiPanelFactory.createBrassButton(this, 40, cursorY, 260, 44, "COPY FULL JOURNAL", () => {
                void this.handleCopyFullJournal();
            }),
        );
        contentContainer.add(
            UiPanelFactory.createBrassButton(this, 320, cursorY, 320, 44, "COPY ALL WORK PACKETS", () => {
                void this.handleCopyAllWorkPackets();
            }),
        );
        contentContainer.add(
            UiPanelFactory.createBrassButton(this, 660, cursorY, 320, 44, "DOWNLOAD TOPIC / SKILL CSV", () => {
                this.downloadTopicSkillSummary();
            }),
        );
        return cursorY + 76;
    }

    private downloadTopicSkillSummary(): void {
        const manager = AssessmentManager.getInstance();
        const csvRows = [
            "CED topic,topic title,learning objective,skill,scenarios,correct attempts,total attempts,accuracy percent",
        ];
        for (const topic of CED_UNIT_SEVEN_TOPICS) {
            const signal = manager.getTopicPracticeSignal(topic.topicCode);
            const values = [
                topic.topicCode,
                topic.topicTitle,
                topic.learningObjectiveCode,
                topic.suggestedSkillCode,
                topic.scenarioNumbers.join("; "),
                String(signal.correctAnswerCount),
                String(signal.attemptedQuestionCount),
                signal.getAccuracyPercentage() === null ? "" : String(signal.getAccuracyPercentage()),
            ];
            csvRows.push(values.map((value) => `"${value.replaceAll('"', '""')}"`).join(","));
        }
        const csvBlob = new Blob([`\uFEFF${csvRows.join("\n")}`], { type: "text/csv;charset=utf-8" });
        const downloadUrl = URL.createObjectURL(csvBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = "cascade-unit-7-topic-skill-progress.csv";
        downloadLink.click();
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        this.setFeedbackText("Topic and skill summary downloaded as CSV.");
    }

    private buildLearningProgressSection(contentContainer: Phaser.GameObjects.Container, startY: number): number {
        contentContainer.add(UiPanelFactory.createSectionHeader(this, 40, startY, "UNIT 7 LEARNING PROGRESS", 22));
        const manager = GameSession.getInstance().getAssessmentManager();
        let cursorY = startY + 36;
        const helperText = UiPanelFactory.createBodyText(
            this,
            40,
            cursorY,
            1100,
            "Use these practice signals to choose review topics. A correct-answer rate is formative evidence, not a prediction of AP exam performance.",
            14,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        contentContainer.add(helperText);
        cursorY += helperText.displayHeight + 14;

        contentContainer.add(
            UiPanelFactory.createTypewriterText(
                this,
                40,
                cursorY,
                1100,
                "TOPIC / LEARNING OBJECTIVE                                      SCENARIO(S)      PRACTICE SIGNAL",
                13,
                UiPalette.HIGHLIGHT_BRASS_CSS,
            ),
        );
        cursorY += 28;
        for (const topic of CED_UNIT_SEVEN_TOPICS) {
            const signal = manager.getTopicPracticeSignal(topic.topicCode);
            const accuracy = signal.getAccuracyPercentage();
            const accuracyText =
                accuracy === null
                    ? "No attempts yet"
                    : `${signal.correctAnswerCount}/${signal.attemptedQuestionCount} correct (${accuracy}%)`;
            const scenarioText = topic.scenarioNumbers.map((number) => `S${number}`).join(", ");
            contentContainer.add(
                UiPanelFactory.createTypewriterText(
                    this,
                    40,
                    cursorY,
                    1100,
                    `${topic.topicCode} ${topic.topicTitle} · LO ${topic.learningObjectiveCode} · Skill ${topic.suggestedSkillCode}     ${scenarioText}     ${accuracyText}`,
                    14,
                    accuracy !== null && accuracy < 60 ? UiPalette.BRIGHT_BLOOD_CSS : UiPalette.PARCHMENT_CSS,
                ),
            );
            cursorY += 27;
        }
        return cursorY + 28;
    }

    private async handleCopyFullJournal(): Promise<void> {
        const journalExportText = AssessmentManager.getInstance().exportJournalAsPlainText();
        await this.copyTextToClipboard(journalExportText, "Journal copied to the clipboard.");
    }

    private async handleCopyAllWorkPackets(): Promise<void> {
        const workPacketExportTexts: string[] = [];
        for (let scenarioNumber = 1; scenarioNumber <= 10; scenarioNumber += 1) {
            if (AssessmentManager.getInstance().isScenarioCompleted(scenarioNumber)) {
                workPacketExportTexts.push(AssessmentManager.getInstance().exportWorkPacketForScenario(scenarioNumber));
            }
        }
        await this.copyTextToClipboard(workPacketExportTexts.join("\n\n"), "Work packets copied to the clipboard.");
    }

    private async copyTextToClipboard(exportText: string, successMessage: string): Promise<void> {
        try {
            await navigator.clipboard.writeText(exportText);
            this.setFeedbackText(successMessage);
        } catch {
            this.setFeedbackText("Copy failed. Use the journal download or copy the text manually.");
        }
    }

    private buildContentControlsSection(contentContainer: Phaser.GameObjects.Container, startY: number): number {
        contentContainer.add(UiPanelFactory.createSectionHeader(this, 40, startY, "CONTENT CONTROLS", 22));
        let cursorY = startY + 40;
        contentContainer.add(
            UiPanelFactory.createTypewriterText(
                this,
                40,
                cursorY,
                1100,
                "Scenario 9 documents mass atrocities; review the advisory before enabling.",
                15,
                UiPalette.BRIGHT_BLOOD_CSS,
            ),
        );
        cursorY += 32;
        for (let scenarioNumber = 1; scenarioNumber <= 10; scenarioNumber += 1) {
            const columnIndex = (scenarioNumber - 1) % 2;
            const rowIndex = Math.floor((scenarioNumber - 1) / 2);
            const toggleX = 40 + columnIndex * 400;
            const toggleY = cursorY + rowIndex * 48;
            const isEnabled = TeacherSettings.getInstance().isScenarioEnabled(scenarioNumber);
            contentContainer.add(
                UiPanelFactory.createBrassButton(
                    this,
                    toggleX,
                    toggleY,
                    380,
                    40,
                    `SCENARIO ${scenarioNumber}: ${isEnabled ? "ENABLED" : "DISABLED"}`,
                    () => {
                        TeacherSettings.getInstance().setScenarioEnabled(
                            scenarioNumber,
                            !TeacherSettings.getInstance().isScenarioEnabled(scenarioNumber),
                        );
                        this.rebuildDashboardContent();
                    },
                ),
            );
        }
        cursorY += 5 * 48 + 12;
        const isScenarioNineRequired = TeacherSettings.getInstance().isScenarioNineRequiredBeforeTen();
        contentContainer.add(
            UiPanelFactory.createBrassButton(
                this,
                40,
                cursorY,
                520,
                44,
                `REQUIRE SCENARIO 9 BEFORE SCENARIO 10: ${isScenarioNineRequired ? "ON" : "OFF"}`,
                () => {
                    TeacherSettings.getInstance().setScenarioNineRequiredBeforeTen(
                        !TeacherSettings.getInstance().isScenarioNineRequiredBeforeTen(),
                    );
                    this.rebuildDashboardContent();
                },
            ),
        );
        cursorY += 60;
        contentContainer.add(
            UiPanelFactory.createBrassButton(this, 40, cursorY, 220, 44, "FULL DETAIL", () => {
                TeacherSettings.getInstance().setContentDetailLevel("full");
                this.rebuildDashboardContent();
            }),
        );
        contentContainer.add(
            UiPanelFactory.createBrassButton(this, 280, cursorY, 260, 44, "SUMMARY DETAIL", () => {
                TeacherSettings.getInstance().setContentDetailLevel("summary");
                this.rebuildDashboardContent();
            }),
        );
        cursorY += 60;
        contentContainer.add(
            UiPanelFactory.createTypewriterText(
                this,
                40,
                cursorY,
                1100,
                `Current detail level: ${TeacherSettings.getInstance().getContentDetailLevel()}`,
            ),
        );
        cursorY += 40;
        const resetButtonContainer = UiPanelFactory.createBrassButton(
            this,
            40,
            cursorY,
            300,
            44,
            "RESET ALL SETTINGS",
            () => {
                TeacherSettings.getInstance().resetAllSettings();
                this.setFeedbackText("All teacher settings have been reset to their defaults.");
                this.rebuildDashboardContent();
            },
        );
        const resetTintRectangle = this.add.rectangle(0, 0, 300, 44, UiPalette.BLOOD_RED, 0.55).setOrigin(0, 0);
        resetButtonContainer.addAt(resetTintRectangle, 1);
        contentContainer.add(resetButtonContainer);
        return cursorY + 64;
    }

    private buildCedResourcesSection(contentContainer: Phaser.GameObjects.Container, startY: number): number {
        contentContainer.add(UiPanelFactory.createSectionHeader(this, 40, startY, "CED RESOURCES", 22));
        let cursorY = startY + 40;
        const resourceTextObject = UiPanelFactory.createBodyText(
            this,
            40,
            cursorY,
            1100,
            "Professional Development > Teaching and Assessing Module - Understanding Continuity and Change " +
                "in Period 6 (resources on the decline of empires in the twentieth century).",
        );
        contentContainer.add(resourceTextObject);
        cursorY += resourceTextObject.displayHeight + 12;
        const weightingTextObject = UiPanelFactory.createBodyText(
            this,
            40,
            cursorY,
            1100,
            "This unit represents 8-10% of your AP Exam score.",
        );
        contentContainer.add(weightingTextObject);
        return cursorY + weightingTextObject.displayHeight + 24;
    }

    private handleWheelScroll(deltaY: number): void {
        if (this.contentContainer === null) {
            return;
        }
        this.scrollOffsetY -= deltaY * 0.5;
        this.applyScrollClamp();
    }

    private applyScrollClamp(): void {
        if (this.contentContainer === null) {
            return;
        }
        const availableHeightPx =
            this.scale.height - TeacherDashboardScene.CONTENT_BASE_Y - TeacherDashboardScene.BOTTOM_FEEDBACK_RESERVE_PX;
        const minimumOffsetY = Math.min(0, availableHeightPx - this.contentHeightPx);
        this.scrollOffsetY = Phaser.Math.Clamp(this.scrollOffsetY, minimumOffsetY, 0);
        this.contentContainer.setY(TeacherDashboardScene.CONTENT_BASE_Y + this.scrollOffsetY);
    }

    private setFeedbackText(feedbackText: string): void {
        if (this.feedbackTextObject !== null) {
            this.feedbackTextObject.setText(feedbackText);
        }
    }
}
