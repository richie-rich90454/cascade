import { GameSystem } from "../../core/GameSystem";
import type { GameState } from "../../core/GameState";
import type { LearningObjective } from "../../types/LearningObjective";
import type { ReasoningProcess } from "../../types/ReasoningProcess";
import type { SuggestedSkill } from "../../types/SuggestedSkill";
import type { ThematicFocus } from "../../types/ThematicFocus";

export class DecisionOption {
    public readonly optionIdentifier: string;
    public readonly optionLabelText: string;
    public readonly consequenceText: string;
    public readonly resultingFlagIdentifier: string;
    public readonly resultingResourceCode: string;
    public readonly resultingResourceDelta: number;

    constructor(
        optionIdentifier: string,
        optionLabelText: string,
        consequenceText: string,
        resultingFlagIdentifier: string,
        resultingResourceCode: string,
        resultingResourceDelta: number,
    ) {
        this.optionIdentifier = optionIdentifier;
        this.optionLabelText = optionLabelText;
        this.consequenceText = consequenceText;
        this.resultingFlagIdentifier = resultingFlagIdentifier;
        this.resultingResourceCode = resultingResourceCode;
        this.resultingResourceDelta = resultingResourceDelta;
    }
}

export class DecisionRecord {
    public readonly decisionIdentifier: string;
    public readonly decisionTitle: string;
    public readonly contextParagraph: string;
    public readonly causationSummary: string;
    public readonly comparisonSummary: string;
    public readonly continuityChangeSummary: string;
    public readonly sourcingSummary: string;
    public readonly options: DecisionOption[];

    constructor(
        decisionIdentifier: string,
        decisionTitle: string,
        contextParagraph: string,
        causationSummary: string,
        comparisonSummary: string,
        continuityChangeSummary: string,
        sourcingSummary: string,
        options: DecisionOption[],
    ) {
        this.decisionIdentifier = decisionIdentifier;
        this.decisionTitle = decisionTitle;
        this.contextParagraph = contextParagraph;
        this.causationSummary = causationSummary;
        this.comparisonSummary = comparisonSummary;
        this.continuityChangeSummary = continuityChangeSummary;
        this.sourcingSummary = sourcingSummary;
        this.options = options;
    }
}

export class ScenarioEventRecord {
    public readonly turnNumber: number;
    public readonly eventIdentifier: string;
    public readonly headline: string;
    public readonly newspaperAssetIdentifier: string;
    public readonly nationCode: string;
    public readonly illustrationAssetIdentifier: string;

    constructor(
        turnNumber: number,
        eventIdentifier: string,
        headline: string,
        newspaperAssetIdentifier: string,
        nationCode: string,
        illustrationAssetIdentifier: string,
    ) {
        this.turnNumber = turnNumber;
        this.eventIdentifier = eventIdentifier;
        this.headline = headline;
        this.newspaperAssetIdentifier = newspaperAssetIdentifier;
        this.nationCode = nationCode;
        this.illustrationAssetIdentifier = illustrationAssetIdentifier;
    }
}

export class CausalChainCause {
    public readonly causeIdentifier: string;
    public readonly causeText: string;
    public readonly timeScale: string;
    public readonly isInternalFactor: boolean;

    constructor(causeIdentifier: string, causeText: string, timeScale: string, isInternalFactor: boolean) {
        this.causeIdentifier = causeIdentifier;
        this.causeText = causeText;
        this.timeScale = timeScale;
        this.isInternalFactor = isInternalFactor;
    }
}

export class CausalChainDefinition {
    public readonly chainIdentifier: string;
    public readonly chainTitle: string;
    public readonly chainHintText: string;
    public readonly causes: CausalChainCause[];

    constructor(chainIdentifier: string, chainTitle: string, chainHintText: string, causes: CausalChainCause[]) {
        this.chainIdentifier = chainIdentifier;
        this.chainTitle = chainTitle;
        this.chainHintText = chainHintText;
        this.causes = causes;
    }
}

export class ComparisonRow {
    public readonly rowIdentifier: string;
    public readonly criterionText: string;
    public readonly leftAnswerText: string;
    public readonly rightAnswerText: string;
    public readonly isSimilarity: boolean;

    constructor(rowIdentifier: string, criterionText: string, leftAnswerText: string, rightAnswerText: string, isSimilarity: boolean) {
        this.rowIdentifier = rowIdentifier;
        this.criterionText = criterionText;
        this.leftAnswerText = leftAnswerText;
        this.rightAnswerText = rightAnswerText;
        this.isSimilarity = isSimilarity;
    }
}

export class ComparisonDefinition {
    public readonly comparisonTitle: string;
    public readonly leftColumnLabel: string;
    public readonly rightColumnLabel: string;
    public readonly rows: ComparisonRow[];

