import { TelegramRequestPayload } from "../core/EventBus";
import type { PrimarySource } from "../data/PrimarySource";
import type { GameState } from "../core/GameState";

export class IntelligenceManager {
    private readonly gameState: GameState;
    private readonly analysisResultsBySourceIdentifier: Map<string, boolean>;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.analysisResultsBySourceIdentifier = new Map<string, boolean>();
    }

    public recordSourceAnalysisResult(sourceIdentifier: string, wasAnalysisCorrect: boolean): void {
        this.analysisResultsBySourceIdentifier.set(sourceIdentifier, wasAnalysisCorrect);
    }

    public getSourceAnalysisResult(sourceIdentifier: string): boolean | null {
        return this.analysisResultsBySourceIdentifier.get(sourceIdentifier) ?? null;
    }

    public isSourceAnalyzed(sourceIdentifier: string): boolean {
        return this.analysisResultsBySourceIdentifier.has(sourceIdentifier);
    }

    public getAnalyzedSourceCount(): number {
        return this.analysisResultsBySourceIdentifier.size;
    }

    public getCorrectlyAnalyzedSourceCount(): number {
        let correctlyAnalyzedSourceCount = 0;
        for (const wasAnalysisCorrect of this.analysisResultsBySourceIdentifier.values()) {
            if (wasAnalysisCorrect) {
                correctlyAnalyzedSourceCount += 1;
            }
        }
        return correctlyAnalyzedSourceCount;
    }

    public getEspionageLevel(nationIdentifier: string): number {
        const nation = this.gameState.getNation(nationIdentifier);
        if (nation === null) {
            return 0;
        }
        return Math.round(nation.getTreasury() / 100) + this.getCorrectlyAnalyzedSourceCount();
    }

    public produceTelegramPayloadForSourceAnalysis(primarySource: PrimarySource, wasAnalysisCorrect: boolean): TelegramRequestPayload {
        if (wasAnalysisCorrect) {
            return new TelegramRequestPayload(
                "Most Secret",
                `Accurate intelligence from ${primarySource.authorOrOrigin}`,
                [
                    `Source origin: ${primarySource.authorOrOrigin}, ${primarySource.dateText}.`,
                    `Point of view: ${primarySource.pointOfViewAnswer}`,
                    `Purpose: ${primarySource.purposeAnswer}`,
                    `Reading confirmed. The report is reliable for planning.`,
                ],
            );
        }
        return new TelegramRequestPayload(
            "Most Secret",
            `Assessment from ${primarySource.authorOrOrigin} remains uncertain`,
            [
                `Source origin: ${primarySource.authorOrOrigin}, ${primarySource.dateText}.`,
                `Warning: the point of view was misread.`,
                `Audience and limitations: ${primarySource.limitationsAnswer}`,
                `Intelligence drawn from this report may mislead the ministry.`,
            ],
        );
    }

    public getIntelligenceSummaryLines(): string[] {
        const summaryLines: string[] = [];
        summaryLines.push(`Sources analyzed: ${this.getAnalyzedSourceCount()}`);
        summaryLines.push(`Sources correctly analyzed: ${this.getCorrectlyAnalyzedSourceCount()}`);
        summaryLines.push(`Current intelligence value: ${this.getCorrectlyAnalyzedSourceCount() * 5} of 50`);
        return summaryLines;
    }
}
