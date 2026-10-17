import type { Scenario, ScenarioEvaluationResult } from "../domain/scenarios/Scenario";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import { AssessmentManager } from "../managers/AssessmentManager";
import { AudioManager } from "../managers/AudioManager";
import { DiplomacyManager } from "../managers/DiplomacyManager";
import { DomesticManager } from "../managers/DomesticManager";
import { EconomyManager } from "../managers/EconomyManager";
import { IntelligenceManager } from "../managers/IntelligenceManager";
import { LocalProfileManager } from "../managers/LocalProfileManager";
import { MilitaryManager } from "../managers/MilitaryManager";
import { ResourceType } from "../types/ResourceType";
import { EventBus, GameEventTypes, ScenarioCompletionPayload } from "./EventBus";
import { GameState } from "./GameState";
import { TurnManager } from "./TurnManager";
import type { CampaignSaveData } from "./CampaignSave";

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
    private playProgress: CampaignSaveData["playProgress"];
    private isRestoringCampaign: boolean;

    private constructor() {
        this.gameState = new GameState();
        LocalProfileManager.getInstance();
        this.assessmentManager = AssessmentManager.getInstance();
        this.audioManager = AudioManager.getInstance();
        this.diplomacyManager = new DiplomacyManager(this.gameState);
        this.economyManager = new EconomyManager(this.gameState);
        this.militaryManager = new MilitaryManager(this.gameState);
        this.domesticManager = new DomesticManager();
        this.intelligenceManager = new IntelligenceManager(this.gameState);
        this.currentScenario = null;
        this.hasVictoryResultBeenRecorded = false;
        this.playProgress = {
            phaseIndex: 0,
            walkthroughEnabled: true,
            walkthroughPaused: false,
            walkthroughStep: 0,
        };
        this.isRestoringCampaign = false;
        const persistOnChange = (): void => {
            if (!this.isRestoringCampaign) {
                this.persistCampaign();
            }
        };
        const eventBus = EventBus.getInstance();
        [
            GameEventTypes.TURN_PHASE_CHANGED,
            GameEventTypes.TURN_STARTED,
            GameEventTypes.GAME_STATE_CHANGED,
            GameEventTypes.RESOURCE_CHANGED,
            GameEventTypes.SOURCE_ANALYZED,
            GameEventTypes.DECISION_MADE,
            GameEventTypes.MECHANIC_COMPLETED,
            GameEventTypes.CAUSAL_CHAIN_COMPLETED,
            GameEventTypes.COMPARISON_COMPLETED,
            GameEventTypes.CONTINUITY_CHART_COMPLETED,
            GameEventTypes.JOURNAL_UPDATED,
            GameEventTypes.SCENARIO_COMPLETED,
        ].forEach((eventName) => eventBus.subscribe(eventName, persistOnChange));
    }

    public static getInstance(): GameSession {
        return GameSession.SINGLETON_INSTANCE;
    }

    public startScenario(scenario: Scenario): void {
        this.isRestoringCampaign = true;
        try {
            this.currentScenario = scenario;
            this.hasVictoryResultBeenRecorded = false;
            this.playProgress = {
                phaseIndex: 0,
                walkthroughEnabled: true,
                walkthroughPaused: false,
                walkthroughStep: 0,
            };
            this.gameState.reset();
            this.diplomacyManager = new DiplomacyManager(this.gameState);
            this.economyManager = new EconomyManager(this.gameState);
            this.militaryManager = new MilitaryManager(this.gameState);
            this.domesticManager = new DomesticManager();
            this.intelligenceManager = new IntelligenceManager(this.gameState);
            scenario.registerInitialState(this.gameState);
            this.gameState.setTurnNumber(1);
            TurnManager.getInstance().beginScenario();
        } finally {
            this.isRestoringCampaign = false;
        }
        this.persistCampaign();
    }

    public restoreCampaign(save: CampaignSaveData): boolean {
        const scenario = ScenarioRegistry.getInstance().getScenarioByNumber(save.scenarioNumber);
        if (
            scenario === null ||
            save.gameState.scenarioIdentifier !== scenario.getSystemName() ||
            save.gameState.turnNumber !== save.turnManager.turnNumber
        ) {
            return false;
        }
        this.isRestoringCampaign = true;
        try {
            this.gameState.reset();
            this.currentScenario = scenario;
            scenario.registerInitialState(this.gameState);
            if (!this.gameState.restoreSnapshot(save.gameState)) {
                this.clearActiveSession();
                return false;
            }
            this.hasVictoryResultBeenRecorded = save.hasVictoryResultBeenRecorded;
            this.playProgress = structuredClone(save.playProgress);
            this.diplomacyManager = new DiplomacyManager(this.gameState);
            this.economyManager = new EconomyManager(this.gameState);
            this.militaryManager = new MilitaryManager(this.gameState);
            this.domesticManager = new DomesticManager();
            this.intelligenceManager = new IntelligenceManager(this.gameState);
            this.intelligenceManager.restoreSnapshot(save.intelligenceResults);
            if (!TurnManager.getInstance().restoreState(
                save.turnManager.turnNumber,
                save.turnManager.phaseCode,
                save.turnManager.isActive,
            )) {
                this.clearActiveSession();
                return false;
            }
            return true;
        } catch {
            this.clearActiveSession();
            return false;
        } finally {
            this.isRestoringCampaign = false;
        }
    }

    public clearActiveSession(): void {
        this.gameState.reset();
        this.currentScenario = null;
        this.hasVictoryResultBeenRecorded = false;
        TurnManager.getInstance().endScenario();
        this.diplomacyManager = new DiplomacyManager(this.gameState);
        this.economyManager = new EconomyManager(this.gameState);
        this.militaryManager = new MilitaryManager(this.gameState);
        this.domesticManager = new DomesticManager();
        this.intelligenceManager = new IntelligenceManager(this.gameState);
        this.playProgress = {
            phaseIndex: 0,
            walkthroughEnabled: true,
            walkthroughPaused: false,
            walkthroughStep: 0,
        };
    }

    public setPlayProgress(progress: CampaignSaveData["playProgress"]): void {
        this.playProgress = structuredClone(progress);
        this.persistCampaign();
    }

    public getPlayProgress(): CampaignSaveData["playProgress"] {
        return structuredClone(this.playProgress);
    }

    public createCampaignSnapshot(): CampaignSaveData | null {
        if (this.currentScenario === null || !TurnManager.getInstance().isScenarioInProgress()) {
            return null;
        }
        const turnManager = TurnManager.getInstance();
        return {
            version: 1,
            scenarioNumber: this.currentScenario.getScenarioNumber(),
            gameState: this.gameState.createSnapshot(),
            intelligenceResults: this.intelligenceManager.createSnapshot(),
            turnManager: {
                turnNumber: turnManager.getCurrentTurnNumber(),
                phaseCode: turnManager.getCurrentPhase().getCode(),
                isActive: turnManager.isScenarioInProgress(),
            },
            playProgress: structuredClone(this.playProgress),
            hasVictoryResultBeenRecorded: this.hasVictoryResultBeenRecorded,
            savedAtIsoTimestamp: new Date().toISOString(),
        };
    }

    public persistCampaign(): void {
        if (this.isRestoringCampaign) {
            return;
        }
        LocalProfileManager.getInstance().saveCampaign(this.createCampaignSnapshot());
    }

    public switchToProfile(profileIdentifier: string): boolean {
        this.persistCampaign();
        if (!LocalProfileManager.getInstance().switchProfile(profileIdentifier)) {
            return false;
        }
        this.clearActiveSession();
        this.assessmentManager.restoreSnapshot(LocalProfileManager.getInstance().getActiveAssessment());
        return true;
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
        this.isRestoringCampaign = true;
        try {
            this.gameState.setTurnNumber(nextTurnNumber);
            this.currentScenario.simulateTurn(nextTurnNumber, this.gameState);
            this.economyManager.advanceAllProductionQueues();
            this.economyManager.advanceNationalEconomies();
            if (nextTurnNumber % 3 === 0) {
                this.gameState.addToResource(ResourceType.INTELLIGENCE, 2);
            }
        } finally {
            this.isRestoringCampaign = false;
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
