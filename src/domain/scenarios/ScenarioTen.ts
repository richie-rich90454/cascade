import type { GameState } from "../../core/GameState";
import { GameSystem } from "../../core/GameSystem";
import { Rubrics } from "../../data/Rubrics";
import { LearningObjective } from "../../types/LearningObjective";
import { ReasoningProcess } from "../../types/ReasoningProcess";
import { SuggestedSkill } from "../../types/SuggestedSkill";
import { ThematicFocus } from "../../types/ThematicFocus";
import {
    ArgumentDefinition,
    ArgumentPrompt,
    CausalChainDefinition,
    ComparisonDefinition,
    ContinuityChangeDefinition,
    DecisionRecord,
    FocusTreeDefinition,
    Scenario,
    ScenarioEvaluationResult,
    ScenarioEventRecord,
    TestimonyRecord,
} from "./Scenario";
import { CausalArgumentSystem } from "./systems/CausalArgumentSystem";
import { ComplexArgumentSystem } from "./systems/ComplexArgumentSystem";

export class ScenarioTen extends Scenario {
    private readonly playableSystems: GameSystem[];

    constructor() {
        super("scenario_ten_the_weight_of_history");
        this.playableSystems = [new CausalArgumentSystem(), new ComplexArgumentSystem()];
    }

    public override getScenarioNumber(): number {
        return 10;
    }

    public override getScenarioTitle(): string {
        return "The Weight of History";
    }

    public override getScenarioSubtitle(): string {
        return "1945-Present";
    }

    public override getStartYear(): number {
        return 1945;
    }

    public override getEndYear(): number {
        return 2020;
    }

    public override getDurationInMinutes(): number {
        return 60;
    }

    public override getTurnCount(): number {
        return 8;
    }

    public override getThematicFocus(): ThematicFocus {
        return ThematicFocus.GOVERNANCE;
    }

    public override getSuggestedSkill(): SuggestedSkill {
        return SuggestedSkill.SKILL_6_D;
    }

    public override getReasoningProcess(): ReasoningProcess {
        return ReasoningProcess.CAUSATION;
    }

    public override getLearningObjective(): LearningObjective {
        return LearningObjective.OBJECTIVE_I;
    }

    public override getPerspectiveLabels(): string[] {
        return ["Student-as-historian (no nation-state play)"];
    }

    public override getBriefingParagraphs(): string[] {
        return [
            "In 1945 the deadliest war in history ended, and the world began the hardest work a generation can face: the reckoning. This scenario asks a single demanding question about the century behind it. What was the most significant cause of the global conflict that ran from 1900 to 1945, and how should a historian weigh the alternatives against one another?",
            "All four themes of this course intersect in that reckoning. Governance appears in the United Nations founded to keep the peace and in the rival blocs that divided the world; technology and innovation appear in the atomic bomb and the machinery of mass production; economic systems appear in the Depression that discredited one order and in the planned economies that challenged it; and social interactions and organization appear in the genocide, displacement, and decolonization that remade societies on every continent.",
            "As a student-historian you hold no nation-state's perspective. Your evidence is the documentary record of 1900 to 1945, from treaties and charters to speeches and announcements, and your method is the reasoning of causation. You must decide which cause carries the greatest weight and defend that judgment with diverse evidence.",
            "Across eight turns you will follow the postwar order from the United Nations Charter to the long peace and its wars. Your task is to build a complex argument that survives the strongest counterarguments and to explain how the history of 1945 to the present still carries the weight of what came before.",
        ];
    }

    public override getObjectiveSummaries(): string[] {
        return [
            "Write a defensible thesis identifying the most significant cause of global conflict between 1900 and 1945.",
            "Corroborate the thesis with diverse evidence drawn from across the period 1900-1945.",
            "Explain nuance by analyzing how multiple variables interacted instead of reducing the period to a single cause.",
            "Explain insightful connections within and across periods and complete all four Skill 6.D argument sections.",
        ];
    }

    public override getScenarioResourceCodes(): string[] {
        return [];
    }

    public override getPlayableSystems(): GameSystem[] {
        return this.playableSystems;
    }

    public override getFocusTreeDefinition(): FocusTreeDefinition | null {
        return null;
    }

    public override getPrimarySourceIdentifiers(): string[] {
        return [
            "treaty_of_versailles_article_231",
            "covenant_of_the_league_of_nations",
            "atlantic_charter_1941",
            "united_nations_charter_preamble",
            "truman_atomic_bomb_announcement",
            "nehru_tryst_with_destiny",
        ];
    }

    public override getDecisionRecords(): DecisionRecord[] {
        return [];
    }

