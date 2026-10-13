import { GameSystem } from "../../../core/GameSystem";
import type { GameState } from "../../../core/GameState";
import { ResourceType } from "../../../types/ResourceType";

export class LaissezFaireToInterventionSystem extends GameSystem {
    private readonly interventionistNationIdentifiers: string[];

    constructor() {
        super("laissez_faire_to_intervention");
        this.interventionistNationIdentifiers = ["soviet_union", "united_states", "kingdom_of_italy", "brazil", "mexico"];
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        for (const nation of gameState.getAllNations()) {
            nation.addToTreasury(1);
        }
        if (turnNumber < 5) {
            return;
        }
        for (const interventionistNationIdentifier of this.interventionistNationIdentifiers) {
            if (gameState.getNation(interventionistNationIdentifier) === null) {
                continue;
            }
            gameState.addToResource(ResourceType.SUPPORT, 1);
        }
    }
}
