import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { AssetManager } from "../managers/AssetManager";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "../ui/UiPalette";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";

export class MainMenuScene extends Phaser.Scene {
    private static readonly BUTTON_WIDTH_PX = 320;
    private static readonly BUTTON_HEIGHT_PX = 48;
    private static readonly BUTTON_VERTICAL_GAP_PX = 8;
    private static readonly BUTTON_STACK_TOP_Y = 416;
    private static readonly CONTENT_HEIGHT_FOR_SCALING_PX = 812;

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

        this.menuContentRoot.add(
            this.add
                .text(screenCenterX, 84, "CASCADE", {
                    fontFamily: FontFamilies.GOTHIC,
                    fontSize: "96px",
                    color: UiPalette.HIGHLIGHT_BRASS_CSS,
                })
                .setOrigin(0.5, 0.5),
        );
        this.menuContentRoot.add(
            this.add
                .text(screenCenterX, 148, "GLOBAL CONFLICT", {
                    fontFamily: FontFamilies.GOTHIC,
                    fontSize: "72px",
                    color: UiPalette.BRASS_TAN_CSS,
                })
                .setOrigin(0.5, 0.5),
        );
        this.menuContentRoot.add(
            this.add
                .text(screenCenterX, 212, "Global Conflict, c. 1900 to the Present", {
                    fontFamily: FontFamilies.BODY_SERIF,
                    fontSize: "26px",
                    fontStyle: "italic",
                    color: UiPalette.PARCHMENT_CSS,
                })
                .setOrigin(0.5, 0.5),
        );
        this.menuContentRoot.add(
            this.add
                .text(screenCenterX, 246, "An AP World History: Modern Unit 7 Review Game", {
                    fontFamily: FontFamilies.BODY_SERIF,
                    fontSize: "18px",
                    color: UiPalette.AGED_PARCHMENT_CSS,
                })
                .setOrigin(0.5, 0.5),
        );

        const unitOverviewPanel = UiPanelFactory.createPanelContainer(
            this,
            screenCenterX - 320,
            272,
            640,
            132,
            PanelVariant.PARCHMENT,
        );
        unitOverviewPanel.add(
            UiPanelFactory.createBodyText(
                this,
                24,
                16,
                592,
                [
                    "Unit 7: Global Conflict, c. 1900 to the present.",
                    "This unit represents 8-10% of your AP Exam score and takes approximately 9-12 class periods.",
                    "The Personal Progress Check 7 includes about 25 multiple-choice questions, 2 short-answer questions, and 1 document-based question.",
                ].join("\n"),
                15,
                UiPalette.NEAR_BLACK_LEATHER_CSS,
            ),
        );
        this.menuContentRoot.add(unitOverviewPanel);

        const buttonLeftX = screenCenterX - MainMenuScene.BUTTON_WIDTH_PX / 2;
        const buttonEntries: Array<{ labelText: string; onActivated: () => void }> = [
            { labelText: "HOW TO PLAY", onActivated: () => this.showHowToPlayOverlay() },
        ];
        const currentScenario = GameSession.getInstance().getCurrentScenario();
        if (currentScenario !== null) {
            buttonEntries.push({
                labelText: "RESUME CAMPAIGN",
                onActivated: () =>
                    this.scene.start(SceneKeys.SCENARIO_PLAY, { scenarioNumber: currentScenario.getScenarioNumber() }),
            });
        }
        buttonEntries.push(
            { labelText: "CAMPAIGN SELECT", onActivated: () => this.scene.start(SceneKeys.CAMPAIGN_SELECTOR) },
            { labelText: "PROGRESS CHECK", onActivated: () => this.scene.start(SceneKeys.PROGRESS_CHECK) },
            { labelText: "TEACHER DASHBOARD", onActivated: () => this.scene.start(SceneKeys.TEACHER_DASHBOARD) },
            { labelText: "SETTINGS", onActivated: () => this.scene.start(SceneKeys.SETTINGS) },
        );
        buttonEntries.forEach((buttonEntry, buttonIndex) => {
            this.menuContentRoot?.add(
                UiPanelFactory.createBrassButton(
                    this,
                    buttonLeftX,
                    this.getButtonTopY(buttonIndex),
                    MainMenuScene.BUTTON_WIDTH_PX,
                    MainMenuScene.BUTTON_HEIGHT_PX,
                    buttonEntry.labelText,
                    buttonEntry.onActivated,
                ),
            );
        });

        const creditText = UiPanelFactory.createTypewriterText(
            this,
            screenCenterX,
            MainMenuScene.CONTENT_HEIGHT_FOR_SCALING_PX - 24,
            this.scale.width,
            "Cascade - an education-centric grand strategy game",
            14,
            UiPalette.FIELD_GRAY_CSS,
        );
        creditText.setOrigin(0.5, 0.5);
        creditText.setStroke(UiPalette.NEAR_BLACK_LEATHER_CSS, 3);
        creditText.setBackgroundColor(UiPalette.NEAR_BLACK_LEATHER_CSS);
        creditText.setPadding(10, 5, 10, 5);
        this.menuContentRoot.add(creditText);

        this.applyContentScaling();
        GameSession.getInstance().getAudioManager().playMusicTrack("menu_main");
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
