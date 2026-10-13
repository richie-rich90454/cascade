import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { FontFamilies } from "../managers/FontManager";
import { ProductionQueueComponent } from "../ui/ProductionQueueComponent";
import { TypewriterTextComponent } from "../ui/TypewriterTextComponent";
import { UiPalette } from "../ui/UiPalette";
import { UiPanelFactory } from "../ui/UiPanelFactory";

export class ProductionQueueScene extends Phaser.Scene {
    private static readonly BACK_BUTTON_WIDTH_PX = 200;
    private static readonly BACK_BUTTON_HEIGHT_PX = 44;
    private static readonly HEADER_FONT_SIZE_PX = 30;
    private static readonly TYPEWRITER_CHARACTERS_PER_SECOND = 45;

    constructor() {
        super({ key: SceneKeys.PRODUCTION_QUEUE });
    }

    public create(): void {
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        this.createBackButton();
        const gameSession = GameSession.getInstance();
        const currentScenario = gameSession.getCurrentScenario();
        const gameState = gameSession.getGameState();
        const playerNation = gameState.getNation(gameState.getPlayerNationIdentifier());
        if (!gameSession.isScenarioActive() || currentScenario === null || playerNation === null) {
            this.createTypewriterMessage("No scenario is active. Start a scenario from the campaign selector.");
            return;
        }
        this.createHeader("PRODUCTION QUEUE");
        const economyManager = gameSession.getEconomyManager();
        const playerNationIdentifier = playerNation.getIdentifier();
        const productionQueueComponent = new ProductionQueueComponent(
            this,
            60,
            130,
            this.scale.width - 120,
            this.scale.height - 260,
        );
        const refreshProductionQueue = (): void => {
            productionQueueComponent.setProductionQueue(
                economyManager.getProductionQueueForNation(playerNationIdentifier),
                playerNation,
                economyManager,
            );
        };
        refreshProductionQueue();
        productionQueueComponent.setOnQueueItemRequested((unitTemplateIdentifier: string) => {
            economyManager.enqueueProductionItem(playerNationIdentifier, unitTemplateIdentifier, 1);
            refreshProductionQueue();
        });
        const advanceProductionButton = UiPanelFactory.createBrassButton(
            this,
            this.scale.width - 360,
            this.scale.height - 124,
            280,
            44,
            "ADVANCE PRODUCTION",
            () => {
                economyManager.advanceAllProductionQueues();
                refreshProductionQueue();
            },
        );
        advanceProductionButton.setDepth(UiPalette.UI_DEPTH_POPUP);
        UiPanelFactory.createTypewriterText(
            this,
            60,
            this.scale.height - 116,
            this.scale.width - 520,
            "Factories complete queued items each turn. Assign more factories to the items that matter most.",
            15,
        );
    }

    private createBackButton(): void {
        const backButton = UiPanelFactory.createBrassButton(
            this,
            24,
            22,
            ProductionQueueScene.BACK_BUTTON_WIDTH_PX,
            ProductionQueueScene.BACK_BUTTON_HEIGHT_PX,
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
            ProductionQueueScene.HEADER_FONT_SIZE_PX,
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
        typewriterTextComponent.setTextAndReveal(messageText, ProductionQueueScene.TYPEWRITER_CHARACTERS_PER_SECOND);
        typewriterTextComponent.setDepth(UiPalette.UI_DEPTH_PANEL);
    }
}
