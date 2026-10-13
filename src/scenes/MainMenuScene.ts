import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "../ui/UiPalette";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";

export class MainMenuScene extends Phaser.Scene {
    private static readonly BUTTON_WIDTH_PX = 320;
    private static readonly BUTTON_HEIGHT_PX = 56;
    private static readonly BUTTON_VERTICAL_GAP_PX = 10;
    private static readonly BUTTON_STACK_TOP_Y = 424;

    public constructor() {
        super({ key: SceneKeys.MAIN_MENU });
    }

    public create(): void {
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        this.add.rectangle(0, 0, this.scale.width, 210, UiPalette.DARK_OLIVE).setOrigin(0, 0).setAlpha(0.5);
        const screenCenterX = this.scale.width / 2;
        this.add
            .text(screenCenterX, 84, "CASCADE", {
                fontFamily: FontFamilies.GOTHIC,
                fontSize: "96px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
            })
            .setOrigin(0.5, 0.5);
        this.add
            .text(screenCenterX, 148, "GLOBAL CONFLICT", {
                fontFamily: FontFamilies.GOTHIC,
                fontSize: "72px",
                color: UiPalette.BRASS_TAN_CSS,
            })
            .setOrigin(0.5, 0.5);
        this.add
            .text(screenCenterX, 212, "A Century of Global Conflict, 1900-1945", {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "26px",
                fontStyle: "italic",
                color: UiPalette.PARCHMENT_CSS,
            })
            .setOrigin(0.5, 0.5);
        this.add
            .text(screenCenterX, 246, "An AP World History: Modern Unit 7 Review Game", {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "18px",
                color: UiPalette.AGED_PARCHMENT_CSS,
            })
            .setOrigin(0.5, 0.5);
        this.createUnitOverviewPanel(screenCenterX);
        const buttonLeftX = screenCenterX - MainMenuScene.BUTTON_WIDTH_PX / 2;
        UiPanelFactory.createBrassButton(
            this,
            buttonLeftX,
            this.getButtonTopY(0),
            MainMenuScene.BUTTON_WIDTH_PX,
            MainMenuScene.BUTTON_HEIGHT_PX,
            "CAMPAIGN",
            () => {
                this.scene.start(SceneKeys.CAMPAIGN_SELECTOR);
            },
        );
        UiPanelFactory.createBrassButton(
            this,
            buttonLeftX,
            this.getButtonTopY(1),
            MainMenuScene.BUTTON_WIDTH_PX,
            MainMenuScene.BUTTON_HEIGHT_PX,
            "PROGRESS CHECK",
            () => {
                this.scene.start(SceneKeys.PROGRESS_CHECK);
            },
        );
        UiPanelFactory.createBrassButton(
            this,
            buttonLeftX,
            this.getButtonTopY(2),
            MainMenuScene.BUTTON_WIDTH_PX,
            MainMenuScene.BUTTON_HEIGHT_PX,
            "TEACHER DASHBOARD",
            () => {
                this.scene.start(SceneKeys.TEACHER_DASHBOARD);
            },
        );
        UiPanelFactory.createBrassButton(
            this,
            buttonLeftX,
            this.getButtonTopY(3),
            MainMenuScene.BUTTON_WIDTH_PX,
            MainMenuScene.BUTTON_HEIGHT_PX,
            "SETTINGS",
            () => {
                this.scene.start(SceneKeys.SETTINGS);
            },
        );
        const creditText = UiPanelFactory.createTypewriterText(
            this,
            screenCenterX,
            this.scale.height - 26,
            this.scale.width,
            "Cascade - an education-centric grand strategy game",
            14,
            UiPalette.FIELD_GRAY_CSS,
        );
        creditText.setOrigin(0.5, 0.5);
        GameSession.getInstance().getAudioManager().playMusicTrack("menu_main");
    }

    private createUnitOverviewPanel(screenCenterX: number): void {
        const unitOverviewPanel = UiPanelFactory.createPanelContainer(
            this,
            screenCenterX - 320,
            218,
            640,
            180,
            PanelVariant.PARCHMENT,
        );
        const unitOverviewText = UiPanelFactory.createBodyText(
            this,
            24,
            20,
            592,
            [
                "Unit 7: Global Conflict, c. 1900 to the present.",
                "This unit represents 8-10% of your AP Exam score.",
                "The unit takes approximately 9-12 class periods.",
                "The Personal Progress Check 7 includes about 25 multiple-choice questions, 2 short-answer questions, and 1 document-based question.",
            ].join("\n"),
            16,
            UiPalette.NEAR_BLACK_LEATHER_CSS,
        );
        unitOverviewPanel.add(unitOverviewText);
    }

    private getButtonTopY(buttonIndex: number): number {
        return (
            MainMenuScene.BUTTON_STACK_TOP_Y +
            buttonIndex * (MainMenuScene.BUTTON_HEIGHT_PX + MainMenuScene.BUTTON_VERTICAL_GAP_PX)
        );
    }
}
