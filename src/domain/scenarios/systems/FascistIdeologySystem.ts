import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class FascistIdeologySystem extends GameSystem {
    constructor() {
        super("fascist_ideology");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const germanEmpire = gameState.getNation("german_empire");
        if (germanEmpire === null) {
            return;
        }
        gameState.addToResource(ResourceType.SUPPORT, 2);
        gameState.addToResource(ResourceType.SUPPLY, 2);
        germanEmpire.addToStability(turnNumber >= 5 ? -2 : 2);
    }
}
