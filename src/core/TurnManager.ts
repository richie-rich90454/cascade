import { EventBus, GameEventTypes, PhaseChangePayload } from "./EventBus";

export class TurnPhase {
    public static readonly BRIEFING = new TurnPhase(
        "briefing",
        "Briefing",
        "Read the situation, the objectives, and the historical context.",
    );
    public static readonly INTELLIGENCE = new TurnPhase(
        "intelligence",
        "Intelligence",
        "Analyze primary sources to gather usable intelligence.",
    );
    public static readonly DECISION = new TurnPhase(
        "decision",
        "Decision",
        "Make strategic choices across the five interlocking domains.",
    );
    public static readonly RESOLUTION = new TurnPhase(
        "resolution",
        "Resolution",
        "Observe the consequences of the decisions.",
    );
    public static readonly EVENT = new TurnPhase("event", "Event", "Read the historical event of the turn.");
    public static readonly DEBRIEF = new TurnPhase("debrief", "Debrief", "Write a reflection on the turn.");
    public static readonly JOURNAL = new TurnPhase("journal", "Journal", "Record the learning of the turn.");

    private readonly phaseCode: string;
    private readonly phaseDisplayName: string;
    private readonly phaseDescription: string;

    private constructor(phaseCode: string, phaseDisplayName: string, phaseDescription: string) {
        this.phaseCode = phaseCode;
        this.phaseDisplayName = phaseDisplayName;
        this.phaseDescription = phaseDescription;
    }

    public getCode(): string {
        return this.phaseCode;
    }

    public getDisplayName(): string {
        return this.phaseDisplayName;
    }

    public getDescription(): string {
        return this.phaseDescription;
    }

    public static getAllPhases(): TurnPhase[] {
        return [
            TurnPhase.BRIEFING,
            TurnPhase.INTELLIGENCE,
            TurnPhase.DECISION,
            TurnPhase.RESOLUTION,
            TurnPhase.EVENT,
            TurnPhase.DEBRIEF,
            TurnPhase.JOURNAL,
        ];
    }
}

export class TurnManager {
    private static readonly SINGLETON_INSTANCE = new TurnManager();

    private readonly enteredPhases: TurnPhase[];

    private currentPhase: TurnPhase;
    private currentTurnNumber: number;
    private isScenarioActive: boolean;

    private constructor() {
        this.enteredPhases = [];
        this.currentPhase = TurnPhase.BRIEFING;
        this.currentTurnNumber = 0;
        this.isScenarioActive = false;
    }

    public static getInstance(): TurnManager {
        return TurnManager.SINGLETON_INSTANCE;
    }

    public beginScenario(): void {
        this.currentTurnNumber = 1;
        this.isScenarioActive = true;
        this.enterPhase(TurnPhase.BRIEFING);
        EventBus.getInstance().publish(GameEventTypes.TURN_STARTED, { turnNumber: this.currentTurnNumber });
    }

    public enterBriefingPhase(): void {
        this.enterPhase(TurnPhase.BRIEFING);
    }

    public enterIntelligencePhase(): void {
        this.enterPhase(TurnPhase.INTELLIGENCE);
    }

    public enterDecisionPhase(): void {
        this.enterPhase(TurnPhase.DECISION);
    }

    public enterResolutionPhase(): void {
        this.enterPhase(TurnPhase.RESOLUTION);
    }

    public enterEventPhase(): void {
        this.enterPhase(TurnPhase.EVENT);
    }

    public enterDebriefPhase(): void {
        this.enterPhase(TurnPhase.DEBRIEF);
    }

    public enterJournalPhase(): void {
        this.enterPhase(TurnPhase.JOURNAL);
    }

    public advanceTurn(): void {
        this.currentTurnNumber += 1;
        this.enterPhase(TurnPhase.BRIEFING);
    }

    public endScenario(): void {
        this.isScenarioActive = false;
    }

    public getCurrentPhase(): TurnPhase {
        return this.currentPhase;
    }

    public getCurrentTurnNumber(): number {
        return this.currentTurnNumber;
    }

    public isScenarioInProgress(): boolean {
        return this.isScenarioActive;
    }

    public isInPhase(turnPhase: TurnPhase): boolean {
        return this.currentPhase === turnPhase;
    }

    public getEnteredPhases(): TurnPhase[] {
        return [...this.enteredPhases];
    }

    public restoreState(turnNumber: number, phaseCode: string, isActive: boolean): boolean {
        const restoredPhase = TurnPhase.getAllPhases().find((phase) => phase.getCode() === phaseCode);
        if (!Number.isInteger(turnNumber) || turnNumber < 1 || restoredPhase === undefined) {
            return false;
        }
        this.currentTurnNumber = turnNumber;
        this.currentPhase = restoredPhase;
        this.isScenarioActive = isActive;
        this.enteredPhases.length = 0;
        this.enteredPhases.push(restoredPhase);
        return true;
    }

    private enterPhase(turnPhase: TurnPhase): void {
        const previousPhase = this.currentPhase;
        this.currentPhase = turnPhase;
        this.enteredPhases.push(turnPhase);
        EventBus.getInstance().publish(
            GameEventTypes.TURN_PHASE_CHANGED,
            new PhaseChangePayload(previousPhase.getCode(), turnPhase.getCode(), this.currentTurnNumber),
        );
    }
}
