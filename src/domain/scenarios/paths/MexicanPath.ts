import { GameSystem } from "../../../core/GameSystem";
import type { GameState } from "../../../core/GameState";
import { ResourceType } from "../../../types/ResourceType";

export class MexicanPath extends GameSystem {
    constructor() {
        super("mexican_path");
    }

    protected override onSimulateTurn(_turnNumber: number, gameState: GameState): void {
        if (!gameState.isScenarioFlagSet("path_s4_mexico")) {
            return;
        }
        const mexico = gameState.getNation("mexico");
        if (mexico === null) {
            return;
        }
        mexico.addToTreasury(3);
        gameState.addToResource(ResourceType.GROWTH, 2);
        gameState.addToResource(ResourceType.SUPPORT, 3);
    }
}
