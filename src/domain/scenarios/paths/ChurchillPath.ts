import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class ChurchillPath extends GameSystem {
    constructor() {
        super("churchill_path");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (!gameState.isScenarioFlagSet("path_s7_churchill") || turnNumber < 3) {
            return;
        }
        const britishEmpire = gameState.getNation("british_empire");
        if (britishEmpire === null) {
            return;
        }
        gameState.addToResource(ResourceType.SUPPORT, 2);
        britishEmpire.addToStability(2);
    }
}
