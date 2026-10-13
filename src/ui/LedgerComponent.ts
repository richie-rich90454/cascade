import Phaser from "phaser";

import { FontFamilies } from "../managers/FontManager";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class LedgerComponent extends Phaser.GameObjects.Container {
    private static readonly ROW_TEXT_COUNT = 15;
    private static readonly VISIBLE_DATA_ROW_COUNT = 14;
    private static readonly TAB_CHIP_HEIGHT_PX = 30;
    private static readonly TAB_CHIP_GAP_PX = 8;
    private static readonly TAB_ROW_Y_PX = 10;
    private static readonly TAB_UNDERLINE_Y_PX = 42;
    private static readonly ROW_AREA_TOP_PX = 52;
    private static readonly ROW_BOTTOM_PADDING_PX = 10;
    private static readonly ROW_TEXT_LEFT_PX = 14;
    private static readonly CHARACTER_SLOT_WIDTH_PX = 8;
    private static readonly DATA_FONT_SIZE_PX = 13;
    private static readonly MINIMUM_COLUMN_WIDTH_CHARS = 4;

    private readonly ledgerWidthPx: number;
    private readonly rowHeightPx: number;
    private readonly tabButtonContainers: Phaser.GameObjects.Container[];
    private readonly tabStartXByName: Map<string, number>;
    private readonly tabWidthByName: Map<string, number>;
    private readonly headerRowsByTabName: Map<string, string[]>;
    private readonly dataRowsByTabName: Map<string, string[][]>;
    private readonly tabUnderlineGraphics: Phaser.GameObjects.Graphics;
    private readonly rowBackgroundGraphics: Phaser.GameObjects.Graphics;
    private readonly rowTextObjects: Phaser.GameObjects.Text[];

    private activeTabName: string | null;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_SIDEBAR);
        this.ledgerWidthPx = width;
        this.rowHeightPx =
            (height - LedgerComponent.ROW_AREA_TOP_PX - LedgerComponent.ROW_BOTTOM_PADDING_PX) /
            LedgerComponent.ROW_TEXT_COUNT;
        this.rowTextObjects = [];
        this.tabButtonContainers = [];
        this.tabStartXByName = new Map<string, number>();
        this.tabWidthByName = new Map<string, number>();
        this.headerRowsByTabName = new Map<string, string[]>();
        this.dataRowsByTabName = new Map<string, string[][]>();
        this.activeTabName = null;
        this.add(UiPanelFactory.createPanelContainer(scene, 0, 0, width, height, PanelVariant.LEDGER));
        this.rowBackgroundGraphics = scene.add.graphics();
        this.add(this.rowBackgroundGraphics);
        for (let rowIndex = 0; rowIndex < LedgerComponent.ROW_TEXT_COUNT; rowIndex += 1) {
            const isHeaderRow = rowIndex === 0;
            const rowTextObject = scene.add.text(LedgerComponent.ROW_TEXT_LEFT_PX, this.getRowCenterY(rowIndex), "", {
                fontFamily: isHeaderRow ? FontFamilies.TYPEWRITER_HEADER : FontFamilies.TYPEWRITER_BODY,
                fontSize: `${LedgerComponent.DATA_FONT_SIZE_PX}px`,
                color: isHeaderRow ? UiPalette.HIGHLIGHT_BRASS_CSS : UiPalette.AGED_PARCHMENT_CSS,
            });
            rowTextObject.setOrigin(0, 0.5);
            rowTextObject.setVisible(false);
            this.add(rowTextObject);
            this.rowTextObjects.push(rowTextObject);
        }
        this.tabUnderlineGraphics = scene.add.graphics();
        this.add(this.tabUnderlineGraphics);
    }

    public setTabs(tabNames: string[]): void {
        for (const tabButtonContainer of this.tabButtonContainers) {
            tabButtonContainer.destroy();
        }
        this.tabButtonContainers.length = 0;
        this.tabStartXByName.clear();
        this.tabWidthByName.clear();
        let cursorX = 12;
        for (const tabName of tabNames) {
            const tabWidthPx = Math.max(90, tabName.length * 10 + 24);
            const tabButtonContainer = UiPanelFactory.createBrassButton(
                this.scene,
                cursorX,
                LedgerComponent.TAB_ROW_Y_PX,
                tabWidthPx,
                LedgerComponent.TAB_CHIP_HEIGHT_PX,
                tabName,
                () => {
                    this.setActiveTab(tabName);
                },
            );
            this.tabButtonContainers.push(tabButtonContainer);
            this.tabStartXByName.set(tabName, cursorX);
            this.tabWidthByName.set(tabName, tabWidthPx);
            this.add(tabButtonContainer);
            cursorX += tabWidthPx + LedgerComponent.TAB_CHIP_GAP_PX;
        }
        if (this.activeTabName === null && tabNames.length > 0) {
            this.setActiveTab(tabNames[0]);
        }
    }

    public setRowsForTab(tabName: string, headerRow: string[], dataRows: string[][]): void {
        this.headerRowsByTabName.set(tabName, headerRow);
        this.dataRowsByTabName.set(tabName, dataRows);
        if (tabName === this.activeTabName) {
            this.renderActiveTabRows();
        }
    }

    public setActiveTab(tabName: string): void {
        this.activeTabName = tabName;
        this.drawActiveTabUnderline();
        this.renderActiveTabRows();
    }

    private drawActiveTabUnderline(): void {
        this.tabUnderlineGraphics.clear();
        if (this.activeTabName === null) {
            return;
        }
        const tabStartX = this.tabStartXByName.get(this.activeTabName);
        const tabWidthPx = this.tabWidthByName.get(this.activeTabName);
        if (tabStartX === undefined || tabWidthPx === undefined) {
            return;
        }
        this.tabUnderlineGraphics.lineStyle(3, UiPalette.HIGHLIGHT_BRASS, 1);
        this.tabUnderlineGraphics.lineBetween(
            tabStartX + 2,
            LedgerComponent.TAB_UNDERLINE_Y_PX,
            tabStartX + tabWidthPx - 2,
            LedgerComponent.TAB_UNDERLINE_Y_PX,
        );
    }

    private renderActiveTabRows(): void {
        this.rowBackgroundGraphics.clear();
        const formattedLines = this.buildFormattedLinesForActiveTab();
        for (let rowIndex = 0; rowIndex < LedgerComponent.ROW_TEXT_COUNT; rowIndex += 1) {
            const rowTextObject = this.rowTextObjects[rowIndex];
            const lineText = rowIndex < formattedLines.length ? formattedLines[rowIndex] : "";
            rowTextObject.setText(lineText);
            rowTextObject.setVisible(lineText.length > 0);
            if (lineText.length === 0) {
                continue;
            }
            const rowTopY = LedgerComponent.ROW_AREA_TOP_PX + rowIndex * this.rowHeightPx;
            const rowFillColor =
                rowIndex === 0
                    ? UiPalette.NEAR_BLACK_LEATHER
                    : rowIndex % 2 === 1
                      ? UiPalette.DARK_OLIVE
                      : UiPalette.MID_OLIVE;
            this.rowBackgroundGraphics.fillStyle(rowFillColor, 0.9);
            this.rowBackgroundGraphics.fillRect(6, rowTopY, this.ledgerWidthPx - 12, this.rowHeightPx);
            this.rowBackgroundGraphics.lineStyle(1, UiPalette.DEEP_BRASS, 0.6);
            this.rowBackgroundGraphics.lineBetween(
                6,
                rowTopY + this.rowHeightPx,
                this.ledgerWidthPx - 6,
                rowTopY + this.rowHeightPx,
            );
        }
    }

    private buildFormattedLinesForActiveTab(): string[] {
        if (this.activeTabName === null) {
            return [];
        }
        const headerRow = this.headerRowsByTabName.get(this.activeTabName) ?? [];
        const dataRows = this.dataRowsByTabName.get(this.activeTabName) ?? [];
        const visibleDataRows = dataRows.slice(0, LedgerComponent.VISIBLE_DATA_ROW_COUNT);
        const allRows: string[][] = [headerRow];
        for (const dataRow of visibleDataRows) {
            allRows.push(dataRow);
        }
        const columnWidths = this.computeColumnCharacterWidths(allRows);
        if (columnWidths.length === 0) {
            return [];
        }
        const formattedLines: string[] = [];
        for (const row of allRows) {
            const formattedCells: string[] = [];
            for (let columnIndex = 0; columnIndex < columnWidths.length; columnIndex += 1) {
                const cellText = columnIndex < row.length ? row[columnIndex] : "";
                formattedCells.push(LedgerComponent.formatColumnCell(cellText, columnWidths[columnIndex]));
            }
            formattedLines.push(formattedCells.join("").trimEnd());
        }
        return formattedLines;
    }

    private computeColumnCharacterWidths(rows: string[][]): number[] {
        let maximumColumnCount = 0;
        for (const row of rows) {
            maximumColumnCount = Math.max(maximumColumnCount, row.length);
        }
        if (maximumColumnCount === 0) {
            return [];
        }
        const maximumLengthsByColumn: number[] = [];
        for (let columnIndex = 0; columnIndex < maximumColumnCount; columnIndex += 1) {
            let maximumCellLength = 1;
            for (const row of rows) {
                if (columnIndex < row.length) {
                    maximumCellLength = Math.max(maximumCellLength, row[columnIndex].length);
                }
            }
            maximumLengthsByColumn.push(maximumCellLength + 2);
        }
        const totalMaximumLength = maximumLengthsByColumn.reduce(
            (lengthSum, columnLength) => lengthSum + columnLength,
            0,
        );
        const characterBudget = Math.max(
            20,
            Math.floor((this.ledgerWidthPx - 28) / LedgerComponent.CHARACTER_SLOT_WIDTH_PX),
        );
        return maximumLengthsByColumn.map((columnLength) =>
            Math.max(
                LedgerComponent.MINIMUM_COLUMN_WIDTH_CHARS,
                Math.floor((columnLength / totalMaximumLength) * characterBudget),
            ),
        );
    }

    private static formatColumnCell(cellText: string, columnWidthChars: number): string {
        if (cellText.length > columnWidthChars) {
            if (columnWidthChars <= 3) {
                return cellText.slice(0, Math.max(0, columnWidthChars));
            }
            return cellText.slice(0, columnWidthChars - 3) + "...";
        }
        return cellText.padEnd(columnWidthChars);
    }

    private getRowCenterY(rowIndex: number): number {
        return LedgerComponent.ROW_AREA_TOP_PX + rowIndex * this.rowHeightPx + this.rowHeightPx / 2;
    }
}
