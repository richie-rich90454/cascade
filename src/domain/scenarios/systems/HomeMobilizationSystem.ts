import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class HomeMobilizationSystem extends GameSystem {
    constructor() {
        super("home_mobilization");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        gameState.addToResource(ResourceType.PRODUCTION, 2);
        gameState.addToResource(ResourceType.MANPOWER, 1000);
        if (turnNumber >= 6) {
            gameState.addToResource(ResourceType.OPINION, -1);
        }
    }
}