    constructor(comparisonTitle: string, leftColumnLabel: string, rightColumnLabel: string, rows: ComparisonRow[]) {
        this.comparisonTitle = comparisonTitle;
        this.leftColumnLabel = leftColumnLabel;
        this.rightColumnLabel = rightColumnLabel;
        this.rows = rows;
    }
}

export class ContinuityChangeMarker {
    public readonly markerIdentifier: string;
    public readonly markerLabel: string;
    public readonly markerYear: number;
    public readonly classification: string;
    public readonly explanationText: string;

    constructor(
        markerIdentifier: string,
        markerLabel: string,
        markerYear: number,
        classification: string,
        explanationText: string,
    ) {
        this.markerIdentifier = markerIdentifier;
        this.markerLabel = markerLabel;
        this.markerYear = markerYear;
        this.classification = classification;
        this.explanationText = explanationText;
    }
}

export class ContinuityChangeDefinition {
    public readonly chartTitle: string;
    public readonly startYear: number;
    public readonly endYear: number;
    public readonly markers: ContinuityChangeMarker[];

    constructor(chartTitle: string, startYear: number, endYear: number, markers: ContinuityChangeMarker[]) {
        this.chartTitle = chartTitle;
        this.startYear = startYear;
        this.endYear = endYear;
        this.markers = markers;
    }
}

export class ArgumentPrompt {
    public readonly promptIdentifier: string;
    public readonly promptText: string;
    public readonly evidencePrompts: string[];
    public readonly counterargumentPrompts: string[];

    constructor(promptIdentifier: string, promptText: string, evidencePrompts: string[], counterargumentPrompts: string[]) {
        this.promptIdentifier = promptIdentifier;
        this.promptText = promptText;
        this.evidencePrompts = evidencePrompts;
        this.counterargumentPrompts = counterargumentPrompts;
    }
}

export class ArgumentDefinition {
    public readonly argumentTitle: string;
    public readonly argumentPrompts: ArgumentPrompt[];

    constructor(argumentTitle: string, argumentPrompts: ArgumentPrompt[]) {
        this.argumentTitle = argumentTitle;
        this.argumentPrompts = argumentPrompts;
    }
}

export class FocusNodeDefinition {
    public readonly nodeIdentifier: string;
    public readonly nodeDisplayName: string;
    public readonly historicalSummary: string;
    public readonly nodeEffectsSummary: string;
    public readonly prerequisiteNodeIdentifiers: string[];
    public readonly unlockedByCausalChainIdentifier: string;
    public readonly gridColumnIndex: number;
    public readonly gridRowIndex: number;

    constructor(
        nodeIdentifier: string,
        nodeDisplayName: string,
        historicalSummary: string,
        nodeEffectsSummary: string,
        prerequisiteNodeIdentifiers: string[],
        unlockedByCausalChainIdentifier: string,
        gridColumnIndex: number,
        gridRowIndex: number,
    ) {
        this.nodeIdentifier = nodeIdentifier;
        this.nodeDisplayName = nodeDisplayName;
        this.historicalSummary = historicalSummary;
        this.nodeEffectsSummary = nodeEffectsSummary;
        this.prerequisiteNodeIdentifiers = prerequisiteNodeIdentifiers;
        this.unlockedByCausalChainIdentifier = unlockedByCausalChainIdentifier;
        this.gridColumnIndex = gridColumnIndex;
        this.gridRowIndex = gridRowIndex;
    }
}

export class FocusTreeDefinition {
    public readonly focusTreeTitle: string;
    public readonly focusNodes: FocusNodeDefinition[];

    constructor(focusTreeTitle: string, focusNodes: FocusNodeDefinition[]) {
        this.focusTreeTitle = focusTreeTitle;
        this.focusNodes = focusNodes;
    }
}

export class TestimonyRecord {
    public readonly testimonyIdentifier: string;
    public readonly testimonyTitle: string;
    public readonly testimonySourceText: string;
    public readonly reflectionPrompt: string;

    constructor(testimonyIdentifier: string, testimonyTitle: string, testimonySourceText: string, reflectionPrompt: string) {
        this.testimonyIdentifier = testimonyIdentifier;
        this.testimonyTitle = testimonyTitle;
        this.testimonySourceText = testimonySourceText;
        this.reflectionPrompt = reflectionPrompt;
    }
}

export class ScenarioEvaluationResult {
    public readonly scenarioNumber: number;
    public readonly isVictory: boolean;
    public readonly earnedScore: number;
    public readonly maximumScore: number;
    public readonly satisfiedCriteria: string[];
    public readonly unmetCriteria: string[];

    constructor(
        scenarioNumber: number,
        isVictory: boolean,
        earnedScore: number,
        maximumScore: number,
        satisfiedCriteria: string[],
        unmetCriteria: string[],
    ) {
        this.scenarioNumber = scenarioNumber;
        this.isVictory = isVictory;
        this.earnedScore = earnedScore;
        this.maximumScore = maximumScore;
        this.satisfiedCriteria = satisfiedCriteria;
        this.unmetCriteria = unmetCriteria;
    }
}

