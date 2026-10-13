import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";

export class GreatDepressionSystem extends GameSystem {
    constructor() {
        super("great_depression");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (turnNumber >= 5 && turnNumber <= 7) {
            return;
        }
        const treasuryFraction = turnNumber === 1 ? -0.15 : turnNumber <= 4 ? -0.03 : 0.02;
        for (const nation of gameState.getAllNations()) {
            const treasuryDelta = Math.round(nation.getTreasury() * treasuryFraction);
            nation.addToTreasury(Math.max(treasuryDelta, -nation.getTreasury()));
        }
    }
}
