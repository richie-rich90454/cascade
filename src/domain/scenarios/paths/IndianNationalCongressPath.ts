import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class IndianNationalCongressPath extends GameSystem {
    constructor() {
        super("indian_national_congress_path");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const britishRaj = gameState.getNation("british_raj");
        const britishEmpire = gameState.getNation("british_empire");
        if (britishRaj === null || britishEmpire === null) {
            return;
        }
        const congressPressure = turnNumber >= 4 ? 3 : 2;
        gameState.addToResource(ResourceType.RESISTANCE, congressPressure);
        britishEmpire.addToLegitimacy(-1);
    }
}
