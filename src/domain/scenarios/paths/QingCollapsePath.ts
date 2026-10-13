import { GameSystem } from "../../../core/GameSystem";
import type { GameState } from "../../../core/GameState";

export class QingCollapsePath extends GameSystem {
    constructor() {
        super("qing_collapse_path");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const qingChina = gameState.getNation("qing_china");
        if (qingChina === null) {
            return;
        }
        if (turnNumber === 3) {
            qingChina.addToLegitimacy(-6);
        }
        if (turnNumber === 7) {
            qingChina.addToLegitimacy(-12);
            qingChina.addToStability(-15);
            gameState.setScenarioFlag("qing_xinhai_revolution_fired");
        }
        if (turnNumber === 10) {
            qingChina.renameEntity("Republic of China (1912)");
        }
    }
}
