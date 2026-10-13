import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class RepressivePolicyMechanic extends GameSystem {
    private readonly repressiveNationIdentifiers: string[];

    constructor() {
        super("repressive_policy");
        this.repressiveNationIdentifiers = ["soviet_union", "kingdom_of_italy"];
    }

    protected override onSimulateTurn(_turnNumber: number, gameState: GameState): void {
        for (const repressiveNationIdentifier of this.repressiveNationIdentifiers) {
            if (gameState.getNation(repressiveNationIdentifier) === null) {
                continue;
            }
            gameState.addToResource(ResourceType.SUPPORT, -2);
            gameState.addToResource(ResourceType.REPRESSION, 3);
        }
    }
}
