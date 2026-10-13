import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class WestAfricanResistancePath extends GameSystem {
    constructor() {
        super("west_african_resistance_path");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const westAfricanColonies = gameState.getNation("west_african_colonies");
        const frenchRepublic = gameState.getNation("french_republic");
        if (westAfricanColonies === null || frenchRepublic === null) {
            return;
        }
        const resistanceGrowth = turnNumber >= 3 ? 3 : 2;
        gameState.addToResource(ResourceType.RESISTANCE, resistanceGrowth);
        frenchRepublic.addToTreasury(-4);
    }
}
