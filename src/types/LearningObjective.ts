import { ThematicFocus } from "./ThematicFocus";

export class LearningObjective {
    public static readonly OBJECTIVE_A = new LearningObjective(
        "A",
        "Explain how internal and external factors contributed to change in various states after 1900.",
        "7.1",
        1,
        "GOV",
        "4.B",
        "continuity_and_change",
    );
    public static readonly OBJECTIVE_B = new LearningObjective(
        "B",
        "Explain the causes and consequences of World War I.",
        "7.2",
        2,
        "GOV",
        "1.B",
        "causation",
    );
    public static readonly OBJECTIVE_C = new LearningObjective(
        "C",
        "Explain how governments used a variety of methods to conduct war.",
        "7.3",
        3,
        "TEC",
        "3.B",
        "continuity_and_change",
    );
    public static readonly OBJECTIVE_D = new LearningObjective(
        "D",
        "Explain how different governments responded to economic crisis after 1900.",
        "7.4",
        4,
        "ECN",
        "2.C",
        "comparison",
    );
    public static readonly OBJECTIVE_E = new LearningObjective(
        "E",
        "Explain the continuities and changes in territorial holdings from 1900 to the present.",
        "7.5",
        5,
        "GOV",
        "2.C",
        "continuity_and_change",
    );
    public static readonly OBJECTIVE_F = new LearningObjective(
        "F",
        "Explain the causes and consequences of World War II.",
        "7.6",
        6,
        "GOV",
        "2.C",
        "causation",
    );
    public static readonly OBJECTIVE_G = new LearningObjective(
        "G",
        "Explain similarities and differences in how governments used a variety of methods to conduct war.",
        "7.7",
        7,
        "GOV",
        "3.D",
        "comparison",
    );
    public static readonly OBJECTIVE_H = new LearningObjective(
        "H",
        "Explain the various causes and consequences of mass atrocities in the period from 1900 to the present.",
        "7.8",
        9,
        "SIO",
        "5.B",
        "causation",
    );
    public static readonly OBJECTIVE_I = new LearningObjective(
        "I",
        "Explain the relative significance of the causes of global conflict in the period 1900 to the present.",
        "7.9",
        10,
        "ALL",
        "6.D",
        "causation",
    );

    private readonly learningObjectiveCode: string;
    private readonly learningObjectiveText: string;
    private readonly cedTopicCode: string;
    private readonly primaryScenarioNumber: number;
    private readonly thematicFocusCode: string;
    private readonly suggestedSkillCode: string;
    private readonly reasoningProcessCode: string;

    private constructor(
        learningObjectiveCode: string,
        learningObjectiveText: string,
        cedTopicCode: string,
        primaryScenarioNumber: number,
        thematicFocusCode: string,
        suggestedSkillCode: string,
        reasoningProcessCode: string,
    ) {
        this.learningObjectiveCode = learningObjectiveCode;
        this.learningObjectiveText = learningObjectiveText;
        this.cedTopicCode = cedTopicCode;
        this.primaryScenarioNumber = primaryScenarioNumber;
        this.thematicFocusCode = thematicFocusCode;
        this.suggestedSkillCode = suggestedSkillCode;
        this.reasoningProcessCode = reasoningProcessCode;
    }

    public getCode(): string {
        return this.learningObjectiveCode;
    }

    public getText(): string {
        return this.learningObjectiveText;
    }

    public getCedTopicCode(): string {
        return this.cedTopicCode;
    }

    public getPrimaryScenarioNumber(): number {
        return this.primaryScenarioNumber;
    }

    public getThematicFocus(): ThematicFocus | null {
        return ThematicFocus.findByThematicFocusCode(this.thematicFocusCode);
    }

    public getSuggestedSkillCode(): string {
        return this.suggestedSkillCode;
    }

    public getReasoningProcessCode(): string {
        return this.reasoningProcessCode;
    }

    public static getAllLearningObjectives(): LearningObjective[] {
        return [
            LearningObjective.OBJECTIVE_A,
            LearningObjective.OBJECTIVE_B,
            LearningObjective.OBJECTIVE_C,
            LearningObjective.OBJECTIVE_D,
            LearningObjective.OBJECTIVE_E,
            LearningObjective.OBJECTIVE_F,
            LearningObjective.OBJECTIVE_G,
            LearningObjective.OBJECTIVE_H,
            LearningObjective.OBJECTIVE_I,
        ];
    }

    public static findByLearningObjectiveCode(learningObjectiveCode: string): LearningObjective | null {
        for (const learningObjective of LearningObjective.getAllLearningObjectives()) {
            if (learningObjective.getCode() === learningObjectiveCode) {
                return learningObjective;
            }
        }
        return null;
    }

    public static getLearningObjectivesForScenario(scenarioNumber: number): LearningObjective | null {
        for (const learningObjective of LearningObjective.getAllLearningObjectives()) {
            if (learningObjective.getPrimaryScenarioNumber() === scenarioNumber) {
                return learningObjective;
            }
        }
        return null;
    }
}
