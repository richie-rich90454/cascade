import Phaser from "phaser";

import type { InterestGroup } from "../managers/DomesticManager";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class InterestGroupPanelComponent extends Phaser.GameObjects.Container {
    private static readonly MAXIMUM_ROW_COUNT = 8;
    private static readonly PANEL_HEADER_HEIGHT_PX = 56;
    private static readonly PANEL_BOTTOM_PADDING_PX = 16;
    private static readonly ROW_HEIGHT_PX = 30;
    private static readonly ROW_LABEL_LEFT_PX = 16;
    private static readonly BAR_LEFT_PX = 146;
    private static readonly BAR_HEIGHT_PX = 12;
    private static readonly POWER_TEXT_RESERVE_PX = 46;
    private static readonly POWER_HIGH_MINIMUM = 60;
    private static readonly POWER_LOW_MAXIMUM = 35;

    private readonly panelWidthPx: number;
    private readonly barGraphics: Phaser.GameObjects.Graphics;
    private readonly rowTextObjects: Phaser.GameObjects.Text[];

    constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_SIDEBAR);
        this.panelWidthPx = width;
        const panelHeightPx =
            InterestGroupPanelComponent.PANEL_HEADER_HEIGHT_PX +
            InterestGroupPanelComponent.MAXIMUM_ROW_COUNT * InterestGroupPanelComponent.ROW_HEIGHT_PX +
            InterestGroupPanelComponent.PANEL_BOTTOM_PADDING_PX;
        this.add(UiPanelFactory.createPanelContainer(scene, 0, 0, width, panelHeightPx, PanelVariant.LEATHER));
        const headerTextObject = UiPanelFactory.createSectionHeader(
            scene,
            InterestGroupPanelComponent.ROW_LABEL_LEFT_PX,
            14,
            "Interest Groups",
            17,
        );
        this.barGraphics = scene.add.graphics();
        this.rowTextObjects = [];
        this.add(headerTextObject);
        this.add(this.barGraphics);
        this.setInterestGroups([]);
    }

    public setInterestGroups(interestGroups: InterestGroup[]): void {
        for (const rowTextObject of this.rowTextObjects) {
            rowTextObject.destroy();
        }
        this.rowTextObjects.length = 0;
        this.barGraphics.clear();
        // ponytail: fixed eight rows, matching the eight DomesticManager interest groups
        const visibleInterestGroups = interestGroups.slice(0, InterestGroupPanelComponent.MAXIMUM_ROW_COUNT);
        const barWidthPx = Math.max(
            40,
            this.panelWidthPx -
                InterestGroupPanelComponent.BAR_LEFT_PX -
                InterestGroupPanelComponent.POWER_TEXT_RESERVE_PX -
                InterestGroupPanelComponent.ROW_LABEL_LEFT_PX,
        );
        for (let rowIndex = 0; rowIndex < visibleInterestGroups.length; rowIndex += 1) {
            const interestGroup = visibleInterestGroups[rowIndex];
            const rowTopY =
                InterestGroupPanelComponent.PANEL_HEADER_HEIGHT_PX +
                rowIndex * InterestGroupPanelComponent.ROW_HEIGHT_PX;
            const rowLabelTextObject = this.scene.add.text(
                InterestGroupPanelComponent.ROW_LABEL_LEFT_PX,
                rowTopY + 7,
                interestGroup.groupDisplayName,
                {
                    fontFamily: FontFamilies.BODY_SERIF,
                    fontSize: "15px",
                    color: UiPalette.PARCHMENT_CSS,
                },
            );
            const powerTextObject = this.scene.add.text(
                this.panelWidthPx - InterestGroupPanelComponent.ROW_LABEL_LEFT_PX,
                rowTopY + 7,
                `${interestGroup.getPoliticalPower()}`,
                {
                    fontFamily: FontFamilies.BODY_SERIF,
                    fontSize: "15px",
                    color: UiPalette.BRASS_TAN_CSS,
                },
            );
            powerTextObject.setOrigin(1, 0);
            const powerValue = Phaser.Math.Clamp(interestGroup.getPoliticalPower(), 0, 100);
            const barTopY = rowTopY + 9;
            this.barGraphics.fillStyle(UiPalette.NEAR_BLACK_LEATHER, 0.9);
            this.barGraphics.fillRect(
                InterestGroupPanelComponent.BAR_LEFT_PX,
                barTopY,
                barWidthPx,
                InterestGroupPanelComponent.BAR_HEIGHT_PX,
            );
            let powerColorValue = UiPalette.BRIGHT_BLOOD;
            if (powerValue >= InterestGroupPanelComponent.POWER_HIGH_MINIMUM) {
                powerColorValue = UiPalette.BRIGHT_BRASS;
            } else if (powerValue >= InterestGroupPanelComponent.POWER_LOW_MAXIMUM) {
                powerColorValue = UiPalette.BRASS_TAN;
            }
            this.barGraphics.fillStyle(powerColorValue, 1);
            this.barGraphics.fillRect(
                InterestGroupPanelComponent.BAR_LEFT_PX,
                barTopY,
                Math.round((barWidthPx * powerValue) / 100),
                InterestGroupPanelComponent.BAR_HEIGHT_PX,
            );
            this.barGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.8);
            this.barGraphics.strokeRect(
                InterestGroupPanelComponent.BAR_LEFT_PX,
                barTopY,
                barWidthPx,
                InterestGroupPanelComponent.BAR_HEIGHT_PX,
            );
            this.add(rowLabelTextObject);
            this.add(powerTextObject);
            this.rowTextObjects.push(rowLabelTextObject);
            this.rowTextObjects.push(powerTextObject);
        }
        if (visibleInterestGroups.length === 0) {
            const emptyTextObject = this.scene.add.text(
                InterestGroupPanelComponent.ROW_LABEL_LEFT_PX,
                InterestGroupPanelComponent.PANEL_HEADER_HEIGHT_PX,
                "No interest groups recorded.",
                {
                    fontFamily: FontFamilies.BODY_SERIF,
                    fontSize: "15px",
                    color: UiPalette.DEEP_PARCHMENT_CSS,
                },
            );
            this.add(emptyTextObject);
            this.rowTextObjects.push(emptyTextObject);
        }
    }
}
