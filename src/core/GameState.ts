import type { Nation } from "../domain/Nation";
import type { Province } from "../domain/Province";
import type { Unit } from "../domain/Unit";
import type { ResourceType } from "../types/ResourceType";
import { EventBus, GameEventTypes, ResourceChangePayload } from "./EventBus";

export interface GameStateSnapshot {
    version: 1;
    scenarioIdentifier: string;
    turnNumber: number;
    playerNationIdentifier: string;
    resourceQuantities: Record<string, number>;
    scenarioFlags: string[];
    nations: Array<{
        identifier: string;
        treasury: number;
        manpower: number;
        legitimacy: number;
        stability: number;
        capitalProvinceIdentifier: string;
        controlledProvinceIdentifiers: string[];
        alliedNationIdentifiers: string[];
        nationsAtWarWithIdentifiers: string[];
        primaryColorHex: string;
        accentColorHex: string;
    }>;
    provinces: Array<{
        identifier: string;
        ownerNationIdentifier: string;
        victoryPointValue: number;
        isCapital: boolean;
        supplyValue: number;
    }>;
    units: Array<{
        identifier: string;
        stationedProvinceIdentifier: string;
        strengthValue: number;
        organizationValue: number;
        experienceValue: number;
    }>;
}

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
        EventBus.getInstance().publish(GameEventTypes.GAME_STATE_CHANGED, undefined);
    }

    public getTurnNumber(): number {
        return this.turnNumber;
    }

    public setTurnNumber(turnNumber: number): void {
        this.turnNumber = turnNumber;
        EventBus.getInstance().publish(GameEventTypes.GAME_STATE_CHANGED, undefined);
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
        EventBus.getInstance().publish(GameEventTypes.GAME_STATE_CHANGED, undefined);
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
        EventBus.getInstance().publish(GameEventTypes.GAME_STATE_CHANGED, undefined);
    }

    public clearScenarioFlag(flagIdentifier: string): void {
        if (this.scenarioFlags.delete(flagIdentifier)) {
            EventBus.getInstance().publish(GameEventTypes.GAME_STATE_CHANGED, undefined);
        }
    }

    public getScenarioFlags(): string[] {
        return Array.from(this.scenarioFlags);
    }

    public createSnapshot(): GameStateSnapshot {
        return {
            version: 1,
            scenarioIdentifier: this.scenarioIdentifier,
            turnNumber: this.turnNumber,
            playerNationIdentifier: this.playerNationIdentifier,
            resourceQuantities: this.getRawResourceQuantities(),
            scenarioFlags: this.getScenarioFlags(),
            nations: this.getAllNations().map((nation) => ({
                identifier: nation.getIdentifier(),
                treasury: nation.getTreasury(),
                manpower: nation.getManpower(),
                legitimacy: nation.getLegitimacy(),
                stability: nation.getStability(),
                capitalProvinceIdentifier: nation.getCapitalProvinceIdentifier(),
                controlledProvinceIdentifiers: nation.getControlledProvinceIdentifiers(),
                alliedNationIdentifiers: nation.getAlliedNationIdentifiers(),
                nationsAtWarWithIdentifiers: nation.getNationsAtWarWithIdentifiers(),
                primaryColorHex: nation.getPrimaryColorHex(),
                accentColorHex: nation.getAccentColorHex(),
            })),
            provinces: this.getAllProvinces().map((province) => ({
                identifier: province.getIdentifier(),
                ownerNationIdentifier: province.getOwnerNationIdentifier(),
                victoryPointValue: province.getVictoryPointValue(),
                isCapital: province.isCapital(),
                supplyValue: province.getSupplyValue(),
            })),
            units: this.getAllUnits().map((unit) => ({
                identifier: unit.getIdentifier(),
                stationedProvinceIdentifier: unit.getStationedProvinceIdentifier(),
                strengthValue: unit.getStrength(),
                organizationValue: unit.getOrganization(),
                experienceValue: unit.getExperience(),
            })),
        };
    }

    public restoreSnapshot(snapshot: GameStateSnapshot): boolean {
        if (
            snapshot === null ||
            typeof snapshot !== "object" ||
            snapshot.version !== 1 ||
            typeof snapshot.scenarioIdentifier !== "string" ||
            snapshot.scenarioIdentifier !== this.scenarioIdentifier ||
            !Number.isInteger(snapshot.turnNumber) ||
            snapshot.turnNumber < 1 ||
            typeof snapshot.playerNationIdentifier !== "string" ||
            snapshot.resourceQuantities === null ||
            typeof snapshot.resourceQuantities !== "object" ||
            Array.isArray(snapshot.resourceQuantities) ||
            !Array.isArray(snapshot.scenarioFlags) ||
            !snapshot.scenarioFlags.every((flag) => typeof flag === "string") ||
            !Array.isArray(snapshot.nations) ||
            !Array.isArray(snapshot.provinces) ||
            !Array.isArray(snapshot.units) ||
            this.getAllNations().length !== snapshot.nations.length ||
            this.getAllProvinces().length !== snapshot.provinces.length ||
            this.getAllUnits().length !== snapshot.units.length
        ) {
            return false;
        }
        if (
            Object.values(snapshot.resourceQuantities).some((quantity) => !Number.isFinite(quantity)) ||
            snapshot.nations.some(
                (record) =>
                    record === null ||
                    typeof record !== "object" ||
                    typeof record.identifier !== "string" ||
                    this.getNation(record.identifier) === null ||
                    !Number.isFinite(record.treasury) ||
                    !Number.isFinite(record.manpower) ||
                    !Number.isFinite(record.legitimacy) ||
                    !Number.isFinite(record.stability) ||
                    typeof record.capitalProvinceIdentifier !== "string" ||
                    typeof record.primaryColorHex !== "string" ||
                    typeof record.accentColorHex !== "string" ||
                    !Array.isArray(record.controlledProvinceIdentifiers) ||
                    !record.controlledProvinceIdentifiers.every((identifier) => typeof identifier === "string") ||
                    !Array.isArray(record.alliedNationIdentifiers) ||
                    !record.alliedNationIdentifiers.every((identifier) => typeof identifier === "string") ||
                    !Array.isArray(record.nationsAtWarWithIdentifiers) ||
                    !record.nationsAtWarWithIdentifiers.every((identifier) => typeof identifier === "string"),
            ) ||
            snapshot.provinces.some(
                (record) =>
                    record === null ||
                    typeof record !== "object" ||
                    typeof record.identifier !== "string" ||
                    this.getProvince(record.identifier) === null ||
                    typeof record.ownerNationIdentifier !== "string" ||
                    !Number.isFinite(record.victoryPointValue) ||
                    typeof record.isCapital !== "boolean" ||
                    !Number.isFinite(record.supplyValue),
            ) ||
            snapshot.units.some(
                (record) =>
                    record === null ||
                    typeof record !== "object" ||
                    typeof record.identifier !== "string" ||
                    this.getUnit(record.identifier) === null ||
                    typeof record.stationedProvinceIdentifier !== "string" ||
                    !Number.isFinite(record.strengthValue) ||
                    !Number.isFinite(record.organizationValue) ||
                    !Number.isFinite(record.experienceValue),
            )
        ) {
            return false;
        }
        this.turnNumber = snapshot.turnNumber;
        this.playerNationIdentifier = snapshot.playerNationIdentifier;
        this.resourceQuantities.clear();
        for (const [resourceCode, quantity] of Object.entries(snapshot.resourceQuantities)) {
            this.resourceQuantities.set(resourceCode, quantity);
        }
        this.scenarioFlags.clear();
        snapshot.scenarioFlags.forEach((flag) => this.scenarioFlags.add(flag));
        snapshot.nations.forEach((record) =>
            this.getNation(record.identifier)?.restoreMutableState({
                treasury: record.treasury,
                manpower: record.manpower,
                legitimacy: record.legitimacy,
                stability: record.stability,
                capitalProvinceIdentifier: record.capitalProvinceIdentifier,
                controlledProvinceIdentifiers: record.controlledProvinceIdentifiers,
                alliedNationIdentifiers: record.alliedNationIdentifiers,
                nationsAtWarWithIdentifiers: record.nationsAtWarWithIdentifiers,
                primaryColorHex: record.primaryColorHex,
                accentColorHex: record.accentColorHex,
            }),
        );
        snapshot.provinces.forEach((record) =>
            this.getProvince(record.identifier)?.restoreMutableState({
                ownerNationIdentifier: record.ownerNationIdentifier,
                victoryPointValue: record.victoryPointValue,
                isCapitalOfOwner: record.isCapital,
                supplyValue: record.supplyValue,
            }),
        );
        snapshot.units.forEach((record) =>
            this.getUnit(record.identifier)?.restoreMutableState({
                stationedProvinceIdentifier: record.stationedProvinceIdentifier,
                strengthValue: record.strengthValue,
                organizationValue: record.organizationValue,
                experienceValue: record.experienceValue,
            }),
        );
        return true;
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
