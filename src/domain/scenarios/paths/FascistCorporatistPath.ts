import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class FascistCorporatistPath extends GameSystem {
    constructor() {
        super("fascist_corporatist_path");
    }

    protected override onSimulateTurn(_turnNumber: number, gameState: GameState): void {
        if (!gameState.isScenarioFlagSet("path_s4_fascist_corporatist")) {
            return;
        }
        const kingdomOfItaly = gameState.getNation("kingdom_of_italy");
        if (kingdomOfItaly === null) {
            return;
        }
        kingdomOfItaly.addToStability(2);
        gameState.addToResource(ResourceType.PRODUCTION, 3);
        gameState.addToResource(ResourceType.REPRESSION, 3);
    }
}
