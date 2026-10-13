import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class TerritorialConflictSystem extends GameSystem {
    constructor() {
        super("territorial_conflict");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const austroHungarianEmpire = gameState.getNation("austro_hungarian_empire");
        const serbia = gameState.getNation("serbia");
        const russianEmpire = gameState.getNation("russian_empire");
        const frenchRepublic = gameState.getNation("french_republic");
        if (austroHungarianEmpire !== null) {
            austroHungarianEmpire.addToLegitimacy(-1);
            austroHungarianEmpire.addToStability(turnNumber >= 3 ? -2 : -1);
        }
        if (serbia !== null) {
            serbia.addToStability(-2);
            serbia.addToManpower(-500);
        }
        if (russianEmpire !== null && turnNumber >= 3) {
            russianEmpire.addToStability(-1);
            russianEmpire.addToManpower(-2000);
        }
        if (frenchRepublic !== null && turnNumber >= 4) {
            frenchRepublic.addToStability(-1);
            frenchRepublic.addToManpower(-2000);
        }
        gameState.addToResource(ResourceType.NATIONALISM, turnNumber >= 3 ? 3 : 1);
    }
}
