import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class CoalitionCoordinationSystem extends GameSystem {
    private static readonly ALLIED_NATION_IDENTIFIERS: string[] = ["united_states", "british_empire", "soviet_union"];
    private static readonly AXIS_NATION_IDENTIFIERS: string[] = ["german_empire", "empire_of_japan"];

    constructor() {
        super("coalition_coordination");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const hasWarAmongAlliedNations = this.hasAnyWarAmongAlliedNations(gameState);
        if (turnNumber >= 2 && !hasWarAmongAlliedNations) {
            gameState.addToResource(ResourceType.SUPPORT, 2);
            for (const alliedNationIdentifier of CoalitionCoordinationSystem.ALLIED_NATION_IDENTIFIERS) {
                const alliedNation = gameState.getNation(alliedNationIdentifier);
                if (alliedNation !== null) {
                    alliedNation.addToStability(2);
                }
            }
        }
        if (turnNumber >= 6) {
            for (const axisNationIdentifier of CoalitionCoordinationSystem.AXIS_NATION_IDENTIFIERS) {
                if (gameState.getNation(axisNationIdentifier) !== null) {
                    gameState.addToResource(ResourceType.PRODUCTION, -1);
                }
            }
        }
        if (
            turnNumber >= 12 &&
            (this.countAlliedPairsAmongAlliedNations(gameState) >= 1 || !hasWarAmongAlliedNations)
        ) {
            gameState.setScenarioFlag("coalition_s8_held");
        }
    }

    private countAlliedPairsAmongAlliedNations(gameState: GameState): number {
        const alliedNations = gameState.getNationsByIdentifiers(CoalitionCoordinationSystem.ALLIED_NATION_IDENTIFIERS);
        let alliedPairCount = 0;
        for (let firstIndex = 0; firstIndex < alliedNations.length; firstIndex++) {
            for (let secondIndex = firstIndex + 1; secondIndex < alliedNations.length; secondIndex++) {
                if (alliedNations[firstIndex].isAlliedWith(alliedNations[secondIndex])) {
                    alliedPairCount += 1;
                }
            }
        }
        return alliedPairCount;
    }

    private hasAnyWarAmongAlliedNations(gameState: GameState): boolean {
        const alliedNations = gameState.getNationsByIdentifiers(CoalitionCoordinationSystem.ALLIED_NATION_IDENTIFIERS);
        for (let firstIndex = 0; firstIndex < alliedNations.length; firstIndex++) {
            for (let secondIndex = firstIndex + 1; secondIndex < alliedNations.length; secondIndex++) {
                if (alliedNations[firstIndex].isAtWarWith(alliedNations[secondIndex])) {
                    return true;
                }
            }
        }
        return false;
    }
}
