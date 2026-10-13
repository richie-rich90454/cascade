import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class NegativeRepercussionsMechanic extends GameSystem {
    constructor() {
        super("negative_repercussions");
    }

    protected override onSimulateTurn(_turnNumber: number, gameState: GameState): void {
        if (gameState.getResourceQuantity(ResourceType.REPRESSION) < 60) {
            return;
        }
        const sovietUnion = gameState.getNation("soviet_union");
        if (sovietUnion === null) {
            return;
        }
        sovietUnion.addToManpower(-500);
        gameState.addToResource(ResourceType.GROWTH, -1);
    }
}
