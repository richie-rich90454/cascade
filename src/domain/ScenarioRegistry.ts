import { TeacherSettings } from "../core/TeacherSettings";
import { AssessmentManager } from "../managers/AssessmentManager";
import type { Scenario } from "./scenarios/Scenario";
import { ScenarioEight } from "./scenarios/ScenarioEight";
import { ScenarioFive } from "./scenarios/ScenarioFive";
import { ScenarioFour } from "./scenarios/ScenarioFour";
import { ScenarioNine } from "./scenarios/ScenarioNine";
import { ScenarioOne } from "./scenarios/ScenarioOne";
import { ScenarioSeven } from "./scenarios/ScenarioSeven";
import { ScenarioSix } from "./scenarios/ScenarioSix";
import { ScenarioTen } from "./scenarios/ScenarioTen";
import { ScenarioThree } from "./scenarios/ScenarioThree";
import { ScenarioTwo } from "./scenarios/ScenarioTwo";

export class CampaignDefinition {
    public readonly campaignIdentifier: string;
    public readonly campaignDisplayName: string;
    public readonly campaignSubtitle: string;
    public readonly scenarioNumbers: number[];

    constructor(
        campaignIdentifier: string,
        campaignDisplayName: string,
        campaignSubtitle: string,
        scenarioNumbers: number[],
    ) {
        this.campaignIdentifier = campaignIdentifier;
        this.campaignDisplayName = campaignDisplayName;
        this.campaignSubtitle = campaignSubtitle;
        this.scenarioNumbers = scenarioNumbers;
    }
}

export class ScenarioRegistry {
    private static readonly SINGLETON_INSTANCE = new ScenarioRegistry();

    private readonly scenariosByNumber: Map<number, Scenario>;

    private constructor() {
        this.scenariosByNumber = new Map<number, Scenario>();
        const registeredScenarios: Scenario[] = [
            new ScenarioOne(),
            new ScenarioTwo(),
            new ScenarioThree(),
            new ScenarioFour(),
            new ScenarioFive(),
            new ScenarioSix(),
            new ScenarioSeven(),
            new ScenarioEight(),
            new ScenarioNine(),
            new ScenarioTen(),
        ];
        for (const registeredScenario of registeredScenarios) {
            this.scenariosByNumber.set(registeredScenario.getScenarioNumber(), registeredScenario);
        }
    }

    public static getInstance(): ScenarioRegistry {
        return ScenarioRegistry.SINGLETON_INSTANCE;
    }

    public getScenarioByNumber(scenarioNumber: number): Scenario | null {
        return this.scenariosByNumber.get(scenarioNumber) ?? null;
    }

    public getAllScenarios(): Scenario[] {
        return Array.from(this.scenariosByNumber.values()).sort(
            (firstScenario, secondScenario) => firstScenario.getScenarioNumber() - secondScenario.getScenarioNumber(),
        );
    }

    public getCampaigns(): CampaignDefinition[] {
        return [
            new CampaignDefinition(
                "campaign_empires_and_their_ruin",
                "Campaign I: Empires and Their Ruin",
                "From the powder keg of 1900 to the peace that ended all peace",
                [1, 2, 3, 4, 5],
            ),
            new CampaignDefinition(
                "campaign_the_century_of_total_war",
                "Campaign II: The Century of Total War",
                "From the rise of extremism to the weight of history",
                [6, 7, 8, 9, 10],
            ),
        ];
    }

    public isScenarioUnlocked(scenarioNumber: number): boolean {
        const teacherSettings = TeacherSettings.getInstance();
        if (!teacherSettings.isScenarioEnabled(scenarioNumber)) {
            return false;
        }
        if (scenarioNumber === 10 && teacherSettings.isScenarioNineRequiredBeforeTen()) {
            const assessmentManager = AssessmentManager.getInstance();
            return assessmentManager.isScenarioCompleted(9);
        }
        if (scenarioNumber === 1) {
            return true;
        }
        const assessmentManager = AssessmentManager.getInstance();
        return assessmentManager.isScenarioCompleted(scenarioNumber - 1);
    }

    public getUnlockedScenarioCount(): number {
        let unlockedScenarioCount = 0;
        for (const registeredScenario of this.getAllScenarios()) {
            if (this.isScenarioUnlocked(registeredScenario.getScenarioNumber())) {
                unlockedScenarioCount += 1;
            }
        }
        return unlockedScenarioCount;
    }
}
