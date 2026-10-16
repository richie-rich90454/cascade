import Phaser from "phaser";

import { EventBus, GameEventTypes, NavigationRequestedPayload } from "../core/EventBus";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class BottomBarComponent extends Phaser.GameObjects.Container {
    private readonly turnTextObject: Phaser.GameObjects.Text;
    private readonly phaseTextObject: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
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
        this.add(playLoopText);

        const buttonHeightPx = 32;
        const buttonTopY = (height - buttonHeightPx) / 2;
        const menuButtonLeftX = width - 16 - 90;
        const focusTreeButtonLeftX = menuButtonLeftX - 10 - 130;
        const ledgerButtonLeftX = focusTreeButtonLeftX - 10 - 110;
        const journalButtonLeftX = ledgerButtonLeftX - 10 - 110;
        const journalButton = UiPanelFactory.createBrassButton(
            scene,
            journalButtonLeftX,
            buttonTopY,
            110,
            buttonHeightPx,
            "JOURNAL",
            () => this.publishNavigationRequest("journal"),
        );
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
        const menuButton = UiPanelFactory.createBrassButton(
            scene,
            menuButtonLeftX,
            buttonTopY,
            90,
            buttonHeightPx,
            "MENU",
            () => this.publishNavigationRequest("menu"),
        );
        this.add(journalButton);
        this.add(ledgerButton);
        this.add(focusTreeButton);
        this.add(menuButton);
    }

    public setTurnDisplay(turnNumber: number, totalTurnCount: number): void {
        this.turnTextObject.setText(`Turn ${turnNumber} of ${totalTurnCount}`);
    }

    public setPhaseDisplay(phaseDisplayName: string): void {
        this.phaseTextObject.setText(`Current step: ${phaseDisplayName}`);
    }

    private publishNavigationRequest(destinationSceneKey: string): void {
        EventBus.getInstance().publish(
            GameEventTypes.UI_NAVIGATION_REQUESTED,
            new NavigationRequestedPayload(destinationSceneKey),
        );
    }
}
