import { GameSystem } from "../../../core/GameSystem";
import type { GameState } from "../../../core/GameState";
import { ResourceType } from "../../../types/ResourceType";

export class NewDealPath extends GameSystem {
    constructor() {
        super("new_deal_path");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (!gameState.isScenarioFlagSet("path_s4_new_deal") || turnNumber < 8) {
            return;
        }
        const unitedStates = gameState.getNation("united_states");
        if (unitedStates === null) {
            return;
        }
        gameState.addToResource(ResourceType.GROWTH, 3);
        unitedStates.addToTreasury(10);
        gameState.addToResource(ResourceType.SUPPORT, 2);
    }
}
