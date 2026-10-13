export class ResourceChangePayload {
    public readonly resourceTypeCode: string;
    public readonly previousQuantity: number;
    public readonly currentQuantity: number;

    constructor(resourceTypeCode: string, previousQuantity: number, currentQuantity: number) {
        this.resourceTypeCode = resourceTypeCode;
        this.previousQuantity = previousQuantity;
        this.currentQuantity = currentQuantity;
    }
}

export class PhaseChangePayload {
    public readonly previousPhaseCode: string;
    public readonly currentPhaseCode: string;
    public readonly turnNumber: number;

    constructor(previousPhaseCode: string, currentPhaseCode: string, turnNumber: number) {
        this.previousPhaseCode = previousPhaseCode;
        this.currentPhaseCode = currentPhaseCode;
        this.turnNumber = turnNumber;
    }
}

export class NewspaperRequestPayload {
    public readonly newspaperAssetId: string;
    public readonly headline: string;
    public readonly nationCode: string;

    constructor(newspaperAssetId: string, headline: string, nationCode: string) {
        this.newspaperAssetId = newspaperAssetId;
        this.headline = headline;
        this.nationCode = nationCode;
    }
}

export class TelegramRequestPayload {
    public readonly classification: string;
    public readonly subject: string;
    public readonly bodyLines: string[];

    constructor(classification: string, subject: string, bodyLines: string[]) {
        this.classification = classification;
        this.subject = subject;
        this.bodyLines = bodyLines;
    }
}

export class SourceAnalysisPayload {
    public readonly sourceIdentifier: string;
    public readonly wasAnalysisCorrect: boolean;

    constructor(sourceIdentifier: string, wasAnalysisCorrect: boolean) {
        this.sourceIdentifier = sourceIdentifier;
        this.wasAnalysisCorrect = wasAnalysisCorrect;
    }
}

export class CausalChainPayload {
    public readonly chainIdentifier: string;
    public readonly wasOrderingCorrect: boolean;

    constructor(chainIdentifier: string, wasOrderingCorrect: boolean) {
        this.chainIdentifier = chainIdentifier;
        this.wasOrderingCorrect = wasOrderingCorrect;
    }
}

export class UnlockPayload {
    public readonly nodeIdentifier: string;
    public readonly nodeDisplayName: string;

    constructor(nodeIdentifier: string, nodeDisplayName: string) {
        this.nodeIdentifier = nodeIdentifier;
        this.nodeDisplayName = nodeDisplayName;
    }
}

export class DecisionMadePayload {
    public readonly decisionIdentifier: string;
    public readonly chosenOptionIdentifier: string;

    constructor(decisionIdentifier: string, chosenOptionIdentifier: string) {
        this.decisionIdentifier = decisionIdentifier;
        this.chosenOptionIdentifier = chosenOptionIdentifier;
    }
}

export class ScenarioCompletionPayload {
    public readonly scenarioNumber: number;
    public readonly wasVictory: boolean;
    public readonly score: number;

    constructor(scenarioNumber: number, wasVictory: boolean, score: number) {
        this.scenarioNumber = scenarioNumber;
        this.wasVictory = wasVictory;
        this.score = score;
    }
}

export class NotificationPayload {
    public readonly message: string;
    public readonly severity: string;

    constructor(message: string, severity: string) {
        this.message = message;
        this.severity = severity;
    }
}

type EventSubscriber<T> = (payload: T) => void;

export class EventBus {
    private static readonly SINGLETON_INSTANCE = new EventBus();

    private readonly subscribersByEventName: Map<string, EventSubscriber<unknown>[]>;

    private constructor() {
        this.subscribersByEventName = new Map<string, EventSubscriber<unknown>[]>();
    }

    public static getInstance(): EventBus {
        return EventBus.SINGLETON_INSTANCE;
    }

    public subscribe<T>(eventName: string, subscriber: EventSubscriber<T>): void {
        const existingSubscribers = this.subscribersByEventName.get(eventName);
        const wrappedSubscriber = subscriber as EventSubscriber<unknown>;
        if (existingSubscribers === undefined) {
            this.subscribersByEventName.set(eventName, [wrappedSubscriber]);
            return;
        }
        if (!existingSubscribers.includes(wrappedSubscriber)) {
            existingSubscribers.push(wrappedSubscriber);
        }
    }

    public unsubscribe<T>(eventName: string, subscriber: EventSubscriber<T>): void {
        const existingSubscribers = this.subscribersByEventName.get(eventName);
        if (existingSubscribers === undefined) {
            return;
        }
        const wrappedSubscriber = subscriber as EventSubscriber<unknown>;
        const remainingSubscribers = existingSubscribers.filter(
            (candidateSubscriber) => candidateSubscriber !== wrappedSubscriber,
        );
        if (remainingSubscribers.length === 0) {
            this.subscribersByEventName.delete(eventName);
            return;
        }
        this.subscribersByEventName.set(eventName, remainingSubscribers);
    }

    public publish(eventName: string, payload: unknown): void {
        const existingSubscribers = this.subscribersByEventName.get(eventName);
        if (existingSubscribers === undefined) {
            return;
        }
        for (const subscriber of [...existingSubscribers]) {
            subscriber(payload);
        }
    }

    public clearAllSubscribers(): void {
        this.subscribersByEventName.clear();
    }
}

export class GameEventTypes {
    public static readonly TURN_STARTED = "turn:started";
    public static readonly TURN_PHASE_CHANGED = "turn:phase:changed";
    public static readonly TURN_ENDED = "turn:ended";
    public static readonly RESOURCE_CHANGED = "resource:changed";
    public static readonly NATION_SELECTED = "nation:selected";
    public static readonly PROVINCE_SELECTED = "province:selected";
    public static readonly SOURCE_ANALYZED = "source:analyzed";
    public static readonly SOURCE_ANALYSIS_FAILED = "source:analysis:failed";
    public static readonly CAUSAL_CHAIN_COMPLETED = "causal:chain:completed";
    public static readonly CAUSAL_CHAIN_FAILED = "causal:chain:failed";
    public static readonly COMPARISON_COMPLETED = "comparison:completed";
    public static readonly CONTINUITY_CHART_COMPLETED = "continuity:chart:completed";
    public static readonly FOCUS_NODE_UNLOCKED = "focus:node:unlocked";
    public static readonly FOCUS_NODE_COMPLETED = "focus:node:completed";
    public static readonly SHARED_INQUIRY_COMPLETED = "shared:inquiry:completed";
    public static readonly QUICKWRITE_COMPLETED = "quickwrite:completed";
    public static readonly SOCRATIC_SEMINAR_COMPLETED = "socratic:seminar:completed";
    public static readonly ARGUMENT_COMPLETED = "argument:completed";
    public static readonly RELATIONSHIP_COMPLETED = "relationship:completed";
    public static readonly DECISION_MADE = "decision:made";
    public static readonly DIPLOMATIC_PLAY_RESOLVED = "diplomacy:play:resolved";
    public static readonly WAR_DECLARED = "war:declared";
    public static readonly TREATY_SIGNED = "treaty:signed";
    public static readonly PRODUCTION_QUEUE_CHANGED = "production:queue:changed";
    public static readonly NEWSPAPER_REQUESTED = "newspaper:requested";
    public static readonly TELEGRAM_REQUESTED = "telegram:requested";
    public static readonly NOTIFICATION_RAISED = "notification:raised";
    public static readonly SCENARIO_COMPLETED = "scenario:completed";
    public static readonly JOURNAL_UPDATED = "journal:updated";
}
