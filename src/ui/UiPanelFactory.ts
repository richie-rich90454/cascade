import Phaser from "phaser";

import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";

export class PanelVariant {
    public static readonly LEATHER = new PanelVariant("leather", UiPalette.DARK_OLIVE, UiPalette.DEEP_BRASS);
    public static readonly PARCHMENT = new PanelVariant("parchment", UiPalette.PARCHMENT, UiPalette.DEEP_BRASS);
    public static readonly NEWSPAPER = new PanelVariant("newspaper", UiPalette.AGED_PARCHMENT, UiPalette.FIELD_GRAY);
    public static readonly TELEGRAM = new PanelVariant("telegram", UiPalette.PARCHMENT, UiPalette.FIELD_GRAY);
    public static readonly LEDGER = new PanelVariant("ledger", UiPalette.DARK_OLIVE, UiPalette.FIELD_GRAY);
    public static readonly BRASS = new PanelVariant("brass", UiPalette.MID_OLIVE, UiPalette.BRIGHT_BRASS);

    public readonly variantCode: string;
    public readonly fillColor: number;
    public readonly borderColor: number;

    private constructor(variantCode: string, fillColor: number, borderColor: number) {
        this.variantCode = variantCode;
        this.fillColor = fillColor;
        this.borderColor = borderColor;
    }
}

export class UiPanelFactory {
    public static createPanelContainer(
        scene: Phaser.Scene,
        x: number,
        y: number,
        pixelWidth: number,
        pixelHeight: number,
        panelVariant: PanelVariant,
        depthLevel: number = UiPalette.UI_DEPTH_PANEL,
    ): Phaser.GameObjects.Container {
        const panelContainer = scene.add.container(x, y);
        const panelGraphics = scene.add.graphics();
        panelGraphics.fillStyle(panelVariant.fillColor, 1);
        panelGraphics.fillRect(0, 0, pixelWidth, pixelHeight);
        panelGraphics.fillStyle(0x11171c, 0.72);
        panelGraphics.fillRect(0, 0, pixelWidth, 4);
        panelGraphics.fillStyle(0x11171c, 0.32);
        panelGraphics.fillRect(0, pixelHeight - 3, pixelWidth, 3);
        panelGraphics.fillStyle(panelVariant.borderColor, 0.88);
        panelGraphics.fillRect(1, 4, 3, Math.max(0, pixelHeight - 8));
        panelGraphics.lineStyle(1, panelVariant.borderColor, 0.94);
        panelGraphics.strokeRect(1, 1, pixelWidth - 2, pixelHeight - 2);
        panelGraphics.lineStyle(1, UiPalette.FIELD_GRAY, 0.32);
        panelGraphics.strokeRect(5, 5, Math.max(0, pixelWidth - 10), Math.max(0, pixelHeight - 10));
        panelGraphics.fillStyle(0x11171c, 0.82);
        panelGraphics.fillCircle(8, 8, 2.4);
        panelGraphics.fillCircle(pixelWidth - 8, 8, 2.4);
        panelGraphics.fillCircle(8, pixelHeight - 8, 2.4);
        panelGraphics.fillCircle(pixelWidth - 8, pixelHeight - 8, 2.4);
        panelGraphics.fillStyle(UiPalette.BRIGHT_BRASS, 0.76);
        panelGraphics.fillCircle(8, 8, 1);
        panelGraphics.fillCircle(pixelWidth - 8, 8, 1);
        panelGraphics.fillCircle(8, pixelHeight - 8, 1);
        panelGraphics.fillCircle(pixelWidth - 8, pixelHeight - 8, 1);
        panelContainer.add(panelGraphics);
        panelContainer.setDepth(depthLevel);
        panelContainer.setSize(pixelWidth, pixelHeight);
        return panelContainer;
    }

