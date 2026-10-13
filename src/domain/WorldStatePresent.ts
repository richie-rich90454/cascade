import type { GameState } from "../core/GameState";
import { Nations } from "../data/Nations";
import { Nation } from "../domain/Nation";

export class TerritorialHoldingsRow {
    public readonly holdingIdentifier: string;
    public readonly holdingDisplayName: string;
    public readonly statusIn1900: string;
    public readonly statusInPresent: string;
    public readonly classificationAsContinuityOrChange: string;

    constructor(
        holdingIdentifier: string,
        holdingDisplayName: string,
        statusIn1900: string,
        statusInPresent: string,
        classificationAsContinuityOrChange: string,
    ) {
        this.holdingIdentifier = holdingIdentifier;
        this.holdingDisplayName = holdingDisplayName;
        this.statusIn1900 = statusIn1900;
        this.statusInPresent = statusInPresent;
        this.classificationAsContinuityOrChange = classificationAsContinuityOrChange;
    }
}

export class WorldStatePresent {
    public static createPresentDayNations(): Nation[] {
        const presentDayNations: Nation[] = [];
        for (const nationDefinition of Nations.getAllNationDefinitions()) {
            presentDayNations.push(
                new Nation(
                    nationDefinition.identifier,
                    nationDefinition.displayName,
                    nationDefinition.nationCode,
                    nationDefinition.primaryColorHex,
                    nationDefinition.accentColorHex,
                    "",
                ),
            );
        }
        return presentDayNations;
    }

    public static getCollapsedEmpireIdentifiers(): string[] {
        return ["ottoman_empire", "russian_empire", "qing_china", "austro_hungarian_empire"];
    }

    public static getCollapsedEmpireLabels(): Array<{
        identifier: string;
        displayName: string;
        collapsedByYear: number;
    }> {
        return [
            { identifier: "ottoman_empire", displayName: "Ottoman Empire", collapsedByYear: 1922 },
            { identifier: "russian_empire", displayName: "Russian Empire", collapsedByYear: 1917 },
            { identifier: "qing_china", displayName: "Qing Empire", collapsedByYear: 1912 },
            { identifier: "austro_hungarian_empire", displayName: "Austria-Hungary", collapsedByYear: 1918 },
        ];
    }

    public static getTerritorialHoldingsRowsForContinuityAndChangeChart(): TerritorialHoldingsRow[] {
        return [
            new TerritorialHoldingsRow(
                "holdings_ottoman_arab_lands",
                "Ottoman Arab provinces",
                "Direct rule of the Sublime Porte from Baghdad to Jerusalem",
                "Independent states under League of Nations mandates",
                "change",
            ),
            new TerritorialHoldingsRow(
                "holdings_russian_empire",
                "Russian imperial territories",
                "A single autocratic empire from Warsaw to Vladivostok",
                "A communist state shorn of Poland, Finland, and the Baltic",
                "change",
            ),
            new TerritorialHoldingsRow(
                "holdings_qing_china",
                "Qing imperial realm",
                "The celestial empire ruling Manchuria, Mongolia, and Tibet",
                "A republic whose borders survive as a continuity despite revolution",
                "continuity",
            ),
            new TerritorialHoldingsRow(
                "holdings_indian_subcontinent",
                "Indian subcontinent",
                "The British Raj governing 300 million subjects",
                "Independent India and Pakistan",
                "change",
            ),
            new TerritorialHoldingsRow(
                "holdings_british_maritime_empire",
                "British maritime empire",
                "A quarter of the globe colored imperial red",
                "The Commonwealth of Nations replaces formal empire",
                "change",
            ),
            new TerritorialHoldingsRow(
                "holdings_german_colonies",
                "Former German colonies",
                "German East Africa and Kiaochow under Berlin's flag",
                "Mandates entrusted to Britain, France, Japan, and South Africa",
                "change",
            ),
            new TerritorialHoldingsRow(
                "holdings_west_dominated_order",
                "Western dominance of the political order",
                "European great powers dictate the terms of world politics",
                "Two superpowers and many new states share the stage",
                "change",
            ),
            new TerritorialHoldingsRow(
                "holdings_imperial_rivalry_pattern",
                "Imperial rivalry among great powers",
                "Competition for colonies, resources, and prestige",
                "Competition continues through ideology, markets, and alliances",
                "continuity",
            ),
        ];
    }

    public static registerPresentDayWorldIntoGameState(gameState: GameState): void {
        gameState.reset();
        for (const nation of WorldStatePresent.createPresentDayNations()) {
            gameState.registerNation(nation);
        }
        gameState.setTurnNumber(1);
    }
}
