import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class TotalitarianRegimeSystem extends GameSystem {
    constructor() {
        super("totalitarian_regime");
    }

    protected override onSimulateTurn(_turnNumber: number, gameState: GameState): void {
        const sovietUnion = gameState.getNation("soviet_union");
        if (sovietUnion !== null) {
            sovietUnion.addToStability(1);
        }
        const germanEmpire = gameState.getNation("german_empire");
        if (germanEmpire !== null) {
            germanEmpire.addToLegitimacy(1);
        }
        gameState.addToResource(ResourceType.SUPPORT, -1);
    }
}
