import Phaser from "phaser";

import { CausalChainPayload, EventBus, GameEventTypes } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { CausalChainCause, CausalChainDefinition } from "../domain/scenarios/Scenario";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class CausalChainComponent extends Phaser.GameObjects.Container {
    private readonly panelWidth: number;
    private readonly panelHeight: number;
    private readonly cardContainers: Phaser.GameObjects.Container[] = [];
    private readonly causeIdentifierByCardContainer: Map<Phaser.GameObjects.Container, string> = new Map();
    private readonly assignedCauseIdentifiersByColumn: string[][] = [[], [], []];
    private readonly columnLeftPositions: number[] = [0, 0, 0];
    private readonly cardHeightPx: number = 72;

    private columnTopY: number = 0;
    private columnHeightPx: number = 0;
    private cardWidthPx: number = 0;
    private draggedCardStartX: number = 0;
    private draggedCardStartY: number = 0;
    private feedbackTextObject: Phaser.GameObjects.Text | null = null;
    private hasCompletedOrdering: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.panelWidth = width;
        this.panelHeight = height;
        scene.add.existing(this);
        this.setSize(width, height);
    }

    public setChainDefinition(chainDefinition: CausalChainDefinition, gameState: GameState): void {
        this.removeAll(true);
        this.cardContainers.length = 0;
        this.causeIdentifierByCardContainer.clear();
        this.assignedCauseIdentifiersByColumn[0] = [];
        this.assignedCauseIdentifiersByColumn[1] = [];
        this.assignedCauseIdentifiersByColumn[2] = [];
        this.feedbackTextObject = null;
        this.hasCompletedOrdering = false;
        const titleTextObject = UiPanelFactory.createSectionHeader(this.scene, 16, 12, chainDefinition.chainTitle, 20);
        this.add(titleTextObject);
        const instructionTextObject = UiPanelFactory.createBodyText(
            this.scene,
            16,
            44,
            this.panelWidth - 32,
            "Drag each cause card into the column that matches its time scale, " +
                "and keep the causes within each column in their original order.",
            13,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(instructionTextObject);
        const marginX = 16;
        const columnGap = 12;
        const columnWidthPx = (this.panelWidth - 2 * marginX - 2 * columnGap) / 3;
        this.columnTopY = 100;
        this.columnHeightPx = Math.max(150, this.panelHeight - 336);
        this.cardWidthPx = columnWidthPx - 12;
        const columnLabels = ["Long-term (decades)", "Intermediate (years)", "Short-term (months)"];
        const columnGraphics = this.scene.add.graphics();
        for (let columnIndex = 0; columnIndex < 3; columnIndex++) {
            const columnX = marginX + columnIndex * (columnWidthPx + columnGap);
            this.columnLeftPositions[columnIndex] = columnX;
            columnGraphics.fillStyle(UiPalette.MID_OLIVE, 0.45);
            columnGraphics.fillRect(columnX, this.columnTopY, columnWidthPx, this.columnHeightPx);
            columnGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.9);
            columnGraphics.strokeRect(columnX + 0.5, this.columnTopY + 0.5, columnWidthPx - 1, this.columnHeightPx - 1);
        }
        this.add(columnGraphics);
        for (let columnIndex = 0; columnIndex < 3; columnIndex++) {
            const columnLabelTextObject = this.scene.add.text(
                this.columnLeftPositions[columnIndex] + 6,
                this.columnTopY + 6,
                columnLabels[columnIndex],
                {
                    fontFamily: FontFamilies.SMALL_CAPS,
                    fontSize: "12px",
                    color: UiPalette.HIGHLIGHT_BRASS_CSS,
                },
            );
            this.add(columnLabelTextObject);
        }
        const trayTopY = this.columnTopY + this.columnHeightPx + 14;
        const shuffledCauses = this.createShuffledCauses(chainDefinition.causes);
        for (let cardIndex = 0; cardIndex < shuffledCauses.length; cardIndex++) {
            const trayColumnIndex = cardIndex % 3;
            const trayRowIndex = Math.floor(cardIndex / 3);
            const cardX = marginX + trayColumnIndex * (columnWidthPx + columnGap) + 6;
            const cardY = trayTopY + trayRowIndex * (this.cardHeightPx + 8);
            this.createCauseCard(shuffledCauses[cardIndex], cardX, cardY);
        }
        const confirmButtonY = trayTopY + 2 * (this.cardHeightPx + 8) + 10;
        const confirmButton = UiPanelFactory.createBrassButton(
            this.scene,
            16,
            confirmButtonY,
            220,
            40,
            "Confirm Ordering",
            () => {
                this.handleConfirmOrdering(chainDefinition, gameState);
            },
        );
        this.add(confirmButton);
        this.feedbackTextObject = UiPanelFactory.createBodyText(
            this.scene,
            252,
            confirmButtonY + 10,
            this.panelWidth - 268,
            "",
            14,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.add(this.feedbackTextObject);
    }

    private createShuffledCauses(causes: CausalChainCause[]): CausalChainCause[] {
        const shufflableCauses = [...causes];
        for (let causeIndex = shufflableCauses.length - 1; causeIndex > 0; causeIndex--) {
            const swapIndex = Math.floor(Math.random() * (causeIndex + 1));
            const temporaryCause = shufflableCauses[causeIndex];
            shufflableCauses[causeIndex] = shufflableCauses[swapIndex];
            shufflableCauses[swapIndex] = temporaryCause;
        }
        return shufflableCauses;
    }

    private createCauseCard(cause: CausalChainCause, cardX: number, cardY: number): void {
        const cardContainer = this.scene.add.container(cardX, cardY);
        const cardGraphics = this.scene.add.graphics();
        cardGraphics.fillStyle(UiPalette.PARCHMENT, 1);
        cardGraphics.fillRect(0, 0, this.cardWidthPx, this.cardHeightPx);
        cardGraphics.lineStyle(2, UiPalette.DEEP_BRASS, 0.9);
        cardGraphics.strokeRect(1, 1, this.cardWidthPx - 2, this.cardHeightPx - 2);
        const cardTextObject = this.scene.add.text(6, 4, cause.causeText, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "12px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            wordWrap: { width: this.cardWidthPx - 12, useAdvancedWrap: true },
            lineSpacing: 2,
        });
        const cardZone = this.scene.add.zone(0, 0, this.cardWidthPx, this.cardHeightPx).setOrigin(0, 0);
        cardZone.setInteractive({ useHandCursor: true });
        this.scene.input.setDraggable(cardZone);
        cardZone.on("dragstart", () => {
            this.draggedCardStartX = cardContainer.x;
            this.draggedCardStartY = cardContainer.y;
        });
        cardZone.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            cardContainer.setPosition(this.draggedCardStartX + dragX, this.draggedCardStartY + dragY);
        });
        cardZone.on("dragend", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            this.handleCardDrop(cardContainer, this.draggedCardStartX + dragX, this.draggedCardStartY + dragY);
        });
        cardContainer.add(cardGraphics);
        cardContainer.add(cardTextObject);
        cardContainer.add(cardZone);
        this.add(cardContainer);
        this.cardContainers.push(cardContainer);
        this.causeIdentifierByCardContainer.set(cardContainer, cause.causeIdentifier);
    }

    private handleCardDrop(cardContainer: Phaser.GameObjects.Container, droppedX: number, droppedY: number): void {
        if (this.hasCompletedOrdering) {
            return;
        }
        const causeIdentifier = this.causeIdentifierByCardContainer.get(cardContainer) ?? "";
        let previousColumnIndex = -1;
        for (let columnIndex = 0; columnIndex < 3; columnIndex++) {
            const assignedCauseIdentifiers = this.assignedCauseIdentifiersByColumn[columnIndex];
            const existingIndex = assignedCauseIdentifiers.indexOf(causeIdentifier);
            if (existingIndex >= 0) {
                assignedCauseIdentifiers.splice(existingIndex, 1);
                previousColumnIndex = columnIndex;
            }
        }
        const targetColumnIndex = this.findColumnIndexAtPoint(
            droppedX + this.cardWidthPx / 2,
            droppedY + this.cardHeightPx / 2,
        );
        if (targetColumnIndex >= 0) {
            this.assignedCauseIdentifiersByColumn[targetColumnIndex].push(causeIdentifier);
            this.layoutColumnCards(targetColumnIndex);
        }
        if (previousColumnIndex >= 0 && previousColumnIndex !== targetColumnIndex) {
            this.layoutColumnCards(previousColumnIndex);
        }
    }

    private findColumnIndexAtPoint(pointX: number, pointY: number): number {
        if (pointY < this.columnTopY || pointY > this.columnTopY + this.columnHeightPx) {
            return -1;
        }
        for (let columnIndex = 0; columnIndex < 3; columnIndex++) {
            const columnLeftX = this.columnLeftPositions[columnIndex];
            if (pointX >= columnLeftX && pointX <= columnLeftX + this.cardWidthPx + 12) {
                return columnIndex;
            }
        }
        return -1;
    }

    private layoutColumnCards(columnIndex: number): void {
        const assignedCauseIdentifiers = this.assignedCauseIdentifiersByColumn[columnIndex];
        const columnX = this.columnLeftPositions[columnIndex];
        for (let cardIndex = 0; cardIndex < assignedCauseIdentifiers.length; cardIndex++) {
            const cardContainer = this.findCardContainerForCauseIdentifier(assignedCauseIdentifiers[cardIndex]);
            if (cardContainer !== null) {
                cardContainer.setPosition(columnX + 6, this.columnTopY + 26 + cardIndex * (this.cardHeightPx + 6));
            }
        }
    }

    private findCardContainerForCauseIdentifier(causeIdentifierToFind: string): Phaser.GameObjects.Container | null {
        for (const cardContainer of this.cardContainers) {
            if (this.causeIdentifierByCardContainer.get(cardContainer) === causeIdentifierToFind) {
                return cardContainer;
            }
        }
        return null;
    }

    private handleConfirmOrdering(chainDefinition: CausalChainDefinition, gameState: GameState): void {
        if (this.hasCompletedOrdering) {
            return;
        }
        if (this.isOrderingCorrect(chainDefinition)) {
            this.hasCompletedOrdering = true;
            gameState.setScenarioFlag(chainDefinition.chainIdentifier + "_complete");
            this.applyFactorTags(chainDefinition);
            this.setFeedbackText("Correct. Every cause is in the right time scale and order.");
            EventBus.getInstance().publish(
                GameEventTypes.CAUSAL_CHAIN_COMPLETED,
                new CausalChainPayload(chainDefinition.chainIdentifier, true),
            );
            return;
        }
        this.setFeedbackText(chainDefinition.chainHintText);
        EventBus.getInstance().publish(
            GameEventTypes.CAUSAL_CHAIN_FAILED,
            new CausalChainPayload(chainDefinition.chainIdentifier, false),
        );
    }

    private isOrderingCorrect(chainDefinition: CausalChainDefinition): boolean {
        const timeScaleCodes = ["long_term", "intermediate", "short_term"];
        for (let columnIndex = 0; columnIndex < timeScaleCodes.length; columnIndex++) {
            const expectedCauseIdentifiers: string[] = [];
            for (const cause of chainDefinition.causes) {
                if (cause.timeScale === timeScaleCodes[columnIndex]) {
                    expectedCauseIdentifiers.push(cause.causeIdentifier);
                }
            }
            const assignedCauseIdentifiers = this.assignedCauseIdentifiersByColumn[columnIndex];
            if (assignedCauseIdentifiers.length !== expectedCauseIdentifiers.length) {
                return false;
            }
            for (let causeIndex = 0; causeIndex < expectedCauseIdentifiers.length; causeIndex++) {
                if (assignedCauseIdentifiers[causeIndex] !== expectedCauseIdentifiers[causeIndex]) {
                    return false;
                }
            }
        }
        return true;
    }

    private applyFactorTags(chainDefinition: CausalChainDefinition): void {
        for (const cardContainer of this.cardContainers) {
            const causeIdentifier = this.causeIdentifierByCardContainer.get(cardContainer) ?? "";
            for (const cause of chainDefinition.causes) {
                if (cause.causeIdentifier === causeIdentifier) {
                    const tagText = cause.isInternalFactor ? "Internal factor" : "External factor";
                    const tagTextObject = this.scene.add.text(this.cardWidthPx - 6, this.cardHeightPx - 15, tagText, {
                        fontFamily: FontFamilies.SMALL_CAPS,
                        fontSize: "12px",
                        color: cause.isInternalFactor ? UiPalette.BLOOD_RED_CSS : UiPalette.DEEP_BRASS_CSS,
                    });
                    tagTextObject.setOrigin(1, 0);
                    cardContainer.add(tagTextObject);
                }
            }
        }
    }

    private setFeedbackText(feedbackText: string): void {
        if (this.feedbackTextObject !== null) {
            this.feedbackTextObject.setText(feedbackText);
        }
    }
}
