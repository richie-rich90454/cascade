import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { FontFamilies } from "../managers/FontManager";
import { UnitCategory } from "../types/UnitCategory";
import { LedgerComponent } from "../ui/LedgerComponent";
import { TypewriterTextComponent } from "../ui/TypewriterTextComponent";
import { UiPalette } from "../ui/UiPalette";
import { UiPanelFactory } from "../ui/UiPanelFactory";

export class LedgerScene extends Phaser.Scene {
    private static readonly BACK_BUTTON_WIDTH_PX = 200;
    private static readonly BACK_BUTTON_HEIGHT_PX = 44;
    private static readonly HEADER_FONT_SIZE_PX = 30;
    private static readonly TYPEWRITER_CHARACTERS_PER_SECOND = 45;
    private static readonly MAXIMUM_DIPLOMATIC_RELATION_ROWS = 30;
    private static readonly MAXIMUM_TERRITORIAL_HOLDING_ROWS = 40;

    constructor() {
        super({ key: SceneKeys.LEDGER });
    }

    public create(): void {
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        this.createBackButton();
        const gameSession = GameSession.getInstance();
        const currentScenario = gameSession.getCurrentScenario();
        if (!gameSession.isScenarioActive() || currentScenario === null) {
            this.createTypewriterMessage("No scenario is active. Start a scenario from the campaign selector.");
            return;
        }
        this.createHeader("LEDGER");
        const gameState = gameSession.getGameState();
        const economyManager = gameSession.getEconomyManager();
        const militaryManager = gameSession.getMilitaryManager();
        const diplomacyManager = gameSession.getDiplomacyManager();
        const domesticManager = gameSession.getDomesticManager();

        UiPanelFactory.createTypewriterText(
            this,
            40,
            78,
            this.scale.width - 80,
            "The ledger records every figure the game tracks. Columns marked with numbers can be compared across nations.",
            14,
        );

        const ledgerComponent = new LedgerComponent(this, 40, 100, this.scale.width - 80, this.scale.height - 180);
        ledgerComponent.setTabs([
            "Production",
            "Manpower",
            "Treasury",
            "Casualties",
            "Diplomatic Relations",
            "Territorial Holdings",
            "Economic Indicators",
            "Interest Groups",
        ]);

        const productionRows: string[][] = [];
        for (const nation of gameState.getAllNations()) {
            const productionQueueItems = economyManager.getProductionQueueForNation(nation.getIdentifier());
            let completedQueueItemCount = 0;
            for (const productionQueueItem of productionQueueItems) {
                if (productionQueueItem.isCompleted) {
                    completedQueueItemCount += 1;
                }
            }
            productionRows.push([
                nation.getDisplayName(),
                String(economyManager.computeProductionPowerPerTurn(nation)),
                String(productionQueueItems.length),
                String(completedQueueItemCount),
            ]);
        }
        ledgerComponent.setRowsForTab(
            "Production",
            ["Nation", "Factories", "Queue Items", "Completed"],
            productionRows,
        );

        const manpowerRows: string[][] = [];
        for (const nation of gameState.getAllNations()) {
            manpowerRows.push([
                nation.getDisplayName(),
                String(nation.getManpower()),
                String(nation.getControlledProvinceCount()),
            ]);
        }
        ledgerComponent.setRowsForTab("Manpower", ["Nation", "Manpower", "Controlled Provinces"], manpowerRows);

        const treasuryRows: string[][] = [];
        for (const nation of gameState.getAllNations()) {
            treasuryRows.push([
                nation.getDisplayName(),
                String(nation.getTreasury()),
                String(economyManager.computeTreasuryIncomePerTurn(nation)),
            ]);
        }
        ledgerComponent.setRowsForTab("Treasury", ["Nation", "Treasury", "Income Per Turn"], treasuryRows);

        const casualtyRows: string[][] = [];
        for (const nation of gameState.getAllNations()) {
            const casualtiesByCategory = militaryManager.getCasualtiesByCategory(nation.getIdentifier());
            for (const [unitCategoryCode, casualtyAmount] of casualtiesByCategory.entries()) {
                const unitCategory = UnitCategory.findByUnitCategoryCode(unitCategoryCode);
                casualtyRows.push([
                    nation.getDisplayName(),
                    unitCategory === null ? unitCategoryCode : unitCategory.getDisplayName(),
                    String(casualtyAmount),
                ]);
            }
        }
        ledgerComponent.setRowsForTab("Casualties", ["Nation", "Category", "Casualties"], casualtyRows);

        const relationRows: string[][] = [];
        const diplomaticRelationsMatrix = diplomacyManager.getDiplomaticRelationsMatrix();
        for (const relationEntry of diplomaticRelationsMatrix.slice(0, LedgerScene.MAXIMUM_DIPLOMATIC_RELATION_ROWS)) {
            relationRows.push([
                relationEntry.firstNationName,
                relationEntry.secondNationName,
                String(relationEntry.relationScore),
            ]);
        }
        ledgerComponent.setRowsForTab(
            "Diplomatic Relations",
            ["First Nation", "Second Nation", "Relation"],
            relationRows,
        );

        const territorialRows: string[][] = [];
        const allProvinces = gameState.getAllProvinces();
        for (const province of allProvinces.slice(0, LedgerScene.MAXIMUM_TERRITORIAL_HOLDING_ROWS)) {
            const ownerNation = gameState.getNation(province.getOwnerNationIdentifier());
            territorialRows.push([
                province.getDisplayName(),
                province.getTerrainTypeCode(),
                ownerNation === null ? province.getOwnerNationIdentifier() : ownerNation.getDisplayName(),
                String(province.getVictoryPointValue()),
            ]);
        }
        ledgerComponent.setRowsForTab(
            "Territorial Holdings",
            ["Province", "Terrain", "Owner", "Victory Points"],
            territorialRows,
        );

        const marketRows: string[][] = [];
        for (const marketRow of economyManager.getMarketRows()) {
            marketRows.push([
                marketRow.resourceDisplayName,
                String(marketRow.supplyQuantity),
                String(marketRow.demandQuantity),
                String(marketRow.pricePerUnit),
            ]);
        }
        ledgerComponent.setRowsForTab("Economic Indicators", ["Resource", "Supply", "Demand", "Price"], marketRows);

        const interestGroupRows: string[][] = [];
        const interestGroups = domesticManager.getInterestGroupsForNation(gameState.getPlayerNationIdentifier());
        for (const interestGroup of interestGroups) {
            interestGroupRows.push([interestGroup.groupDisplayName, String(interestGroup.getPoliticalPower())]);
        }
        ledgerComponent.setRowsForTab("Interest Groups", ["Group", "Political Power"], interestGroupRows);

        ledgerComponent.setActiveTab("Production");
    }

