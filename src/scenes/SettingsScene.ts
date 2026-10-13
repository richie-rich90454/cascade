import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { TeacherSettings } from "../core/TeacherSettings";
import { UiPalette } from "../ui/UiPalette";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";

export class SettingsScene extends Phaser.Scene {
    private audioButtonsContainer: Phaser.GameObjects.Container | null;

    constructor() {
        super({ key: SceneKeys.SETTINGS });
        this.audioButtonsContainer = null;
    }

    public create(): void {
        this.audioButtonsContainer = null;

        this.add.rectangle(0, 0, this.scale.width, this.scale.height, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        const headerTextObject = UiPanelFactory.createSectionHeader(this, this.scale.width / 2, 20, "SETTINGS", 28);
        headerTextObject.setOrigin(0.5, 0);
        UiPanelFactory.createBrassButton(this, 24, 24, 200, 40, "BACK TO MENU", () => {
            this.scene.start(SceneKeys.MAIN_MENU);
        });
        GameSession.getInstance().getAudioManager().playMusicTrack("menu_main");

        this.buildContentAdvisoryPanel();
        this.buildAudioSection();
        this.buildDisplaySection();
        this.buildAboutSection();
    }

    private buildContentAdvisoryPanel(): void {
        UiPanelFactory.createSectionHeader(this, 40, 84, "CONTENT ADVISORY", 20);
        const advisoryTextObject = UiPanelFactory.createBodyText(
            this,
            20,
            20,
            1160,
            "Cascade presents the history of global conflict, including mass atrocities, through " +
                "documentation and testimony. Scenario 9 handles these subjects with particular gravity. " +
                "Teachers may disable scenarios or reduce detail levels in the Teacher Dashboard.",
            16,
            UiPalette.NEAR_BLACK_LEATHER_CSS,
        );
        const advisoryPanel = UiPanelFactory.createPanelContainer(
            this,
            40,
            118,
            1200,
            advisoryTextObject.displayHeight + 40,
            PanelVariant.PARCHMENT,
        );
        advisoryPanel.add(advisoryTextObject);
    }

    private buildAudioSection(): void {
        UiPanelFactory.createSectionHeader(this, 40, 250, "AUDIO", 20);
        this.buildAudioButtons();
    }

    private buildAudioButtons(): void {
        if (this.audioButtonsContainer !== null) {
            this.audioButtonsContainer.destroy(true);
            this.audioButtonsContainer = null;
        }
        const audioButtonsContainer = this.add.container(0, 0);
        this.audioButtonsContainer = audioButtonsContainer;
        const audioManager = GameSession.getInstance().getAudioManager();
        const teacherSettings = TeacherSettings.getInstance();
        audioButtonsContainer.add(
            UiPanelFactory.createBrassButton(
                this,
                40,
                285,
                240,
                44,
                `MUSIC: ${audioManager.isMusicEnabled() ? "ON" : "OFF"}`,
                () => {
                    audioManager.setMusicPlaybackEnabled(!audioManager.isMusicEnabled());
                    if (audioManager.isMusicEnabled()) {
                        audioManager.playMusicTrack("menu_main");
                    }
                    this.buildAudioButtons();
                },
            ),
        );
        audioButtonsContainer.add(
            UiPanelFactory.createBrassButton(
                this,
                300,
                285,
                300,
                44,
                `SOUND EFFECTS: ${audioManager.areSoundEffectsEnabled() ? "ON" : "OFF"}`,
                () => {
                    audioManager.setSoundEffectsEnabled(!audioManager.areSoundEffectsEnabled());
                    this.buildAudioButtons();
                },
            ),
        );
        audioButtonsContainer.add(
            UiPanelFactory.createBrassButton(
                this,
                620,
                285,
                280,
                44,
                `MASTER AUDIO: ${teacherSettings.isMasterAudioEnabled() ? "ON" : "OFF"}`,
                () => {
                    teacherSettings.setMasterAudioEnabled(!teacherSettings.isMasterAudioEnabled());
                    if (!teacherSettings.isMasterAudioEnabled()) {
                        audioManager.setMusicPlaybackEnabled(false);
                    }
                    this.buildAudioButtons();
                },
            ),
        );
    }

    private buildDisplaySection(): void {
        UiPanelFactory.createSectionHeader(this, 40, 350, "DISPLAY", 20);
        UiPanelFactory.createBrassButton(this, 40, 385, 240, 44, "FULLSCREEN", () => {
            this.toggleFullscreen();
        });
        UiPanelFactory.createTypewriterText(
            this,
            40,
            445,
            720,
            "For larger text, use your browser's zoom controls: Ctrl and plus, or Command and plus on Mac.",
        );
    }

    private toggleFullscreen(): void {
        if (typeof this.scale.toggleFullscreen === "function") {
            this.scale.toggleFullscreen();
        }
    }

    private buildAboutSection(): void {
        UiPanelFactory.createSectionHeader(this, 40, 510, "ABOUT", 20);
        UiPanelFactory.createTypewriterText(
            this,
            40,
            550,
            800,
            "Cascade\n" +
                "A Century of Global Conflict, 1900-1945\n" +
                "Version 4.0\n" +
                "Built with Phaser 4 and TypeScript.\n" +
                "All assets are generated procedurally from the game's own palette.",
        );
    }
}
