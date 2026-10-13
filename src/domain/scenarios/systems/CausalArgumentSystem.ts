import { EventBus, GameEventTypes, TelegramRequestPayload } from "../../../core/EventBus";
import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";

// ponytail: telegram nudge only; the argument UI sets argument_s10_complete
export class CausalArgumentSystem extends GameSystem {
    constructor() {
        super("causal_argument_system");
    }

    protected override onSimulateTurn(turnNumber: number, _gameState: GameState): void {
        if (turnNumber !== 4) {
            return;
        }
        EventBus.getInstance().publish(
            GameEventTypes.TELEGRAM_REQUESTED,
            new TelegramRequestPayload("Scholarly Brief", "The argument takes shape", [
                "Your thesis must weigh causes rather than list them; decide which cause carries the greatest significance and explain why.",
                "Set the evidence from each phase of the period against the alternatives you have studied.",
                "A strong argument answers the strongest objection, not the weakest one.",
            ]),
        );
    }
}
