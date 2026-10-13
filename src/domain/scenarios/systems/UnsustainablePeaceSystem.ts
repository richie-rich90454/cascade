import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class UnsustainablePeaceSystem extends GameSystem {
    constructor() {
        super("unsustainable_peace");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const germanEmpire = gameState.getNation("german_empire");
        if (germanEmpire === null) {
            return;
        }
        if (turnNumber <= 4) {
            germanEmpire.addToStability(-1);
            return;
        }
        gameState.addToResource(ResourceType.SUPPORT, 2);
    }
}
