import Phaser from "phaser";

import { EventBus, GameEventTypes, ResourceChangePayload } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import { FontFamilies } from "../managers/FontManager";
import { ResourceType } from "../types/ResourceType";
import { TooltipComponent } from "./TooltipComponent";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class TopBarComponent extends Phaser.GameObjects.Container {
    private static readonly BAR_HEIGHT_PX = 48;

    private readonly gameState: GameState;
    private readonly valueTextByResourceTypeCode: Map<string, Phaser.GameObjects.Text>;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        gameState: GameState,
        resourceCodes: string[] = ResourceType.getTopBarResourceTypes().map((resourceType) => resourceType.getCode()),
    ) {
        super(scene, x, y);
        this.gameState = gameState;
        this.valueTextByResourceTypeCode = new Map<string, Phaser.GameObjects.Text>();
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_PANEL);

        const topBarPanelContainer = UiPanelFactory.createPanelContainer(
            scene,
            0,
            0,
            width,
            TopBarComponent.BAR_HEIGHT_PX,
            PanelVariant.LEATHER,
        );
        this.add(topBarPanelContainer);

        const topBarResourceTypes = resourceCodes
            .map((resourceCode) => ResourceType.findByResourceTypeCode(resourceCode))
            .filter((resourceType): resourceType is ResourceType => resourceType !== null);
        const slotWidthPx = width / topBarResourceTypes.length;
        const compactTypography = width < 720;
        const slotDividerGraphics = scene.add.graphics();
        const sharedTooltip = new TooltipComponent(scene, x, y + TopBarComponent.BAR_HEIGHT_PX + 8, 280);
        for (let resourceIndex = 0; resourceIndex < topBarResourceTypes.length; resourceIndex++) {
            const resourceType = topBarResourceTypes[resourceIndex];
            const slotLeftX = resourceIndex * slotWidthPx;
            const slotCenterX = slotLeftX + slotWidthPx / 2;
            const slotLabelTextObject = scene.add.text(slotCenterX, 4, TopBarComponent.getSlotLabelText(resourceType), {
                fontFamily: FontFamilies.SMALL_CAPS,
                fontSize: `${compactTypography ? Math.max(9, Math.min(12, Math.floor(slotWidthPx * 0.15))) : 14}px`,
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
                fontStyle: "bold",
                wordWrap: { width: Math.max(36, slotWidthPx - 8), useAdvancedWrap: true },
                align: "center",
            });
            slotLabelTextObject.setOrigin(0.5, 0);
            const slotValueTextObject = scene.add.text(slotCenterX, compactTypography ? 29 : 23, "", {
                fontFamily: FontFamilies.DISPLAY_SERIF,
                fontSize: `${compactTypography ? 12 : 15}px`,
                color: UiPalette.PARCHMENT_CSS,
            });
            slotValueTextObject.setOrigin(0.5, 0);
            this.valueTextByResourceTypeCode.set(resourceType.getCode(), slotValueTextObject);
            const slotZone = scene.add.zone(slotLeftX, 0, slotWidthPx, TopBarComponent.BAR_HEIGHT_PX).setOrigin(0, 0);
            sharedTooltip.attachToTargetZone(slotZone, resourceType.getDisplayName(), () => [
                resourceType.getDescription(),
                `Current value: ${this.gameState.getResourceQuantity(resourceType)}`,
            ]);
            this.add(slotLabelTextObject);
            this.add(slotValueTextObject);
            this.add(slotZone);
            if (resourceIndex > 0) {
                slotDividerGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.65);
                slotDividerGraphics.lineBetween(slotLeftX, 6, slotLeftX, TopBarComponent.BAR_HEIGHT_PX - 6);
            }
        }
        this.add(slotDividerGraphics);
        EventBus.getInstance().subscribe<ResourceChangePayload>(
            GameEventTypes.RESOURCE_CHANGED,
            this.handleResourceChanged,
        );
        this.refreshValues();
    }

    public refreshValues(): void {
        for (const [resourceCode, valueTextObject] of this.valueTextByResourceTypeCode) {
            const resourceType = ResourceType.findByResourceTypeCode(resourceCode);
            if (resourceType !== null) {
                valueTextObject.setText(String(this.gameState.getResourceQuantity(resourceType)));
            }
        }
    }

    private handleResourceChanged = (payload: ResourceChangePayload): void => {
        const valueTextObject = this.valueTextByResourceTypeCode.get(payload.resourceTypeCode);
        if (valueTextObject !== undefined) {
            valueTextObject.setText(String(payload.currentQuantity));
        }
    };

    private static getSlotLabelText(resourceType: ResourceType): string {
        return resourceType.getDisplayName();
    }
}
