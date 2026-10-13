import Phaser from "phaser";

import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class RightSidebarComponent extends Phaser.GameObjects.Container {
    private readonly contextContainer: Phaser.GameObjects.Container;
    private readonly emptyPromptTextObject: Phaser.GameObjects.Text;

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

        this.emptyPromptTextObject = UiPanelFactory.createBodyText(
            scene,
            12,
            12,
            width - 32,
            "Select a province, unit, nation, or focus to inspect.",
            15,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.contextContainer = scene.add.container(8, 8);
        this.add(this.contextContainer);
        this.setContentToEmptyPrompt();
    }

    public setContentToEmptyPrompt(): void {
        this.contextContainer.removeAll(false);
        this.contextContainer.add(this.emptyPromptTextObject);
    }

    public addContextContent(contentObject: Phaser.GameObjects.GameObject): void {
        this.contextContainer.removeAll(false);
        this.contextContainer.add(contentObject);
    }

    public clearContextContent(): void {
        this.contextContainer.removeAll(false);
    }
}
