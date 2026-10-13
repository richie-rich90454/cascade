import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";

export class MexicanRevolutionPath extends GameSystem {
    constructor() {
        super("mexican_revolution_path");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const mexico = gameState.getNation("mexico");
        if (mexico === null) {
            return;
        }
        if (turnNumber === 6) {
            mexico.addToStability(-10);
            mexico.addToLegitimacy(-8);
            gameState.setScenarioFlag("mexican_revolution_begun");
        }
        if (turnNumber === 9) {
            mexico.addToManpower(-6000);
            mexico.addToTreasury(-25);
        }
        if (turnNumber === 12) {
            mexico.addToLegitimacy(5);
            gameState.setScenarioFlag("mexican_constitution_1917");
        }
    }
}
