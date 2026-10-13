import { EventBus, GameEventTypes, TelegramRequestPayload } from "../../../core/EventBus";
import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";

// ponytail: telegram nudge only; the argument UI sets argument_s10_complete
export class ComplexArgumentSystem extends GameSystem {
    constructor() {
        super("complex_argument_system");
    }

    protected override onSimulateTurn(turnNumber: number, _gameState: GameState): void {
        if (turnNumber !== 6) {
            return;
        }
        EventBus.getInstance().publish(
            GameEventTypes.TELEGRAM_REQUESTED,
            new TelegramRequestPayload("Scholarly Brief", "Corroborate with diverse evidence", [
                "A single source is a claim; evidence drawn from different perspectives is corroboration.",
                "Gather evidence that supports, modifies, or refutes your thesis, and let the strongest evidence qualify the argument.",
                "A complex argument explains how and why each piece of evidence matters to the claim.",
            ]),
        );
    }
}
