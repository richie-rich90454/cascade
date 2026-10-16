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

export class CriterionPracticeFeedback {
    public readonly criterionText: string;
    public readonly wasSignalDetected: boolean;
    public readonly reviewPrompt: string;

    constructor(criterionText: string, wasSignalDetected: boolean, reviewPrompt: string) {
        this.criterionText = criterionText;
        this.wasSignalDetected = wasSignalDetected;
        this.reviewPrompt = reviewPrompt;
    }
}

export class ShortAnswerPracticeFeedback {
    public readonly detectedSignalCount: number;
    public readonly maximumSignalCount: number;
    public readonly criteria: CriterionPracticeFeedback[];

    constructor(detectedSignalCount: number, maximumSignalCount: number, criteria: CriterionPracticeFeedback[]) {
        this.detectedSignalCount = detectedSignalCount;
        this.maximumSignalCount = maximumSignalCount;
        this.criteria = criteria;
    }
}

export class TopicPracticeSignal {
    public readonly correctAnswerCount: number;
    public readonly attemptedQuestionCount: number;

    constructor(correctAnswerCount: number, attemptedQuestionCount: number) {
        this.correctAnswerCount = correctAnswerCount;
        this.attemptedQuestionCount = attemptedQuestionCount;
    }

    public getAccuracyPercentage(): number | null {
        if (this.attemptedQuestionCount === 0) {
            return null;
        }
        return Math.round((this.correctAnswerCount / this.attemptedQuestionCount) * 100);
    }
}

interface PersistedAssessmentRecord {
    journalEntries: Array<{
        entryIdentifier: string;
        scenarioNumber: number;
        turnNumber: number;
        entryCategory: string;
        promptText: string;
        responseText: string;
        recordedAtIsoTimestamp: string;
    }>;
    latestVictoryFlagsByScenarioNumber: Array<[number, boolean]>;
    topicAttemptsByCedTopicCode: Record<string, { correct: number; attempted: number }>;
}

export class AssessmentManager {
    private static readonly SINGLETON_INSTANCE = new AssessmentManager();
    private static readonly STORAGE_KEY = "cascade.assessment.v2";

    private readonly journalEntries: JournalEntry[];
    private readonly latestVictoryFlagsByScenarioNumber: Map<number, boolean>;
    private readonly topicAttemptsByCedTopicCode: Map<string, { correct: number; attempted: number }>;
    private readonly storage: Storage | null;

    private constructor() {
        this.journalEntries = [];
        this.latestVictoryFlagsByScenarioNumber = new Map<number, boolean>();
        this.topicAttemptsByCedTopicCode = new Map<string, { correct: number; attempted: number }>();
        try {
            this.storage = typeof localStorage === "undefined" ? null : localStorage;
        } catch {
            this.storage = null;
        }
        this.loadFromStorage();
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
        this.saveToStorage();
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
        this.saveToStorage();
    }

    public recordTopicPracticeAttempt(cedTopicCode: string, wasCorrect: boolean): void {
        const currentSignal = this.topicAttemptsByCedTopicCode.get(cedTopicCode) ?? { correct: 0, attempted: 0 };
        this.topicAttemptsByCedTopicCode.set(cedTopicCode, {
            correct: currentSignal.correct + (wasCorrect ? 1 : 0),
            attempted: currentSignal.attempted + 1,
        });
        this.saveToStorage();
    }

    public getTopicPracticeSignal(cedTopicCode: string): TopicPracticeSignal {
        const signal = this.topicAttemptsByCedTopicCode.get(cedTopicCode) ?? { correct: 0, attempted: 0 };
        return new TopicPracticeSignal(signal.correct, signal.attempted);
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
        return this.getShortAnswerPracticeFeedback(rubricItem, responseText).detectedSignalCount;
    }

    public getShortAnswerPracticeFeedback(
        rubricItem: ShortAnswerRubricItem,
        responseText: string,
    ): ShortAnswerPracticeFeedback {
        const normalizedResponseText = responseText.toLowerCase();
        const criteria = rubricItem.scoringCriteria.map((criterionText, criterionIndex) => {
            const conceptGroup = rubricItem.requiredConceptGroups[criterionIndex] ?? [];
            const wasSignalDetected = conceptGroup.some((conceptKeyword) =>
                normalizedResponseText.includes(conceptKeyword.toLowerCase()),
            );
            return new CriterionPracticeFeedback(
                criterionText,
                wasSignalDetected,
                wasSignalDetected
                    ? "Review that this idea is explained and supported with specific historical evidence."
                    : "Review this criterion and add a relevant example or explanation if it supports your argument.",
            );
        });
        const detectedSignalCount = Math.min(
            rubricItem.maximumPointValue,
            criteria.filter((criterion) => criterion.wasSignalDetected).length,
        );
        return new ShortAnswerPracticeFeedback(detectedSignalCount, rubricItem.maximumPointValue, criteria);
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
        exportLines.push("Global Conflict, c. 1900 to the Present");
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
        this.saveToStorage();
    }

