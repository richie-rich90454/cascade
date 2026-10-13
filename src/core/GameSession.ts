import { EventBus, GameEventTypes, ScenarioCompletionPayload } from "./EventBus";
import { GameState } from "./GameState";
import { TurnManager } from "./TurnManager";
import { AssessmentManager } from "../managers/AssessmentManager";
import { AudioManager } from "../managers/AudioManager";
import { DiplomacyManager } from "../managers/DiplomacyManager";
import { DomesticManager } from "../managers/DomesticManager";
import { EconomyManager } from "../managers/EconomyManager";
import { IntelligenceManager } from "../managers/IntelligenceManager";
import { MilitaryManager } from "../managers/MilitaryManager";
import type { Scenario, ScenarioEvaluationResult } from "../domain/scenarios/Scenario";
import { ResourceType } from "../types/ResourceType";

export class GameSession {
    private static readonly SINGLETON_INSTANCE = new GameSession();

    private readonly gameState: GameState;
    private readonly assessmentManager: AssessmentManager;
    private readonly audioManager: AudioManager;

    private diplomacyManager: DiplomacyManager;
    private economyManager: EconomyManager;
    private militaryManager: MilitaryManager;
    private domesticManager: DomesticManager;
    private intelligenceManager: IntelligenceManager;

    private currentScenario: Scenario | null;
    private hasVictoryResultBeenRecorded: boolean;

    private constructor() {
        this.gameState = new GameState();
        this.assessmentManager = AssessmentManager.getInstance();
        this.audioManager = AudioManager.getInstance();
        this.diplomacyManager = new DiplomacyManager(this.gameState);
        this.economyManager = new EconomyManager(this.gameState);
        this.militaryManager = new MilitaryManager(this.gameState);
        this.domesticManager = new DomesticManager();
        this.intelligenceManager = new IntelligenceManager(this.gameState);
        this.currentScenario = null;
        this.hasVictoryResultBeenRecorded = false;
    }

    public static getInstance(): GameSession {
        return GameSession.SINGLETON_INSTANCE;
    }

    public startScenario(scenario: Scenario): void {
        this.currentScenario = scenario;
        this.hasVictoryResultBeenRecorded = false;
        this.diplomacyManager = new DiplomacyManager(this.gameState);
        this.economyManager = new EconomyManager(this.gameState);
        this.militaryManager = new MilitaryManager(this.gameState);
        this.domesticManager = new DomesticManager();
        this.intelligenceManager = new IntelligenceManager(this.gameState);
        scenario.registerInitialState(this.gameState);
        TurnManager.getInstance().beginScenario();
    }

    public getGameState(): GameState {
        return this.gameState;
    }

    public getCurrentScenario(): Scenario | null {
        return this.currentScenario;
    }

    public isScenarioActive(): boolean {
        return this.currentScenario !== null;
    }

    public getAssessmentManager(): AssessmentManager {
        return this.assessmentManager;
    }

    public getAudioManager(): AudioManager {
        return this.audioManager;
    }

    public getDiplomacyManager(): DiplomacyManager {
        return this.diplomacyManager;
    }

    public getEconomyManager(): EconomyManager {
        return this.economyManager;
    }

    public getMilitaryManager(): MilitaryManager {
        return this.militaryManager;
    }

    public getDomesticManager(): DomesticManager {
        return this.domesticManager;
    }

    public getIntelligenceManager(): IntelligenceManager {
        return this.intelligenceManager;
    }

    public getCurrentTurnNumber(): number {
        return this.gameState.getTurnNumber();
    }

    public getTotalTurnCount(): number {
        return this.currentScenario === null ? 0 : this.currentScenario.getTurnCount();
    }

    public advanceScenarioTurn(): void {
        if (this.currentScenario === null) {
            return;
        }
        const nextTurnNumber = this.gameState.getTurnNumber() + 1;
        this.gameState.setTurnNumber(nextTurnNumber);
        this.currentScenario.simulateTurn(nextTurnNumber, this.gameState);
        this.economyManager.advanceAllProductionQueues();
        this.economyManager.advanceNationalEconomies();
        if (nextTurnNumber % 3 === 0) {
            this.gameState.addToResource(ResourceType.INTELLIGENCE, 2);
        }
        TurnManager.getInstance().advanceTurn();
    }

    public isFinalTurn(): boolean {
        return this.gameState.getTurnNumber() >= this.getTotalTurnCount();
    }

    public evaluateCurrentScenario(): ScenarioEvaluationResult | null {
        if (this.currentScenario === null) {
            return null;
        }
        return this.currentScenario.evaluateVictory(this.gameState);
    }

    public recordScenarioCompletion(scenarioEvaluationResult: ScenarioEvaluationResult): void {
        if (this.currentScenario === null || this.hasVictoryResultBeenRecorded) {
            return;
        }
        this.hasVictoryResultBeenRecorded = true;
        this.assessmentManager.recordScenarioVictory(
            scenarioEvaluationResult.scenarioNumber,
            scenarioEvaluationResult.isVictory,
        );
        EventBus.getInstance().publish(
            GameEventTypes.SCENARIO_COMPLETED,
            new ScenarioCompletionPayload(
                scenarioEvaluationResult.scenarioNumber,
                scenarioEvaluationResult.isVictory,
                scenarioEvaluationResult.earnedScore,
            ),
        );
    }
}
