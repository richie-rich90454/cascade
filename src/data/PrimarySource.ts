export class PrimarySource {
    public readonly sourceIdentifier: string;
    public readonly sourceDisplayTitle: string;
    public readonly authorOrOrigin: string;
    public readonly dateText: string;
    public readonly nationIdentifier: string;
    public readonly sourceType: string;
    public readonly excerptText: string;
    public readonly pointOfViewAnswer: string;
    public readonly purposeAnswer: string;
    public readonly historicalSituationAnswer: string;
    public readonly audienceAnswer: string;
    public readonly limitationsAnswer: string;
    public readonly analysisQuestion: string;
    public readonly analysisOptions: string[];
    public readonly correctAnalysisOptionIndex: number;
    public readonly illustrationAssetIdentifier: string;

    constructor(
        sourceIdentifier: string,
        sourceDisplayTitle: string,
        authorOrOrigin: string,
        dateText: string,
        nationIdentifier: string,
        sourceType: string,
        excerptText: string,
        pointOfViewAnswer: string,
        purposeAnswer: string,
        historicalSituationAnswer: string,
        audienceAnswer: string,
        limitationsAnswer: string,
        analysisQuestion: string,
        analysisOptions: string[],
        correctAnalysisOptionIndex: number,
        illustrationAssetIdentifier: string,
    ) {
        this.sourceIdentifier = sourceIdentifier;
        this.sourceDisplayTitle = sourceDisplayTitle;
        this.authorOrOrigin = authorOrOrigin;
        this.dateText = dateText;
        this.nationIdentifier = nationIdentifier;
        this.sourceType = sourceType;
        this.excerptText = excerptText;
        this.pointOfViewAnswer = pointOfViewAnswer;
        this.purposeAnswer = purposeAnswer;
        this.historicalSituationAnswer = historicalSituationAnswer;
        this.audienceAnswer = audienceAnswer;
        this.limitationsAnswer = limitationsAnswer;
        this.analysisQuestion = analysisQuestion;
        this.analysisOptions = analysisOptions;
        this.correctAnalysisOptionIndex = correctAnalysisOptionIndex;
        this.illustrationAssetIdentifier = illustrationAssetIdentifier;
    }

    public isAnalysisAnswerCorrect(selectedOptionIndex: number): boolean {
        return selectedOptionIndex === this.correctAnalysisOptionIndex;
    }
}
