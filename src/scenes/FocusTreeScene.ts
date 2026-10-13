import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { FontFamilies } from "../managers/FontManager";
import { FocusTreeComponent } from "../ui/FocusTreeComponent";
import { TypewriterTextComponent } from "../ui/TypewriterTextComponent";
import { UiPalette } from "../ui/UiPalette";
import { UiPanelFactory } from "../ui/UiPanelFactory";

export class FocusTreeScene extends Phaser.Scene {
    private static readonly BACK_BUTTON_WIDTH_PX = 200;
    private static readonly BACK_BUTTON_HEIGHT_PX = 44;
    private static readonly HEADER_FONT_SIZE_PX = 30;
    private static readonly TYPEWRITER_CHARACTERS_PER_SECOND = 45;

    constructor() {
        super({ key: SceneKeys.FOCUS_TREE });
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
        this.createHeader("NATIONAL FOCUS");
        const focusTreeDefinition = currentScenario.getFocusTreeDefinition();
        if (focusTreeDefinition === null) {
            this.createTypewriterMessage(
                "This scenario does not use a focus tree. Its decisions live on the map screen.",
            );
            return;
        }
        const focusTreeComponent = new FocusTreeComponent(
            this,
            60,
            120,
            this.scale.width - 120,
            this.scale.height - 220,
        );
        focusTreeComponent.setFocusTreeDefinition(focusTreeDefinition, gameSession.getGameState());
        UiPanelFactory.createTypewriterText(
            this,
            60,
            this.scale.height - 88,
            this.scale.width - 120,
            "Focus nodes unlock through causal understanding. Complete the causal chains to open the path.",
            15,
        );
    }

    private createBackButton(): void {
        const backButton = UiPanelFactory.createBrassButton(
            this,
            24,
            22,
            FocusTreeScene.BACK_BUTTON_WIDTH_PX,
            FocusTreeScene.BACK_BUTTON_HEIGHT_PX,
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
            FocusTreeScene.HEADER_FONT_SIZE_PX,
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
        typewriterTextComponent.setTextAndReveal(messageText, FocusTreeScene.TYPEWRITER_CHARACTERS_PER_SECOND);
        typewriterTextComponent.setDepth(UiPalette.UI_DEPTH_PANEL);
    }
}
