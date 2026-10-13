import { EventBus, GameEventTypes, TelegramRequestPayload } from "../../../core/EventBus";
import type { GameState } from "../../../core/GameState";
import { GameSystem } from "../../../core/GameSystem";

export class UkrainianAtrocitySystem extends GameSystem {
    private static readonly OPENING_TURN_NUMBER = 3;
    private static readonly CASE_FLAG_IDENTIFIER = "case_s9_ukrainian_opened";

    constructor() {
        super("ukrainian_atrocity");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        if (turnNumber !== UkrainianAtrocitySystem.OPENING_TURN_NUMBER) {
            return;
        }
        if (gameState.isScenarioFlagSet(UkrainianAtrocitySystem.CASE_FLAG_IDENTIFIER)) {
            return;
        }
        gameState.setScenarioFlag(UkrainianAtrocitySystem.CASE_FLAG_IDENTIFIER);
        EventBus.getInstance().publish(
            GameEventTypes.TELEGRAM_REQUESTED,
            new TelegramRequestPayload("Scholarly Brief", "The Historical Reckoning: the Holodomor case opens", [
                "The file of 1932-1933 is opened: collectivization and grain requisitions brought mass starvation to Ukraine and the Kuban.",
                "Gareth Jones's dispatches, the Law of Three Spikelets, and Chamberlin's later report document the famine and its denial.",
                "The record shows a catastrophe produced by state policy and concealed from the world.",
            ]),
        );
    }
}
