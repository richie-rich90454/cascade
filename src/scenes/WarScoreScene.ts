import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import type { Nation } from "../domain/Nation";
import { FontFamilies } from "../managers/FontManager";
import { TypewriterTextComponent } from "../ui/TypewriterTextComponent";
import { UiPalette } from "../ui/UiPalette";
import { UiPanelFactory } from "../ui/UiPanelFactory";
import { WarScoreComponent } from "../ui/WarScoreComponent";

export class WarScoreScene extends Phaser.Scene {
    private static readonly BACK_BUTTON_WIDTH_PX = 200;
    private static readonly BACK_BUTTON_HEIGHT_PX = 44;
    private static readonly HEADER_FONT_SIZE_PX = 30;
    private static readonly TYPEWRITER_CHARACTERS_PER_SECOND = 45;
    private static readonly MAXIMUM_NATION_CHIP_COUNT = 6;
    private static readonly WAR_SCORE_COMPONENT_TOP_Y_PX = 150;
    private static readonly WAR_SCORE_COMPONENT_HEIGHT_PX = 420;

    private warScoreComponent: WarScoreComponent | null = null;

    constructor() {
        super({ key: SceneKeys.WAR_SCORE });
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
        this.createHeader("WAR SCORE");
        const gameState = gameSession.getGameState();
        const playerNation = gameState.getNation(gameState.getPlayerNationIdentifier());
        const selectableNations = WarScoreScene.buildNationChipOrder(playerNation, gameState.getAllNations());
        if (selectableNations.length === 0) {
            this.createTypewriterMessage("No scenario is active. Start a scenario from the campaign selector.");
            return;
        }
        this.createNationChipRow(selectableNations, (selectedNation: Nation) => {
            this.refreshWarScore(selectedNation);
        });
        this.warScoreComponent = new WarScoreComponent(
            this,
            60,
            WarScoreScene.WAR_SCORE_COMPONENT_TOP_Y_PX,
            this.scale.width - 120,
            WarScoreScene.WAR_SCORE_COMPONENT_HEIGHT_PX,
        );
        this.refreshWarScore(selectableNations[0]);
        UiPanelFactory.createTypewriterText(
            this,
            60,
            WarScoreScene.WAR_SCORE_COMPONENT_TOP_Y_PX + WarScoreScene.WAR_SCORE_COMPONENT_HEIGHT_PX + 16,
            this.scale.width - 120,
            "War score weighs military strength, economic output, diplomacy, and the will of the people. Wars are won by more than battles.",
            15,
        );
    }

    private refreshWarScore(selectedNation: Nation): void {
        if (this.warScoreComponent === null) {
            return;
        }
        const diplomacyManager = GameSession.getInstance().getDiplomacyManager();
        this.warScoreComponent.setWarScoreBreakdown(
            selectedNation,
            diplomacyManager.computeWarScoreForNation(selectedNation.getIdentifier()),
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
            WarScoreScene.BACK_BUTTON_WIDTH_PX,
            WarScoreScene.BACK_BUTTON_HEIGHT_PX,
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
            WarScoreScene.HEADER_FONT_SIZE_PX,
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
        typewriterTextComponent.setTextAndReveal(messageText, WarScoreScene.TYPEWRITER_CHARACTERS_PER_SECOND);
        typewriterTextComponent.setDepth(UiPalette.UI_DEPTH_PANEL);
    }

    private static buildNationChipOrder(playerNation: Nation | null, allNations: Nation[]): Nation[] {
        const orderedNations: Nation[] = [];
        const includedNationIdentifiers = new Set<string>();
        if (playerNation !== null) {
            orderedNations.push(playerNation);
            includedNationIdentifiers.add(playerNation.getIdentifier());
        }
        for (const nation of allNations) {
            if (playerNation === null || !playerNation.isAtWarWith(nation)) {
                continue;
            }
            if (!includedNationIdentifiers.has(nation.getIdentifier())) {
                orderedNations.push(nation);
                includedNationIdentifiers.add(nation.getIdentifier());
            }
        }
        for (const nation of allNations) {
            if (!includedNationIdentifiers.has(nation.getIdentifier())) {
                orderedNations.push(nation);
                includedNationIdentifiers.add(nation.getIdentifier());
            }
        }
        return orderedNations.slice(0, WarScoreScene.MAXIMUM_NATION_CHIP_COUNT);
    }
}
