import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class BrazilianPopulistSystem extends GameSystem {
    constructor() {
        super("brazilian_populist");
    }

    protected override onSimulateTurn(_turnNumber: number, gameState: GameState): void {
        const brazil = gameState.getNation("brazil");
        if (brazil === null) {
            return;
        }
        brazil.addToTreasury(3);
        gameState.addToResource(ResourceType.GROWTH, 1);
        gameState.addToResource(ResourceType.SUPPORT, 1);
    }
}
