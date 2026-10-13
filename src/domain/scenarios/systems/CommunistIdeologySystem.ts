import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class CommunistIdeologySystem extends GameSystem {
    constructor() {
        super("communist_ideology");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const sovietUnion = gameState.getNation("soviet_union");
        if (sovietUnion === null) {
            return;
        }
        gameState.addToResource(ResourceType.SUPPORT, 2);
        gameState.addToResource(ResourceType.PRODUCTION, 2);
        gameState.addToResource(ResourceType.REPRESSION, turnNumber >= 5 ? 3 : 1);
    }
}
