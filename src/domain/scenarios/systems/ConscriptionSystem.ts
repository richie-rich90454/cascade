import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class ConscriptionSystem extends GameSystem {
    constructor() {
        super("conscription");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        gameState.addToResource(ResourceType.MANPOWER, -2500);
        if (turnNumber >= 5) {
            gameState.addToResource(ResourceType.OPINION, -1);
        }
    }
}
