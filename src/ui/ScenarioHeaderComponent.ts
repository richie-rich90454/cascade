import Phaser from "phaser";

import type { Scenario } from "../domain/scenarios/Scenario";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";

export class ScenarioHeaderComponent extends Phaser.GameObjects.Container {
    private readonly titleTextObject: Phaser.GameObjects.Text;
    private readonly subtitleTextObject: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_PANEL);

        this.titleTextObject = scene.add.text(0, 0, "", {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "24px",
            fontStyle: "bold",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
            wordWrap: { width: width - 24, useAdvancedWrap: true },
        });
        this.subtitleTextObject = scene.add.text(0, 38, "", {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "16px",
            fontStyle: "italic",
            color: UiPalette.AGED_PARCHMENT_CSS,
        });
        this.add(this.titleTextObject);
        this.add(this.subtitleTextObject);
    }

    public setScenario(scenario: Scenario): void {
        this.titleTextObject.setText(scenario.getScenarioTitle());
        this.subtitleTextObject.setText(`${scenario.getStartYear()}-${scenario.getEndYear()}`);
    }
}
