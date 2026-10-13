import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class ImperialistExpansionSystem extends GameSystem {
    private static readonly GREAT_POWER_NATION_IDENTIFIERS: string[] = [
        "british_empire",
        "french_republic",
        "german_empire",
        "russian_empire",
        "austro_hungarian_empire",
    ];

    constructor() {
        super("imperialist_expansion");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        for (const greatPowerIdentifier of ImperialistExpansionSystem.GREAT_POWER_NATION_IDENTIFIERS) {
            const greatPower = gameState.getNation(greatPowerIdentifier);
            if (greatPower === null) {
                continue;
            }
            greatPower.addToTreasury(-4 - turnNumber);
            gameState.addToResource(ResourceType.IMPERIAL_PRESTIGE, 1);
        }
        const britishEmpire = gameState.getNation("british_empire");
        const germanEmpire = gameState.getNation("german_empire");
        if (britishEmpire !== null && germanEmpire !== null && turnNumber >= 2) {
            britishEmpire.addToTreasury(-4);
            germanEmpire.addToTreasury(-4);
        }
        gameState.addToResource(ResourceType.NATIONALISM, turnNumber >= 4 ? 2 : 1);
    }
}
