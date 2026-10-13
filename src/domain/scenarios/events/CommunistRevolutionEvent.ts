import { EventBus, GameEventTypes, TelegramRequestPayload } from "../../../core/EventBus";
import { GameSystem } from "../../../core/GameSystem";
import type { GameState } from "../../../core/GameState";

export class CommunistRevolutionEvent extends GameSystem {
    private hasFiredEvent: boolean;

    constructor() {
        super("communist_revolution_event");
        this.hasFiredEvent = false;
    }

    public getTriggerTurnNumber(): number {
        return 12;
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (this.hasFiredEvent || turnNumber !== this.getTriggerTurnNumber()) {
            return;
        }
        this.hasFiredEvent = true;
        gameState.setScenarioFlag("event_communist_revolution_fired");
        const russianNation = gameState.getNation("russian_empire");
        if (russianNation !== null) {
            russianNation.addToLegitimacy(-35);
            russianNation.addToStability(-45);
        }
        EventBus.getInstance().publish(
            GameEventTypes.TELEGRAM_REQUESTED,
            new TelegramRequestPayload("Most Urgent", "THE BOLSHEVIKS HAVE TAKEN PETROGRAD", [
                "The Winter Palace has fallen. The Provisional Government is arrested.",
                "Soviet power is proclaimed. The Russian Empire, as it was known in 1900, exists no longer.",
                "Assess the consequences for the Eastern Front and for the colonial world.",
            ]),
        );
    }
}
