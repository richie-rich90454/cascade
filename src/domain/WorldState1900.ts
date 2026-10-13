import type { GameState } from "../core/GameState";
import { Nation } from "../domain/Nation";
import { Province } from "../domain/Province";
import { Nations } from "../data/Nations";

interface ProvinceSeedRecord {
    identifier: string;
    displayName: string;
    terrainTypeCode: string;
    columnIndex: number;
    rowIndex: number;
    ownerNationIdentifier: string;
    victoryPointValue: number;
    isCapitalOfOwner: boolean;
}

export class WorldState1900 {
    private static readonly PROVINCE_SEED_RECORDS: ProvinceSeedRecord[] = [
        { identifier: "prov_london", displayName: "London", terrainTypeCode: "urban", columnIndex: 2, rowIndex: 4, ownerNationIdentifier: "british_empire", victoryPointValue: 40, isCapitalOfOwner: true },
        { identifier: "prov_liverpool", displayName: "Liverpool", terrainTypeCode: "industrial", columnIndex: 2, rowIndex: 3, ownerNationIdentifier: "british_empire", victoryPointValue: 15, isCapitalOfOwner: false },
        { identifier: "prov_paris", displayName: "Paris", terrainTypeCode: "urban", columnIndex: 3, rowIndex: 5, ownerNationIdentifier: "french_republic", victoryPointValue: 35, isCapitalOfOwner: true },
        { identifier: "prov_algiers", displayName: "Algiers", terrainTypeCode: "coastal", columnIndex: 3, rowIndex: 8, ownerNationIdentifier: "french_republic", victoryPointValue: 10, isCapitalOfOwner: false },
        { identifier: "prov_brussels", displayName: "Brussels", terrainTypeCode: "urban", columnIndex: 3, rowIndex: 4, ownerNationIdentifier: "belgium", victoryPointValue: 12, isCapitalOfOwner: true },
        { identifier: "prov_berlin", displayName: "Berlin", terrainTypeCode: "urban", columnIndex: 5, rowIndex: 5, ownerNationIdentifier: "german_empire", victoryPointValue: 30, isCapitalOfOwner: true },
        { identifier: "prov_rhineland", displayName: "Rhineland", terrainTypeCode: "industrial", columnIndex: 4, rowIndex: 5, ownerNationIdentifier: "german_empire", victoryPointValue: 15, isCapitalOfOwner: false },
        { identifier: "prov_vienna", displayName: "Vienna", terrainTypeCode: "urban", columnIndex: 6, rowIndex: 4, ownerNationIdentifier: "austro_hungarian_empire", victoryPointValue: 25, isCapitalOfOwner: true },
        { identifier: "prov_budapest", displayName: "Budapest", terrainTypeCode: "urban", columnIndex: 7, rowIndex: 5, ownerNationIdentifier: "austro_hungarian_empire", victoryPointValue: 15, isCapitalOfOwner: false },
        { identifier: "prov_belgrade", displayName: "Belgrade", terrainTypeCode: "plains", columnIndex: 7, rowIndex: 6, ownerNationIdentifier: "serbia", victoryPointValue: 8, isCapitalOfOwner: true },
        { identifier: "prov_rome", displayName: "Rome", terrainTypeCode: "urban", columnIndex: 5, rowIndex: 7, ownerNationIdentifier: "kingdom_of_italy", victoryPointValue: 15, isCapitalOfOwner: true },
        { identifier: "prov_athens", displayName: "Athens", terrainTypeCode: "mountains", columnIndex: 7, rowIndex: 7, ownerNationIdentifier: "kingdom_of_italy", victoryPointValue: 5, isCapitalOfOwner: false },
        { identifier: "prov_madrid", displayName: "Madrid", terrainTypeCode: "urban", columnIndex: 2, rowIndex: 7, ownerNationIdentifier: "kingdom_of_italy", victoryPointValue: 10, isCapitalOfOwner: false },
        { identifier: "prov_moscow", displayName: "Moscow", terrainTypeCode: "urban", columnIndex: 10, rowIndex: 3, ownerNationIdentifier: "russian_empire", victoryPointValue: 25, isCapitalOfOwner: true },
        { identifier: "prov_kyiv", displayName: "Kyiv", terrainTypeCode: "plains", columnIndex: 9, rowIndex: 4, ownerNationIdentifier: "russian_empire", victoryPointValue: 8, isCapitalOfOwner: false },
        { identifier: "prov_warsaw", displayName: "Warsaw", terrainTypeCode: "plains", columnIndex: 7, rowIndex: 4, ownerNationIdentifier: "russian_empire", victoryPointValue: 8, isCapitalOfOwner: false },
        { identifier: "prov_vladivostok", displayName: "Vladivostok", terrainTypeCode: "coastal", columnIndex: 18, rowIndex: 3, ownerNationIdentifier: "russian_empire", victoryPointValue: 8, isCapitalOfOwner: false },
        { identifier: "prov_istanbul", displayName: "Istanbul", terrainTypeCode: "urban", columnIndex: 8, rowIndex: 5, ownerNationIdentifier: "ottoman_empire", victoryPointValue: 20, isCapitalOfOwner: true },
        { identifier: "prov_ankara", displayName: "Ankara", terrainTypeCode: "plains", columnIndex: 8, rowIndex: 6, ownerNationIdentifier: "ottoman_empire", victoryPointValue: 8, isCapitalOfOwner: false },
        { identifier: "prov_damascus", displayName: "Damascus", terrainTypeCode: "desert", columnIndex: 10, rowIndex: 7, ownerNationIdentifier: "ottoman_empire", victoryPointValue: 8, isCapitalOfOwner: false },
        { identifier: "prov_baghdad", displayName: "Baghdad", terrainTypeCode: "desert", columnIndex: 10, rowIndex: 8, ownerNationIdentifier: "ottoman_empire", victoryPointValue: 10, isCapitalOfOwner: false },
        { identifier: "prov_mecca", displayName: "Mecca", terrainTypeCode: "desert", columnIndex: 10, rowIndex: 10, ownerNationIdentifier: "ottoman_empire", victoryPointValue: 5, isCapitalOfOwner: false },
        { identifier: "prov_cairo", displayName: "Cairo", terrainTypeCode: "desert", columnIndex: 8, rowIndex: 9, ownerNationIdentifier: "ottoman_empire", victoryPointValue: 10, isCapitalOfOwner: false },
        { identifier: "prov_new_york", displayName: "New York", terrainTypeCode: "urban", columnIndex: 5, rowIndex: 4, ownerNationIdentifier: "united_states", victoryPointValue: 25, isCapitalOfOwner: false },
        { identifier: "prov_washington", displayName: "Washington", terrainTypeCode: "urban", columnIndex: 4, rowIndex: 5, ownerNationIdentifier: "united_states", victoryPointValue: 35, isCapitalOfOwner: true },
        { identifier: "prov_chicago", displayName: "Chicago", terrainTypeCode: "industrial", columnIndex: 4, rowIndex: 3, ownerNationIdentifier: "united_states", victoryPointValue: 15, isCapitalOfOwner: false },
        { identifier: "prov_san_francisco", displayName: "San Francisco", terrainTypeCode: "urban", columnIndex: 2, rowIndex: 3, ownerNationIdentifier: "united_states", victoryPointValue: 12, isCapitalOfOwner: false },
        { identifier: "prov_havana", displayName: "Havana", terrainTypeCode: "coastal", columnIndex: 4, rowIndex: 7, ownerNationIdentifier: "united_states", victoryPointValue: 6, isCapitalOfOwner: false },
        { identifier: "prov_manila", displayName: "Manila", terrainTypeCode: "coastal", columnIndex: 15, rowIndex: 9, ownerNationIdentifier: "united_states", victoryPointValue: 8, isCapitalOfOwner: false },
        { identifier: "prov_mexico_city", displayName: "Mexico City", terrainTypeCode: "urban", columnIndex: 3, rowIndex: 9, ownerNationIdentifier: "mexico", victoryPointValue: 15, isCapitalOfOwner: true },
        { identifier: "prov_veracruz", displayName: "Veracruz", terrainTypeCode: "coastal", columnIndex: 4, rowIndex: 9, ownerNationIdentifier: "mexico", victoryPointValue: 6, isCapitalOfOwner: false },
        { identifier: "prov_rio_de_janeiro", displayName: "Rio de Janeiro", terrainTypeCode: "coastal", columnIndex: 7, rowIndex: 11, ownerNationIdentifier: "brazil", victoryPointValue: 10, isCapitalOfOwner: false },
        { identifier: "prov_sao_paulo", displayName: "Sao Paulo", terrainTypeCode: "industrial", columnIndex: 7, rowIndex: 10, ownerNationIdentifier: "brazil", victoryPointValue: 12, isCapitalOfOwner: true },
        { identifier: "prov_tokyo", displayName: "Tokyo", terrainTypeCode: "urban", columnIndex: 17, rowIndex: 5, ownerNationIdentifier: "empire_of_japan", victoryPointValue: 20, isCapitalOfOwner: true },
        { identifier: "prov_seoul", displayName: "Seoul", terrainTypeCode: "plains", columnIndex: 16, rowIndex: 5, ownerNationIdentifier: "empire_of_japan", victoryPointValue: 8, isCapitalOfOwner: false },
        { identifier: "prov_beijing", displayName: "Beijing", terrainTypeCode: "urban", columnIndex: 14, rowIndex: 4, ownerNationIdentifier: "qing_china", victoryPointValue: 20, isCapitalOfOwner: true },
        { identifier: "prov_shanghai", displayName: "Shanghai", terrainTypeCode: "urban", columnIndex: 15, rowIndex: 5, ownerNationIdentifier: "qing_china", victoryPointValue: 12, isCapitalOfOwner: false },
        { identifier: "prov_hong_kong", displayName: "Hong Kong", terrainTypeCode: "coastal", columnIndex: 15, rowIndex: 6, ownerNationIdentifier: "british_empire", victoryPointValue: 6, isCapitalOfOwner: false },
        { identifier: "prov_delhi", displayName: "Delhi", terrainTypeCode: "urban", columnIndex: 12, rowIndex: 6, ownerNationIdentifier: "british_raj", victoryPointValue: 15, isCapitalOfOwner: true },
        { identifier: "prov_calcutta", displayName: "Calcutta", terrainTypeCode: "urban", columnIndex: 13, rowIndex: 7, ownerNationIdentifier: "british_raj", victoryPointValue: 12, isCapitalOfOwner: false },
        { identifier: "prov_bombay", displayName: "Bombay", terrainTypeCode: "coastal", columnIndex: 12, rowIndex: 7, ownerNationIdentifier: "british_raj", victoryPointValue: 10, isCapitalOfOwner: false },
        { identifier: "prov_singapore", displayName: "Singapore", terrainTypeCode: "coastal", columnIndex: 14, rowIndex: 9, ownerNationIdentifier: "british_empire", victoryPointValue: 8, isCapitalOfOwner: false },
        { identifier: "prov_sydney", displayName: "Sydney", terrainTypeCode: "coastal", columnIndex: 20, rowIndex: 12, ownerNationIdentifier: "british_empire", victoryPointValue: 6, isCapitalOfOwner: false },
        { identifier: "prov_cape_town", displayName: "Cape Town", terrainTypeCode: "coastal", columnIndex: 6, rowIndex: 13, ownerNationIdentifier: "british_empire", victoryPointValue: 8, isCapitalOfOwner: false },
        { identifier: "prov_nairobi", displayName: "Nairobi", terrainTypeCode: "plains", columnIndex: 8, rowIndex: 11, ownerNationIdentifier: "british_empire", victoryPointValue: 5, isCapitalOfOwner: false },
        { identifier: "prov_lagos", displayName: "Lagos", terrainTypeCode: "coastal", columnIndex: 4, rowIndex: 11, ownerNationIdentifier: "british_empire", victoryPointValue: 5, isCapitalOfOwner: false },
        { identifier: "prov_dakar", displayName: "Dakar", terrainTypeCode: "coastal", columnIndex: 1, rowIndex: 10, ownerNationIdentifier: "french_republic", victoryPointValue: 5, isCapitalOfOwner: false },
        { identifier: "prov_west_africa_interior", displayName: "Bamako", terrainTypeCode: "plains", columnIndex: 2, rowIndex: 10, ownerNationIdentifier: "west_african_colonies", victoryPointValue: 4, isCapitalOfOwner: true },
        { identifier: "prov_sofia", displayName: "Sofia", terrainTypeCode: "mountains", columnIndex: 7, rowIndex: 6, ownerNationIdentifier: "ottoman_empire", victoryPointValue: 4, isCapitalOfOwner: false },
    ];

