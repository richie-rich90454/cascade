export class ReasoningProcess {
    public static readonly CAUSATION = new ReasoningProcess(
        "causation",
        "Causation",
        "Identify the causes and effects of a historical development, and explain the ways in which one caused the other.",
        "ui_badge_causation",
    );
    public static readonly COMPARISON = new ReasoningProcess(
        "comparison",
        "Comparison",
        "Identify similarities and differences between historical developments, and explain the significance of those similarities and differences.",
        "ui_badge_comparison",
    );
    public static readonly CONTINUITY_AND_CHANGE = new ReasoningProcess(
        "continuity_and_change",
        "Continuity and Change",
        "Identify patterns of continuity and change over time, and explain the significance of those patterns.",
        "ui_badge_continuity",
    );

    private readonly reasoningProcessCode: string;
    private readonly reasoningProcessDisplayName: string;
    private readonly reasoningProcessDescription: string;
    private readonly badgeAssetIdentifier: string;

    private constructor(
        reasoningProcessCode: string,
        reasoningProcessDisplayName: string,
        reasoningProcessDescription: string,
        badgeAssetIdentifier: string,
    ) {
        this.reasoningProcessCode = reasoningProcessCode;
        this.reasoningProcessDisplayName = reasoningProcessDisplayName;
        this.reasoningProcessDescription = reasoningProcessDescription;
        this.badgeAssetIdentifier = badgeAssetIdentifier;
    }

    public getCode(): string {
        return this.reasoningProcessCode;
    }

    public getDisplayName(): string {
        return this.reasoningProcessDisplayName;
    }

    public getDescription(): string {
        return this.reasoningProcessDescription;
    }

    public getBadgeAssetId(): string {
        return this.badgeAssetIdentifier;
    }

    public static getAllReasoningProcesses(): ReasoningProcess[] {
        return [ReasoningProcess.CAUSATION, ReasoningProcess.COMPARISON, ReasoningProcess.CONTINUITY_AND_CHANGE];
    }

    public static findByReasoningProcessCode(reasoningProcessCode: string): ReasoningProcess | null {
        for (const reasoningProcess of ReasoningProcess.getAllReasoningProcesses()) {
            if (reasoningProcess.getCode() === reasoningProcessCode) {
                return reasoningProcess;
            }
        }
        return null;
    }
}
