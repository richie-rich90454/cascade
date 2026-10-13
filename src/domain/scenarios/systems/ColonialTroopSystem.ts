import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class ColonialTroopSystem extends GameSystem {
    constructor() {
        super("colonial_troops");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const arrivingTroops = turnNumber <= 2 ? 1000 : 1500;
        gameState.addToResource(ResourceType.MANPOWER, arrivingTroops);
        gameState.addToResource(ResourceType.COLONIAL_RESOURCES, 2);
    }
}