    public static createBrassButton(
        scene: Phaser.Scene,
        x: number,
        y: number,
        pixelWidth: number,
        pixelHeight: number,
        buttonLabelText: string,
        onButtonClicked: () => void,
    ): Phaser.GameObjects.Container {
        const buttonContainer = scene.add.container(x, y);
        const buttonGraphics = scene.add.graphics();
        const redrawButton = (fillColor: number): void => {
            buttonGraphics.clear();
            buttonGraphics.fillStyle(fillColor, 1);
            buttonGraphics.fillRect(0, 0, pixelWidth, pixelHeight);
            const isHovered = fillColor === UiPalette.BUTTON_HOVER;
            buttonGraphics.lineStyle(
                isHovered ? 2 : 1,
                isHovered ? UiPalette.HIGHLIGHT_BRASS : UiPalette.FIELD_GRAY,
                1,
            );
            buttonGraphics.strokeRect(1, 1, pixelWidth - 2, pixelHeight - 2);
        };
        redrawButton(UiPalette.MID_OLIVE);
        const buttonLabel = scene.add.text(pixelWidth / 2, pixelHeight / 2, buttonLabelText, {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "16px",
            fontStyle: "bold",
            color: UiPalette.PARCHMENT_CSS,
        });
        buttonLabel.setOrigin(0.5, 0.5);
        const buttonZone = scene.add.zone(0, 0, pixelWidth, pixelHeight).setOrigin(0, 0);
        buttonZone.setInteractive({ useHandCursor: true });
        buttonZone.on("pointerover", () => {
            redrawButton(UiPalette.BUTTON_HOVER);
        });
        buttonZone.on("pointerout", () => {
            redrawButton(UiPalette.MID_OLIVE);
        });
        buttonZone.on("pointerdown", () => {
            redrawButton(UiPalette.NEAR_BLACK_LEATHER);
        });
        buttonZone.on("pointerup", () => {
            redrawButton(UiPalette.BUTTON_HOVER);
            onButtonClicked();
        });
        buttonContainer.add(buttonGraphics);
        buttonContainer.add(buttonLabel);
        buttonContainer.add(buttonZone);
        return buttonContainer;
    }

    public static createSectionHeader(
        scene: Phaser.Scene,
        x: number,
        y: number,
        headerText: string,
        fontSizePx: number = 20,
        textColorCss: string = UiPalette.HIGHLIGHT_BRASS_CSS,
    ): Phaser.GameObjects.Text {
        return scene.add.text(x, y, headerText, {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: `${fontSizePx}px`,
            color: textColorCss,
        });
    }

    public static createBodyText(
        scene: Phaser.Scene,
        x: number,
        y: number,
        wrapWidthPx: number,
        bodyText: string,
        fontSizePx: number = 16,
        textColorCss: string = UiPalette.PARCHMENT_CSS,
    ): Phaser.GameObjects.Text {
        return scene.add.text(x, y, bodyText, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: `${fontSizePx}px`,
            color: textColorCss,
            wordWrap: { width: wrapWidthPx, useAdvancedWrap: true },
            lineSpacing: 4,
        });
    }

    public static createTypewriterText(
        scene: Phaser.Scene,
        x: number,
        y: number,
        wrapWidthPx: number,
        typewriterText: string,
        fontSizePx: number = 15,
        textColorCss: string = UiPalette.AGED_PARCHMENT_CSS,
    ): Phaser.GameObjects.Text {
        return scene.add.text(x, y, typewriterText, {
            fontFamily: FontFamilies.TYPEWRITER_BODY,
            fontSize: `${fontSizePx}px`,
            color: textColorCss,
            wordWrap: { width: wrapWidthPx, useAdvancedWrap: true },
            lineSpacing: 4,
        });
    }

    public static createBadgeChip(
        scene: Phaser.Scene,
        x: number,
        y: number,
        badgeLabelText: string,
        backgroundColorHex: number,
        textColorCss: string = UiPalette.PARCHMENT_CSS,
    ): Phaser.GameObjects.Container {
        const badgeContainer = scene.add.container(x, y);
        const estimatedWidthPx = Math.max(56, badgeLabelText.length * 10 + 20);
        const badgeGraphics = scene.add.graphics();
        badgeGraphics.fillStyle(backgroundColorHex, 1);
        badgeGraphics.fillRect(0, 0, estimatedWidthPx, 24);
        badgeGraphics.lineStyle(1, UiPalette.HIGHLIGHT_BRASS, 0.85);
        badgeGraphics.strokeRect(0.5, 0.5, estimatedWidthPx - 1, 23);
        const badgeLabel = scene.add.text(estimatedWidthPx / 2, 12, badgeLabelText, {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "14px",
            color: textColorCss,
        });
        badgeLabel.setOrigin(0.5, 0.5);
        badgeContainer.add(badgeGraphics);
        badgeContainer.add(badgeLabel);
        return badgeContainer;
    }

    public static createHorizontalDivider(
        scene: Phaser.Scene,
        x: number,
        y: number,
        pixelWidth: number,
        dividerColor: number = UiPalette.DEEP_BRASS,
    ): Phaser.GameObjects.Graphics {
        const dividerGraphics = scene.add.graphics();
        dividerGraphics.lineStyle(1, dividerColor, 0.8);
        dividerGraphics.lineBetween(x, y, x + pixelWidth, y);
        return dividerGraphics;
    }
}
