import Phaser from "phaser";

import { EventBus, GameEventTypes, MechanicCompletedPayload } from "../core/EventBus";
import type { GameState } from "../core/GameState";
import type { Nation } from "../domain/Nation";
import type { DiplomacyManager } from "../managers/DiplomacyManager";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { UiPanelFactory } from "./UiPanelFactory";

export class DiplomaticPlayComponent extends Phaser.GameObjects.Container {
    private static readonly CONTENT_INSET_PX = 12;

    private readonly componentWidthPx: number;
    private readonly contentContainer: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.componentWidthPx = width;
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_PANEL);
        this.setSize(width, height);
        this.contentContainer = scene.add.container(
            DiplomaticPlayComponent.CONTENT_INSET_PX,
            DiplomaticPlayComponent.CONTENT_INSET_PX,
        );
        this.add(this.contentContainer);
    }

    public setDiplomaticPlay(
        playerNation: Nation,
        targetNation: Nation,
        allNations: Nation[],
        diplomacyManager: DiplomacyManager,
        gameState: GameState,
    ): void {
        this.contentContainer.removeAll(true);
        let currentY = 0;
        const headerTextObject = UiPanelFactory.createSectionHeader(this.scene, 0, currentY, "Diplomatic Play", 18);
        this.contentContainer.add(headerTextObject);
        currentY += 28;

        const playerNationIdentifier = gameState.getPlayerNationIdentifier();
        const resolvedPlayerNation =
            allNations.find((nation) => nation.getIdentifier() === playerNationIdentifier) ?? playerNation;
        const playingAsTextObject = UiPanelFactory.createBodyText(
            this.scene,
            0,
            currentY,
            this.componentWidthPx - 24,
            "Playing as: " + resolvedPlayerNation.getDisplayName(),
            13,
            UiPalette.AGED_PARCHMENT_CSS,
        );
        this.contentContainer.add(playingAsTextObject);
        currentY += 26;

        const targetPanelGraphics = this.scene.add.graphics();
        targetPanelGraphics.fillStyle(UiPalette.MID_OLIVE, 1);
        targetPanelGraphics.fillRect(0, currentY, this.componentWidthPx - 24, 52);
        targetPanelGraphics.lineStyle(2, UiPalette.BRASS_TAN, 0.95);
        targetPanelGraphics.strokeRect(1, currentY + 1, this.componentWidthPx - 26, 50);
        this.contentContainer.add(targetPanelGraphics);
        const targetNameTextObject = this.scene.add.text(8, currentY + 8, "Target: " + targetNation.getDisplayName(), {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "14px",
            color: UiPalette.PARCHMENT_CSS,
        });
        const targetRelationTextObject = this.scene.add.text(
            8,
            currentY + 28,
            "Relation: " + diplomacyManager.getRelationScore(playerNation, targetNation),
            {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "13px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
            },
        );
        this.contentContainer.add(targetNameTextObject);
        this.contentContainer.add(targetRelationTextObject);
        currentY += 64;

        const likelyMovesHeaderTextObject = this.scene.add.text(0, currentY, "Likely Moves", {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "14px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
        });
        this.contentContainer.add(likelyMovesHeaderTextObject);
        currentY += 20;
        const likelyMoves = diplomacyManager.getLikelyMovesForNation(targetNation.getIdentifier()).slice(0, 3);
        const likelyMovesTextObject = UiPanelFactory.createBodyText(
            this.scene,
            0,
            currentY,
            this.componentWidthPx - 24,
            likelyMoves.join("\n"),
            13,
            UiPalette.PARCHMENT_CSS,
        );
        this.contentContainer.add(likelyMovesTextObject);
        currentY += likelyMovesTextObject.displayHeight + 10;

        const neutralNations = allNations
            .filter(
                (nation) =>
                    nation.getIdentifier() !== playerNation.getIdentifier() &&
                    nation.getIdentifier() !== targetNation.getIdentifier(),
            )
            .slice(0, 6);
        for (const neutralNation of neutralNations) {
            const neutralNameTextObject = this.scene.add.text(0, currentY + 6, neutralNation.getDisplayName(), {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "13px",
                color: UiPalette.PARCHMENT_CSS,
            });
            const swayChipContainer = this.createSwayChip(currentY, neutralNation, playerNation, diplomacyManager);
            this.contentContainer.add(neutralNameTextObject);
            this.contentContainer.add(swayChipContainer);
            currentY += 34;
        }
        currentY += 6;

        const demandConcessionsButton = UiPanelFactory.createBrassButton(
            this.scene,
            0,
            currentY,
            200,
            34,
            "Demand Concessions",
            () => {
                diplomacyManager.adjustRelationScore(playerNation, targetNation, -15);
            },
        );
        this.contentContainer.add(demandConcessionsButton);
        currentY += 42;
        const declareWarButton = UiPanelFactory.createBrassButton(
            this.scene,
            0,
            currentY,
            200,
            34,
            "Declare War",
            () => {
                diplomacyManager.declareWarBetween(playerNation, targetNation);
                EventBus.getInstance().publish(
                    GameEventTypes.DIPLOMATIC_PLAY_RESOLVED,
                    new MechanicCompletedPayload("diplomatic_play_declared_war", 0),
                );
            },
        );
        this.contentContainer.add(declareWarButton);
        currentY += 42;
        const backDownButton = UiPanelFactory.createBrassButton(this.scene, 0, currentY, 200, 34, "Back Down", () => {
            diplomacyManager.adjustRelationScore(playerNation, targetNation, 5);
            EventBus.getInstance().publish(
                GameEventTypes.DIPLOMATIC_PLAY_RESOLVED,
                new MechanicCompletedPayload("diplomatic_play_concluded", 0),
            );
        });
        this.contentContainer.add(backDownButton);
    }

    private createSwayChip(
        rowTopY: number,
        neutralNation: Nation,
        playerNation: Nation,
        diplomacyManager: DiplomacyManager,
    ): Phaser.GameObjects.Container {
        const chipWidthPx = 80;
        const chipHeightPx = 28;
        const chipContainer = this.scene.add.container(this.componentWidthPx - 24 - chipWidthPx, rowTopY);
        const chipGraphics = this.scene.add.graphics();
        chipGraphics.fillStyle(UiPalette.DEEP_BRASS, 1);
        chipGraphics.fillRect(0, 0, chipWidthPx, chipHeightPx);
        chipGraphics.lineStyle(2, UiPalette.HIGHLIGHT_BRASS, 0.9);
        chipGraphics.strokeRect(1, 1, chipWidthPx - 2, chipHeightPx - 2);
        const chipLabelTextObject = this.scene.add.text(chipWidthPx / 2, chipHeightPx / 2, "Sway", {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "13px",
            color: UiPalette.PARCHMENT_CSS,
        });
        chipLabelTextObject.setOrigin(0.5, 0.5);
        const chipZone = this.scene.add.zone(0, 0, chipWidthPx, chipHeightPx).setOrigin(0, 0);
        chipZone.setInteractive({ useHandCursor: true });
        chipZone.on("pointerup", () => {
            diplomacyManager.adjustRelationScore(neutralNation, playerNation, 8);
            chipZone.disableInteractive();
            chipGraphics.clear();
            chipGraphics.fillStyle(UiPalette.MID_OLIVE, 1);
            chipGraphics.fillRect(0, 0, chipWidthPx, chipHeightPx);
            chipGraphics.lineStyle(2, UiPalette.FIELD_GRAY, 0.9);
            chipGraphics.strokeRect(1, 1, chipWidthPx - 2, chipHeightPx - 2);
            chipLabelTextObject.setText("Swayed");
            chipLabelTextObject.setColor(UiPalette.PARCHMENT_CSS);
        });
        chipContainer.add(chipGraphics);
        chipContainer.add(chipLabelTextObject);
        chipContainer.add(chipZone);
        return chipContainer;
    }
}
