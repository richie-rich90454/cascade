import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class TerritorialGainSystem extends GameSystem {
    constructor() {
        super("territorial_gain");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (turnNumber === 2 || turnNumber === 4) {
            gameState.addToResource(ResourceType.MANDATES, 5);
        }
    }
}
