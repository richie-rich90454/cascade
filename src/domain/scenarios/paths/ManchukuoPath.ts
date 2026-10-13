import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class ManchukuoPath extends GameSystem {
    constructor() {
        super("manchukuo_path");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (turnNumber !== 3) {
            return;
        }
        if (gameState.getNation("empire_of_japan") === null) {
            return;
        }
        gameState.addToResource(ResourceType.TERRITORY, 5);
        gameState.addToResource(ResourceType.RESISTANCE, 3);
    }
}
