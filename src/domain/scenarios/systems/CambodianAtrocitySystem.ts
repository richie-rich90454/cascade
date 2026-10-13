import { EventBus, GameEventTypes, TelegramRequestPayload } from "../../../core/EventBus";
import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";

export class CambodianAtrocitySystem extends GameSystem {
    private static readonly OPENING_TURN_NUMBER = 5;
    private static readonly CASE_FLAG_IDENTIFIER = "case_s9_cambodian_opened";

    constructor() {
        super("cambodian_atrocity");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (turnNumber !== CambodianAtrocitySystem.OPENING_TURN_NUMBER) {
            return;
        }
        if (gameState.isScenarioFlagSet(CambodianAtrocitySystem.CASE_FLAG_IDENTIFIER)) {
            return;
        }
        gameState.setScenarioFlag(CambodianAtrocitySystem.CASE_FLAG_IDENTIFIER);
        EventBus.getInstance().publish(
            GameEventTypes.TELEGRAM_REQUESTED,
            new TelegramRequestPayload("Scholarly Brief", "The Historical Reckoning: the Cambodian case opens", [
                "The file of 1975-1979 is opened: the Khmer Rouge emptied the cities and remade Cambodian society by force.",
                "The evacuation broadcast, Pol Pot's anniversary speech, and the testimony of a survivor of S-21 document ideology, terror, and survival.",
                "An estimated 1.5 to 2 million Cambodians died before the regime fell.",
            ]),
        );
    }
}
