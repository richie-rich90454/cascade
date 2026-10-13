import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class TotalitarianRepressionSystem extends GameSystem {
    constructor() {
        super("totalitarian_repression");
    }

    protected override onSimulateTurn(_turnNumber: number, gameState: GameState): void {
        const occupiedMinorNationIdentifiers = ["belgium", "serbia"];
        for (const occupiedMinorNationIdentifier of occupiedMinorNationIdentifiers) {
            const occupiedMinorNation = gameState.getNation(occupiedMinorNationIdentifier);
            if (occupiedMinorNation === null) {
                continue;
            }
            occupiedMinorNation.addToStability(-2);
            occupiedMinorNation.addToLegitimacy(-1);
        }
        gameState.addToResource(ResourceType.SUPPORT, -1);
    }
}
