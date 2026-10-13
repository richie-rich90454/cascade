import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class ColonialMobilizationSystem extends GameSystem {
    constructor() {
        super("colonial_mobilization");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const extractionRate = turnNumber >= 4 ? 4 : 3;
        gameState.addToResource(ResourceType.COLONIAL_RESOURCES, extractionRate);
        gameState.addToResource(ResourceType.MANPOWER, 500);
    }
}
