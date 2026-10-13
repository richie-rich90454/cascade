import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class LeagueOfNationsMandatePath extends GameSystem {
    constructor() {
        super("league_of_nations_mandate_path");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (turnNumber === 3) {
            gameState.addToResource(ResourceType.MANDATES, 5);
        }
        if (turnNumber === 6) {
            gameState.addToResource(ResourceType.PRESTIGE, 3);
            gameState.addToResource(ResourceType.RESISTANCE, 2);
        }
    }
}
