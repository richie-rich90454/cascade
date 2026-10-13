import { GameSystem } from "../../../core/GameSystem";
import type { GameState } from "../../../core/GameState";

export class ImperialDeclineSystem extends GameSystem {
    constructor() {
        super("imperial_decline");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const decliningEmpireIdentifiers = ["ottoman_empire", "russian_empire", "qing_china", "austro_hungarian_empire"];
        for (const decliningEmpireIdentifier of decliningEmpireIdentifiers) {
            const decliningEmpire = gameState.getNation(decliningEmpireIdentifier);
            if (decliningEmpire === null) {
                continue;
            }
            const declineFactor = turnNumber >= 8 ? 3 : 1;
            decliningEmpire.addToLegitimacy(-declineFactor);
            if (decliningEmpire.getLegitimacy() < 30) {
                decliningEmpire.addToStability(-2);
            }
        }
    }
}
