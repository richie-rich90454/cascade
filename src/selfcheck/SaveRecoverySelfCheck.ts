class MemoryStorage implements Storage {
    private readonly values: Map<string, string>;

    public constructor() {
        this.values = new Map<string, string>();
    }

    public get length(): number {
        return this.values.size;
    }

    public clear(): void {
        this.values.clear();
    }

    public getItem(key: string): string | null {
        return this.values.get(key) ?? null;
    }

    public key(index: number): string | null {
        return Array.from(this.values.keys())[index] ?? null;
    }

    public removeItem(key: string): void {
        this.values.delete(key);
    }

    public setItem(key: string, value: string): void {
        this.values.set(key, value);
    }
}

export {};

const memoryStorage = new MemoryStorage();
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: memoryStorage });

const now = new Date().toISOString();
const validProfileStore = {
    version: 1,
    activeProfileIdentifier: "default",
    profiles: [
        {
            profileIdentifier: "default",
            displayName: "Student",
            createdAtIsoTimestamp: now,
            updatedAtIsoTimestamp: now,
            assessment: {
                journalEntries: [],
                latestVictoryFlagsByScenarioNumber: [],
                topicAttemptsByCedTopicCode: {},
            },
            campaign: null,
        },
    ],
};
const corruptedProfileStore = structuredClone(validProfileStore);
corruptedProfileStore.profiles[0].assessment.journalEntries = [null] as never[];
memoryStorage.setItem("cascade.student-profiles.v1", JSON.stringify(corruptedProfileStore));
memoryStorage.setItem("cascade.student-profiles.backup.v1", JSON.stringify(validProfileStore));

const { LocalProfileManager } = await import("../managers/LocalProfileManager");
const profileManager = LocalProfileManager.getInstance();
if (profileManager.getRecoveryMessage() !== "A damaged save was recovered from the last valid local backup.") {
    throw new Error("Save recovery did not replace a malformed assessment profile with its valid backup.");
}
if (profileManager.getActiveAssessment().journalEntries.length !== 0 || !profileManager.canSaveLocally()) {
    throw new Error("The recovered student profile is not safe to use and save.");
}

console.log("SaveRecoverySelfCheck: malformed assessment data safely recovered from the last valid backup.");
