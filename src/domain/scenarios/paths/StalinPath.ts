import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class StalinPath extends GameSystem {
    constructor() {
        super("stalin_path");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (!gameState.isScenarioFlagSet("path_s7_stalin")) {
            return;
        }
        const sovietUnion = gameState.getNation("soviet_union");
        if (sovietUnion === null) {
            return;
        }
        sovietUnion.addToManpower(4000);
        gameState.addToResource(ResourceType.PRODUCTION, 2);
        if (turnNumber > 6) {
            gameState.addToResource(ResourceType.SUPPORT, -2);
        }
    }
}
