import type { GameState } from "./GameState";

export abstract class GameSystem {
    protected readonly systemName: string;
    protected isEnabled: boolean;

    constructor(systemName: string) {
        this.systemName = systemName;
        this.isEnabled = true;
    }

    public getSystemName(): string {
        return this.systemName;
    }

    public isSystemEnabled(): boolean {
        return this.isEnabled;
    }

    public setSystemEnabled(isEnabled: boolean): void {
        this.isEnabled = isEnabled;
    }

    public simulateTurn(turnNumber: number, gameState: GameState): void {
        if (!this.isEnabled) {
            return;
        }
        this.onSimulateTurn(turnNumber, gameState);
    }

    protected abstract onSimulateTurn(turnNumber: number, gameState: GameState): void;
}
