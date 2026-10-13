import { GameEntity } from "../core/GameEntity";
import type { UnitCategory } from "../types/UnitCategory";

export class Unit extends GameEntity {
    private readonly unitCategory: UnitCategory;
    private readonly owningNationIdentifier: string;

    private stationedProvinceIdentifier: string;
    private strengthValue: number;
    private organizationValue: number;
    private experienceValue: number;

    constructor(
        identifier: string,
        displayName: string,
        unitCategory: UnitCategory,
        owningNationIdentifier: string,
        stationedProvinceIdentifier: string,
    ) {
        super(identifier, displayName);
        this.unitCategory = unitCategory;
        this.owningNationIdentifier = owningNationIdentifier;
        this.stationedProvinceIdentifier = stationedProvinceIdentifier;
        this.strengthValue = 100;
        this.organizationValue = 100;
        this.experienceValue = 0;
    }

    public getUnitCategory(): UnitCategory {
        return this.unitCategory;
    }

    public getOwningNationIdentifier(): string {
        return this.owningNationIdentifier;
    }

    public getStationedProvinceIdentifier(): string {
        return this.stationedProvinceIdentifier;
    }

    public moveToProvince(provinceIdentifier: string): void {
        this.stationedProvinceIdentifier = provinceIdentifier;
    }

    public getStrength(): number {
        return this.strengthValue;
    }

    public applyCasualties(casualtyAmount: number): number {
        this.strengthValue = Math.max(0, this.strengthValue - Math.abs(casualtyAmount));
        return this.strengthValue;
    }

    public reinforce(reinforcementAmount: number): number {
        this.strengthValue = Math.min(100, this.strengthValue + Math.abs(reinforcementAmount));
        return this.strengthValue;
    }

    public getOrganization(): number {
        return this.organizationValue;
    }

    public reduceOrganization(reductionAmount: number): number {
        this.organizationValue = Math.max(0, this.organizationValue - Math.abs(reductionAmount));
        return this.organizationValue;
    }

    public restoreOrganization(restorationAmount: number): number {
        this.organizationValue = Math.min(100, this.organizationValue + Math.abs(restorationAmount));
        return this.organizationValue;
    }

    public getExperience(): number {
        return this.experienceValue;
    }

    public grantExperience(experienceAmount: number): number {
        this.experienceValue += Math.abs(experienceAmount);
        return this.experienceValue;
    }

    public isDestroyed(): boolean {
        return this.strengthValue <= 0;
    }

    public override describe(): string {
        return `${this.entityDisplayName} (${this.unitCategory.getDisplayName()})`;
    }
}
