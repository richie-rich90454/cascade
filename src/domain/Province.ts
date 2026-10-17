import { GameEntity } from "../core/GameEntity";

export class Province extends GameEntity {
    private readonly terrainTypeCode: string;
    private readonly columnIndex: number;
    private readonly rowIndex: number;

    private ownerNationIdentifier: string;
    private victoryPointValue: number;
    private isCapitalOfOwner: boolean;
    private supplyValue: number;

    constructor(
        identifier: string,
        displayName: string,
        terrainTypeCode: string,
        columnIndex: number,
        rowIndex: number,
        ownerNationIdentifier: string,
        victoryPointValue: number,
        isCapitalOfOwner: boolean,
    ) {
        super(identifier, displayName);
        this.terrainTypeCode = terrainTypeCode;
        this.columnIndex = columnIndex;
        this.rowIndex = rowIndex;
        this.ownerNationIdentifier = ownerNationIdentifier;
        this.victoryPointValue = victoryPointValue;
        this.isCapitalOfOwner = isCapitalOfOwner;
        this.supplyValue = 10;
    }

    public getTerrainTypeCode(): string {
        return this.terrainTypeCode;
    }

    public getColumnIndex(): number {
        return this.columnIndex;
    }

    public getRowIndex(): number {
        return this.rowIndex;
    }

    public getOwnerNationIdentifier(): string {
        return this.ownerNationIdentifier;
    }

    public setOwnerNationIdentifier(ownerNationIdentifier: string): void {
        this.ownerNationIdentifier = ownerNationIdentifier;
    }

    public restoreMutableState(state: {
        ownerNationIdentifier: string;
        victoryPointValue: number;
        isCapitalOfOwner: boolean;
        supplyValue: number;
    }): void {
        this.ownerNationIdentifier = state.ownerNationIdentifier;
        this.victoryPointValue = state.victoryPointValue;
        this.isCapitalOfOwner = state.isCapitalOfOwner;
        this.supplyValue = state.supplyValue;
    }

    public getVictoryPointValue(): number {
        return this.victoryPointValue;
    }

    public addVictoryPoints(additionalVictoryPoints: number): void {
        this.victoryPointValue = Math.max(0, this.victoryPointValue + additionalVictoryPoints);
    }

    public isCapital(): boolean {
        return this.isCapitalOfOwner;
    }

    public getSupplyValue(): number {
        return this.supplyValue;
    }

    public setSupplyValue(supplyValue: number): void {
        this.supplyValue = Math.max(0, supplyValue);
    }

    public override describe(): string {
        return `${this.entityDisplayName} (${this.terrainTypeCode})`;
    }
}
