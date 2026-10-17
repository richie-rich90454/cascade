import type { CampaignSaveData } from "../core/CampaignSave";

export interface AssessmentSnapshot {
    journalEntries: Array<{
        entryIdentifier: string;
        scenarioNumber: number;
        turnNumber: number;
        entryCategory: string;
        promptText: string;
        responseText: string;
        recordedAtIsoTimestamp: string;
    }>;
    latestVictoryFlagsByScenarioNumber: Array<[number, boolean]>;
    topicAttemptsByCedTopicCode: Record<string, { correct: number; attempted: number }>;
}

export interface StudentProfile {
    profileIdentifier: string;
    displayName: string;
    createdAtIsoTimestamp: string;
    updatedAtIsoTimestamp: string;
    assessment: AssessmentSnapshot;
    campaign: CampaignSaveData | null;
}

interface ProfileStore {
    version: 1;
    activeProfileIdentifier: string;
    profiles: StudentProfile[];
}

const STORAGE_KEY = "cascade.student-profiles.v1";
const BACKUP_STORAGE_KEY = "cascade.student-profiles.backup.v1";
const LEGACY_ASSESSMENT_KEY = "cascade.assessment.v2";

const emptyAssessmentSnapshot = (): AssessmentSnapshot => ({
    journalEntries: [],
    latestVictoryFlagsByScenarioNumber: [],
    topicAttemptsByCedTopicCode: {},
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value);

export class LocalProfileManager {
    private static readonly SINGLETON_INSTANCE = new LocalProfileManager();
    private storage: Storage | null;
    private store: ProfileStore;
    private recoveryMessage: string;
    private isSaveAvailable: boolean;

    private constructor() {
        this.storage = null;
        this.store = this.createDefaultStore();
        this.recoveryMessage = "";
        this.isSaveAvailable = true;
        try {
            this.storage = typeof localStorage === "undefined" ? null : localStorage;
        } catch {
            this.storage = null;
        }
        this.load();
    }

    public static getInstance(): LocalProfileManager {
        return LocalProfileManager.SINGLETON_INSTANCE;
    }

    public getProfiles(): StudentProfile[] {
        return this.store.profiles.map((profile) => structuredClone(profile));
    }

    public getActiveProfile(): StudentProfile {
        const activeProfile = this.store.profiles.find(
            (profile) => profile.profileIdentifier === this.store.activeProfileIdentifier,
        );
        return structuredClone(activeProfile ?? this.store.profiles[0]);
    }

    public getActiveCampaign(): CampaignSaveData | null {
        return this.getActiveProfile().campaign;
    }

    public getActiveAssessment(): AssessmentSnapshot {
        return this.getActiveProfile().assessment;
    }

    public getRecoveryMessage(): string {
        return this.recoveryMessage;
    }

    public reportRecoveryIssue(message: string): void {
        this.recoveryMessage = message;
    }

    public canSaveLocally(): boolean {
        return this.storage !== null && this.isSaveAvailable;
    }

    public createProfile(displayName: string): StudentProfile | null {
        const normalizedName = this.normalizeName(displayName);
        if (normalizedName === null) {
            this.recoveryMessage = "Enter a student name between 1 and 30 characters.";
            return null;
        }
        const timestamp = new Date().toISOString();
        const profile: StudentProfile = {
            profileIdentifier: this.createIdentifier(),
            displayName: normalizedName,
            createdAtIsoTimestamp: timestamp,
            updatedAtIsoTimestamp: timestamp,
            assessment: emptyAssessmentSnapshot(),
            campaign: null,
        };
        this.store.profiles.push(profile);
        this.store.activeProfileIdentifier = profile.profileIdentifier;
        if (!this.persist()) {
            this.store.profiles.pop();
            this.store.activeProfileIdentifier = this.store.profiles[0]?.profileIdentifier ?? "default";
            return null;
        }
        this.recoveryMessage = "";
        return structuredClone(profile);
    }

    public renameProfile(profileIdentifier: string, displayName: string): boolean {
        const normalizedName = this.normalizeName(displayName);
        if (normalizedName === null) {
            this.recoveryMessage = "Enter a student name between 1 and 30 characters.";
            return false;
        }
        const profile = this.store.profiles.find((candidate) => candidate.profileIdentifier === profileIdentifier);
        if (profile === undefined) {
            return false;
        }
        const oldName = profile.displayName;
        profile.displayName = normalizedName;
        profile.updatedAtIsoTimestamp = new Date().toISOString();
        if (!this.persist()) {
            profile.displayName = oldName;
            return false;
        }
        this.recoveryMessage = "";
        return true;
    }

    public switchProfile(profileIdentifier: string): boolean {
        if (!this.store.profiles.some((profile) => profile.profileIdentifier === profileIdentifier)) {
            return false;
        }
        const previousIdentifier = this.store.activeProfileIdentifier;
        this.store.activeProfileIdentifier = profileIdentifier;
        if (!this.persist()) {
            this.store.activeProfileIdentifier = previousIdentifier;
            return false;
        }
        this.recoveryMessage = "";
        return true;
    }

    public deleteProfile(profileIdentifier: string): boolean {
        if (this.store.profiles.length <= 1) {
            this.recoveryMessage = "Keep at least one local student profile.";
            return false;
        }
        const oldProfiles = this.store.profiles;
        const oldActiveIdentifier = this.store.activeProfileIdentifier;
        this.store.profiles = oldProfiles.filter((profile) => profile.profileIdentifier !== profileIdentifier);
        if (this.store.profiles.length === oldProfiles.length) {
            return false;
        }
        if (oldActiveIdentifier === profileIdentifier) {
            this.store.activeProfileIdentifier = this.store.profiles[0].profileIdentifier;
        }
        if (!this.persist()) {
            this.store.profiles = oldProfiles;
            this.store.activeProfileIdentifier = oldActiveIdentifier;
            return false;
        }
        let backupWasRefreshed = true;
        try {
            this.storage?.setItem(BACKUP_STORAGE_KEY, JSON.stringify(this.store));
        } catch {
            backupWasRefreshed = false;
        }
        this.recoveryMessage = backupWasRefreshed
            ? ""
            : "The profile was removed, but its older recovery copy could not be refreshed.";
        return true;
    }

    public saveCampaign(campaign: CampaignSaveData | null): boolean {
        const profile = this.findActiveProfile();
        if (profile === undefined) {
            return false;
        }
        const previousCampaign = profile.campaign;
        profile.campaign = campaign === null ? null : structuredClone(campaign);
        profile.updatedAtIsoTimestamp = new Date().toISOString();
        if (!this.persist()) {
            profile.campaign = previousCampaign;
            return false;
        }
        return true;
    }

    public saveAssessment(assessment: AssessmentSnapshot): boolean {
        const profile = this.findActiveProfile();
        if (profile === undefined) {
            return false;
        }
        const previousAssessment = profile.assessment;
        profile.assessment = structuredClone(assessment);
        profile.updatedAtIsoTimestamp = new Date().toISOString();
        if (!this.persist()) {
            profile.assessment = previousAssessment;
            return false;
        }
        return true;
    }

    private load(): void {
        if (this.storage === null) {
            this.isSaveAvailable = false;
            this.recoveryMessage = "Local saves are unavailable in this browser session.";
            return;
        }
        try {
            const stored = this.storage.getItem(STORAGE_KEY);
            if (stored !== null) {
                const parsed = this.parseStore(stored);
                if (parsed !== null) {
                    this.store = parsed;
                    return;
                }
                const backup = this.storage.getItem(BACKUP_STORAGE_KEY);
                const recovered = backup === null ? null : this.parseStore(backup);
                if (recovered !== null) {
                    this.store = recovered;
                    this.recoveryMessage = "A damaged save was recovered from the last valid local backup.";
                    return;
                }
                this.isSaveAvailable = false;
                this.recoveryMessage = "The local save could not be read. Your existing data was left untouched.";
                return;
            }
            this.migrateLegacyAssessment();
            this.persist();
        } catch {
            this.isSaveAvailable = false;
            this.recoveryMessage = "The browser could not read local storage. Your existing data was left untouched.";
        }
    }

    private migrateLegacyAssessment(): void {
        if (this.storage === null) {
            return;
        }
        const legacyValue = this.storage.getItem(LEGACY_ASSESSMENT_KEY);
        if (legacyValue === null) {
            return;
        }
        try {
            const legacy = JSON.parse(legacyValue) as unknown;
            if (isRecord(legacy)) {
                const defaultProfile = this.store.profiles[0];
                defaultProfile.assessment = {
                    journalEntries: Array.isArray(legacy.journalEntries) ? legacy.journalEntries : [],
                    latestVictoryFlagsByScenarioNumber: Array.isArray(legacy.latestVictoryFlagsByScenarioNumber)
                        ? legacy.latestVictoryFlagsByScenarioNumber
                        : [],
                    topicAttemptsByCedTopicCode: isRecord(legacy.topicAttemptsByCedTopicCode)
                        ? (legacy.topicAttemptsByCedTopicCode as AssessmentSnapshot["topicAttemptsByCedTopicCode"])
                        : {},
                };
                this.recoveryMessage = "Your previous journal and assessment records were moved to the default profile.";
            }
        } catch {
            this.recoveryMessage = "An older assessment save could not be migrated. The original data was preserved.";
        }
    }

    private parseStore(serializedStore: string): ProfileStore | null {
        try {
            const value = JSON.parse(serializedStore) as unknown;
            if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.profiles)) {
                return null;
            }
            const profiles = value.profiles.filter((candidate): candidate is StudentProfile => this.isValidProfile(candidate));
            if (
                profiles.length === 0 ||
                profiles.length !== value.profiles.length ||
                typeof value.activeProfileIdentifier !== "string"
            ) {
                return null;
            }
            const activeProfileIdentifier = profiles.some(
                (profile) => profile.profileIdentifier === value.activeProfileIdentifier,
            )
                ? value.activeProfileIdentifier
                : profiles[0].profileIdentifier;
            return { version: 1, activeProfileIdentifier, profiles };
        } catch {
            return null;
        }
    }

    private isValidProfile(value: unknown): value is StudentProfile {
        if (!isRecord(value) || !isRecord(value.assessment)) {
            return false;
        }
        return (
            typeof value.profileIdentifier === "string" &&
            typeof value.displayName === "string" &&
            value.displayName.length > 0 &&
            typeof value.createdAtIsoTimestamp === "string" &&
            typeof value.updatedAtIsoTimestamp === "string" &&
            Array.isArray(value.assessment.journalEntries) &&
            Array.isArray(value.assessment.latestVictoryFlagsByScenarioNumber) &&
            isRecord(value.assessment.topicAttemptsByCedTopicCode) &&
            (value.campaign === null || this.isValidCampaign(value.campaign))
        );
    }

    private isValidCampaign(value: unknown): value is CampaignSaveData {
        if (!isRecord(value) || !isRecord(value.gameState) || !isRecord(value.turnManager) || !isRecord(value.playProgress)) {
            return false;
        }
        const gameState = value.gameState;
        const resourceQuantities = gameState.resourceQuantities;
        const isValidResourceRecord =
            isRecord(resourceQuantities) && Object.values(resourceQuantities).every((quantity) => typeof quantity === "number" && Number.isFinite(quantity));
        const isValidStringList = (item: unknown): item is string[] =>
            Array.isArray(item) && item.every((value) => typeof value === "string");
        const isValidGameState =
            gameState.version === 1 &&
            typeof gameState.scenarioIdentifier === "string" &&
            Number.isInteger(gameState.turnNumber) &&
            typeof gameState.playerNationIdentifier === "string" &&
            isValidResourceRecord &&
            isValidStringList(gameState.scenarioFlags) &&
            Array.isArray(gameState.nations) &&
            gameState.nations.every((nation) =>
                isRecord(nation) &&
                typeof nation.identifier === "string" &&
                [nation.treasury, nation.manpower, nation.legitimacy, nation.stability].every(
                    (number) => typeof number === "number" && Number.isFinite(number),
                ) &&
                typeof nation.capitalProvinceIdentifier === "string" &&
                typeof nation.primaryColorHex === "string" &&
                typeof nation.accentColorHex === "string" &&
                isValidStringList(nation.controlledProvinceIdentifiers) &&
                isValidStringList(nation.alliedNationIdentifiers) &&
                isValidStringList(nation.nationsAtWarWithIdentifiers),
            ) &&
            Array.isArray(gameState.provinces) &&
            gameState.provinces.every((province) =>
                isRecord(province) &&
                typeof province.identifier === "string" &&
                typeof province.ownerNationIdentifier === "string" &&
                typeof province.victoryPointValue === "number" &&
                Number.isFinite(province.victoryPointValue) &&
                typeof province.isCapital === "boolean" &&
                typeof province.supplyValue === "number" &&
                Number.isFinite(province.supplyValue),
            ) &&
            Array.isArray(gameState.units) &&
            gameState.units.every((unit) =>
                isRecord(unit) &&
                typeof unit.identifier === "string" &&
                typeof unit.stationedProvinceIdentifier === "string" &&
                [unit.strengthValue, unit.organizationValue, unit.experienceValue].every(
                    (number) => typeof number === "number" && Number.isFinite(number),
                ),
            );
        return (
            value.version === 1 &&
            typeof value.scenarioNumber === "number" &&
            Number.isInteger(value.scenarioNumber) &&
            value.scenarioNumber >= 1 &&
            value.scenarioNumber <= 10 &&
            isValidGameState &&
            Array.isArray(value.intelligenceResults) &&
            value.intelligenceResults.every(
                (result) =>
                    Array.isArray(result) &&
                    result.length === 2 &&
                    typeof result[0] === "string" &&
                    typeof result[1] === "boolean",
            ) &&
            typeof value.turnManager.turnNumber === "number" &&
            Number.isInteger(value.turnManager.turnNumber) &&
            value.turnManager.turnNumber >= 1 &&
            typeof value.turnManager.phaseCode === "string" &&
            value.turnManager.isActive === true &&
            value.turnManager.turnNumber === gameState.turnNumber &&
            typeof value.playProgress.phaseIndex === "number" &&
            Number.isInteger(value.playProgress.phaseIndex) &&
            value.playProgress.phaseIndex >= 0 &&
            typeof value.playProgress.walkthroughEnabled === "boolean" &&
            typeof value.playProgress.walkthroughPaused === "boolean" &&
            typeof value.playProgress.walkthroughStep === "number" &&
            Number.isInteger(value.playProgress.walkthroughStep) &&
            value.playProgress.walkthroughStep >= 0 &&
            typeof value.hasVictoryResultBeenRecorded === "boolean" &&
            typeof value.savedAtIsoTimestamp === "string"
        );
    }

    private persist(): boolean {
        if (this.storage === null || !this.isSaveAvailable) {
            this.recoveryMessage = "Progress is available until this tab closes, but local storage is unavailable.";
            return false;
        }
        try {
            const oldValidStore = this.storage.getItem(STORAGE_KEY);
            if (oldValidStore !== null && this.parseStore(oldValidStore) !== null) {
                this.storage.setItem(BACKUP_STORAGE_KEY, oldValidStore);
            }
            this.storage.setItem(STORAGE_KEY, JSON.stringify(this.store));
            return true;
        } catch {
            this.isSaveAvailable = false;
            this.recoveryMessage = "The browser could not save progress. Free storage space or enable local storage to continue safely.";
            return false;
        }
    }

    private findActiveProfile(): StudentProfile | undefined {
        return this.store.profiles.find((profile) => profile.profileIdentifier === this.store.activeProfileIdentifier);
    }

    private createDefaultStore(): ProfileStore {
        const timestamp = new Date().toISOString();
        return {
            version: 1,
            activeProfileIdentifier: "default",
            profiles: [
                {
                    profileIdentifier: "default",
                    displayName: "Student",
                    createdAtIsoTimestamp: timestamp,
                    updatedAtIsoTimestamp: timestamp,
                    assessment: emptyAssessmentSnapshot(),
                    campaign: null,
                },
            ],
        };
    }

    private normalizeName(displayName: string): string | null {
        const normalizedName = displayName.trim().replace(/\s+/g, " ");
        return normalizedName.length > 0 && normalizedName.length <= 30 ? normalizedName : null;
    }

    private createIdentifier(): string {
        const randomPart = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        return `student-${randomPart}`;
    }
}

