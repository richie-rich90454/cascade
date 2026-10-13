import { GameSystem } from "../../../core/GameSystem";
import type { GameState } from "../../../core/GameState";
import { ResourceType } from "../../../types/ResourceType";

export class BrazilianPath extends GameSystem {
    constructor() {
        super("brazilian_path");
    }

    protected override onSimulateTurn(_turnNumber: number, gameState: GameState): void {
        if (!gameState.isScenarioFlagSet("path_s4_brazil")) {
            return;
        }
        const brazil = gameState.getNation("brazil");
        if (brazil === null) {
            return;
        }
        brazil.addToTreasury(4);
        gameState.addToResource(ResourceType.GROWTH, 2);
        gameState.addToResource(ResourceType.SUPPORT, 2);
    }
}
