import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { HighDpiConfigurator } from "../core/HighDpiConfigurator";
import { SceneKeys } from "../core/SceneKeys";
import { AssetManager } from "../managers/AssetManager";
import { FontFamilies } from "../managers/FontManager";
import { LocalProfileManager } from "../managers/LocalProfileManager";
import { UiPalette } from "../ui/UiPalette";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";
import { formatUiDisplayCase } from "../ui/UiTextCase";

export class MainMenuScene extends Phaser.Scene {
    private static readonly BUTTON_WIDTH_PX = 320;
    private static readonly BUTTON_HEIGHT_PX = 44;
    private static readonly BUTTON_VERTICAL_GAP_PX = 6;
    private static readonly BUTTON_STACK_TOP_Y = 450;
    private static readonly CONTENT_HEIGHT_FOR_SCALING_PX = 866;

    private menuContentRoot: Phaser.GameObjects.Container | null;

    public constructor() {
        super({ key: SceneKeys.MAIN_MENU });
        this.menuContentRoot = null;
    }

    public create(): void {
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        const heroTextureKey = AssetManager.getInstance().getTextureKey("cascade_world_atlas_hero");
        if (this.textures.exists(heroTextureKey)) {
            this.add
                .image(0, 0, heroTextureKey)
                .setOrigin(0, 0)
                .setDisplaySize(this.scale.width, this.scale.height)
                .setAlpha(0.64);
        }
        this.add.rectangle(0, 0, this.scale.width, 240, UiPalette.DARK_OLIVE).setOrigin(0, 0).setAlpha(0.5);
        this.menuContentRoot = this.add.container(0, 0);
        const screenCenterX = this.scale.width / 2;

        const cascadeTitle = this.add
            .text(screenCenterX, 84, "Cascade", {
                fontFamily: FontFamilies.GOTHIC,
                fontSize: "96px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
            })
            .setOrigin(0.5, 0.5);
        this.fitTextToWidth(cascadeTitle, this.scale.width - 40, 34);
        this.menuContentRoot.add(cascadeTitle);
        const globalConflictTitle = this.add
            .text(screenCenterX, 148, "Global Conflict", {
                fontFamily: FontFamilies.GOTHIC,
                fontSize: "72px",
                color: UiPalette.BRASS_TAN_CSS,
            })
            .setOrigin(0.5, 0.5);
        this.fitTextToWidth(globalConflictTitle, this.scale.width - 40, 24);
        this.menuContentRoot.add(globalConflictTitle);
        const menuSubtitle = this.add
            .text(screenCenterX, 212, "Unit 7 · c. 1900 to the Present", {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "26px",
                fontStyle: "italic",
                color: UiPalette.PARCHMENT_CSS,
            })
            .setOrigin(0.5, 0.5);
        this.fitTextToWidth(menuSubtitle, this.scale.width - 40, 16);
        this.menuContentRoot.add(menuSubtitle);
        const menuCourseLabel = this.add
            .text(
                screenCenterX,
                246,
                this.scale.width < 540
                    ? "Advanced Placement World History · Unit 7"
                    : "Advanced Placement World History: Modern · Unit 7 review game",
                {
                    fontFamily: FontFamilies.BODY_SERIF,
                    fontSize: "18px",
                    color: UiPalette.AGED_PARCHMENT_CSS,
                },
            )
            .setOrigin(0.5, 0.5);
        this.fitTextToWidth(menuCourseLabel, this.scale.width - 40, 12);
        this.menuContentRoot.add(menuCourseLabel);

        const unitOverviewWidth = Math.max(160, Math.min(640, this.scale.width - 40));
        const unitOverviewPanel = UiPanelFactory.createPanelContainer(
            this,
            screenCenterX - unitOverviewWidth / 2,
            270,
            unitOverviewWidth,
            132,
            PanelVariant.LEATHER,
        );
        unitOverviewPanel.add(
            UiPanelFactory.createSectionHeader(this, 20, 12, "Your first round", 18, UiPalette.HIGHLIGHT_BRASS_CSS),
        );
        unitOverviewPanel.add(
            UiPanelFactory.createBodyText(
                this,
                20,
                42,
                unitOverviewWidth - 40,
                this.scale.width < 540
                    ? "Read a source, make a policy choice, and explain its effects. The Powder Keg guides your first round."
                    : [
                          "Read a historical source, make a policy choice, and explain its effects.",
                          "The Powder Keg includes a step-by-step guide for your first round.",
                      ].join("\n"),
                this.scale.width < 540 ? 14 : 16,
                UiPalette.PARCHMENT_CSS,
            ),
        );
        this.menuContentRoot.add(unitOverviewPanel);

        const buttonWidth = Math.min(MainMenuScene.BUTTON_WIDTH_PX, this.scale.width - 48);
        const buttonLeftX = screenCenterX - buttonWidth / 2;
        const buttonEntries: Array<{ labelText: string; onActivated: () => void }> = [];
        const savedCampaign = LocalProfileManager.getInstance().getActiveCampaign();
        const currentScenario = GameSession.getInstance().getCurrentScenario();
        if (savedCampaign !== null || currentScenario !== null) {
            buttonEntries.push({
                labelText: "Resume campaign",
                onActivated: () => this.resumeSavedCampaign(),
            });
        }
        buttonEntries.push(
            { labelText: "Choose a campaign", onActivated: () => this.scene.start(SceneKeys.CAMPAIGN_SELECTOR) },
            { labelText: "How to play", onActivated: () => this.showHowToPlayOverlay() },
            { labelText: "Progress check", onActivated: () => this.scene.start(SceneKeys.PROGRESS_CHECK) },
            { labelText: "Teacher dashboard", onActivated: () => this.scene.start(SceneKeys.TEACHER_DASHBOARD) },
            { labelText: "Settings", onActivated: () => this.scene.start(SceneKeys.SETTINGS) },
            { labelText: "Student profiles", onActivated: () => this.scene.start(SceneKeys.STUDENT_PROFILES) },
        );
        buttonEntries.forEach((buttonEntry, buttonIndex) => {
            this.menuContentRoot?.add(
                UiPanelFactory.createBrassButton(
                    this,
                    buttonLeftX,
                    this.getButtonTopY(buttonIndex),
                    buttonWidth,
                    MainMenuScene.BUTTON_HEIGHT_PX,
                    buttonEntry.labelText,
                    buttonEntry.onActivated,
                ),
            );
        });

        const footerWidth = Math.min(560, this.scale.width - 40);
        const footerTag = this.add.container(screenCenterX, MainMenuScene.CONTENT_HEIGHT_FOR_SCALING_PX - 24);
        footerTag.add(
            this.add
                .rectangle(0, 0, footerWidth, 34, UiPalette.NEAR_BLACK_LEATHER, 0.82)
                .setStrokeStyle(1, UiPalette.DEEP_BRASS, 0.8),
        );
        footerTag.add(
            this.add
                .text(0, 0, "Read the sources · weigh choices · explain consequences", {
                    fontFamily: FontFamilies.TYPEWRITER_BODY,
                    fontSize: this.scale.width < 540 ? "12px" : "13px",
                    color: UiPalette.PARCHMENT_CSS,
                    align: "center",
                    wordWrap: { width: footerWidth - 20, useAdvancedWrap: true },
                })
                .setOrigin(0.5),
        );
        this.menuContentRoot.add(footerTag);

        const profileManager = LocalProfileManager.getInstance();
        const profileStatus = profileManager.getRecoveryMessage();
        const activeProfile = profileManager.getActiveProfile();
        const statusText = formatUiDisplayCase(
            profileStatus.length > 0
                ? profileStatus
                : `Local profile · ${activeProfile.displayName}${profileManager.getActiveCampaign() === null ? "" : " · campaign saved"}`,
        );
        const saveStatus = this.add.text(screenCenterX, 420, statusText, {
            fontFamily: FontFamilies.TYPEWRITER_BODY,
            fontSize: "14px",
            color: profileManager.canSaveLocally() ? UiPalette.PARCHMENT_CSS : UiPalette.ALERT_TEXT_ON_DARK_CSS,
            align: "center",
            wordWrap: { width: Math.min(800, this.scale.width - 48) },
            backgroundColor: UiPalette.NEAR_BLACK_LEATHER_CSS,
            padding: { x: 8, y: 5 },
        });
        saveStatus.setOrigin(0.5, 0.5);
        this.menuContentRoot.add(saveStatus);

        this.applyContentScaling();
        GameSession.getInstance().getAudioManager().playMusicTrack("menu_main");
    }

