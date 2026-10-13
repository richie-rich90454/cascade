import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class FascistRegimeSystem extends GameSystem {
    constructor() {
        super("fascist_regime");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (turnNumber < 4) {
            return;
        }
        const germanEmpire = gameState.getNation("german_empire");
        if (germanEmpire === null) {
            return;
        }
        gameState.addToResource(ResourceType.SUPPORT, 2);
        gameState.addToResource(ResourceType.MILITARY, 2);
        germanEmpire.addToTreasury(-3);
    }
}
