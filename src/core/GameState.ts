import type { Nation } from "../domain/Nation";
import type { Province } from "../domain/Province";
import type { Unit } from "../domain/Unit";
import type { ResourceType } from "../types/ResourceType";
import { EventBus, GameEventTypes, ResourceChangePayload } from "./EventBus";

export class GameState {
    private readonly registeredNations: Map<string, Nation>;
    private readonly registeredProvinces: Map<string, Province>;
    private readonly registeredUnits: Map<string, Unit>;
    private readonly resourceQuantities: Map<string, number>;
    private readonly scenarioFlags: Set<string>;

    private scenarioIdentifier: string;
    private turnNumber: number;
    private playerNationIdentifier: string;

    constructor() {
        this.registeredNations = new Map<string, Nation>();
        this.registeredProvinces = new Map<string, Province>();
        this.registeredUnits = new Map<string, Unit>();
        this.resourceQuantities = new Map<string, number>();
        this.scenarioFlags = new Set<string>();
        this.scenarioIdentifier = "";
        this.turnNumber = 0;
        this.playerNationIdentifier = "";
    }

    public getScenarioIdentifier(): string {
        return this.scenarioIdentifier;
    }

    public setScenarioIdentifier(scenarioIdentifier: string): void {
        this.scenarioIdentifier = scenarioIdentifier;
    }

    public getTurnNumber(): number {
        return this.turnNumber;
    }

    public setTurnNumber(turnNumber: number): void {
        this.turnNumber = turnNumber;
    }

    public advanceTurnNumber(): number {
        this.turnNumber += 1;
        return this.turnNumber;
    }

    public getPlayerNationIdentifier(): string {
        return this.playerNationIdentifier;
    }

    public setPlayerNationIdentifier(playerNationIdentifier: string): void {
        this.playerNationIdentifier = playerNationIdentifier;
    }

    public registerNation(nation: Nation): void {
        this.registeredNations.set(nation.getIdentifier(), nation);
    }

    public getNation(nationIdentifier: string): Nation | null {
        return this.registeredNations.get(nationIdentifier) ?? null;
    }

    public getAllNations(): Nation[] {
        return Array.from(this.registeredNations.values());
    }

    public getNationsByIdentifiers(nationIdentifiers: string[]): Nation[] {
        const resolvedNations: Nation[] = [];
        for (const nationIdentifier of nationIdentifiers) {
            const resolvedNation = this.registeredNations.get(nationIdentifier);
            if (resolvedNation !== undefined) {
                resolvedNations.push(resolvedNation);
            }
        }
        return resolvedNations;
    }

    public registerProvince(province: Province): void {
        this.registeredProvinces.set(province.getIdentifier(), province);
    }

    public getProvince(provinceIdentifier: string): Province | null {
        return this.registeredProvinces.get(provinceIdentifier) ?? null;
    }

    public getAllProvinces(): Province[] {
        return Array.from(this.registeredProvinces.values());
    }

    public registerUnit(unit: Unit): void {
        this.registeredUnits.set(unit.getIdentifier(), unit);
    }

    public getUnit(unitIdentifier: string): Unit | null {
        return this.registeredUnits.get(unitIdentifier) ?? null;
    }

    public getAllUnits(): Unit[] {
        return Array.from(this.registeredUnits.values());
    }

    public getResourceQuantity(resourceType: ResourceType): number {
        return this.resourceQuantities.get(resourceType.getCode()) ?? 0;
    }

    public setResourceQuantity(resourceType: ResourceType, quantity: number): void {
        const previousQuantity = this.getResourceQuantity(resourceType);
        this.resourceQuantities.set(resourceType.getCode(), quantity);
        EventBus.getInstance().publish(
            GameEventTypes.RESOURCE_CHANGED,
            new ResourceChangePayload(resourceType.getCode(), previousQuantity, quantity),
        );
    }

    public addToResource(resourceType: ResourceType, deltaQuantity: number): number {
        const updatedQuantity = this.getResourceQuantity(resourceType) + deltaQuantity;
        this.setResourceQuantity(resourceType, updatedQuantity);
        return updatedQuantity;
    }

    public applyRawResourceQuantity(resourceTypeCode: string, quantity: number): void {
        this.resourceQuantities.set(resourceTypeCode, quantity);
    }

    public getRawResourceQuantities(): Record<string, number> {
        const rawQuantities: Record<string, number> = {};
        for (const [resourceTypeCode, quantity] of this.resourceQuantities.entries()) {
            rawQuantities[resourceTypeCode] = quantity;
        }
        return rawQuantities;
    }

    public isScenarioFlagSet(flagIdentifier: string): boolean {
        return this.scenarioFlags.has(flagIdentifier);
    }

    public setScenarioFlag(flagIdentifier: string): void {
        this.scenarioFlags.add(flagIdentifier);
    }

    public clearScenarioFlag(flagIdentifier: string): void {
        this.scenarioFlags.delete(flagIdentifier);
    }

    public getScenarioFlags(): string[] {
        return Array.from(this.scenarioFlags);
    }

    public reset(): void {
        this.registeredNations.clear();
        this.registeredProvinces.clear();
        this.registeredUnits.clear();
        this.resourceQuantities.clear();
        this.scenarioFlags.clear();
        this.scenarioIdentifier = "";
        this.turnNumber = 0;
        this.playerNationIdentifier = "";
    }
}
