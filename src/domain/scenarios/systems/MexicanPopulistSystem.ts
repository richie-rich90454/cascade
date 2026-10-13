import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class MexicanPopulistSystem extends GameSystem {
    constructor() {
        super("mexican_populist");
    }

    protected override onSimulateTurn(_turnNumber: number, gameState: GameState): void {
        const mexico = gameState.getNation("mexico");
        if (mexico === null) {
            return;
        }
        mexico.addToTreasury(2);
        gameState.addToResource(ResourceType.GROWTH, 1);
        gameState.addToResource(ResourceType.SUPPORT, 2);
    }
}
