import { GameEntity } from "../core/GameEntity";

export class Nation extends GameEntity {
    private readonly nationCode: string;
    private primaryColorHex: string;
    private accentColorHex: string;

    private treasury: number;
    private manpower: number;
    private legitimacy: number;
    private stability: number;

    private capitalProvinceIdentifier: string;
    private readonly controlledProvinceIdentifiers: Set<string>;
    private readonly alliedNationIdentifiers: Set<string>;
    private readonly nationsAtWarWithIdentifiers: Set<string>;

    constructor(
        identifier: string,
        displayName: string,
        nationCode: string,
        primaryColorHex: string,
        accentColorHex: string,
        capitalProvinceIdentifier: string,
    ) {
        super(identifier, displayName);
        this.nationCode = nationCode;
        this.primaryColorHex = primaryColorHex;
        this.accentColorHex = accentColorHex;
        this.capitalProvinceIdentifier = capitalProvinceIdentifier;
        this.treasury = 0;
        this.manpower = 0;
        this.legitimacy = 50;
        this.stability = 50;
        this.controlledProvinceIdentifiers = new Set<string>();
        this.alliedNationIdentifiers = new Set<string>();
        this.nationsAtWarWithIdentifiers = new Set<string>();
    }

    public getNationCode(): string {
        return this.nationCode;
    }

    public getPrimaryColorHex(): string {
        return this.primaryColorHex;
    }

    public setPrimaryColorHex(primaryColorHex: string): void {
        this.primaryColorHex = primaryColorHex;
    }

    public getAccentColorHex(): string {
        return this.accentColorHex;
    }

    public setAccentColorHex(accentColorHex: string): void {
        this.accentColorHex = accentColorHex;
    }

    public getTreasury(): number {
        return this.treasury;
    }

    public addToTreasury(deltaAmount: number): number {
        this.treasury += deltaAmount;
        return this.treasury;
    }

    public getManpower(): number {
        return this.manpower;
    }

    public addToManpower(deltaAmount: number): number {
        this.manpower = Math.max(0, this.manpower + deltaAmount);
        return this.manpower;
    }

    public getLegitimacy(): number {
        return this.legitimacy;
    }

    public addToLegitimacy(deltaAmount: number): number {
        this.legitimacy = Nation.clampPercentage(this.legitimacy + deltaAmount);
        return this.legitimacy;
    }

    public getStability(): number {
        return this.stability;
    }

    public addToStability(deltaAmount: number): number {
        this.stability = Nation.clampPercentage(this.stability + deltaAmount);
        return this.stability;
    }

    public getCapitalProvinceIdentifier(): string {
        return this.capitalProvinceIdentifier;
    }

    public setCapitalProvinceIdentifier(capitalProvinceIdentifier: string): void {
        this.capitalProvinceIdentifier = capitalProvinceIdentifier;
    }

    public getControlledProvinceIdentifiers(): string[] {
        return Array.from(this.controlledProvinceIdentifiers);
    }

    public addControlledProvince(provinceIdentifier: string): void {
        this.controlledProvinceIdentifiers.add(provinceIdentifier);
    }

    public removeControlledProvince(provinceIdentifier: string): void {
        this.controlledProvinceIdentifiers.delete(provinceIdentifier);
    }

    public getControlledProvinceCount(): number {
        return this.controlledProvinceIdentifiers.size;
    }

    public formAllianceWith(otherNation: Nation): void {
        this.alliedNationIdentifiers.add(otherNation.getIdentifier());
        otherNation.alliedNationIdentifiers.add(this.entityIdentifier);
    }

    public breakAllianceWith(otherNation: Nation): void {
        this.alliedNationIdentifiers.delete(otherNation.getIdentifier());
        otherNation.alliedNationIdentifiers.delete(this.entityIdentifier);
    }

    public isAlliedWith(otherNation: Nation): boolean {
        return this.alliedNationIdentifiers.has(otherNation.getIdentifier());
    }

    public getAlliedNationIdentifiers(): string[] {
        return Array.from(this.alliedNationIdentifiers);
    }

    public declareWarOn(otherNation: Nation): void {
        this.nationsAtWarWithIdentifiers.add(otherNation.getIdentifier());
        otherNation.nationsAtWarWithIdentifiers.add(this.entityIdentifier);
    }

    public signPeaceWith(otherNation: Nation): void {
        this.nationsAtWarWithIdentifiers.delete(otherNation.getIdentifier());
        otherNation.nationsAtWarWithIdentifiers.delete(this.entityIdentifier);
    }

    public isAtWarWith(otherNation: Nation): boolean {
        return this.nationsAtWarWithIdentifiers.has(otherNation.getIdentifier());
    }

    public isAtWarWithAnyNation(): boolean {
        return this.nationsAtWarWithIdentifiers.size > 0;
    }

    public getNationsAtWarWithIdentifiers(): string[] {
        return Array.from(this.nationsAtWarWithIdentifiers);
    }

    public describe(): string {
        return `${this.entityDisplayName} (${this.nationCode})`;
    }

    private static clampPercentage(value: number): number {
        return Math.max(0, Math.min(100, Math.round(value)));
    }
}
