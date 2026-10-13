import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class IndustrialMobilizationSystem extends GameSystem {
    constructor() {
        super("industrial_mobilization");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const productionGain = turnNumber >= 5 ? 4 : 3;
        gameState.addToResource(ResourceType.PRODUCTION, productionGain);
        gameState.addToResource(ResourceType.FOOD, -2);
    }
}
