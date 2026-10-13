import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class FascistCorporatistSystem extends GameSystem {
    constructor() {
        super("fascist_corporatist");
    }

    protected override onSimulateTurn(_turnNumber: number, gameState: GameState): void {
        const kingdomOfItaly = gameState.getNation("kingdom_of_italy");
        if (kingdomOfItaly === null) {
            return;
        }
        kingdomOfItaly.addToStability(1);
        gameState.addToResource(ResourceType.PRODUCTION, 2);
        gameState.addToResource(ResourceType.REPRESSION, 2);
    }
}
