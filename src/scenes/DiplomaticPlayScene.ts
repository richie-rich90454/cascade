import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import type { Nation } from "../domain/Nation";
import { FontFamilies } from "../managers/FontManager";
import { DiplomaticPlayComponent } from "../ui/DiplomaticPlayComponent";
import { TypewriterTextComponent } from "../ui/TypewriterTextComponent";
import { UiPalette } from "../ui/UiPalette";
import { UiPanelFactory } from "../ui/UiPanelFactory";

export class DiplomaticPlayScene extends Phaser.Scene {
    private static readonly BACK_BUTTON_WIDTH_PX = 200;
    private static readonly BACK_BUTTON_HEIGHT_PX = 44;
    private static readonly HEADER_FONT_SIZE_PX = 30;
    private static readonly TYPEWRITER_CHARACTERS_PER_SECOND = 45;
    private static readonly MAXIMUM_NATION_CHIP_COUNT = 6;

    private diplomaticPlayComponent: DiplomaticPlayComponent | null = null;

    constructor() {
        super({ key: SceneKeys.DIPLOMATIC_PLAY });
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
        this.createHeader("DIPLOMATIC PLAY");
        if (!currentScenario.supportsDiplomaticPlay()) {
            this.createTypewriterMessage("This scenario does not use diplomatic plays.");
            return;
        }
        const gameState = gameSession.getGameState();
        const playerNation = gameState.getNation(gameState.getPlayerNationIdentifier());
        if (playerNation === null) {
            this.createTypewriterMessage("No scenario is active. Start a scenario from the campaign selector.");
            return;
        }
        const targetNations: Nation[] = [];
        for (const nation of gameState.getAllNations()) {
            if (nation.getIdentifier() !== playerNation.getIdentifier()) {
                targetNations.push(nation);
            }
        }
        const visibleTargetNations = targetNations.slice(0, DiplomaticPlayScene.MAXIMUM_NATION_CHIP_COUNT);
        if (visibleTargetNations.length === 0) {
            this.createTypewriterMessage("This scenario does not use diplomatic plays.");
            return;
        }
        this.createNationChipRow(visibleTargetNations, (selectedNation: Nation) => {
            this.refreshDiplomaticPlay(selectedNation);
        });
        this.diplomaticPlayComponent = new DiplomaticPlayComponent(
            this,
            60,
            140,
            this.scale.width - 120,
            this.scale.height - 240,
        );
        this.refreshDiplomaticPlay(visibleTargetNations[0]);
        UiPanelFactory.createTypewriterText(
            this,
            60,
            this.scale.height - 84,
            this.scale.width - 120,
            "Sway the uncommitted, weigh escalation, and remember that every move teaches the alliance system of 1914.",
            15,
        );
    }

    private refreshDiplomaticPlay(targetNation: Nation): void {
        if (this.diplomaticPlayComponent === null) {
            return;
        }
        const gameSession = GameSession.getInstance();
        const gameState = gameSession.getGameState();
        const playerNation = gameState.getNation(gameState.getPlayerNationIdentifier());
        if (playerNation === null) {
            return;
        }
        this.diplomaticPlayComponent.setDiplomaticPlay(
            playerNation,
            targetNation,
            gameState.getAllNations(),
            gameSession.getDiplomacyManager(),
            gameState,
        );
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
            DiplomaticPlayScene.BACK_BUTTON_WIDTH_PX,
            DiplomaticPlayScene.BACK_BUTTON_HEIGHT_PX,
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
            DiplomaticPlayScene.HEADER_FONT_SIZE_PX,
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
        typewriterTextComponent.setTextAndReveal(messageText, DiplomaticPlayScene.TYPEWRITER_CHARACTERS_PER_SECOND);
        typewriterTextComponent.setDepth(UiPalette.UI_DEPTH_PANEL);
    }
}
