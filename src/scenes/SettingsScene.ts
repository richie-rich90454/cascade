import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { TeacherSettings } from "../core/TeacherSettings";
import { getTextScale, setTextScale } from "../core/AccessibilityPreferences";
import { FontFamilies } from "../managers/FontManager";
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
        const textScaleDisplay = this.add.text(320, 407, `TEXT SIZE · ${Math.round(getTextScale() * 100)}%`, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "16px",
            color: UiPalette.PARCHMENT_CSS,
        });
        textScaleDisplay.setOrigin(0, 0.5);
        UiPanelFactory.createBrassButton(this, 490, 385, 72, 44, "A−", () => {
            setTextScale(getTextScale() - 0.1);
            this.scene.restart();
        });
        UiPanelFactory.createBrassButton(this, 570, 385, 72, 44, "A+", () => {
            setTextScale(getTextScale() + 0.1);
            this.scene.restart();
        });
        UiPanelFactory.createTypewriterText(
            this,
            40,
            445,
            720,
            "Adjust all game text with A− and A+. Browser zoom also works for the whole interface.",
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
                "Global Conflict, c. 1900 to the Present\n" +
                "Version 4.0\n" +
                "Built with Phaser 4 and TypeScript.\n" +
                "Original atlas artwork with source-attributed historical map data.",
        );
        UiPanelFactory.createBrassButton(this, 40, 625, 300, 44, "CREDITS & LICENSES", () => {
            this.showCreditsOverlay();
        });
    }

    private showCreditsOverlay(): void {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        const overlayContainer = this.add.container(0, 0).setDepth(UiPalette.UI_DEPTH_POPUP);
        const overlayRectangle = this.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.8).setOrigin(0, 0);
        overlayRectangle.setInteractive();
        overlayContainer.add(overlayRectangle);

        const panelWidth = Math.min(1040, screenWidth - 48);
        const panelHeight = Math.min(700, screenHeight - 48);
        const overlayPanel = UiPanelFactory.createPanelContainer(
            this,
            (screenWidth - panelWidth) / 2,
            (screenHeight - panelHeight) / 2,
            panelWidth,
            panelHeight,
            PanelVariant.LEATHER,
        );
        overlayPanel.add(UiPanelFactory.createSectionHeader(this, 28, 20, "CREDITS & LICENSES", 26));
        overlayPanel.add(
            UiPanelFactory.createBodyText(
                this,
                28,
                68,
                panelWidth - 56,
                [
                    "HISTORICAL MAPS  Historical Basemaps by Alexander Ourednik and contributors. Adapted country-boundary data and the generated SVG maps are licensed under GNU GPL v3.0; the full license is included with the map data.",
                    "ATLAS ART  Original title-screen illustration generated for Cascade with OpenAI image generation. It is not a sourced historical map or photograph.",
                    "CURRICULUM  Unit alignment references the College Board AP World History: Modern Course and Exam Description (effective Fall 2026). Cascade is independent and is not endorsed by College Board.",
                    "SOFTWARE  Phaser 4.2.1 (MIT License); TypeScript 5.9.3 (Apache License 2.0); Vite 8.3.4 (MIT License).",
                    "HISTORICAL TEXTS  Source cards identify the named author, work, and date. Short edited extracts and contextual summaries may have translation or edition rights held by their respective publishers; Cascade does not claim a blanket license for those works.",
                    "TYPE  Noto Sans and EB Garamond are provided by Google Fonts under the SIL Open Font License 1.1. Font source and license links are listed in the project credits document.",
                    "Open the project credits document for source links, license references, and the local GPL text.",
                    "AP® is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this website.",
                ].join("\n\n"),
                15,
                UiPalette.PARCHMENT_CSS,
            ),
        );
        overlayPanel.add(
            UiPanelFactory.createBrassButton(this, panelWidth - 150, 18, 120, 40, "CLOSE", () => {
                overlayContainer.destroy(true);
            }),
        );
        overlayContainer.add(overlayPanel);
    }
}
