import type { GameStateSnapshot } from "./GameState";

export interface CampaignSaveData {
    version: 1;
    scenarioNumber: number;
    gameState: GameStateSnapshot;
    intelligenceResults: Array<[string, boolean]>;
    turnManager: {
        turnNumber: number;
        phaseCode: string;
        isActive: boolean;
    };
    playProgress: {
        phaseIndex: number;
        walkthroughEnabled: boolean;
        walkthroughPaused: boolean;
        walkthroughStep: number;
    };
    hasVictoryResultBeenRecorded: boolean;
    savedAtIsoTimestamp: string;
}

