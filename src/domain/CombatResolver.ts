import type { SeedRandom } from "../core/SeedRandom";
import type { Unit } from "./Unit";

export class CombatOutcome {
    public readonly attackerUnitIdentifier: string;
    public readonly defenderUnitIdentifier: string;
    public readonly attackerStrengthLoss: number;
    public readonly defenderStrengthLoss: number;
    public readonly wasAttackerVictorious: boolean;
    public readonly battleNarrative: string;

    constructor(
        attackerUnitIdentifier: string,
        defenderUnitIdentifier: string,
        attackerStrengthLoss: number,
        defenderStrengthLoss: number,
        wasAttackerVictorious: boolean,
        battleNarrative: string,
    ) {
        this.attackerUnitIdentifier = attackerUnitIdentifier;
        this.defenderUnitIdentifier = defenderUnitIdentifier;
        this.attackerStrengthLoss = attackerStrengthLoss;
        this.defenderStrengthLoss = defenderStrengthLoss;
        this.wasAttackerVictorious = wasAttackerVictorious;
        this.battleNarrative = battleNarrative;
    }
}

export class CombatResolver {
    private readonly seedRandom: SeedRandom;

    constructor(seedRandom: SeedRandom) {
        this.seedRandom = seedRandom;
    }

    public resolveBattle(attackingUnit: Unit, defendingUnit: Unit, terrainDefenseBonus: number = 1.0): CombatOutcome {
        const attackerEffectiveness = this.computeUnitEffectiveness(attackingUnit);
        const defenderEffectiveness = this.computeUnitEffectiveness(defendingUnit) * terrainDefenseBonus;
        const totalEffectiveness = attackerEffectiveness + defenderEffectiveness;
        const attackerRandomModifier = this.seedRandom.nextFloatInRange(0.85, 1.15);
        const defenderRandomModifier = this.seedRandom.nextFloatInRange(0.85, 1.15);

        const attackerShare = (attackerEffectiveness * attackerRandomModifier) / totalEffectiveness;
        const defenderShare = (defenderEffectiveness * defenderRandomModifier) / totalEffectiveness;

        const attackerStrengthLoss = Math.round((1 - attackerShare) * 45);
        const defenderStrengthLoss = Math.round((1 - defenderShare) * 45);
        const wasAttackerVictorious = defenderShare < attackerShare;

        attackingUnit.applyCasualties(attackerStrengthLoss);
        defendingUnit.applyCasualties(defenderStrengthLoss);
        attackingUnit.grantExperience(2);
        defendingUnit.grantExperience(3);

        const battleNarrative = wasAttackerVictorious
            ? `${attackingUnit.getDisplayName()} drove ${defendingUnit.getDisplayName()} from the field.`
            : `${defendingUnit.getDisplayName()} held against ${attackingUnit.getDisplayName()}.`;

        return new CombatOutcome(
            attackingUnit.getIdentifier(),
            defendingUnit.getIdentifier(),
            attackerStrengthLoss,
            defenderStrengthLoss,
            wasAttackerVictorious,
            battleNarrative,
        );
    }

    public resolveSiege(
        attackingUnit: Unit,
        defendingGarrisonUnit: Unit,
        fortificationLevel: number = 1,
    ): CombatOutcome {
        const siegeTerrainDefenseBonus = 1.0 + fortificationLevel * 0.25;
        return this.resolveBattle(attackingUnit, defendingGarrisonUnit, siegeTerrainDefenseBonus);
    }

    private computeUnitEffectiveness(unit: Unit): number {
        const strengthContribution = unit.getStrength() / 100;
        const organizationContribution = unit.getOrganization() / 100;
        const experienceContribution = Math.min(1, unit.getExperience() / 50);
        return 10 * strengthContribution * (0.6 + 0.4 * organizationContribution) * (1 + 0.2 * experienceContribution);
    }
}
