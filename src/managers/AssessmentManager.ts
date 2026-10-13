import { EventBus, GameEventTypes } from "../core/EventBus";
import type { ShortAnswerRubricItem } from "../data/Rubrics";
import { Rubrics } from "../data/Rubrics";

export class JournalEntry {
    public readonly entryIdentifier: string;
    public readonly scenarioNumber: number;
    public readonly turnNumber: number;
    public readonly entryCategory: string;
    public readonly promptText: string;
    public readonly responseText: string;
    public readonly recordedAtIsoTimestamp: string;

    constructor(
        entryIdentifier: string,
        scenarioNumber: number,
        turnNumber: number,
        entryCategory: string,
        promptText: string,
        responseText: string,
        recordedAtIsoTimestamp: string,
    ) {
        this.entryIdentifier = entryIdentifier;
        this.scenarioNumber = scenarioNumber;
        this.turnNumber = turnNumber;
        this.entryCategory = entryCategory;
        this.promptText = promptText;
        this.responseText = responseText;
        this.recordedAtIsoTimestamp = recordedAtIsoTimestamp;
    }
}

export class ScenarioAssessmentSummary {
    public readonly scenarioNumber: number;
    public readonly shortAnswerPointsEarned: number;
    public readonly shortAnswerPointsPossible: number;
    public readonly journalEntryCount: number;
    public readonly wasVictory: boolean;

    constructor(
        scenarioNumber: number,
        shortAnswerPointsEarned: number,
        shortAnswerPointsPossible: number,
        journalEntryCount: number,
        wasVictory: boolean,
    ) {
        this.scenarioNumber = scenarioNumber;
        this.shortAnswerPointsEarned = shortAnswerPointsEarned;
        this.shortAnswerPointsPossible = shortAnswerPointsPossible;
        this.journalEntryCount = journalEntryCount;
        this.wasVictory = wasVictory;
    }

    public getCompletionPercentage(): number {
        if (this.shortAnswerPointsPossible === 0) {
            return 0;
        }
        return Math.round((this.shortAnswerPointsEarned / this.shortAnswerPointsPossible) * 100);
    }
}

export class AssessmentManager {
    private static readonly SINGLETON_INSTANCE = new AssessmentManager();

    private readonly journalEntries: JournalEntry[];
    private readonly latestVictoryFlagsByScenarioNumber: Map<number, boolean>;

    private constructor() {
        this.journalEntries = [];
        this.latestVictoryFlagsByScenarioNumber = new Map<number, boolean>();
    }

    public static getInstance(): AssessmentManager {
        return AssessmentManager.SINGLETON_INSTANCE;
    }

    public addJournalEntry(
        scenarioNumber: number,
        turnNumber: number,
        entryCategory: string,
        promptText: string,
        responseText: string,
    ): JournalEntry {
        const journalEntry = new JournalEntry(
            `journal_${this.journalEntries.length + 1}`,
            scenarioNumber,
            turnNumber,
            entryCategory,
            promptText,
            responseText,
            new Date().toISOString(),
        );
        this.journalEntries.push(journalEntry);
        EventBus.getInstance().publish(GameEventTypes.JOURNAL_UPDATED, { scenarioNumber, entryCategory });
        return journalEntry;
    }

    public getJournalEntries(): JournalEntry[] {
        return [...this.journalEntries];
    }

    public getJournalEntriesForScenario(scenarioNumber: number): JournalEntry[] {
        return this.journalEntries.filter((journalEntry) => journalEntry.scenarioNumber === scenarioNumber);
    }

    public recordScenarioVictory(scenarioNumber: number, wasVictory: boolean): void {
        this.latestVictoryFlagsByScenarioNumber.set(scenarioNumber, wasVictory);
    }

    public wasScenarioCompletedWithVictory(scenarioNumber: number): boolean {
        return this.latestVictoryFlagsByScenarioNumber.get(scenarioNumber) ?? false;
    }

    public isScenarioCompleted(scenarioNumber: number): boolean {
        return this.latestVictoryFlagsByScenarioNumber.has(scenarioNumber);
    }

    public getCompletedScenarioCount(): number {
        return this.latestVictoryFlagsByScenarioNumber.size;
    }

    public getVictoryCount(): number {
        let victoryCount = 0;
        for (const wasVictory of this.latestVictoryFlagsByScenarioNumber.values()) {
            if (wasVictory) {
                victoryCount += 1;
            }
        }
        return victoryCount;
    }

    public scoreShortAnswerResponse(rubricItem: ShortAnswerRubricItem, responseText: string): number {
        const normalizedResponseText = responseText.toLowerCase();
        let earnedPoints = 0;
        for (const conceptGroup of rubricItem.requiredConceptGroups) {
            const wasConceptGroupMatched = conceptGroup.some((conceptKeyword) =>
                normalizedResponseText.includes(conceptKeyword.toLowerCase()),
            );
            if (wasConceptGroupMatched) {
                earnedPoints += 1;
            }
        }
        return Math.min(rubricItem.maximumPointValue, earnedPoints);
    }

