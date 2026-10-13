import Phaser from "phaser";

import { AssetManager } from "../managers/AssetManager";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class NewspaperPopupComponent extends Phaser.GameObjects.Container {
    private static readonly POPUP_OVERLAY_ALPHA = 0.62;
    private static readonly PAGE_PADDING_PX = 22;
    private static readonly COLUMN_GAP_PX = 18;
    private static readonly MASTHEAD_MAX_HEIGHT_PX = 64;
    private static readonly BUTTON_WIDTH_PX = 150;
    private static readonly BUTTON_HEIGHT_PX = 36;

    private readonly panelWidthPx: number;

    private contentContainer: Phaser.GameObjects.Container | null;
    private onDismissedCallback: (() => void) | null;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_POPUP);
        this.setScrollFactor(0, 0, true);
        this.panelWidthPx = width;
        const overlayRectangle = scene.add.rectangle(
            0,
            0,
            scene.scale.width,
            scene.scale.height,
            0x000000,
            NewspaperPopupComponent.POPUP_OVERLAY_ALPHA,
        );
        overlayRectangle.setOrigin(0, 0);
        overlayRectangle.setPosition(-x, -y);
        overlayRectangle.setInteractive();
        this.add(overlayRectangle);
        this.contentContainer = null;
        this.onDismissedCallback = null;
        this.setVisible(false);
    }

    public showNewspaper(
        mastheadAssetId: string,
        headlineText: string,
        bodyParagraphs: string[],
        nationCode: string,
        onDismissed?: () => void,
    ): void {
        this.onDismissedCallback = onDismissed ?? null;
        this.clearContent();
        const scene = this.scene;
        const innerWidthPx = this.panelWidthPx - NewspaperPopupComponent.PAGE_PADDING_PX * 2;
        const innerLeftX = -innerWidthPx / 2;

        const mastheadImage = this.createOptionalAssetImage(mastheadAssetId);
        let mastheadHeightPx = 0;
        if (mastheadImage !== null) {
            const mastheadScale = Math.min(
                innerWidthPx / mastheadImage.width,
                NewspaperPopupComponent.MASTHEAD_MAX_HEIGHT_PX / mastheadImage.height,
            );
            mastheadImage.setScale(mastheadScale);
            mastheadHeightPx = mastheadImage.height * mastheadScale;
        }
        const mastheadTextObject =
            mastheadImage === null
                ? scene.add.text(0, 0, "THE CASCADE HERALD", {
                      fontFamily: FontFamilies.TYPEWRITER_HEADER,
                      fontSize: "34px",
                      color: UiPalette.NEAR_BLACK_LEATHER_CSS,
                  })
                : null;
        if (mastheadTextObject !== null) {
            mastheadTextObject.setOrigin(0.5, 0);
            mastheadHeightPx = mastheadTextObject.height;
        }

        const datelineTextObject = scene.add.text(0, 0, `SPECIAL EDITION — 1914 — DISPATCHES FROM ${nationCode}`, {
            fontFamily: FontFamilies.TYPEWRITER_BODY,
            fontSize: "13px",
            color: UiPalette.DEEP_PARCHMENT_CSS,
        });
        datelineTextObject.setOrigin(0.5, 0);

        const headlineTextObject = scene.add.text(0, 0, headlineText, {
            fontFamily: FontFamilies.GOTHIC,
            fontSize: "34px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            align: "center",
            wordWrap: { width: innerWidthPx, useAdvancedWrap: true },
        });
        headlineTextObject.setOrigin(0.5, 0);

        const columnWidthPx = (innerWidthPx - NewspaperPopupComponent.COLUMN_GAP_PX) / 2;
        const paragraphSplitIndex = Math.ceil(bodyParagraphs.length / 2);
        const leftColumnTextObject = this.createColumnTextObject(
            bodyParagraphs.slice(0, paragraphSplitIndex).join("\n\n"),
            columnWidthPx,
        );
        const rightColumnTextObject = this.createColumnTextObject(
            bodyParagraphs.slice(paragraphSplitIndex).join("\n\n"),
            columnWidthPx,
        );
        const columnHeightPx = Math.max(leftColumnTextObject.height, rightColumnTextObject.height);

        const panelHeightPx =
            NewspaperPopupComponent.PAGE_PADDING_PX +
            mastheadHeightPx +
            10 +
            14 +
            datelineTextObject.height +
            10 +
            headlineTextObject.height +
            14 +
            8 +
            columnHeightPx +
            18 +
            NewspaperPopupComponent.BUTTON_HEIGHT_PX +
            NewspaperPopupComponent.PAGE_PADDING_PX;

        const contentContainer = scene.add.container(0, 0);
        contentContainer.add(
            UiPanelFactory.createPanelContainer(
                scene,
                -this.panelWidthPx / 2,
                -panelHeightPx / 2,
                this.panelWidthPx,
                panelHeightPx,
                PanelVariant.NEWSPAPER,
                UiPalette.UI_DEPTH_POPUP,
            ),
        );
        const ruleGraphics = scene.add.graphics();
        contentContainer.add(ruleGraphics);

        let contentY = -panelHeightPx / 2 + NewspaperPopupComponent.PAGE_PADDING_PX;
        if (mastheadImage !== null) {
            mastheadImage.setPosition(0, contentY + mastheadHeightPx / 2);
            contentContainer.add(mastheadImage);
        } else if (mastheadTextObject !== null) {
            mastheadTextObject.setPosition(0, contentY);
            contentContainer.add(mastheadTextObject);
        }
        contentY += mastheadHeightPx + 10;

        ruleGraphics.lineStyle(2, UiPalette.NEAR_BLACK_LEATHER, 0.9);
        ruleGraphics.lineBetween(innerLeftX, contentY, innerLeftX + innerWidthPx, contentY);
        ruleGraphics.lineStyle(1, UiPalette.NEAR_BLACK_LEATHER, 0.6);
        ruleGraphics.lineBetween(innerLeftX, contentY + 4, innerLeftX + innerWidthPx, contentY + 4);
        contentY += 14;

        datelineTextObject.setPosition(0, contentY);
        contentContainer.add(datelineTextObject);
        contentY += datelineTextObject.height + 10;

        headlineTextObject.setPosition(0, contentY);
        contentContainer.add(headlineTextObject);
        contentY += headlineTextObject.height + 14;

        ruleGraphics.lineStyle(1, UiPalette.NEAR_BLACK_LEATHER, 0.8);
        ruleGraphics.lineBetween(innerLeftX, contentY, innerLeftX + innerWidthPx, contentY);
        contentY += 8;

        leftColumnTextObject.setPosition(innerLeftX, contentY);
        rightColumnTextObject.setPosition(innerLeftX + columnWidthPx + NewspaperPopupComponent.COLUMN_GAP_PX, contentY);
        contentContainer.add(leftColumnTextObject);
        contentContainer.add(rightColumnTextObject);
        const columnDividerX = innerLeftX + columnWidthPx + NewspaperPopupComponent.COLUMN_GAP_PX / 2;
        ruleGraphics.lineStyle(1, UiPalette.NEAR_BLACK_LEATHER, 0.45);
        ruleGraphics.lineBetween(columnDividerX, contentY, columnDividerX, contentY + columnHeightPx);

        const dismissButtonContainer = UiPanelFactory.createBrassButton(
            scene,
            -NewspaperPopupComponent.BUTTON_WIDTH_PX / 2,
            panelHeightPx / 2 - NewspaperPopupComponent.BUTTON_HEIGHT_PX - 18,
            NewspaperPopupComponent.BUTTON_WIDTH_PX,
            NewspaperPopupComponent.BUTTON_HEIGHT_PX,
            "Close",
            () => {
                this.dismiss();
            },
        );
        contentContainer.add(dismissButtonContainer);

        contentContainer.setPosition(scene.scale.width / 2 - this.x, scene.scale.height / 2 - this.y);
        this.contentContainer = contentContainer;
        this.add(contentContainer);
        this.setVisible(true);
    }

    private createColumnTextObject(columnText: string, wrapWidthPx: number): Phaser.GameObjects.Text {
        return this.scene.add.text(0, 0, columnText, {
            fontFamily: FontFamilies.TYPEWRITER_BODY,
            fontSize: "13px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            lineSpacing: 3,
            wordWrap: { width: wrapWidthPx, useAdvancedWrap: true },
        });
    }

    private createOptionalAssetImage(assetIdentifier: string): Phaser.GameObjects.Image | null {
        const textureKey = AssetManager.getInstance().getTextureKey(assetIdentifier);
        if (!this.scene.textures.exists(textureKey)) {
            return null;
        }
        return this.scene.add.image(0, 0, textureKey);
    }

    private dismiss(): void {
        this.clearContent();
        this.setVisible(false);
        const dismissedCallback = this.onDismissedCallback;
        this.onDismissedCallback = null;
        if (dismissedCallback !== null) {
            dismissedCallback();
        }
    }

    private clearContent(): void {
        if (this.contentContainer !== null) {
            this.contentContainer.destroy();
            this.contentContainer = null;
        }
    }
}
