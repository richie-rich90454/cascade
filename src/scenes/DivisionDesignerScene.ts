import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import type { GameState } from "../core/GameState";
import { SceneKeys } from "../core/SceneKeys";
import type { Nation } from "../domain/Nation";
import { FontFamilies } from "../managers/FontManager";
import type { MilitaryManager } from "../managers/MilitaryManager";
import { DivisionDesignerComponent } from "../ui/DivisionDesignerComponent";
import { TypewriterTextComponent } from "../ui/TypewriterTextComponent";
import { UiPalette } from "../ui/UiPalette";
import { UiPanelFactory } from "../ui/UiPanelFactory";

export class DivisionDesignerScene extends Phaser.Scene {
    private static readonly BACK_BUTTON_WIDTH_PX = 200;
    private static readonly BACK_BUTTON_HEIGHT_PX = 44;
    private static readonly HEADER_FONT_SIZE_PX = 30;
    private static readonly TYPEWRITER_CHARACTERS_PER_SECOND = 45;
    private static readonly MAXIMUM_NATION_CHIP_COUNT = 6;
    private static readonly DEFAULT_DESIGN_PROVINCE_IDENTIFIER = "prov_london";

    private divisionDesignerComponent: DivisionDesignerComponent | null = null;
    private orderOfBattleTextObject: Phaser.GameObjects.Text | null = null;

    constructor() {
        super({ key: SceneKeys.DIVISION_DESIGNER });
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
        this.createHeader("DIVISION DESIGNER");
        const gameState = gameSession.getGameState();
        const militaryManager = gameSession.getMilitaryManager();
        const playerNation = gameState.getNation(gameState.getPlayerNationIdentifier());
        const selectableNations = DivisionDesignerScene.buildSelectableNations(
            playerNation,
            gameState,
            militaryManager,
        );
        if (selectableNations.length === 0) {
            this.createTypewriterMessage("No scenario is active. Start a scenario from the campaign selector.");
            return;
        }
        const defaultSelectedNation = playerNation === null ? selectableNations[0] : playerNation;
        this.createNationChipRow(selectableNations, (selectedNation: Nation) => {
            this.refreshDivisionDesigner(selectedNation);
        });
        this.divisionDesignerComponent = new DivisionDesignerComponent(
            this,
            60,
            150,
            this.scale.width - 120,
            this.scale.height - 280,
        );
        this.orderOfBattleTextObject = UiPanelFactory.createTypewriterText(
            this,
            this.scale.width - 360,
            150,
            300,
            "",
            14,
        );
        this.orderOfBattleTextObject.setDepth(UiPalette.UI_DEPTH_POPUP);
        this.refreshDivisionDesigner(defaultSelectedNation);
    }

    private refreshDivisionDesigner(selectedNation: Nation): void {
        if (this.divisionDesignerComponent === null || this.orderOfBattleTextObject === null) {
            return;
        }
        const militaryManager = GameSession.getInstance().getMilitaryManager();
        this.divisionDesignerComponent.openDesignerForNation(
            selectedNation,
            militaryManager,
            DivisionDesignerScene.getDesignProvinceIdentifier(selectedNation),
        );
        const orderOfBattleNodes = militaryManager.getOrderOfBattleTree(selectedNation.getIdentifier());
        const orderOfBattleLines: string[] = [selectedNation.getDisplayName() + " - Order of Battle"];
        for (const orderOfBattleNode of orderOfBattleNodes) {
            const nodeSummary =
                orderOfBattleNode.levelName +
                ": " +
                orderOfBattleNode.units.length +
                " units, strength " +
                orderOfBattleNode.getTotalStrength();
            orderOfBattleLines.push(nodeSummary);
        }
        if (orderOfBattleNodes.length === 0) {
            orderOfBattleLines.push("No units raised yet.");
        }
        this.orderOfBattleTextObject.setText(orderOfBattleLines.join("\n"));
    }

    private createNationChipRow(selectableNations: Nation[], onNationSelected: (nation: Nation) => void): void {
        const chipRowContainer = this.add.container(60, 64);
        let cursorX = 0;
        for (const selectableNation of selectableNations) {
            const chipWidthPx = Math.max(130, selectableNation.getDisplayName().length * 9 + 30);
            const chipContainer = UiPanelFactory.createBrassButton(
                this,
                cursorX,
                0,
                chipWidthPx,
                40,
                selectableNation.getDisplayName(),
                () => {
                    onNationSelected(selectableNation);
                },
            );
            chipRowContainer.add(chipContainer);
            cursorX += chipWidthPx + 10;
        }
        chipRowContainer.setDepth(UiPalette.UI_DEPTH_POPUP);
    }

    private createBackButton(): void {
        const backButton = UiPanelFactory.createBrassButton(
            this,
            24,
            22,
            DivisionDesignerScene.BACK_BUTTON_WIDTH_PX,
            DivisionDesignerScene.BACK_BUTTON_HEIGHT_PX,
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
            DivisionDesignerScene.HEADER_FONT_SIZE_PX,
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
        typewriterTextComponent.setTextAndReveal(messageText, DivisionDesignerScene.TYPEWRITER_CHARACTERS_PER_SECOND);
        typewriterTextComponent.setDepth(UiPalette.UI_DEPTH_PANEL);
    }

    private static buildSelectableNations(
        playerNation: Nation | null,
        gameState: GameState,
        militaryManager: MilitaryManager,
    ): Nation[] {
        const selectableNations: Nation[] = [];
        if (playerNation !== null) {
            selectableNations.push(playerNation);
        }
        for (const nation of gameState.getAllNations()) {
            if (playerNation !== null && nation.getIdentifier() === playerNation.getIdentifier()) {
                continue;
            }
            if (militaryManager.getUnitsForNation(nation.getIdentifier()).length > 0) {
                selectableNations.push(nation);
            }
        }
        return selectableNations.slice(0, DivisionDesignerScene.MAXIMUM_NATION_CHIP_COUNT);
    }

    private static getDesignProvinceIdentifier(nation: Nation): string {
        if (nation.getCapitalProvinceIdentifier().length > 0) {
            return nation.getCapitalProvinceIdentifier();
        }
        const controlledProvinceIdentifiers = nation.getControlledProvinceIdentifiers();
        if (controlledProvinceIdentifiers.length > 0) {
            return controlledProvinceIdentifiers[0];
        }
        return DivisionDesignerScene.DEFAULT_DESIGN_PROVINCE_IDENTIFIER;
    }
}
