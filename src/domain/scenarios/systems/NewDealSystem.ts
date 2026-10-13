import { GameSystem } from "../../../core/GameSystem";
import type { GameState } from "../../../core/GameState";
import { ResourceType } from "../../../types/ResourceType";

export class NewDealSystem extends GameSystem {
    constructor() {
        super("new_deal");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (turnNumber < 8) {
            return;
        }
        const unitedStates = gameState.getNation("united_states");
        if (unitedStates === null) {
            return;
        }
        gameState.addToResource(ResourceType.GROWTH, 2);
        unitedStates.addToTreasury(10);
        gameState.addToResource(ResourceType.SUPPORT, 1);
    }
}
