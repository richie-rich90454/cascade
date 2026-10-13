import { EventBus, GameEventTypes } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { Nation } from "../domain/Nation";

export class WarScoreBreakdown {
    public readonly militaryScore: number;
    public readonly economicScore: number;
    public readonly diplomaticScore: number;
    public readonly moralScore: number;
    public readonly totalScore: number;

    constructor(militaryScore: number, economicScore: number, diplomaticScore: number, moralScore: number) {
        this.militaryScore = militaryScore;
        this.economicScore = economicScore;
        this.diplomaticScore = diplomaticScore;
        this.moralScore = moralScore;
        this.totalScore = militaryScore + economicScore + diplomaticScore + moralScore;
    }
}

export class DiplomacyManager {
    private readonly gameState: GameState;
    private readonly relationScoresByNationPair: Map<string, number>;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.relationScoresByNationPair = new Map<string, number>();
    }

    public getRelationScore(firstNation: Nation, secondNation: Nation): number {
        return (
            this.relationScoresByNationPair.get(DiplomacyManager.buildNationPairKey(firstNation, secondNation)) ?? 25
        );
    }

    public setRelationScore(firstNation: Nation, secondNation: Nation, relationScore: number): void {
        const clampedRelationScore = Math.max(-100, Math.min(100, relationScore));
        this.relationScoresByNationPair.set(
            DiplomacyManager.buildNationPairKey(firstNation, secondNation),
            clampedRelationScore,
        );
    }

    public adjustRelationScore(firstNation: Nation, secondNation: Nation, deltaScore: number): number {
        const updatedRelationScore = this.getRelationScore(firstNation, secondNation) + deltaScore;
        this.setRelationScore(firstNation, secondNation, updatedRelationScore);
        return this.getRelationScore(firstNation, secondNation);
    }

    public formAllianceBetween(firstNation: Nation, secondNation: Nation): void {
        firstNation.formAllianceWith(secondNation);
        this.setRelationScore(
            firstNation,
            secondNation,
            Math.max(60, this.getRelationScore(firstNation, secondNation)),
        );
        EventBus.getInstance().publish(GameEventTypes.TREATY_SIGNED, {
            firstNationIdentifier: firstNation.getIdentifier(),
            secondNationIdentifier: secondNation.getIdentifier(),
            treatyType: "alliance",
        });
    }

    public declareWarBetween(firstNation: Nation, secondNation: Nation): void {
        firstNation.declareWarOn(secondNation);
        this.setRelationScore(firstNation, secondNation, -100);
        EventBus.getInstance().publish(GameEventTypes.WAR_DECLARED, {
            firstNationIdentifier: firstNation.getIdentifier(),
            secondNationIdentifier: secondNation.getIdentifier(),
        });
    }

    public signPeaceBetween(firstNation: Nation, secondNation: Nation): void {
        firstNation.signPeaceWith(secondNation);
        this.setRelationScore(firstNation, secondNation, -25);
        EventBus.getInstance().publish(GameEventTypes.TREATY_SIGNED, {
            firstNationIdentifier: firstNation.getIdentifier(),
            secondNationIdentifier: secondNation.getIdentifier(),
            treatyType: "peace",
        });
    }

    public computeWarScoreForNation(nationIdentifier: string): WarScoreBreakdown {
        const nation = this.gameState.getNation(nationIdentifier);
        if (nation === null) {
            return new WarScoreBreakdown(0, 0, 0, 0);
        }
        const nationUnits = this.gameState
            .getAllUnits()
            .filter((unit) => unit.getOwningNationIdentifier() === nationIdentifier);
        let militaryScore = 0;
        for (const unit of nationUnits) {
            militaryScore += unit.getStrength() / 10;
        }
        const economicScore = Math.min(40, nation.getTreasury() / 25 + nation.getControlledProvinceCount() * 0.8);
        const diplomaticScore = Math.min(20, nation.getAlliedNationIdentifiers().length * 5);
        const moralScore = Math.min(20, (nation.getLegitimacy() + nation.getStability()) / 10);
        return new WarScoreBreakdown(
            Math.round(militaryScore),
            Math.round(economicScore),
            Math.round(diplomaticScore),
            Math.round(moralScore),
        );
    }

    public getLikelyMovesForNation(nationIdentifier: string): string[] {
        const nation = this.gameState.getNation(nationIdentifier);
        if (nation === null) {
            return [];
        }
        const likelyMoves: string[] = [];
        if (nation.isAtWarWithAnyNation()) {
            likelyMoves.push(`${nation.getDisplayName()} will seek to press its current military advantage.`);
        }
        if (nation.getAlliedNationIdentifiers().length > 0) {
            likelyMoves.push(`${nation.getDisplayName()} will consult its allies before any escalation.`);
        }
        if (nation.getTreasury() < 100) {
            likelyMoves.push(`${nation.getDisplayName()} is short of funds and may seek loans or concessions.`);
        }
        if (nation.getStability() < 40) {
            likelyMoves.push(`${nation.getDisplayName()} faces domestic unrest and may avoid foreign adventures.`);
        }
        if (likelyMoves.length === 0) {
            likelyMoves.push(`${nation.getDisplayName()} will pursue its interests cautiously.`);
        }
        return likelyMoves;
    }

    public getDiplomaticRelationsMatrix(): Array<{
        firstNationName: string;
        secondNationName: string;
        relationScore: number;
    }> {
        const relationsMatrix: Array<{ firstNationName: string; secondNationName: string; relationScore: number }> = [];
        const allNations = this.gameState.getAllNations();
        for (let firstIndex = 0; firstIndex < allNations.length; firstIndex++) {
            for (let secondIndex = firstIndex + 1; secondIndex < allNations.length; secondIndex++) {
                relationsMatrix.push({
                    firstNationName: allNations[firstIndex].getDisplayName(),
                    secondNationName: allNations[secondIndex].getDisplayName(),
                    relationScore: this.getRelationScore(allNations[firstIndex], allNations[secondIndex]),
                });
            }
        }
        return relationsMatrix;
    }

    private static buildNationPairKey(firstNation: Nation, secondNation: Nation): string {
        const identifiersAlphabetical = [firstNation.getIdentifier(), secondNation.getIdentifier()].sort();
        return `${identifiersAlphabetical[0]}::${identifiersAlphabetical[1]}`;
    }
}
