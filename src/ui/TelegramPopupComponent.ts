import Phaser from "phaser";

import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class TelegramPopupComponent extends Phaser.GameObjects.Container {
    private static readonly POPUP_OVERLAY_ALPHA = 0.62;
    private static readonly PANEL_PADDING_PX = 24;
    private static readonly STAMP_ROTATION_DEGREES = -12;
    private static readonly SLIDE_DURATION_MS = 380;
    private static readonly BUTTON_WIDTH_PX = 150;
    private static readonly BUTTON_HEIGHT_PX = 36;

    private readonly panelWidthPx: number;

    private contentContainer: Phaser.GameObjects.Container | null;
    private onDismissedCallback: (() => void) | null;
    private slideTween: Phaser.Tweens.Tween | null;

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
            TelegramPopupComponent.POPUP_OVERLAY_ALPHA,
        );
        overlayRectangle.setOrigin(0, 0);
        overlayRectangle.setPosition(-x, -y);
        overlayRectangle.setInteractive();
        this.add(overlayRectangle);
        this.contentContainer = null;
        this.onDismissedCallback = null;
        this.slideTween = null;
        this.setVisible(false);
    }

    public showTelegram(
        classificationText: string,
        subjectText: string,
        bodyLines: string[],
        onDismissed?: () => void,
    ): void {
        this.onDismissedCallback = onDismissed ?? null;
        this.clearContent();
        const scene = this.scene;
        const innerWidthPx = this.panelWidthPx - TelegramPopupComponent.PANEL_PADDING_PX * 2;

        const headerTextObject = scene.add.text(0, 0, "TELEGRAM", {
            fontFamily: FontFamilies.TYPEWRITER_HEADER,
            fontSize: "24px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
        });

        const classificationStampTextObject = scene.add.text(0, 0, classificationText, {
            fontFamily: FontFamilies.TYPEWRITER_HEADER,
            fontSize: "26px",
            color: UiPalette.BRIGHT_BLOOD_CSS,
            stroke: UiPalette.BLOOD_RED_CSS,
            strokeThickness: 2,
        });
        classificationStampTextObject.setOrigin(0.5, 0.5);
        classificationStampTextObject.setRotation(Phaser.Math.DegToRad(TelegramPopupComponent.STAMP_ROTATION_DEGREES));
        classificationStampTextObject.setAlpha(0.85);

        const subjectTextObject = scene.add.text(0, 0, subjectText, {
            fontFamily: FontFamilies.TYPEWRITER_HEADER,
            fontSize: "17px",
            color: UiPalette.DEEP_BRASS_CSS,
            wordWrap: { width: innerWidthPx, useAdvancedWrap: true },
        });

        const bodyTextObject = scene.add.text(0, 0, bodyLines.join("\n"), {
            fontFamily: FontFamilies.TYPEWRITER_BODY,
            fontSize: "15px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            wordWrap: { width: innerWidthPx, useAdvancedWrap: true },
            lineSpacing: 4,
        });

        const panelHeightPx =
            TelegramPopupComponent.PANEL_PADDING_PX +
            headerTextObject.height +
            12 +
            subjectTextObject.height +
            12 +
            bodyTextObject.height +
            20 +
            TelegramPopupComponent.BUTTON_HEIGHT_PX +
            TelegramPopupComponent.PANEL_PADDING_PX;

        const contentContainer = scene.add.container(0, 0);
        contentContainer.add(
            UiPanelFactory.createPanelContainer(
                scene,
                -this.panelWidthPx / 2,
                -panelHeightPx / 2,
                this.panelWidthPx,
                panelHeightPx,
                PanelVariant.TELEGRAM,
                UiPalette.UI_DEPTH_POPUP,
            ),
        );

        let contentY = -panelHeightPx / 2 + TelegramPopupComponent.PANEL_PADDING_PX;
        headerTextObject.setPosition(-innerWidthPx / 2, contentY);
        contentContainer.add(headerTextObject);

        classificationStampTextObject.setPosition(innerWidthPx / 2 - 80, contentY + 14);
        contentContainer.add(classificationStampTextObject);
        contentY += headerTextObject.height + 12;

        subjectTextObject.setPosition(-innerWidthPx / 2, contentY);
        contentContainer.add(subjectTextObject);
        contentY += subjectTextObject.height + 12;

        bodyTextObject.setPosition(-innerWidthPx / 2, contentY);
        contentContainer.add(bodyTextObject);

        const dismissButtonContainer = UiPanelFactory.createBrassButton(
            scene,
            -TelegramPopupComponent.BUTTON_WIDTH_PX / 2,
            panelHeightPx / 2 - TelegramPopupComponent.BUTTON_HEIGHT_PX - 18,
            TelegramPopupComponent.BUTTON_WIDTH_PX,
            TelegramPopupComponent.BUTTON_HEIGHT_PX,
            "Continue",
            () => {
                this.dismiss();
            },
        );
        contentContainer.add(dismissButtonContainer);

        const contentCenterX = scene.scale.width / 2 - this.x;
        const contentCenterY = scene.scale.height / 2 - this.y;
        const slideStartOffsetPx = Math.max(scene.scale.width * 0.6, this.panelWidthPx);
        contentContainer.setPosition(contentCenterX + slideStartOffsetPx, contentCenterY);
        this.contentContainer = contentContainer;
        this.add(contentContainer);
        this.setVisible(true);
        this.slideTween = scene.tweens.add({
            targets: contentContainer,
            x: contentCenterX,
            duration: TelegramPopupComponent.SLIDE_DURATION_MS,
            ease: "Cubic.easeOut",
            onComplete: () => {
                this.slideTween = null;
            },
        });
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
        if (this.slideTween !== null) {
            this.slideTween.stop();
            this.slideTween = null;
        }
        if (this.contentContainer !== null) {
            this.contentContainer.destroy();
            this.contentContainer = null;
        }
    }
}