    public static createInitialWorldNations(): Nation[] {
        const manifestSeedManpower: Record<string, number> = {
            british_empire: 108000,
            french_republic: 71000,
            german_empire: 132000,
            russian_empire: 160000,
            austro_hungarian_empire: 78000,
            ottoman_empire: 42000,
            kingdom_of_italy: 46000,
            united_states: 96000,
            empire_of_japan: 31000,
            qing_china: 140000,
            serbia: 6000,
            belgium: 12000,
            mexico: 18000,
            brazil: 22000,
            british_raj: 90000,
            west_african_colonies: 9000,
        };
        const manifestSeedTreasury: Record<string, number> = {
            british_empire: 920,
            french_republic: 640,
            german_empire: 810,
            russian_empire: 480,
            austro_hungarian_empire: 390,
            ottoman_empire: 180,
            kingdom_of_italy: 220,
            united_states: 870,
            empire_of_japan: 190,
            qing_china: 160,
            serbia: 35,
            belgium: 60,
            mexico: 40,
            brazil: 55,
            british_raj: 120,
            west_african_colonies: 20,
        };
        const initialWorldNations: Nation[] = [];
        for (const nationDefinition of Nations.getAllNationDefinitions()) {
            if (nationDefinition.identifier === "soviet_union" || nationDefinition.identifier === "republic_of_china" || nationDefinition.identifier === "republic_of_turkey") {
                continue;
            }
            const capitalProvinceSeed = WorldState1900.PROVINCE_SEED_RECORDS.find(
                (provinceSeed) => provinceSeed.ownerNationIdentifier === nationDefinition.identifier && provinceSeed.isCapitalOfOwner,
            );
            const newNation = new Nation(
                nationDefinition.identifier,
                nationDefinition.displayName,
                nationDefinition.nationCode,
                nationDefinition.primaryColorHex,
                nationDefinition.accentColorHex,
                capitalProvinceSeed?.identifier ?? "",
            );
            newNation.addToManpower(manifestSeedManpower[nationDefinition.identifier] ?? 10000);
            newNation.addToTreasury(manifestSeedTreasury[nationDefinition.identifier] ?? 50);
            initialWorldNations.push(newNation);
        }
        return initialWorldNations;
    }

