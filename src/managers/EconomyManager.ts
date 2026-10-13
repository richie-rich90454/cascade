import type { GameState } from "../core/GameState";
import { Units } from "../data/Units";
import type { Nation } from "../domain/Nation";

export class ProductionQueueItem {
    public readonly queueItemIdentifier: string;
    public readonly unitTemplateIdentifier: string;
    public readonly assignedFactoryCount: number;
    public accumulatedProductionPoints: number;
    public isCompleted: boolean;

    constructor(queueItemIdentifier: string, unitTemplateIdentifier: string, assignedFactoryCount: number) {
        this.queueItemIdentifier = queueItemIdentifier;
        this.unitTemplateIdentifier = unitTemplateIdentifier;
        this.assignedFactoryCount = assignedFactoryCount;
        this.accumulatedProductionPoints = 0;
        this.isCompleted = false;
    }

    public getRequiredProductionPoints(): number {
        const unitTemplate = Units.findUnitTemplateByIdentifier(this.unitTemplateIdentifier);
        return unitTemplate === null ? 10 : unitTemplate.equipmentCost;
    }

    public getCompletionPercentage(): number {
        const requiredProductionPoints = this.getRequiredProductionPoints();
        return Math.min(100, Math.round((this.accumulatedProductionPoints / requiredProductionPoints) * 100));
    }
}

export class MarketRow {
    public readonly resourceDisplayName: string;
    public readonly supplyQuantity: number;
    public readonly demandQuantity: number;
    public readonly pricePerUnit: number;

    constructor(resourceDisplayName: string, supplyQuantity: number, demandQuantity: number, pricePerUnit: number) {
        this.resourceDisplayName = resourceDisplayName;
        this.supplyQuantity = supplyQuantity;
        this.demandQuantity = demandQuantity;
        this.pricePerUnit = pricePerUnit;
    }
}

export class EconomyManager {
    private readonly gameState: GameState;
    private readonly productionQueuesByNationIdentifier: Map<string, ProductionQueueItem[]>;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.productionQueuesByNationIdentifier = new Map<string, ProductionQueueItem[]>();
    }

    public getProductionQueueForNation(nationIdentifier: string): ProductionQueueItem[] {
        return this.productionQueuesByNationIdentifier.get(nationIdentifier) ?? [];
    }

    public enqueueProductionItem(
        nationIdentifier: string,
        unitTemplateIdentifier: string,
        assignedFactoryCount: number,
    ): ProductionQueueItem {
        const productionQueueItem = new ProductionQueueItem(
            `queue_${nationIdentifier}_${this.getProductionQueueForNation(nationIdentifier).length + 1}`,
            unitTemplateIdentifier,
            assignedFactoryCount,
        );
        const existingQueue = this.productionQueuesByNationIdentifier.get(nationIdentifier);
        if (existingQueue === undefined) {
            this.productionQueuesByNationIdentifier.set(nationIdentifier, [productionQueueItem]);
            return productionQueueItem;
        }
        existingQueue.push(productionQueueItem);
        return productionQueueItem;
    }

    public advanceAllProductionQueues(): Array<{ nationIdentifier: string; completedQueueItem: ProductionQueueItem }> {
        const completedQueueItems: Array<{ nationIdentifier: string; completedQueueItem: ProductionQueueItem }> = [];
        for (const [nationIdentifier, productionQueue] of this.productionQueuesByNationIdentifier.entries()) {
            const nation = this.gameState.getNation(nationIdentifier);
            if (nation === null) {
                continue;
            }
            const productionPower = this.computeProductionPowerPerTurn(nation);
            for (const queueItem of productionQueue) {
                if (queueItem.isCompleted) {
                    continue;
                }
                queueItem.accumulatedProductionPoints += queueItem.assignedFactoryCount * productionPower;
                if (queueItem.accumulatedProductionPoints >= queueItem.getRequiredProductionPoints()) {
                    queueItem.isCompleted = true;
                    completedQueueItems.push({ nationIdentifier, completedQueueItem: queueItem });
                }
            }
        }
        return completedQueueItems;
    }

    public computeProductionPowerPerTurn(nation: Nation): number {
        return 1 + Math.floor(nation.getControlledProvinceCount() / 4) + Math.floor(nation.getTreasury() / 200);
    }

    public computeTreasuryIncomePerTurn(nation: Nation): number {
        const provinceIncome = nation.getControlledProvinceCount() * 0.5;
        const industrialIncome = this.computeProductionPowerPerTurn(nation) * 0.8;
        return Math.round(provinceIncome + industrialIncome);
    }

    public computeGrowthRate(nation: Nation): number {
        const baseGrowthRate = 0.5;
        const stabilityModifier = (nation.getStability() - 50) / 100;
        return Math.round((baseGrowthRate + stabilityModifier) * 100) / 100;
    }

    public advanceNationalEconomies(): void {
        for (const nation of this.gameState.getAllNations()) {
            const treasuryIncome = this.computeTreasuryIncomePerTurn(nation);
            nation.addToTreasury(treasuryIncome);
            const manpowerGrowth = Math.max(100, Math.round(nation.getControlledProvinceCount() * 120));
            nation.addToManpower(manpowerGrowth);
        }
    }

    public getMarketRows(): MarketRow[] {
        return [
            new MarketRow("Food", 120, 110, 1.0),
            new MarketRow("Fuel", 80, 95, 1.4),
            new MarketRow("Steel", 90, 105, 1.6),
            new MarketRow("Rubber", 45, 60, 1.8),
            new MarketRow("Supply", 70, 85, 1.2),
        ];
    }
}
