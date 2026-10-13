import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class HitlerPath extends GameSystem {
    constructor() {
        super("hitler_path");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (!gameState.isScenarioFlagSet("path_s7_hitler")) {
            return;
        }
        const germanEmpire = gameState.getNation("german_empire");
        if (germanEmpire === null) {
            return;
        }
        gameState.addToResource(ResourceType.PRODUCTION, 2);
        gameState.addToResource(ResourceType.SUPPLY, 2);
        germanEmpire.addToStability(turnNumber >= 8 ? -3 : 1);
    }
}
