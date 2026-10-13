import { EventBus, GameEventTypes, TelegramRequestPayload } from "../../../core/EventBus";
import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";

export class RwandanAtrocitySystem extends GameSystem {
    private static readonly OPENING_TURN_NUMBER = 7;
    private static readonly CASE_FLAG_IDENTIFIER = "case_s9_rwandan_opened";

    constructor() {
        super("rwandan_atrocity");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (turnNumber !== RwandanAtrocitySystem.OPENING_TURN_NUMBER) {
            return;
        }
        if (gameState.isScenarioFlagSet(RwandanAtrocitySystem.CASE_FLAG_IDENTIFIER)) {
            return;
        }
        gameState.setScenarioFlag(RwandanAtrocitySystem.CASE_FLAG_IDENTIFIER);
        EventBus.getInstance().publish(
            GameEventTypes.TELEGRAM_REQUESTED,
            new TelegramRequestPayload("Scholarly Brief", "The Historical Reckoning: the Rwandan case opens", [
                "The file of 1994 is opened: over roughly one hundred days, extremists directed the killing of Rwanda's Tutsi population.",
                "Kangura's Ten Commandments, Léon Mugesera's speech, and RTLM broadcasts document the preparation and direction of the genocide.",
                "An estimated 800,000 Tutsi and moderate Hutu were killed while the world largely failed to act.",
            ]),
        );
    }
}