    private createBackButton(): void {
        const backButton = UiPanelFactory.createBrassButton(
            this,
            24,
            22,
            LedgerScene.BACK_BUTTON_WIDTH_PX,
            LedgerScene.BACK_BUTTON_HEIGHT_PX,
            "BACK TO MAP",
            () => {
                const returnSceneKey = GameSession.getInstance().isScenarioActive()
                    ? SceneKeys.SCENARIO_PLAY
                    : SceneKeys.MAIN_MENU;
                this.scene.start(returnSceneKey);
            },
        );
        backButton.setDepth(UiPalette.UI_DEPTH_POPUP);
    }

    private createHeader(headerText: string): void {
        const headerTextObject = UiPanelFactory.createSectionHeader(
            this,
            this.scale.width / 2,
            22,
            headerText,
            LedgerScene.HEADER_FONT_SIZE_PX,
        );
        headerTextObject.setOrigin(0.5, 0);
    }

    private createTypewriterMessage(messageText: string): void {
        const typewriterTextComponent = new TypewriterTextComponent(
            this,
            100,
            this.scale.height / 2 - 60,
            this.scale.width - 200,
            FontFamilies.TYPEWRITER_BODY,
            16,
        );
        typewriterTextComponent.setTextAndReveal(messageText, LedgerScene.TYPEWRITER_CHARACTERS_PER_SECOND);
        typewriterTextComponent.setDepth(UiPalette.UI_DEPTH_PANEL);
    }
}
