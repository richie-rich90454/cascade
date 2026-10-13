import Phaser from "phaser";

import { EventBus, GameEventTypes, NavigationRequestedPayload } from "../core/EventBus";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class BottomBarComponent extends Phaser.GameObjects.Container {
    private static readonly SPEED_CHIP_WIDTH_PX = 58;
    private static readonly SPEED_CHIP_HEIGHT_PX = 28;
    private static readonly SPEED_CHIP_GAP_PX = 8;
    private static readonly SPEED_MULTIPLIERS: number[] = [0, 1, 2, 3];

    private readonly turnTextObject: Phaser.GameObjects.Text;
    private readonly phaseTextObject: Phaser.GameObjects.Text;
    private readonly speedChipGraphicsByMultiplier: Map<number, Phaser.GameObjects.Graphics>;
    private readonly speedChipLabelByMultiplier: Map<number, Phaser.GameObjects.Text>;
    private speedMultiplier: number;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.speedChipGraphicsByMultiplier = new Map<number, Phaser.GameObjects.Graphics>();
        this.speedChipLabelByMultiplier = new Map<number, Phaser.GameObjects.Text>();
        this.speedMultiplier = 1;
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

        this.turnTextObject = scene.add.text(16, 8, "Turn 1 / 1", {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "18px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        this.phaseTextObject = scene.add.text(16, 32, "Briefing", {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "14px",
            color: UiPalette.AGED_PARCHMENT_CSS,
        });
        this.add(this.turnTextObject);
        this.add(this.phaseTextObject);

        const chipRowWidthPx =
            BottomBarComponent.SPEED_MULTIPLIERS.length * BottomBarComponent.SPEED_CHIP_WIDTH_PX +
            (BottomBarComponent.SPEED_MULTIPLIERS.length - 1) * BottomBarComponent.SPEED_CHIP_GAP_PX;
        const chipStartX = width / 2 - chipRowWidthPx / 2;
        const chipTopY = (height - BottomBarComponent.SPEED_CHIP_HEIGHT_PX) / 2;
        for (let chipIndex = 0; chipIndex < BottomBarComponent.SPEED_MULTIPLIERS.length; chipIndex++) {
            const multiplier = BottomBarComponent.SPEED_MULTIPLIERS[chipIndex];
            const chipLeftX =
                chipStartX +
                chipIndex * (BottomBarComponent.SPEED_CHIP_WIDTH_PX + BottomBarComponent.SPEED_CHIP_GAP_PX);
            this.createSpeedChip(scene, chipLeftX, chipTopY, multiplier);
        }
        this.redrawSpeedChips();

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
        this.turnTextObject.setText(`Turn ${turnNumber} / ${totalTurnCount}`);
    }

    public setPhaseDisplay(phaseDisplayName: string): void {
        this.phaseTextObject.setText(phaseDisplayName);
    }

    public getSpeedMultiplier(): number {
        return this.speedMultiplier;
    }

    public setSpeedMultiplier(speedMultiplier: number): void {
        this.speedMultiplier = speedMultiplier;
        this.redrawSpeedChips();
    }

    private createSpeedChip(scene: Phaser.Scene, chipLeftX: number, chipTopY: number, multiplier: number): void {
        const chipGraphics = scene.add.graphics();
        chipGraphics.setPosition(chipLeftX, chipTopY);
        const chipLabelTextObject = scene.add.text(
            chipLeftX + BottomBarComponent.SPEED_CHIP_WIDTH_PX / 2,
            chipTopY + BottomBarComponent.SPEED_CHIP_HEIGHT_PX / 2,
            BottomBarComponent.getSpeedChipLabel(multiplier),
            {
                fontFamily: FontFamilies.DISPLAY_SERIF,
                fontSize: "14px",
                color: UiPalette.PARCHMENT_CSS,
            },
        );
        chipLabelTextObject.setOrigin(0.5, 0.5);
        const chipZone = scene.add
            .zone(chipLeftX, chipTopY, BottomBarComponent.SPEED_CHIP_WIDTH_PX, BottomBarComponent.SPEED_CHIP_HEIGHT_PX)
            .setOrigin(0, 0);
        chipZone.setInteractive({ useHandCursor: true });
        chipZone.on("pointerup", () => {
            this.setSpeedMultiplier(multiplier);
        });
        this.speedChipGraphicsByMultiplier.set(multiplier, chipGraphics);
        this.speedChipLabelByMultiplier.set(multiplier, chipLabelTextObject);
        this.add(chipGraphics);
        this.add(chipLabelTextObject);
        this.add(chipZone);
    }

    private redrawSpeedChips(): void {
        for (const multiplier of BottomBarComponent.SPEED_MULTIPLIERS) {
            const chipGraphics = this.speedChipGraphicsByMultiplier.get(multiplier);
            const chipLabelTextObject = this.speedChipLabelByMultiplier.get(multiplier);
            if (chipGraphics === undefined || chipLabelTextObject === undefined) {
                continue;
            }
            const isActive = multiplier === this.speedMultiplier;
            chipGraphics.clear();
            chipGraphics.fillStyle(isActive ? UiPalette.BRASS_TAN : UiPalette.MID_OLIVE, 1);
            chipGraphics.fillRect(
                0,
                0,
                BottomBarComponent.SPEED_CHIP_WIDTH_PX,
                BottomBarComponent.SPEED_CHIP_HEIGHT_PX,
            );
            chipGraphics.lineStyle(2, isActive ? UiPalette.HIGHLIGHT_BRASS : UiPalette.DEEP_BRASS, 0.95);
            chipGraphics.strokeRect(
                1,
                1,
                BottomBarComponent.SPEED_CHIP_WIDTH_PX - 2,
                BottomBarComponent.SPEED_CHIP_HEIGHT_PX - 2,
            );
            chipLabelTextObject.setColor(isActive ? UiPalette.NEAR_BLACK_LEATHER_CSS : UiPalette.PARCHMENT_CSS);
        }
    }

    private publishNavigationRequest(destinationSceneKey: string): void {
        EventBus.getInstance().publish(
            GameEventTypes.UI_NAVIGATION_REQUESTED,
            new NavigationRequestedPayload(destinationSceneKey),
        );
    }

    private static getSpeedChipLabel(speedMultiplier: number): string {
        switch (speedMultiplier) {
            case 0:
                return "PAUSE";
            case 1:
                return "1x";
            case 2:
                return "2x";
            case 3:
                return "3x";
            default:
                return String(speedMultiplier) + "x";
        }
    }
}
