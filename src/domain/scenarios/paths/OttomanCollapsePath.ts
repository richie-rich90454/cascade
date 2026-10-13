import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class OttomanCollapsePath extends GameSystem {
    constructor() {
        super("ottoman_collapse_path");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const ottomanEmpire = gameState.getNation("ottoman_empire");
        if (ottomanEmpire === null) {
            return;
        }
        if (turnNumber === 4) {
            ottomanEmpire.addToLegitimacy(-5);
            gameState.addToResource(ResourceType.IMPERIAL_CONTROL, -10);
        }
        if (turnNumber === 9) {
            ottomanEmpire.addToManpower(-8000);
            ottomanEmpire.addToTreasury(-40);
            gameState.setScenarioFlag("ottoman_balkan_territories_lost");
        }
        if (turnNumber === 12) {
            gameState.setScenarioFlag("ottoman_collapse_accelerated");
        }
    }
}
