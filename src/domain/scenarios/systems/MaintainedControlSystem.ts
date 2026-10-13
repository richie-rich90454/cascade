import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class MaintainedControlSystem extends GameSystem {
    constructor() {
        super("maintained_control");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const territoryGain = turnNumber >= 3 ? 3 : 2;
        for (const imperialNationIdentifier of ["british_empire", "french_republic"]) {
            if (gameState.getNation(imperialNationIdentifier) === null) {
                continue;
            }
            gameState.addToResource(ResourceType.TERRITORY, territoryGain);
        }
        if (gameState.getResourceQuantity(ResourceType.RESISTANCE) > 40) {
            gameState.addToResource(ResourceType.RESISTANCE, 3);
        }
    }
}