    public clearSavedAssessmentData(): void {
        this.journalEntries.length = 0;
        this.latestVictoryFlagsByScenarioNumber.clear();
        this.topicAttemptsByCedTopicCode.clear();
        if (this.storage !== null) {
            this.storage.removeItem(AssessmentManager.STORAGE_KEY);
        }
    }

    private loadFromStorage(): void {
        if (this.storage === null) {
            return;
        }
        try {
            const storedValue = this.storage.getItem(AssessmentManager.STORAGE_KEY);
            if (storedValue === null) {
                return;
            }
            const parsedRecord = JSON.parse(storedValue) as Partial<PersistedAssessmentRecord>;
            if (Array.isArray(parsedRecord.journalEntries)) {
                for (const entry of parsedRecord.journalEntries) {
                    if (
                        typeof entry.entryIdentifier !== "string" ||
                        typeof entry.scenarioNumber !== "number" ||
                        typeof entry.turnNumber !== "number" ||
                        typeof entry.entryCategory !== "string" ||
                        typeof entry.promptText !== "string" ||
                        typeof entry.responseText !== "string" ||
                        typeof entry.recordedAtIsoTimestamp !== "string"
                    ) {
                        continue;
                    }
                    this.journalEntries.push(
                        new JournalEntry(
                            entry.entryIdentifier,
                            entry.scenarioNumber,
                            entry.turnNumber,
                            entry.entryCategory,
                            entry.promptText,
                            entry.responseText,
                            entry.recordedAtIsoTimestamp,
                        ),
                    );
                }
            }
            if (Array.isArray(parsedRecord.latestVictoryFlagsByScenarioNumber)) {
                for (const entry of parsedRecord.latestVictoryFlagsByScenarioNumber) {
                    if (Array.isArray(entry) && typeof entry[0] === "number" && typeof entry[1] === "boolean") {
                        this.latestVictoryFlagsByScenarioNumber.set(entry[0], entry[1]);
                    }
                }
            }
            if (
                parsedRecord.topicAttemptsByCedTopicCode !== null &&
                typeof parsedRecord.topicAttemptsByCedTopicCode === "object" &&
                !Array.isArray(parsedRecord.topicAttemptsByCedTopicCode)
            ) {
                for (const [topicCode, signal] of Object.entries(parsedRecord.topicAttemptsByCedTopicCode)) {
                    if (
                        signal !== null &&
                        typeof signal === "object" &&
                        typeof signal.correct === "number" &&
                        typeof signal.attempted === "number" &&
                        signal.correct >= 0 &&
                        signal.attempted >= signal.correct
                    ) {
                        this.topicAttemptsByCedTopicCode.set(topicCode, {
                            correct: signal.correct,
                            attempted: signal.attempted,
                        });
                    }
                }
            }
        } catch {
            this.journalEntries.length = 0;
            this.latestVictoryFlagsByScenarioNumber.clear();
            this.topicAttemptsByCedTopicCode.clear();
        }
    }

    private saveToStorage(): void {
        if (this.storage === null) {
            return;
        }
        const persistedRecord: PersistedAssessmentRecord = {
            journalEntries: this.journalEntries.map((entry) => ({
                entryIdentifier: entry.entryIdentifier,
                scenarioNumber: entry.scenarioNumber,
                turnNumber: entry.turnNumber,
                entryCategory: entry.entryCategory,
                promptText: entry.promptText,
                responseText: entry.responseText,
                recordedAtIsoTimestamp: entry.recordedAtIsoTimestamp,
            })),
            latestVictoryFlagsByScenarioNumber: Array.from(this.latestVictoryFlagsByScenarioNumber.entries()),
            topicAttemptsByCedTopicCode: Object.fromEntries(this.topicAttemptsByCedTopicCode.entries()),
        };
        try {
            this.storage.setItem(AssessmentManager.STORAGE_KEY, JSON.stringify(persistedRecord));
        } catch {
            // Keep current-session work available if browser storage is disabled or full.
        }
    }
}
