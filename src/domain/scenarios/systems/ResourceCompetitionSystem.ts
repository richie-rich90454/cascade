import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class ResourceCompetitionSystem extends GameSystem {
    private static readonly WAR_ECONOMY_NATION_IDENTIFIERS: string[] = [
        "austro_hungarian_empire",
        "serbia",
        "german_empire",
        "russian_empire",
        "french_republic",
        "british_empire",
    ];

    constructor() {
        super("resource_competition");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        for (const warEconomyNationIdentifier of ResourceCompetitionSystem.WAR_ECONOMY_NATION_IDENTIFIERS) {
            const warEconomyNation = gameState.getNation(warEconomyNationIdentifier);
            if (warEconomyNation === null) {
                continue;
            }
            warEconomyNation.addToTreasury(-5);
            if (turnNumber >= 4) {
                warEconomyNation.addToManpower(-1000);
            }
        }
        const unitedStates = gameState.getNation("united_states");
        if (unitedStates !== null) {
            unitedStates.addToTreasury(5);
        }
        gameState.addToResource(ResourceType.TREASURY, -3);
        if (turnNumber >= 3) {
            gameState.addToResource(ResourceType.MOBILIZATION, 3);
        }
    }
}