    private resumeSavedCampaign(): void {
        const save = LocalProfileManager.getInstance().getActiveCampaign();
        if (save === null) {
            const currentScenario = GameSession.getInstance().getCurrentScenario();
            if (currentScenario !== null) {
                this.scene.start(SceneKeys.SCENARIO_PLAY, { scenarioNumber: currentScenario.getScenarioNumber() });
                return;
            }
            this.scene.restart();
            return;
        }
        if (!GameSession.getInstance().restoreCampaign(save)) {
            LocalProfileManager.getInstance().reportRecoveryIssue(
                "The saved campaign did not match the current game data. Your profile and last valid save were kept; start a new campaign or restore another profile.",
            );
            this.scene.restart();
            return;
        }
        this.scene.start(SceneKeys.SCENARIO_PLAY, {
            scenarioNumber: save.scenarioNumber,
            phaseIndex: save.playProgress.phaseIndex,
            walkthroughEnabled: save.playProgress.walkthroughEnabled,
            walkthroughPaused: save.playProgress.walkthroughPaused,
            walkthroughStep: save.playProgress.walkthroughStep,
        });
    }

    private applyContentScaling(): void {
        if (this.menuContentRoot === null) {
            return;
        }
        const contentScale = Math.min(1, (this.scale.height - 16) / MainMenuScene.CONTENT_HEIGHT_FOR_SCALING_PX);
        this.menuContentRoot.setScale(contentScale);
        this.menuContentRoot.setPosition(
            (this.scale.width - this.scale.width * contentScale) / 2,
            (this.scale.height - MainMenuScene.CONTENT_HEIGHT_FOR_SCALING_PX * contentScale) / 2,
        );
    }

