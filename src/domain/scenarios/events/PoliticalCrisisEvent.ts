import { EventBus, GameEventTypes, NewspaperRequestPayload } from "../../../core/EventBus";
import { GameSystem } from "../../../core/GameSystem";
import type { GameState } from "../../../core/GameState";

export class PoliticalCrisisEvent extends GameSystem {
    private hasFiredEvent: boolean;

    constructor() {
        super("political_crisis_event");
        this.hasFiredEvent = false;
    }

    public getTriggerTurnNumber(): number {
        return 6;
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (this.hasFiredEvent || turnNumber !== this.getTriggerTurnNumber()) {
            return;
        }
        this.hasFiredEvent = true;
        gameState.setScenarioFlag("event_political_crisis_fired");
        EventBus.getInstance().publish(
            GameEventTypes.NEWSPAPER_REQUESTED,
            new NewspaperRequestPayload(
                "newspaper_masthead_default",
                "MEXICO CITY RISES: MADERO CALLS THE NATION TO ARMS",
                "mexico",
            ),
        );
    }
}
