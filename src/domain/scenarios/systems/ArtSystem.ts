import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class ArtSystem extends GameSystem {
    constructor() {
        super("art");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const isExhibitionTurn = turnNumber % 3 === 0;
        gameState.addToResource(ResourceType.OPINION, isExhibitionTurn ? 2 : 1);
    }
}
