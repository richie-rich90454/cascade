import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class ContinuedImperialismSystem extends GameSystem {
    constructor() {
        super("continued_imperialism");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (turnNumber === 2 || turnNumber === 3) {
            const empireOfJapan = gameState.getNation("empire_of_japan");
            if (empireOfJapan !== null) {
                empireOfJapan.addToTreasury(8);
                gameState.addToResource(ResourceType.MILITARY, 2);
                gameState.addToResource(ResourceType.ECONOMY, 2);
            }
        }
        if (turnNumber === 5) {
            const kingdomOfItaly = gameState.getNation("kingdom_of_italy");
            if (kingdomOfItaly !== null) {
                kingdomOfItaly.addToTreasury(5);
                gameState.addToResource(ResourceType.MILITARY, 2);
                gameState.addToResource(ResourceType.ECONOMY, 1);
            }
        }
    }
}
