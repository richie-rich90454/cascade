import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class NationalismSystem extends GameSystem {
    constructor() {
        super("nationalism");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        for (const nation of gameState.getAllNations()) {
            const nationalismLevel = gameState.getResourceQuantity(ResourceType.NATIONALISM);
            if (nationalismLevel >= 60) {
                nation.addToStability(-1);
                nation.addToLegitimacy(-1);
                continue;
            }
            if (nationalismLevel <= 30) {
                nation.addToStability(1);
            }
        }
        if (turnNumber % 4 === 0) {
            gameState.addToResource(ResourceType.NATIONALISM, 5);
        }
    }
}
