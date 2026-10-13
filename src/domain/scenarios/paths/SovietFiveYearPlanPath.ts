import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class SovietFiveYearPlanPath extends GameSystem {
    constructor() {
        super("soviet_five_year_plan_path");
    }

    protected override onSimulateTurn(_turnNumber: number, gameState: GameState): void {
        if (!gameState.isScenarioFlagSet("path_s4_soviet")) {
            return;
        }
        const sovietUnion = gameState.getNation("soviet_union");
        if (sovietUnion === null) {
            return;
        }
        gameState.addToResource(ResourceType.PRODUCTION, 4);
        sovietUnion.addToTreasury(10);
        gameState.addToResource(ResourceType.SUPPORT, -3);
        gameState.addToResource(ResourceType.REPRESSION, 4);
    }
}
