import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class AntiImperialResistanceSystem extends GameSystem {
    constructor() {
        super("anti_imperial_resistance");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const resistanceGrowth = turnNumber >= 4 ? 3 : 2;
        gameState.addToResource(ResourceType.RESISTANCE, resistanceGrowth);
        if (gameState.getResourceQuantity(ResourceType.RESISTANCE) < 55) {
            return;
        }
        for (const imperialNationIdentifier of ["british_empire", "french_republic"]) {
            const imperialNation = gameState.getNation(imperialNationIdentifier);
            if (imperialNation === null) {
                continue;
            }
            imperialNation.addToLegitimacy(-1);
        }
    }
}