    public override getScenarioEventSchedule(): ScenarioEventRecord[] {
        return [
            new ScenarioEventRecord(
                1,
                "un_charter",
                "FIFTY NATIONS SIGN THE UNITED NATIONS CHARTER IN SAN FRANCISCO",
                "newspaper_masthead_usa",
                "USA",
                "event_united_nations",
            ),
            new ScenarioEventRecord(
                2,
                "nuremberg_trials",
                "NUREMBERG TRIBUNAL CONVENES: NAZI LEADERS ANSWER FOR THEIR CRIMES",
                "newspaper_masthead_germany",
                "GER",
                "event_holocaust",
            ),
            new ScenarioEventRecord(
                3,
                "partition_of_india",
                "INDIA AND PAKISTAN BORN AMID PARTITION AS EMPIRE QUITS SOUTH ASIA",
                "newspaper_masthead_britain",
                "RAJ",
                "event_united_nations",
            ),
            new ScenarioEventRecord(
                4,
                "cold_war_division",
                "IRON CURTAIN DIVIDES EUROPE AS SUPERPOWER RIVALRY HARDENS",
                "newspaper_masthead_ussr",
                "SOV",
                "event_munich_conference",
            ),
            new ScenarioEventRecord(
                5,
                "decolonization_wave",
                "THE TIDE OF DECOLONIZATION SWEEPS ACROSS ASIA AND AFRICA",
                "newspaper_masthead_britain",
                "ENG",
                "event_united_nations",
            ),
            new ScenarioEventRecord(
                6,
                "nuclear_age",
                "THE ATOMIC AGE DAWNS: HOPE AND TERROR IN THE SHADOW OF THE BOMB",
                "newspaper_masthead_usa",
                "USA",
                "event_hiroshima",
            ),
            new ScenarioEventRecord(
                7,
                "the_long_peace_and_its_wars",
                "A LONG PEACE BETWEEN SUPERPOWERS, BUT WARS RAGE AT THE MARGINS",
                "newspaper_masthead_usa",
                "USA",
                "event_pearl_harbor",
            ),
            new ScenarioEventRecord(
                8,
                "the_historians_task",
                "THE HISTORIANS' TASK: WEIGHING THE CAUSES OF GLOBAL CONFLICT",
                "newspaper_masthead_default",
                "USA",
                "event_united_nations",
            ),
        ];
    }

    public override getCausalChainDefinitions(): CausalChainDefinition[] {
        return [];
    }

    public override getComparisonDefinition(): ComparisonDefinition | null {
        return null;
    }

    public override getContinuityChangeDefinition(): ContinuityChangeDefinition | null {
        return null;
    }

    public override getArgumentDefinition(): ArgumentDefinition | null {
        return new ArgumentDefinition("The Relative Significance of the Causes of Global Conflict, 1900-1945", [
            new ArgumentPrompt(
                "argument_s10_primary_cause",
                "Explain the most significant cause of global conflict between 1900 and 1945.",
                [
                    "Cite a specific development from 1900-1914 that supports your thesis.",
                    "Cite a specific development from 1919-1939 that supports your thesis.",
                    "Cite a specific development from 1939-1945 that supports your thesis.",
                ],
                [
                    "State the strongest alternative cause a historian might propose.",
                    "Explain how evidence supports, modifies, or refutes that alternative.",
                ],
            ),
            new ArgumentPrompt(
                "argument_s10_nuance",
                "Explain nuance by analyzing multiple variables that interacted across the period.",
                [
                    "Cite a development that shows how economic crisis shaped political choices in the period.",
                    "Cite a development that shows how ideology shaped political choices in the period.",
                    "Cite a development that shows how the two variables reinforced each other between 1919 and 1939.",
                ],
                [
                    "State an interpretation that reduces the period's conflicts to a single variable.",
                    "Explain how the interaction of multiple variables refutes or modifies that interpretation.",
                ],
            ),
            new ArgumentPrompt(
                "argument_s10_connections",
                "Explain insightful connections within and across periods 1900-1945 and 1945-present.",
                [
                    "Cite a development from 1900-1945 that connects to a continuity or change after 1945.",
                    "Cite a development from 1945-present that echoes a cause you studied for 1900-1945.",
                    "Cite a source that links the wartime order of 1939-1945 to the postwar order of 1945-2020.",
                ],
                [
                    "State an objection to drawing connections across the 1945 divide.",
                    "Explain how your evidence answers or accommodates that objection.",
                ],
            ),
        ]);
    }

    public override getRelationshipPromptTexts(): string[] {
        return [];
    }

    public override getTestimonyRecords(): TestimonyRecord[] {
        return [];
    }

    public override getDebriefQuestionPrompts(): string[] {
        return Rubrics.getRubricItemsForScenario(10).map((rubricItem) => rubricItem.promptText);
    }

    public override getJournalPrompts(): string[] {
        return [
            "Write your working thesis: which cause of global conflict between 1900 and 1945 is most significant, and why?",
            "Choose two sources from different phases of the period and explain how they corroborate or challenge your thesis.",
            "Reflect on how your thinking about causation changed as you weighed the evidence across the scenario.",
        ];
    }

    public override supportsDiplomaticPlay(): boolean {
        return false;
    }

    public override supportsTimelineScrubber(): boolean {
        return true;
    }

    public override supportsProductionQueue(): boolean {
        return false;
    }

    public override supportsDivisionDesigner(): boolean {
        return false;
    }

    public override getContentAdvisoryNote(): string {
        return "This scenario examines the causes and human cost of global conflict, including genocide, in historical and educational terms.";
    }

    public override registerInitialState(gameState: GameState): void {
        gameState.reset();
        gameState.setScenarioIdentifier(this.getSystemName());
        gameState.setPlayerNationIdentifier("");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        for (const playableSystem of this.playableSystems) {
            playableSystem.simulateTurn(turnNumber, gameState);
        }
    }

    public override evaluateVictory(gameState: GameState): ScenarioEvaluationResult {
        const flagStatus = this.collectFlagStatus(gameState, [
            {
                flagIdentifier: "argument_s10_complete",
                flagDescription: "Complex argument completed: all four Skill 6.D sections meet the length requirement",
            },
        ]);
        return this.buildEvaluationResult(10, flagStatus.satisfiedCriteria, flagStatus.unmetCriteria, 1, 0);
    }
}
