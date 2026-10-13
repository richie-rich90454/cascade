import { CombatResolver, CombatOutcome } from "../domain/CombatResolver";
import { SeedRandom } from "../core/SeedRandom";
import { Unit } from "../domain/Unit";
import { UnitCategory } from "../types/UnitCategory";
import type { GameState } from "../core/GameState";
import type { Nation } from "../domain/Nation";

export class OrderOfBattleNode {
    public readonly levelName: string;
    public readonly units: Unit[];

    constructor(levelName: string, units: Unit[]) {
        this.levelName = levelName;
        this.units = units;
    }

    public getTotalStrength(): number {
        let totalStrength = 0;
        for (const unit of this.units) {
            totalStrength += unit.getStrength();
        }
        return totalStrength;
    }
}

export class MilitaryManager {
    private readonly gameState: GameState;
    private readonly casualtiesByNationAndCategory: Map<string, number>;
    private readonly combatResolver: CombatResolver;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.casualtiesByNationAndCategory = new Map<string, number>();
        this.combatResolver = new CombatResolver(new SeedRandom("cascade-military"));
    }

    public recruitUnit(
        nation: Nation,
        unitCategory: UnitCategory,
        stationedProvinceIdentifier: string,
        unitDisplayName: string,
    ): Unit {
        const unitIdentifier = `unit_${nation.getIdentifier()}_${this.gameState.getAllUnits().length + 1}`;
        const recruitedUnit = new Unit(unitIdentifier, unitDisplayName, unitCategory, nation.getIdentifier(), stationedProvinceIdentifier);
        this.gameState.registerUnit(recruitedUnit);
        return recruitedUnit;
    }

    public getUnitsForNation(nationIdentifier: string): Unit[] {
        return this.gameState.getAllUnits().filter((unit) => unit.getOwningNationIdentifier() === nationIdentifier);
    }

    public executeBattle(
        attackingUnit: Unit,
        defendingUnit: Unit,
        terrainDefenseBonus: number,
        attackerNation: Nation,
        defenderNation: Nation,
    ): CombatOutcome {
        const battleOutcome = this.combatResolver.resolveBattle(attackingUnit, defendingUnit, terrainDefenseBonus);
        this.recordCasualties(attackerNation.getIdentifier(), attackingUnit.getUnitCategory().getCode(), battleOutcome.attackerStrengthLoss);
        this.recordCasualties(defenderNation.getIdentifier(), defendingUnit.getUnitCategory().getCode(), battleOutcome.defenderStrengthLoss);
        attackerNation.addToManpower(-battleOutcome.attackerStrengthLoss * 50);
        defenderNation.addToManpower(-battleOutcome.defenderStrengthLoss * 50);
        return battleOutcome;
    }

    public recordCasualties(nationIdentifier: string, unitCategoryCode: string, casualtyAmount: number): void {
        const casualtyKey = `${nationIdentifier}::${unitCategoryCode}`;
        const existingCasualties = this.casualtiesByNationAndCategory.get(casualtyKey) ?? 0;
        this.casualtiesByNationAndCategory.set(casualtyKey, existingCasualties + casualtyAmount);
    }

    public getCasualtiesByCategory(nationIdentifier: string): Map<string, number> {
        const casualtiesForNation = new Map<string, number>();
        for (const [casualtyKey, casualtyAmount] of this.casualtiesByNationAndCategory.entries()) {
            const [recordedNationIdentifier, unitCategoryCode] = casualtyKey.split("::");
            if (recordedNationIdentifier === nationIdentifier) {
                casualtiesForNation.set(unitCategoryCode, casualtyAmount);
            }
        }
        return casualtiesForNation;
    }

    public getTotalCasualtiesForNation(nationIdentifier: string): number {
        let totalCasualties = 0;
        for (const casualtyAmount of this.getCasualtiesByCategory(nationIdentifier).values()) {
            totalCasualties += casualtyAmount;
        }
        return totalCasualties;
    }

    public getOrderOfBattleTree(nationIdentifier: string): OrderOfBattleNode[] {
        const nationUnits = this.getUnitsForNation(nationIdentifier);
        const nodesByCategory = new Map<string, Unit[]>();
        for (const unit of nationUnits) {
            const unitCategoryCode = unit.getUnitCategory().getCode();
            const existingUnits = nodesByCategory.get(unitCategoryCode);
            if (existingUnits === undefined) {
                nodesByCategory.set(unitCategoryCode, [unit]);
                continue;
            }
            existingUnits.push(unit);
        }
        const orderOfBattleNodes: OrderOfBattleNode[] = [];
        for (const [unitCategoryCode, categoryUnits] of nodesByCategory.entries()) {
            const resolvedUnitCategory = UnitCategory.findByUnitCategoryCode(unitCategoryCode);
            orderOfBattleNodes.push(new OrderOfBattleNode(resolvedUnitCategory?.getDisplayName() ?? unitCategoryCode, categoryUnits));
        }
        return orderOfBattleNodes;
    }

    public getTotalArmyStrengthForNation(nationIdentifier: string): number {
        let totalArmyStrength = 0;
        for (const unit of this.getUnitsForNation(nationIdentifier)) {
            totalArmyStrength += unit.getStrength();
        }
        return totalArmyStrength;
    }
}
