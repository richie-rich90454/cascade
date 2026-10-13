import type { PrimarySource } from "./PrimarySource";
import { PrimarySourceScenarioEightLibrary } from "./primarysources/PrimarySourceScenarioEightLibrary";
import { PrimarySourceScenarioFiveLibrary } from "./primarysources/PrimarySourceScenarioFiveLibrary";
import { PrimarySourceScenarioFourLibrary } from "./primarysources/PrimarySourceScenarioFourLibrary";
import { PrimarySourceScenarioNineLibrary } from "./primarysources/PrimarySourceScenarioNineLibrary";
import { PrimarySourceScenarioOneLibrary } from "./primarysources/PrimarySourceScenarioOneLibrary";
import { PrimarySourceScenarioSevenLibrary } from "./primarysources/PrimarySourceScenarioSevenLibrary";
import { PrimarySourceScenarioSixLibrary } from "./primarysources/PrimarySourceScenarioSixLibrary";
import { PrimarySourceScenarioTenLibrary } from "./primarysources/PrimarySourceScenarioTenLibrary";
import { PrimarySourceScenarioThreeLibrary } from "./primarysources/PrimarySourceScenarioThreeLibrary";
import { PrimarySourceScenarioTwoLibrary } from "./primarysources/PrimarySourceScenarioTwoLibrary";

export class PrimarySources {
    public static getSourcesForScenario(scenarioNumber: number): PrimarySource[] {
        switch (scenarioNumber) {
            case 1:
                return PrimarySourceScenarioOneLibrary.getSources();
            case 2:
                return PrimarySourceScenarioTwoLibrary.getSources();
            case 3:
                return PrimarySourceScenarioThreeLibrary.getSources();
            case 4:
                return PrimarySourceScenarioFourLibrary.getSources();
            case 5:
                return PrimarySourceScenarioFiveLibrary.getSources();
            case 6:
                return PrimarySourceScenarioSixLibrary.getSources();
            case 7:
                return PrimarySourceScenarioSevenLibrary.getSources();
            case 8:
                return PrimarySourceScenarioEightLibrary.getSources();
            case 9:
                return PrimarySourceScenarioNineLibrary.getSources();
            case 10:
                return PrimarySourceScenarioTenLibrary.getSources();
            default:
                return [];
        }
    }

    public static getAllPrimarySources(): PrimarySource[] {
        const collectedSources: PrimarySource[] = [];
        for (const scenarioNumber of PrimarySources.getScenarioNumbersWithSources()) {
            for (const primarySource of PrimarySources.getSourcesForScenario(scenarioNumber)) {
                collectedSources.push(primarySource);
            }
        }
        return collectedSources;
    }

    public static findBySourceIdentifier(sourceIdentifier: string): PrimarySource | null {
        for (const primarySource of PrimarySources.getAllPrimarySources()) {
            if (primarySource.sourceIdentifier === sourceIdentifier) {
                return primarySource;
            }
        }
        return null;
    }

    public static getScenarioNumbersWithSources(): number[] {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }
}
