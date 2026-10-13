import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";
import { ResourceType } from "../../../types/ResourceType";

export class AllianceSystem extends GameSystem {
    constructor() {
        super("alliance_system");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        const germanEmpire = gameState.getNation("german_empire");
        const austroHungarianEmpire = gameState.getNation("austro_hungarian_empire");
        const russianEmpire = gameState.getNation("russian_empire");
        const frenchRepublic = gameState.getNation("french_republic");
        const serbia = gameState.getNation("serbia");
        const britishEmpire = gameState.getNation("british_empire");
        if (turnNumber === 1) {
            if (germanEmpire !== null && austroHungarianEmpire !== null) {
                germanEmpire.formAllianceWith(austroHungarianEmpire);
            }
            gameState.addToResource(ResourceType.ALLIANCES, 5);
        }
        if (turnNumber === 2) {
            if (russianEmpire !== null && serbia !== null) {
                russianEmpire.formAllianceWith(serbia);
            }
            gameState.addToResource(ResourceType.ALLIANCES, -5);
        }
        if (turnNumber === 3) {
            if (germanEmpire !== null && russianEmpire !== null) {
                germanEmpire.declareWarOn(russianEmpire);
            }
            if (germanEmpire !== null && frenchRepublic !== null) {
                germanEmpire.declareWarOn(frenchRepublic);
            }
            if (austroHungarianEmpire !== null && serbia !== null) {
                austroHungarianEmpire.declareWarOn(serbia);
            }
            gameState.addToResource(ResourceType.ALLIANCES, -10);
        }
        if (turnNumber >= 4) {
            if (britishEmpire !== null && germanEmpire !== null) {
                britishEmpire.declareWarOn(germanEmpire);
            }
            gameState.addToResource(ResourceType.ALLIANCES, -5);
        }
    }
}