export abstract class Scenario extends GameSystem {
    constructor(systemName: string) {
        super(systemName);
    }

    public abstract getScenarioNumber(): number;

    public abstract getScenarioTitle(): string;

    public abstract getScenarioSubtitle(): string;

    public abstract getStartYear(): number;

    public abstract getEndYear(): number;

    public abstract getDurationInMinutes(): number;

    public abstract getTurnCount(): number;

    public abstract getThematicFocus(): ThematicFocus;

    public abstract getSuggestedSkill(): SuggestedSkill;

    public abstract getReasoningProcess(): ReasoningProcess;

    public abstract getLearningObjective(): LearningObjective;

    public abstract getPerspectiveLabels(): string[];

    public abstract getBriefingParagraphs(): string[];

    public abstract getObjectiveSummaries(): string[];

    public abstract getScenarioResourceCodes(): string[];

    public abstract getPlayableSystems(): GameSystem[];

    public abstract getFocusTreeDefinition(): FocusTreeDefinition | null;

    public abstract getPrimarySourceIdentifiers(): string[];

    public abstract getDecisionRecords(): DecisionRecord[];

    public abstract getScenarioEventSchedule(): ScenarioEventRecord[];

    public abstract getCausalChainDefinitions(): CausalChainDefinition[];

    public abstract getComparisonDefinition(): ComparisonDefinition | null;

    public abstract getContinuityChangeDefinition(): ContinuityChangeDefinition | null;

    public abstract getArgumentDefinition(): ArgumentDefinition | null;

    public abstract getRelationshipPromptTexts(): string[];

    public abstract getTestimonyRecords(): TestimonyRecord[];

    public abstract getDebriefQuestionPrompts(): string[];

    public abstract getJournalPrompts(): string[];

    public abstract supportsDiplomaticPlay(): boolean;

    public abstract supportsTimelineScrubber(): boolean;

    public abstract supportsProductionQueue(): boolean;

    public abstract supportsDivisionDesigner(): boolean;

    public abstract getContentAdvisoryNote(): string;

    public abstract registerInitialState(gameState: GameState): void;

    public abstract evaluateVictory(gameState: GameState): ScenarioEvaluationResult;

    protected collectFlagStatus(
        gameState: GameState,
        describedFlags: Array<{ flagIdentifier: string; flagDescription: string }>,
    ): { satisfiedCriteria: string[]; unmetCriteria: string[]; satisfiedCount: number } {
        const satisfiedCriteria: string[] = [];
        const unmetCriteria: string[] = [];
        for (const describedFlag of describedFlags) {
            if (gameState.isScenarioFlagSet(describedFlag.flagIdentifier)) {
                satisfiedCriteria.push(describedFlag.flagDescription);
            } else {
                unmetCriteria.push(describedFlag.flagDescription);
            }
        }
        return { satisfiedCriteria, unmetCriteria, satisfiedCount: satisfiedCriteria.length };
    }

    protected buildEvaluationResult(
        scenarioNumber: number,
        satisfiedCriteria: string[],
        unmetCriteria: string[],
        requiredSatisfiedCount: number,
        bonusCriteriaSatisfiedCount: number = 0,
    ): ScenarioEvaluationResult {
        const isVictory = satisfiedCriteria.length >= requiredSatisfiedCount;
        const maximumScore = requiredSatisfiedCount + bonusCriteriaSatisfiedCount;
        const earnedScore = Math.min(maximumScore, satisfiedCriteria.length);
        return new ScenarioEvaluationResult(
            scenarioNumber,
            isVictory,
            earnedScore,
            maximumScore,
            satisfiedCriteria,
            unmetCriteria,
        );
    }
}

export class ScenarioResourceCategories {
    public static readonly DIPLOMACY_RESOURCE_CODES: string[] = [
        "alliances",
        "influence",
        "diplomacy",
        "mandates",
        "prestige",
        "imperial_prestige",
    ];
    public static readonly ECONOMY_RESOURCE_CODES: string[] = [
        "production",
        "treasury",
        "growth",
        "economy",
        "industry",
        "food",
        "fuel",
        "steel",
        "rubber",
    ];
    public static readonly MILITARY_RESOURCE_CODES: string[] = [
        "manpower",
        "mobilization",
        "military",
        "supply",
        "territory",
    ];
    public static readonly DOMESTIC_RESOURCE_CODES: string[] = [
        "legitimacy",
        "stability",
        "support",
        "opinion",
        "repression",
        "nationalism",
    ];
    public static readonly INTELLIGENCE_RESOURCE_CODES: string[] = [
        "intelligence",
        "technology",
        "research",
        "ideology",
    ];
}
