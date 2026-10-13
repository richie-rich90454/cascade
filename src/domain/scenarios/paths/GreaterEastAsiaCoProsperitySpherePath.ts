import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class GreaterEastAsiaCoProsperitySpherePath extends GameSystem {
    constructor() {
        super("greater_east_asia_co_prosperity_sphere_path");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (turnNumber !== 5) {
            return;
        }
        if (gameState.getNation("empire_of_japan") === null) {
            return;
        }
        gameState.addToResource(ResourceType.PRESTIGE, 5);
        gameState.addToResource(ResourceType.RESISTANCE, 5);
    }
}
