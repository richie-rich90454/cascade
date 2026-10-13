import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class RooseveltPath extends GameSystem {
    constructor() {
        super("roosevelt_path");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (!gameState.isScenarioFlagSet("path_s7_roosevelt")) {
            return;
        }
        const unitedStates = gameState.getNation("united_states");
        if (unitedStates === null) {
            return;
        }
        if (turnNumber <= 4) {
            unitedStates.addToTreasury(8);
            gameState.addToResource(ResourceType.PRODUCTION, 1);
            return;
        }
        gameState.addToResource(ResourceType.PRODUCTION, 4);
        gameState.addToResource(ResourceType.SUPPORT, 3);
    }
}
