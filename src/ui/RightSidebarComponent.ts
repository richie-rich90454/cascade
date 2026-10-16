import Phaser from "phaser";

import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class RightSidebarComponent extends Phaser.GameObjects.Container {
    private readonly contextContainer: Phaser.GameObjects.Container;
    private readonly contextContentWidth: number;
    private emptyPromptTextObject: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_SIDEBAR);

        const sidebarPanelContainer = UiPanelFactory.createPanelContainer(
            scene,
            0,
            0,
            width,
            height,
            PanelVariant.LEATHER,
        );
        this.add(sidebarPanelContainer);

        this.contextContentWidth = width - 16;
        this.contextContainer = scene.add.container(8, 8);
        this.add(this.contextContainer);
        this.emptyPromptTextObject = this.createEmptyPrompt(this.contextContentWidth);
        this.contextContainer.add(this.emptyPromptTextObject);
    }

    public setContentToEmptyPrompt(): void {
        this.contextContainer.removeAll(true);
        this.emptyPromptTextObject = this.createEmptyPrompt(this.contextContentWidth);
        this.contextContainer.add(this.emptyPromptTextObject);
    }

    public addContextContent(contentObject: Phaser.GameObjects.GameObject): void {
        this.contextContainer.removeAll(true);
        this.contextContainer.add(contentObject);
    }

    public clearContextContent(): void {
        this.contextContainer.removeAll(true);
    }

    private createEmptyPrompt(width: number): Phaser.GameObjects.Text {
        return UiPanelFactory.createBodyText(
            this.scene,
            12,
            12,
            width - 16,
            "Select a province, country, or focus to inspect it.",
            15,
            UiPalette.AGED_PARCHMENT_CSS,
        );
    }
}