    public scoreContextualizationParagraph(responseText: string): number {
        const normalizedResponseText = responseText.toLowerCase();
        const wordCount = normalizedResponseText.split(/\s+/).filter((word) => word.length > 0).length;
        if (wordCount < 20) {
            return 0;
        }
        let achievedScore = 1;
        const containsConnectionLanguage =
            normalizedResponseText.includes("because") ||
            normalizedResponseText.includes("as a result") ||
            normalizedResponseText.includes("led to") ||
            normalizedResponseText.includes("context") ||
            normalizedResponseText.includes("situated") ||
            normalizedResponseText.includes("broader");
        if (containsConnectionLanguage && wordCount >= 35) {
            achievedScore = 2;
        }
        const containsExplanationLanguage =
            normalizedResponseText.includes("this shows") ||
            normalizedResponseText.includes("this illustrates") ||
            normalizedResponseText.includes("this shaped") ||
            normalizedResponseText.includes("reflected") ||
            normalizedResponseText.includes("demonstrates");
        if (containsConnectionLanguage && containsExplanationLanguage && wordCount >= 50) {
            achievedScore = 3;
        }
        return achievedScore;
    }

    public computeScenarioAssessmentSummary(scenarioNumber: number, wasVictory: boolean): ScenarioAssessmentSummary {
        const scenarioRubricItems = Rubrics.getRubricItemsForScenario(scenarioNumber);
        const journalEntriesForScenario = this.getJournalEntriesForScenario(scenarioNumber);
        let shortAnswerPointsPossible = 0;
        for (const rubricItem of scenarioRubricItems) {
            shortAnswerPointsPossible += rubricItem.maximumPointValue;
        }
        let shortAnswerPointsEarned = 0;
        for (const journalEntry of journalEntriesForScenario) {
            const matchingRubricItem = scenarioRubricItems.find(
                (rubricItem) => rubricItem.promptText === journalEntry.promptText,
            );
            if (matchingRubricItem !== undefined) {
                shortAnswerPointsEarned += this.scoreShortAnswerResponse(matchingRubricItem, journalEntry.responseText);
            }
        }
        return new ScenarioAssessmentSummary(
            scenarioNumber,
            shortAnswerPointsEarned,
            shortAnswerPointsPossible,
            journalEntriesForScenario.length,
            wasVictory,
        );
    }

    public exportJournalAsPlainText(): string {
        const exportLines: string[] = [];
        exportLines.push("CASCADE");
        exportLines.push("A Century of Global Conflict, 1900-1945");
        exportLines.push("Student journal export");
        exportLines.push(`Exported: ${new Date().toISOString()}`);
        exportLines.push("");
        for (const journalEntry of this.journalEntries) {
            exportLines.push("------------------------------------------------------------");
            exportLines.push(
                `Scenario ${journalEntry.scenarioNumber} | Turn ${journalEntry.turnNumber} | ${journalEntry.entryCategory}`,
            );
            exportLines.push(`Prompt: ${journalEntry.promptText}`);
            exportLines.push("");
            exportLines.push(journalEntry.responseText);
            exportLines.push("");
        }
        return exportLines.join("\n");
    }

    public exportWorkPacketForScenario(scenarioNumber: number): string {
        const exportLines: string[] = [];
        exportLines.push("CASCADE - Scenario work packet");
        exportLines.push(`Scenario ${scenarioNumber}`);
        exportLines.push(`Exported: ${new Date().toISOString()}`);
        exportLines.push("");
        const scenarioRubricItems = Rubrics.getRubricItemsForScenario(scenarioNumber);
        for (const rubricItem of scenarioRubricItems) {
            exportLines.push("------------------------------------------------------------");
            exportLines.push(`Prompt: ${rubricItem.promptText}`);
            exportLines.push(`Maximum points: ${rubricItem.maximumPointValue}`);
            exportLines.push("Scoring criteria:");
            for (const scoringCriterion of rubricItem.scoringCriteria) {
                exportLines.push(`  - ${scoringCriterion}`);
            }
            const matchingJournalEntry = this.getJournalEntriesForScenario(scenarioNumber).find(
                (journalEntry) => journalEntry.promptText === rubricItem.promptText,
            );
            exportLines.push("");
            exportLines.push("Student response:");
            exportLines.push(matchingJournalEntry?.responseText ?? "(no response recorded)");
            exportLines.push("");
        }
        return exportLines.join("\n");
    }

    public clearAllJournalEntries(): void {
        this.journalEntries.length = 0;
    }
}
