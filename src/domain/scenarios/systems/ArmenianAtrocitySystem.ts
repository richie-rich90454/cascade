import { EventBus, GameEventTypes, TelegramRequestPayload } from "../../../core/EventBus";
import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";

export class ArmenianAtrocitySystem extends GameSystem {
    private static readonly OPENING_TURN_NUMBER = 1;
    private static readonly CASE_FLAG_IDENTIFIER = "case_s9_armenian_opened";

    constructor() {
        super("armenian_atrocity");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (turnNumber !== ArmenianAtrocitySystem.OPENING_TURN_NUMBER) {
            return;
        }
        if (gameState.isScenarioFlagSet(ArmenianAtrocitySystem.CASE_FLAG_IDENTIFIER)) {
            return;
        }
        gameState.setScenarioFlag(ArmenianAtrocitySystem.CASE_FLAG_IDENTIFIER);
        EventBus.getInstance().publish(
            GameEventTypes.TELEGRAM_REQUESTED,
            new TelegramRequestPayload("Scholarly Brief", "The Historical Reckoning: the Armenian case opens", [
                "The file of 1915 is opened: the Ottoman government deported Armenian communities from Anatolia and the killing followed.",
                "Morgenthau's dispatches, the Talat Pasha cipher telegram, and survivor testimony document the case from three directions.",
                "Read the sources together, weighing official orders, foreign observation, and the voices of those who survived.",
            ]),
        );
    }
}
