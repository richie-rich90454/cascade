import Phaser from "phaser";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";

export class TooltipComponent {
    private readonly scene: Phaser.Scene;
    private readonly tooltipContainer: Phaser.GameObjects.Container;
    private readonly maximumWidthPx: number;
    private readonly panelGraphics: Phaser.GameObjects.Graphics;
    private readonly titleTextObject: Phaser.GameObjects.Text;
    private readonly bodyTextObject: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, initialX: number, initialY: number, maximumWidthPx: number) {
        this.scene = scene;
        this.maximumWidthPx = maximumWidthPx;
        this.panelGraphics = scene.add.graphics();
        this.titleTextObject = scene.add.text(14, 10, "", {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "15px",
            color: UiPalette.DEEP_PARCHMENT_CSS,
        });
        this.bodyTextObject = scene.add.text(14, 34, "", {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "14px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            wordWrap: { width: this.maximumWidthPx - 28, useAdvancedWrap: true },
            lineSpacing: 3,
        });
        this.tooltipContainer = scene.add.container(initialX, initialY);
        this.tooltipContainer.add(this.panelGraphics);
        this.tooltipContainer.add(this.titleTextObject);
        this.tooltipContainer.add(this.bodyTextObject);
        this.tooltipContainer.setDepth(UiPalette.UI_DEPTH_TOOLTIP);
        this.tooltipContainer.setVisible(false);
    }

    public showAt(screenX: number, screenY: number, tooltipTitleText: string, tooltipBodyLines: string[]): void {
        this.titleTextObject.setText(tooltipTitleText);
        this.bodyTextObject.setText(tooltipBodyLines.join("\n"));
        const desiredWidthPx = this.maximumWidthPx;
        const desiredHeightPx = Math.max(64, 44 + this.bodyTextObject.height + 12);
        this.panelGraphics.clear();
        this.panelGraphics.fillStyle(UiPalette.PARCHMENT, 0.98);
        this.panelGraphics.fillRect(0, 0, desiredWidthPx, desiredHeightPx);
        this.panelGraphics.lineStyle(2, UiPalette.DEEP_BRASS, 1);
        this.panelGraphics.strokeRect(1, 1, desiredWidthPx - 2, desiredHeightPx - 2);
        const clampedX = Math.min(screenX + 16, this.scene.scale.width - desiredWidthPx - 8);
        const clampedY = Math.min(screenY + 16, this.scene.scale.height - desiredHeightPx - 8);
        this.tooltipContainer.setPosition(Math.max(8, clampedX), Math.max(8, clampedY));
        this.tooltipContainer.setVisible(true);
    }

    public hide(): void {
        this.tooltipContainer.setVisible(false);
    }

    public isTooltipVisible(): boolean {
        return this.tooltipContainer.visible;
    }

    public attachToTargetZone(
        targetZone: Phaser.GameObjects.Zone,
        tooltipTitleText: string,
        tooltipBodyLinesFactory: () => string[],
    ): void {
        targetZone.setInteractive({ useHandCursor: false });
        targetZone.on("pointerover", (pointer: Phaser.Input.Pointer) => {
            this.showAt(pointer.x, pointer.y, tooltipTitleText, tooltipBodyLinesFactory());
        });
        targetZone.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (this.isTooltipVisible()) {
                this.showAt(pointer.x, pointer.y, tooltipTitleText, tooltipBodyLinesFactory());
            }
        });
        targetZone.on("pointerout", () => {
            this.hide();
        });
    }
}
