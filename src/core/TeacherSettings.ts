export class TeacherSettings {
    private static readonly SINGLETON_INSTANCE = new TeacherSettings();
    private static readonly STORAGE_KEY = "cascade.teacher.settings";

    private readonly disabledScenarioNumbers: Set<number>;
    private readonly storage: Storage | null;

    private contentAdvisoryEnabled: boolean;
    private scenarioNineRequiredBeforeTen: boolean;
    private contentDetailLevel: string;
    private masterAudioEnabled: boolean;

    private constructor() {
        this.disabledScenarioNumbers = new Set<number>();
        this.storage = typeof localStorage === "undefined" ? null : localStorage;
        this.contentAdvisoryEnabled = true;
        this.scenarioNineRequiredBeforeTen = true;
        this.contentDetailLevel = "full";
        this.masterAudioEnabled = true;
        this.loadFromStorage();
    }

    public static getInstance(): TeacherSettings {
        return TeacherSettings.SINGLETON_INSTANCE;
    }

    public isContentAdvisoryEnabled(): boolean {
        return this.contentAdvisoryEnabled;
    }

    public setContentAdvisoryEnabled(isEnabled: boolean): void {
        this.contentAdvisoryEnabled = isEnabled;
        this.saveToStorage();
    }

    public isScenarioNineRequiredBeforeTen(): boolean {
        return this.scenarioNineRequiredBeforeTen;
    }

    public setScenarioNineRequiredBeforeTen(isRequired: boolean): void {
        this.scenarioNineRequiredBeforeTen = isRequired;
        this.saveToStorage();
    }

    public getContentDetailLevel(): string {
        return this.contentDetailLevel;
    }

    public setContentDetailLevel(contentDetailLevel: string): void {
        this.contentDetailLevel = contentDetailLevel;
        this.saveToStorage();
    }

    public isMasterAudioEnabled(): boolean {
        return this.masterAudioEnabled;
    }

    public setMasterAudioEnabled(isEnabled: boolean): void {
        this.masterAudioEnabled = isEnabled;
        this.saveToStorage();
    }

    public isScenarioEnabled(scenarioNumber: number): boolean {
        return !this.disabledScenarioNumbers.has(scenarioNumber);
    }

    public setScenarioEnabled(scenarioNumber: number, isEnabled: boolean): void {
        if (isEnabled) {
            this.disabledScenarioNumbers.delete(scenarioNumber);
        } else {
            this.disabledScenarioNumbers.add(scenarioNumber);
        }
        this.saveToStorage();
    }

    public resetAllSettings(): void {
        this.disabledScenarioNumbers.clear();
        this.contentAdvisoryEnabled = true;
        this.scenarioNineRequiredBeforeTen = true;
        this.contentDetailLevel = "full";
        this.masterAudioEnabled = true;
        this.saveToStorage();
    }

    private saveToStorage(): void {
        if (this.storage === null) {
            return;
        }
        const serializedSettings = JSON.stringify({
            isContentAdvisoryEnabled: this.contentAdvisoryEnabled,
            isScenarioNineRequiredBeforeTen: this.scenarioNineRequiredBeforeTen,
            contentDetailLevel: this.contentDetailLevel,
            isMasterAudioEnabled: this.masterAudioEnabled,
            disabledScenarioNumbers: Array.from(this.disabledScenarioNumbers),
        });
        this.storage.setItem(TeacherSettings.STORAGE_KEY, serializedSettings);
    }

    private loadFromStorage(): void {
        if (this.storage === null) {
            return;
        }
        const serializedSettings = this.storage.getItem(TeacherSettings.STORAGE_KEY);
        if (serializedSettings === null) {
            return;
        }
        try {
            const parsedSettings = JSON.parse(serializedSettings) as {
                isContentAdvisoryEnabled: boolean;
                isScenarioNineRequiredBeforeTen: boolean;
                contentDetailLevel: string;
                isMasterAudioEnabled: boolean;
                disabledScenarioNumbers: number[];
            };
            this.contentAdvisoryEnabled = parsedSettings.isContentAdvisoryEnabled;
            this.scenarioNineRequiredBeforeTen = parsedSettings.isScenarioNineRequiredBeforeTen;
            this.contentDetailLevel = parsedSettings.contentDetailLevel;
            this.masterAudioEnabled = parsedSettings.isMasterAudioEnabled;
            for (const disabledScenarioNumber of parsedSettings.disabledScenarioNumbers) {
                this.disabledScenarioNumbers.add(disabledScenarioNumber);
            }
        } catch {
            return;
        }
    }
}