    public static createInitialWorldProvinces(): Province[] {
        const initialWorldProvinces: Province[] = [];
        for (const provinceSeedRecord of WorldState1900.PROVINCE_SEED_RECORDS) {
            initialWorldProvinces.push(
                new Province(
                    provinceSeedRecord.identifier,
                    provinceSeedRecord.displayName,
                    provinceSeedRecord.terrainTypeCode,
                    provinceSeedRecord.columnIndex,
                    provinceSeedRecord.rowIndex,
                    provinceSeedRecord.ownerNationIdentifier,
                    provinceSeedRecord.victoryPointValue,
                    provinceSeedRecord.isCapitalOfOwner,
                ),
            );
        }
        return initialWorldProvinces;
    }

    public static registerInitialWorldIntoGameState(gameState: GameState): void {
        gameState.reset();
        for (const nation of WorldState1900.createInitialWorldNations()) {
            gameState.registerNation(nation);
        }
        for (const province of WorldState1900.createInitialWorldProvinces()) {
            gameState.registerProvince(province);
            const ownerNation = gameState.getNation(province.getOwnerNationIdentifier());
            if (ownerNation !== null) {
                ownerNation.addControlledProvince(province.getIdentifier());
            }
        }
        gameState.setTurnNumber(1);
    }

    public static getEmpiresDominating1900Description(): string {
        return "In 1900 the West dominated the global political order. Land-based empires such as the Ottoman, Russian, and Qing ruled subject peoples across three continents, while maritime empires such as the British and French carried European power to every ocean.";
    }
}
