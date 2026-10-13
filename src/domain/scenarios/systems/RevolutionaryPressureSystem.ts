import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class RevolutionaryPressureSystem extends GameSystem {
    constructor() {
        super("revolutionary_pressure");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const pressureNationIdentifiers = ["russian_empire", "qing_china", "mexico", "ottoman_empire"];
        for (const pressureNationIdentifier of pressureNationIdentifiers) {
            const pressureNation = gameState.getNation(pressureNationIdentifier);
            if (pressureNation === null) {
                continue;
            }
            const isUnderPressure = pressureNation.getLegitimacy() < 45 || pressureNation.getStability() < 45;
            if (isUnderPressure) {
                pressureNation.addToManpower(-2000);
                pressureNation.addToTreasury(-10);
                gameState.addToResource(ResourceType.REPRESSION, 2);
                continue;
            }
            pressureNation.addToStability(1);
        }
        if (turnNumber >= 10) {
            for (const pressureNationIdentifier of pressureNationIdentifiers) {
                const pressureNation = gameState.getNation(pressureNationIdentifier);
                if (pressureNation !== null) {
                    pressureNation.addToLegitimacy(-1);
                }
            }
        }
    }
}
