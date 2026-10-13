import Phaser from "phaser";

import type { GameState } from "../core/GameState";
import type { FocusNodeDefinition } from "../domain/scenarios/Scenario";
import { FontFamilies } from "../managers/FontManager";
import { TooltipComponent } from "./TooltipComponent";
import { UiPalette } from "./UiPalette";

export class FocusNodeComponent extends Phaser.GameObjects.Container {
    public static readonly NODE_WIDTH_PX = 140;
    public static readonly NODE_HEIGHT_PX = 92;

    private readonly frameGraphics: Phaser.GameObjects.Graphics;
    private readonly nodeNameTextObject: Phaser.GameObjects.Text;
    private readonly checkMarkTextObject: Phaser.GameObjects.Text;
    private isAvailable: boolean;
    private isCompleted: boolean;
    private onNodeClicked: (() => void) | null;

    constructor(scene: Phaser.Scene, x: number, y: number, nodeDefinition: FocusNodeDefinition, gameState: GameState) {
        super(scene, x, y);
        this.isCompleted = gameState.isScenarioFlagSet(
            "focus_node_" + FocusNodeComponent.getFlagBase(nodeDefinition.nodeIdentifier) + "_complete",
        );
        this.isAvailable =
            this.isCompleted ||
            nodeDefinition.unlockedByCausalChainIdentifier.length === 0 ||
            gameState.isScenarioFlagSet(nodeDefinition.unlockedByCausalChainIdentifier + "_complete");
        this.onNodeClicked = null;
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_PANEL);
        this.setSize(FocusNodeComponent.NODE_WIDTH_PX, FocusNodeComponent.NODE_HEIGHT_PX);

        this.frameGraphics = scene.add.graphics();
        this.nodeNameTextObject = scene.add.text(8, 8, nodeDefinition.nodeDisplayName, {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "12px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            wordWrap: { width: FocusNodeComponent.NODE_WIDTH_PX - 16, useAdvancedWrap: true },
            lineSpacing: 2,
        });
        this.checkMarkTextObject = scene.add.text(
            FocusNodeComponent.NODE_WIDTH_PX - 26,
            FocusNodeComponent.NODE_HEIGHT_PX - 34,
            "✓",
            {
                fontFamily: FontFamilies.DISPLAY_SERIF,
                fontSize: "24px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
            },
        );
        const nodeZone = scene.add
            .zone(0, 0, FocusNodeComponent.NODE_WIDTH_PX, FocusNodeComponent.NODE_HEIGHT_PX)
            .setOrigin(0, 0);
        nodeZone.setInteractive({ useHandCursor: true });
        nodeZone.on("pointerup", () => {
            if (this.onNodeClicked !== null) {
                this.onNodeClicked();
            }
        });
        const nodeTooltip = new TooltipComponent(scene, x, y + FocusNodeComponent.NODE_HEIGHT_PX + 8, 240);
        nodeTooltip.attachToTargetZone(nodeZone, nodeDefinition.nodeDisplayName, () => [
            nodeDefinition.historicalSummary,
            nodeDefinition.nodeEffectsSummary,
        ]);

        this.add(this.frameGraphics);
        this.add(this.nodeNameTextObject);
        this.add(this.checkMarkTextObject);
        this.add(nodeZone);
        this.redrawNodeVisualState();
    }

    public setNodeAvailable(isAvailable: boolean): void {
        this.isAvailable = isAvailable;
        this.redrawNodeVisualState();
    }

    public setNodeCompleted(isCompleted: boolean): void {
        this.isCompleted = isCompleted;
        this.redrawNodeVisualState();
    }

    public isNodeAvailable(): boolean {
        return this.isAvailable;
    }

    public isNodeCompleted(): boolean {
        return this.isCompleted;
    }

    public setOnNodeClicked(onNodeClicked: () => void): void {
        this.onNodeClicked = onNodeClicked;
    }

    private redrawNodeVisualState(): void {
        const fillColor = this.isCompleted
            ? UiPalette.DEEP_BRASS
            : this.isAvailable
              ? UiPalette.BRIGHT_BRASS
              : UiPalette.FIELD_GRAY;
        this.frameGraphics.clear();
        if (this.isAvailable && !this.isCompleted) {
            this.frameGraphics.lineStyle(3, UiPalette.HIGHLIGHT_BRASS, 0.35);
            this.frameGraphics.strokeRect(
                -3,
                -3,
                FocusNodeComponent.NODE_WIDTH_PX + 6,
                FocusNodeComponent.NODE_HEIGHT_PX + 6,
            );
        }
        this.frameGraphics.fillStyle(fillColor, 1);
        this.frameGraphics.fillRect(0, 0, FocusNodeComponent.NODE_WIDTH_PX, FocusNodeComponent.NODE_HEIGHT_PX);
        this.frameGraphics.lineStyle(3, UiPalette.DEEP_BRASS, 1);
        this.frameGraphics.strokeRect(
            1.5,
            1.5,
            FocusNodeComponent.NODE_WIDTH_PX - 3,
            FocusNodeComponent.NODE_HEIGHT_PX - 3,
        );
        this.frameGraphics.lineStyle(1, UiPalette.BRASS_TAN, 0.9);
        this.frameGraphics.strokeRect(
            5,
            5,
            FocusNodeComponent.NODE_WIDTH_PX - 10,
            FocusNodeComponent.NODE_HEIGHT_PX - 10,
        );
        this.nodeNameTextObject.setColor(
            this.isAvailable && !this.isCompleted ? UiPalette.NEAR_BLACK_LEATHER_CSS : UiPalette.PARCHMENT_CSS,
        );
        this.checkMarkTextObject.setVisible(this.isCompleted);
    }

    private static getFlagBase(nodeIdentifier: string): string {
        return nodeIdentifier.startsWith("focus_") ? nodeIdentifier.substring(6) : nodeIdentifier;
    }
}
