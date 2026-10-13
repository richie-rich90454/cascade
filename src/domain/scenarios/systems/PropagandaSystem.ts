import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class PropagandaSystem extends GameSystem {
    constructor() {
        super("propaganda");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        gameState.addToResource(ResourceType.OPINION, 2);
        if (turnNumber >= 5) {
            const playerNation = gameState.getNation(gameState.getPlayerNationIdentifier());
            if (playerNation !== null) {
                playerNation.addToLegitimacy(-1);
            }
        }
    }
}
