import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";

export class RussianCollapsePath extends GameSystem {
    constructor() {
        super("russian_collapse_path");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const russianEmpire = gameState.getNation("russian_empire");
        if (russianEmpire === null) {
            return;
        }
        if (turnNumber === 5) {
            russianEmpire.addToLegitimacy(-8);
            russianEmpire.addToStability(-6);
        }
        if (turnNumber === 8) {
            russianEmpire.addToManpower(-20000);
            russianEmpire.addToTreasury(-60);
        }
        if (turnNumber === 12) {
            russianEmpire.addToLegitimacy(-15);
            gameState.setScenarioFlag("russian_revolution_complete");
        }
    }
}
