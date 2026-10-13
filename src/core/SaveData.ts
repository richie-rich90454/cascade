import type { GameState } from "./GameState";

export class SaveSlotSummary {
    public readonly slotIdentifier: string;
    public readonly scenarioIdentifier: string;
    public readonly turnNumber: number;
    public readonly savedAtIsoTimestamp: string;

    constructor(slotIdentifier: string, scenarioIdentifier: string, turnNumber: number, savedAtIsoTimestamp: string) {
        this.slotIdentifier = slotIdentifier;
        this.scenarioIdentifier = scenarioIdentifier;
        this.turnNumber = turnNumber;
        this.savedAtIsoTimestamp = savedAtIsoTimestamp;
    }
}

interface SerializedNationRecord {
    nationIdentifier: string;
    displayName: string;
    treasury: number;
    manpower: number;
    legitimacy: number;
    stability: number;
}

interface SerializedGameStateRecord {
    scenarioIdentifier: string;
    turnNumber: number;
    playerNationIdentifier: string;
    resourceQuantities: Record<string, number>;
    scenarioFlags: string[];
    nations: SerializedNationRecord[];
}

export class SaveData {
    private static readonly STORAGE_KEY_PREFIX = "cascade.save.";

    private readonly storage: Storage | null;

    constructor(storage: Storage | null) {
        this.storage = storage;
    }

    public save(slotIdentifier: string, gameState: GameState): SaveSlotSummary {
        const serializedState = SaveData.serializeGameState(gameState);
        if (this.storage !== null) {
            this.storage.setItem(SaveData.STORAGE_KEY_PREFIX + slotIdentifier, serializedState);
        }
        return new SaveSlotSummary(slotIdentifier, gameState.getScenarioIdentifier(), gameState.getTurnNumber(), new Date().toISOString());
    }

    public load(slotIdentifier: string): SerializedGameStateRecord | null {
        if (this.storage === null) {
            return null;
        }
        const serializedState = this.storage.getItem(SaveData.STORAGE_KEY_PREFIX + slotIdentifier);
        if (serializedState === null) {
            return null;
        }
        return SaveData.parseSerializedGameState(serializedState);
    }

    public deleteSlot(slotIdentifier: string): void {
        if (this.storage === null) {
            return;
        }
        this.storage.removeItem(SaveData.STORAGE_KEY_PREFIX + slotIdentifier);
    }

    public listSlots(): SaveSlotSummary[] {
        if (this.storage === null) {
            return [];
        }
        const slotSummaries: SaveSlotSummary[] = [];
        for (let storageIndex = 0; storageIndex < this.storage.length; storageIndex++) {
            const storageKey = this.storage.key(storageIndex);
            if (storageKey === null || !storageKey.startsWith(SaveData.STORAGE_KEY_PREFIX)) {
                continue;
            }
            const serializedState = this.storage.getItem(storageKey);
            if (serializedState === null) {
                continue;
            }
            try {
                const parsedRecord = SaveData.parseSerializedGameState(serializedState);
                slotSummaries.push(
                    new SaveSlotSummary(
                        storageKey.slice(SaveData.STORAGE_KEY_PREFIX.length),
                        parsedRecord.scenarioIdentifier,
                        parsedRecord.turnNumber,
                        new Date().toISOString(),
                    ),
                );
            } catch {
                continue;
            }
        }
        return slotSummaries;
    }

    public applySerializedStateToGameState(slotIdentifier: string, gameState: GameState): boolean {
        const parsedRecord = this.load(slotIdentifier);
        if (parsedRecord === null) {
            return false;
        }
        gameState.reset();
        gameState.setScenarioIdentifier(parsedRecord.scenarioIdentifier);
        gameState.setTurnNumber(parsedRecord.turnNumber);
        gameState.setPlayerNationIdentifier(parsedRecord.playerNationIdentifier);
        for (const [resourceTypeCode, quantity] of Object.entries(parsedRecord.resourceQuantities)) {
            gameState.applyRawResourceQuantity(resourceTypeCode, quantity);
        }
        for (const scenarioFlag of parsedRecord.scenarioFlags) {
            gameState.setScenarioFlag(scenarioFlag);
        }
        return true;
    }

    public static serializeGameState(gameState: GameState): string {
        const serializedRecord: SerializedGameStateRecord = {
            scenarioIdentifier: gameState.getScenarioIdentifier(),
            turnNumber: gameState.getTurnNumber(),
            playerNationIdentifier: gameState.getPlayerNationIdentifier(),
            resourceQuantities: gameState.getRawResourceQuantities(),
            scenarioFlags: gameState.getScenarioFlags(),
            nations: gameState.getAllNations().map((nation) => ({
                nationIdentifier: nation.getIdentifier(),
                displayName: nation.getDisplayName(),
                treasury: nation.getTreasury(),
                manpower: nation.getManpower(),
                legitimacy: nation.getLegitimacy(),
                stability: nation.getStability(),
            })),
        };
        return JSON.stringify(serializedRecord);
    }

    public static parseSerializedGameState(serializedState: string): SerializedGameStateRecord {
        return JSON.parse(serializedState) as SerializedGameStateRecord;
    }
}
