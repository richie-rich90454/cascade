import Phaser from "phaser";

import type { JournalEntry } from "../managers/AssessmentManager";
import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class JournalEntryComponent extends Phaser.GameObjects.Container {
    private static readonly PANEL_PADDING_PX = 20;

    private readonly panelWidthPx: number;

    private contentContainer: Phaser.GameObjects.Container | null;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_SIDEBAR);
        this.panelWidthPx = width;
        this.contentContainer = null;
    }

    public setJournalEntry(journalEntry: JournalEntry): void {
        this.clearContent();
        const scene = this.scene;
        const innerWidthPx = this.panelWidthPx - JournalEntryComponent.PANEL_PADDING_PX * 2;
        const headerTextObject = scene.add.text(0, 0, this.buildHeaderText(journalEntry), {
            fontFamily: FontFamilies.SMALL_CAPS,
            fontSize: "14px",
            color: UiPalette.DEEP_PARCHMENT_CSS,
            wordWrap: { width: innerWidthPx, useAdvancedWrap: true },
        });
        const promptTextObject = scene.add.text(0, 0, journalEntry.promptText, {
            fontFamily: FontFamilies.DISPLAY_SERIF,
            fontSize: "19px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            wordWrap: { width: innerWidthPx, useAdvancedWrap: true },
            lineSpacing: 5,
        });
        const responseTextObject = scene.add.text(0, 0, journalEntry.responseText, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "16px",
            color: UiPalette.NEAR_BLACK_LEATHER_CSS,
            wordWrap: { width: innerWidthPx, useAdvancedWrap: true },
            lineSpacing: 6,
        });
        const panelHeightPx =
            JournalEntryComponent.PANEL_PADDING_PX +
            headerTextObject.height +
            10 +
            promptTextObject.height +
            14 +
            10 +
            responseTextObject.height +
            JournalEntryComponent.PANEL_PADDING_PX;

        const contentContainer = scene.add.container(0, 0);
        contentContainer.add(
            UiPanelFactory.createPanelContainer(scene, 0, 0, this.panelWidthPx, panelHeightPx, PanelVariant.PARCHMENT),
        );

        let contentY = JournalEntryComponent.PANEL_PADDING_PX;
        headerTextObject.setPosition(JournalEntryComponent.PANEL_PADDING_PX, contentY);
        contentContainer.add(headerTextObject);
        contentY += headerTextObject.height + 10;
        promptTextObject.setPosition(JournalEntryComponent.PANEL_PADDING_PX, contentY);
        contentContainer.add(promptTextObject);
        contentY += promptTextObject.height + 14;

        const dividerGraphics = scene.add.graphics();
        dividerGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.8);
        dividerGraphics.lineBetween(
            JournalEntryComponent.PANEL_PADDING_PX,
            contentY,
            this.panelWidthPx - JournalEntryComponent.PANEL_PADDING_PX,
            contentY,
        );
        contentContainer.add(dividerGraphics);
        contentY += 10;

        responseTextObject.setPosition(JournalEntryComponent.PANEL_PADDING_PX, contentY);
        contentContainer.add(responseTextObject);

        this.contentContainer = contentContainer;
        this.add(contentContainer);
    }

    private buildHeaderText(journalEntry: JournalEntry): string {
        const categoryDisplayText = journalEntry.entryCategory.toUpperCase();
        return `SCENARIO ${journalEntry.scenarioNumber} — TURN ${journalEntry.turnNumber} — ${categoryDisplayText}`;
    }

    private clearContent(): void {
        if (this.contentContainer !== null) {
            this.contentContainer.destroy();
            this.contentContainer = null;
        }
    }
}
