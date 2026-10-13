import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class SovietFiveYearPlanSystem extends GameSystem {
    constructor() {
        super("soviet_five_year_plan");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const sovietUnion = gameState.getNation("soviet_union");
        if (sovietUnion === null) {
            return;
        }
        const productionGain = turnNumber >= 5 ? 4 : 2;
        gameState.addToResource(ResourceType.PRODUCTION, productionGain);
        sovietUnion.addToTreasury(8);
        gameState.addToResource(ResourceType.SUPPORT, -2);
        gameState.addToResource(ResourceType.REPRESSION, 3);
    }
}