    private getButtonTopY(buttonIndex: number): number {
        return (
            MainMenuScene.BUTTON_STACK_TOP_Y +
            buttonIndex * (MainMenuScene.BUTTON_HEIGHT_PX + MainMenuScene.BUTTON_VERTICAL_GAP_PX)
        );
    }

    private fitTextToWidth(textObject: Phaser.GameObjects.Text, availableWidth: number, minimumFontSize: number): void {
        const dpiConfigurator = HighDpiConfigurator.getInstance();
        let currentFontSize = dpiConfigurator.getCssFontSize(textObject);
        while (textObject.displayWidth > availableWidth && currentFontSize > minimumFontSize) {
            currentFontSize = Math.max(minimumFontSize, currentFontSize - 1);
            dpiConfigurator.setCssFontSize(textObject, currentFontSize);
        }
    }

    private showHowToPlayOverlay(): void {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        const overlayContainer = this.add.container(0, 0);
        overlayContainer.setDepth(UiPalette.UI_DEPTH_POPUP);
        const overlayRectangle = this.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.78).setOrigin(0, 0);
        overlayRectangle.setInteractive();
        overlayContainer.add(overlayRectangle);
        const panelWidth = Math.min(920, screenWidth - 80);
        const panelHeight = Math.min(640, screenHeight - 60);
        const overlayPanel = UiPanelFactory.createPanelContainer(
            this,
            (screenWidth - panelWidth) / 2,
            (screenHeight - panelHeight) / 2,
            panelWidth,
            panelHeight,
            PanelVariant.LEATHER,
        );
        overlayPanel.add(UiPanelFactory.createSectionHeader(this, 30, 22, "HOW TO PLAY", 28));
        overlayPanel.add(
            UiPanelFactory.createBodyText(
                this,
                30,
                62,
                panelWidth - 60,
                "Cascade is a guided, turn-based history strategy game. Each screen gives you one clear next action; time advances only when you choose to continue.",
                16,
                UiPalette.PARCHMENT_CSS,
            ),
        );
        const tutorialSteps: Array<{ stepTitle: string; stepBody: string }> = [
            {
                stepTitle: "1. PICK A SCENARIO",
                stepBody:
                    "Each scenario is one topic of Unit 7. Scenario 1 is the place to start. Complete it to unlock the next.",
            },
            {
                stepTitle: "2. FOLLOW THE GUIDED TURN",
                stepBody:
                    "The turn card tells you what to do now. Open its activity, follow the prompt, then use the named next-step button when you are ready.",
            },
            {
                stepTitle: "3. READ, THEN DECIDE",
                stepBody:
                    "The objective checklist shows the goals. Select a row or START NEXT OBJECTIVE to open its activity. Read evidence before making a choice.",
            },
            {
                stepTitle: "4. WRITE TO WIN",
                stepBody:
                    "Finish with the debrief and a short journal reflection. Writing feedback is practice guidance; saved journal entries can be exported for review.",
            },
        ];
        const stepCardWidth = (panelWidth - 100) / 2;
        tutorialSteps.forEach((tutorialStep, stepIndex) => {
            const rowIndex = Math.floor(stepIndex / 2);
            const columnIndex = stepIndex % 2;
            const stepCardLeftX = 30 + columnIndex * (stepCardWidth + 40);
            const stepCardTopY = 132 + rowIndex * 164;
            const stepCard = UiPanelFactory.createPanelContainer(
                this,
                stepCardLeftX,
                stepCardTopY,
                stepCardWidth,
                144,
                PanelVariant.PARCHMENT,
            );
            stepCard.add(
                UiPanelFactory.createSectionHeader(
                    this,
                    16,
                    14,
                    tutorialStep.stepTitle,
                    16,
                    UiPalette.NEAR_BLACK_LEATHER_CSS,
                ),
            );
            stepCard.add(
                UiPanelFactory.createBodyText(
                    this,
                    16,
                    44,
                    stepCardWidth - 32,
                    tutorialStep.stepBody,
                    14,
                    UiPalette.NEAR_BLACK_LEATHER_CSS,
                ),
            );
            overlayPanel.add(stepCard);
        });
        overlayPanel.add(
            UiPanelFactory.createBrassButton(
                this,
                panelWidth / 2 - 150,
                panelHeight - 72,
                300,
                52,
                "OPEN CAMPAIGNS",
                () => {
                    overlayContainer.destroy(true);
                    this.scene.start(SceneKeys.CAMPAIGN_SELECTOR);
                },
            ),
        );
        overlayPanel.add(
            UiPanelFactory.createBrassButton(this, panelWidth - 150, 20, 120, 40, "CLOSE", () => {
                overlayContainer.destroy(true);
            }),
        );
        overlayContainer.add(overlayPanel);
    }
}
