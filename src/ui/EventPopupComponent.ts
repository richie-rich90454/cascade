import Phaser from "phaser";

import { AssetManager } from "../managers/AssetManager";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class EventPopupComponent extends Phaser.GameObjects.Container {
    private static readonly POPUP_OVERLAY_ALPHA = 0.62;
    private static readonly PANEL_PADDING_PX = 24;
    private static readonly ILLUSTRATION_MAX_HEIGHT_PX = 150;
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
            EventPopupComponent.POPUP_OVERLAY_ALPHA,
        );
        overlayRectangle.setOrigin(0, 0);
        overlayRectangle.setPosition(-x, -y);
        overlayRectangle.setInteractive();
        this.add(overlayRectangle);
        this.contentContainer = null;
        this.onDismissedCallback = null;
        this.setVisible(false);
    }

    public showEvent(titleText: string, bodyText: string, illustrationAssetId: string, onDismissed?: () => void): void {
        this.onDismissedCallback = onDismissed ?? null;
        this.clearContent();
        const scene = this.scene;
        const innerWidthPx = this.panelWidthPx - EventPopupComponent.PANEL_PADDING_PX * 2;

        const titleTextObject = scene.add.text(0, 0, titleText, {
            fontFamily: FontFamilies.GOTHIC,
            fontSize: "32px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            align: "center",
            wordWrap: { width: innerWidthPx, useAdvancedWrap: true },
        });
        titleTextObject.setOrigin(0.5, 0);

        const bodyTextObject = scene.add.text(0, 0, bodyText, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "17px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            align: "center",
            wordWrap: { width: innerWidthPx, useAdvancedWrap: true },
            lineSpacing: 5,
        });
        bodyTextObject.setOrigin(0.5, 0);

        const illustrationImage = this.createOptionalAssetImage(illustrationAssetId);
        let illustrationHeightPx = 0;
        if (illustrationImage !== null) {
            const illustrationScale = Math.min(
                innerWidthPx / illustrationImage.width,
                EventPopupComponent.ILLUSTRATION_MAX_HEIGHT_PX / illustrationImage.height,
            );
            illustrationImage.setScale(illustrationScale);
            illustrationHeightPx = illustrationImage.height * illustrationScale;
        }

        const panelHeightPx =
            EventPopupComponent.PANEL_PADDING_PX +
            (illustrationHeightPx > 0 ? illustrationHeightPx + 14 : 0) +
            titleTextObject.displayHeight +
            12 +
            bodyTextObject.displayHeight +
            20 +
            EventPopupComponent.BUTTON_HEIGHT_PX +
            EventPopupComponent.PANEL_PADDING_PX;

        const contentContainer = scene.add.container(0, 0);
        contentContainer.add(
            UiPanelFactory.createPanelContainer(
                scene,
                -this.panelWidthPx / 2,
                -panelHeightPx / 2,
                this.panelWidthPx,
                panelHeightPx,
                PanelVariant.PARCHMENT,
                UiPalette.UI_DEPTH_POPUP,
            ),
        );

        let contentY = -panelHeightPx / 2 + EventPopupComponent.PANEL_PADDING_PX;
        if (illustrationImage !== null) {
            illustrationImage.setPosition(0, contentY + illustrationHeightPx / 2);
            contentContainer.add(illustrationImage);
            contentY += illustrationHeightPx + 14;
        }
        titleTextObject.setPosition(0, contentY);
        contentContainer.add(titleTextObject);
        contentY += titleTextObject.displayHeight + 12;
        bodyTextObject.setPosition(0, contentY);
        contentContainer.add(bodyTextObject);

        const dismissButtonContainer = UiPanelFactory.createBrassButton(
            scene,
            -EventPopupComponent.BUTTON_WIDTH_PX / 2,
            panelHeightPx / 2 - EventPopupComponent.BUTTON_HEIGHT_PX - 18,
            EventPopupComponent.BUTTON_WIDTH_PX,
            EventPopupComponent.BUTTON_HEIGHT_PX,
            "Continue",
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
