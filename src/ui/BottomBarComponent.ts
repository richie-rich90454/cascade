import Phaser from "phaser";

import { EventBus, GameEventTypes, NavigationRequestedPayload } from "../core/EventBus";
import { HighDpiConfigurator } from "../core/HighDpiConfigurator";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class BottomBarComponent extends Phaser.GameObjects.Container {
    private readonly turnTextObject: Phaser.GameObjects.Text;
    private readonly phaseTextObject: Phaser.GameObjects.Text;
    private readonly usesChapterProgress: boolean;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        showOptionalStrategyTools: boolean = true,
        usesChapterProgress: boolean = false,
    ) {
        super(scene, x, y);
        this.usesChapterProgress = usesChapterProgress;
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_PANEL);

        const bottomBarPanelContainer = UiPanelFactory.createPanelContainer(
            scene,
            0,
            0,
            width,
            height,
            PanelVariant.LEATHER,
        );
        this.add(bottomBarPanelContainer);

        this.turnTextObject = scene.add.text(16, 6, "Turn 1 of 1", {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "18px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        this.phaseTextObject = scene.add.text(16, 31, "Current step: Briefing", {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "14px",
            color: UiPalette.AGED_PARCHMENT_CSS,
        });
        this.add(this.turnTextObject);
        this.add(this.phaseTextObject);

        const playLoopText = scene.add.text(width / 2 - 196, height / 2, "READ  →  ANALYZE  →  CHOOSE  →  EXPLAIN", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "13px",
            color: UiPalette.AGED_PARCHMENT_CSS,
        });
        playLoopText.setOrigin(0, 0.5);
        playLoopText.setVisible(width >= 1100);
        this.add(playLoopText);

        const buttonHeightPx = 32;
        const buttonTopY = (height - buttonHeightPx) / 2;
        const showWideStrategyTools = showOptionalStrategyTools && width >= 760;
        const menuButtonWidth = Math.min(90, Math.max(72, width * 0.22));
        const journalButtonWidth = width < 420 ? Math.min(104, Math.max(84, width * 0.28)) : 110;
        const menuButtonLeftX = width - 12 - menuButtonWidth;
        const focusTreeButtonLeftX = menuButtonLeftX - 8 - 130;
        const ledgerButtonLeftX = focusTreeButtonLeftX - 8 - 110;
        const journalButtonLeftX = showWideStrategyTools
            ? ledgerButtonLeftX - 8 - 110
            : menuButtonLeftX - 8 - journalButtonWidth;
        const leftTextWidth = Math.max(70, journalButtonLeftX - 24);
        this.turnTextObject.setWordWrapWidth(leftTextWidth, true);
        this.phaseTextObject.setWordWrapWidth(leftTextWidth, true);
        if (width < 760) {
            const dpiConfigurator = HighDpiConfigurator.getInstance();
            dpiConfigurator.setCssFontSize(this.turnTextObject, width < 420 ? 13 : 15);
            dpiConfigurator.setCssFontSize(this.phaseTextObject, width < 420 ? 12 : 13);
        }
        const journalButton = UiPanelFactory.createBrassButton(
            scene,
            journalButtonLeftX,
            buttonTopY,
            journalButtonWidth,
            buttonHeightPx,
            "JOURNAL",
            () => this.publishNavigationRequest("journal"),
        );
        const menuButton = UiPanelFactory.createBrassButton(
            scene,
            menuButtonLeftX,
            buttonTopY,
            menuButtonWidth,
            buttonHeightPx,
            "MENU",
            () => this.publishNavigationRequest("menu"),
        );
        this.add(journalButton);
        if (showWideStrategyTools) {
            const ledgerButton = UiPanelFactory.createBrassButton(
                scene,
                ledgerButtonLeftX,
                buttonTopY,
                110,
                buttonHeightPx,
                "LEDGER",
                () => this.publishNavigationRequest("ledger"),
            );
            const focusTreeButton = UiPanelFactory.createBrassButton(
                scene,
                focusTreeButtonLeftX,
                buttonTopY,
                130,
                buttonHeightPx,
                "FOCUS TREE",
                () => this.publishNavigationRequest("focus_tree"),
            );
            this.add(ledgerButton);
            this.add(focusTreeButton);
        }
        this.add(menuButton);
    }

    public setTurnDisplay(turnNumber: number, totalTurnCount: number): void {
        const progressLabel = this.usesChapterProgress ? "Chapter" : "Turn";
        this.turnTextObject.setText(`${progressLabel} ${turnNumber} of ${totalTurnCount}`);
    }

    public setPhaseDisplay(phaseDisplayName: string): void {
        this.phaseTextObject.setText(
            this.usesChapterProgress || this.phaseTextObject.scene.scale.width < 760
                ? phaseDisplayName
                : `Current step: ${phaseDisplayName}`,
        );
    }

    private publishNavigationRequest(destinationSceneKey: string): void {
        EventBus.getInstance().publish(
            GameEventTypes.UI_NAVIGATION_REQUESTED,
            new NavigationRequestedPayload(destinationSceneKey),
        );
    }
}
