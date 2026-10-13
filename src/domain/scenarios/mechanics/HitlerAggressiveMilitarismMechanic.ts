import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class HitlerAggressiveMilitarismMechanic extends GameSystem {
    constructor() {
        super("hitler_aggressive_militarism");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (turnNumber < 6) {
            return;
        }
        gameState.addToResource(ResourceType.MILITARY, 3);
        gameState.addToResource(ResourceType.SUPPORT, 2);
        const britishEmpire = gameState.getNation("british_empire");
        if (britishEmpire !== null) {
            britishEmpire.addToTreasury(-4);
        }
        const frenchRepublic = gameState.getNation("french_republic");
        if (frenchRepublic !== null) {
            frenchRepublic.addToTreasury(-4);
        }
    }
}
