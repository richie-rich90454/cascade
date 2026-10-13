import Phaser from "phaser";

import { EventBus, GameEventTypes, CausalChainPayload, UnlockPayload } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { FocusNodeDefinition, FocusTreeDefinition } from "../domain/scenarios/Scenario";
import { FocusNodeComponent } from "./FocusNodeComponent";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class FocusTreeComponent extends Phaser.GameObjects.Container {
    private static readonly NODE_SPACING_X_PX = 164;
    private static readonly NODE_SPACING_Y_PX = 140;
    private static readonly NODE_OFFSET_X_PX = 70;
    private static readonly NODE_OFFSET_Y_PX = 60;

    private readonly contentContainer: Phaser.GameObjects.Container;
    private readonly nodeComponentByNodeIdentifier: Map<string, FocusNodeComponent>;
    private readonly nodeDefinitionByNodeIdentifier: Map<string, FocusNodeDefinition>;
    private activeGameState: GameState | null;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.nodeComponentByNodeIdentifier = new Map<string, FocusNodeComponent>();
        this.nodeDefinitionByNodeIdentifier = new Map<string, FocusNodeDefinition>();
        this.activeGameState = null;
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_PANEL);
        this.setSize(width, height);
        this.contentContainer = scene.add.container(0, 0);
        this.add(this.contentContainer);
        EventBus.getInstance().subscribe<CausalChainPayload>(
            GameEventTypes.CAUSAL_CHAIN_COMPLETED,
            this.handleCausalChainCompleted,
        );
    }

    public setFocusTreeDefinition(focusTreeDefinition: FocusTreeDefinition, gameState: GameState): void {
        this.activeGameState = gameState;
        this.nodeComponentByNodeIdentifier.clear();
        this.nodeDefinitionByNodeIdentifier.clear();
        this.contentContainer.removeAll(true);

        const treeTitleTextObject = UiPanelFactory.createSectionHeader(
            this.scene,
            12,
            6,
            focusTreeDefinition.focusTreeTitle,
            14,
        );
        this.contentContainer.add(treeTitleTextObject);
        const connectorGraphics = this.scene.add.graphics();
        this.contentContainer.add(connectorGraphics);

        for (const nodeDefinition of focusTreeDefinition.focusNodes) {
            const nodeLeftX =
                nodeDefinition.gridColumnIndex * FocusTreeComponent.NODE_SPACING_X_PX +
                FocusTreeComponent.NODE_OFFSET_X_PX;
            const nodeTopY =
                nodeDefinition.gridRowIndex * FocusTreeComponent.NODE_SPACING_Y_PX +
                FocusTreeComponent.NODE_OFFSET_Y_PX;
            const focusNodeComponent = new FocusNodeComponent(
                this.scene,
                nodeLeftX,
                nodeTopY,
                nodeDefinition,
                gameState,
            );
            focusNodeComponent.setOnNodeClicked(() => this.handleNodeClicked(nodeDefinition));
            this.contentContainer.add(focusNodeComponent);
            this.nodeComponentByNodeIdentifier.set(nodeDefinition.nodeIdentifier, focusNodeComponent);
            this.nodeDefinitionByNodeIdentifier.set(nodeDefinition.nodeIdentifier, nodeDefinition);
        }

        // ponytail: straight center-to-center connectors, elbow routing if the tree grows deep
        connectorGraphics.lineStyle(2, UiPalette.DEEP_BRASS, 0.9);
        for (const nodeDefinition of focusTreeDefinition.focusNodes) {
            const targetNodeComponent = this.nodeComponentByNodeIdentifier.get(nodeDefinition.nodeIdentifier);
            if (targetNodeComponent === undefined) {
                continue;
            }
            for (const prerequisiteNodeIdentifier of nodeDefinition.prerequisiteNodeIdentifiers) {
                const prerequisiteNodeComponent = this.nodeComponentByNodeIdentifier.get(prerequisiteNodeIdentifier);
                if (prerequisiteNodeComponent === undefined) {
                    continue;
                }
                connectorGraphics.lineBetween(
                    prerequisiteNodeComponent.x + FocusNodeComponent.NODE_WIDTH_PX / 2,
                    prerequisiteNodeComponent.y + FocusNodeComponent.NODE_HEIGHT_PX / 2,
                    targetNodeComponent.x + FocusNodeComponent.NODE_WIDTH_PX / 2,
                    targetNodeComponent.y + FocusNodeComponent.NODE_HEIGHT_PX / 2,
                );
            }
        }
    }

    public refreshNodeStates(gameState: GameState): void {
        for (const [nodeIdentifier, nodeComponent] of this.nodeComponentByNodeIdentifier.entries()) {
            const nodeDefinition = this.nodeDefinitionByNodeIdentifier.get(nodeIdentifier);
            if (nodeDefinition === undefined) {
                continue;
            }
            const isCompleted = gameState.isScenarioFlagSet(
                "focus_node_" + FocusTreeComponent.getFlagBase(nodeDefinition.nodeIdentifier) + "_complete",
            );
            nodeComponent.setNodeCompleted(isCompleted);
            const isChainUnlockSatisfied =
                nodeDefinition.unlockedByCausalChainIdentifier.length === 0 ||
                gameState.isScenarioFlagSet(nodeDefinition.unlockedByCausalChainIdentifier + "_complete");
            nodeComponent.setNodeAvailable(isChainUnlockSatisfied);
        }
    }

    private handleNodeClicked(nodeDefinition: FocusNodeDefinition): void {
        const nodeComponent = this.nodeComponentByNodeIdentifier.get(nodeDefinition.nodeIdentifier);
        if (nodeComponent === undefined || this.activeGameState === null) {
            return;
        }
        if (!nodeComponent.isNodeAvailable() || nodeComponent.isNodeCompleted()) {
            return;
        }
        for (const prerequisiteNodeIdentifier of nodeDefinition.prerequisiteNodeIdentifiers) {
            const prerequisiteNodeComponent = this.nodeComponentByNodeIdentifier.get(prerequisiteNodeIdentifier);
            if (prerequisiteNodeComponent !== undefined && !prerequisiteNodeComponent.isNodeCompleted()) {
                return;
            }
        }
        nodeComponent.setNodeCompleted(true);
        this.activeGameState.setScenarioFlag(
            "focus_node_" + FocusTreeComponent.getFlagBase(nodeDefinition.nodeIdentifier) + "_complete",
        );
        EventBus.getInstance().publish(
            GameEventTypes.FOCUS_NODE_COMPLETED,
            new UnlockPayload(nodeDefinition.nodeIdentifier, nodeDefinition.nodeDisplayName),
        );
    }

    private handleCausalChainCompleted = (payload: CausalChainPayload): void => {
        for (const [nodeIdentifier, nodeComponent] of this.nodeComponentByNodeIdentifier.entries()) {
            const nodeDefinition = this.nodeDefinitionByNodeIdentifier.get(nodeIdentifier);
            if (nodeDefinition === undefined) {
                continue;
            }
            if (nodeDefinition.unlockedByCausalChainIdentifier === payload.chainIdentifier) {
                nodeComponent.setNodeAvailable(true);
                EventBus.getInstance().publish(
                    GameEventTypes.FOCUS_NODE_UNLOCKED,
                    new UnlockPayload(nodeDefinition.nodeIdentifier, nodeDefinition.nodeDisplayName),
                );
            }
        }
    };

    private static getFlagBase(nodeIdentifier: string): string {
        return nodeIdentifier.startsWith("focus_") ? nodeIdentifier.substring(6) : nodeIdentifier;
    }
}
