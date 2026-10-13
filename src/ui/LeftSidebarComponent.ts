import Phaser from "phaser";

import { EventBus, GameEventTypes, MapModeSelectedPayload } from "../core/EventBus";
import { UiPalette } from "./UiPalette";
import { PanelVariant, UiPanelFactory } from "./UiPanelFactory";

export class MapModeOption {
    public static readonly POLITICAL = new MapModeOption(
        "political",
        "Political",
        "Political boundaries and national control.",
    );
    public static readonly TERRAIN = new MapModeOption(
        "terrain",
        "Terrain",
        "Mountains, rivers, forests, and the shape of the land.",
    );
    public static readonly RESOURCE = new MapModeOption(
        "resource",
        "Resource",
        "Resource production and strategic materials by province.",
    );
    public static readonly DIPLOMATIC = new MapModeOption(
        "diplomatic",
        "Diplomatic",
        "Alliances, wars, and the diplomatic alignments of the powers.",
    );
    public static readonly FACTION = new MapModeOption(
        "faction",
        "Faction",
        "Domestic factions and their influence within the state.",
    );
    public static readonly WAR = new MapModeOption("war", "War", "Front lines, battles, and occupied territory.");
    public static readonly CASUALTIES = new MapModeOption(
        "casualties",
        "Casualties",
        "Military and civilian losses suffered across the provinces.",
    );
    public static readonly SUPPLY = new MapModeOption("supply", "Supply", "Supply routes and the reach of logistics.");
    public static readonly INTELLIGENCE = new MapModeOption(
        "intelligence",
        "Intelligence",
        "Intelligence coverage and source networks.",
    );

    private readonly mapModeCode: string;
    private readonly mapModeDisplayName: string;
    private readonly mapModeDescription: string;

    private constructor(mapModeCode: string, mapModeDisplayName: string, mapModeDescription: string) {
        this.mapModeCode = mapModeCode;
        this.mapModeDisplayName = mapModeDisplayName;
        this.mapModeDescription = mapModeDescription;
    }

    public getMapModeCode(): string {
        return this.mapModeCode;
    }

    public getDisplayName(): string {
        return this.mapModeDisplayName;
    }

    public getDescription(): string {
        return this.mapModeDescription;
    }

    public static getAllMapModeOptions(): MapModeOption[] {
        return [
            MapModeOption.POLITICAL,
            MapModeOption.TERRAIN,
            MapModeOption.RESOURCE,
            MapModeOption.DIPLOMATIC,
            MapModeOption.FACTION,
            MapModeOption.WAR,
            MapModeOption.CASUALTIES,
            MapModeOption.SUPPLY,
            MapModeOption.INTELLIGENCE,
        ];
    }
}

export class LeftSidebarComponent extends Phaser.GameObjects.Container {
    public static readonly SIDEBAR_WIDTH_PX = 132;

    private static readonly BUTTON_WIDTH_PX = 116;
    private static readonly BUTTON_HEIGHT_PX = 40;
    private static readonly BUTTON_SPACING_PX = 46;
    private static readonly BUTTON_START_Y_PX = 12;

    private activeMapModeCode: string;
    private readonly activeHighlightGraphics: Phaser.GameObjects.Graphics;
    private readonly buttonTopYByMapModeCode: Map<string, number>;

    constructor(scene: Phaser.Scene, x: number, y: number, height: number, initialMapModeCode: string) {
        super(scene, x, y);
        this.activeMapModeCode = initialMapModeCode;
        this.buttonTopYByMapModeCode = new Map<string, number>();
        scene.add.existing(this);
        this.setDepth(UiPalette.UI_DEPTH_SIDEBAR);

        const sidebarPanelContainer = UiPanelFactory.createPanelContainer(
            scene,
            0,
            0,
            LeftSidebarComponent.SIDEBAR_WIDTH_PX,
            height,
            PanelVariant.LEATHER,
        );
        this.add(sidebarPanelContainer);

        const mapModeOptions = MapModeOption.getAllMapModeOptions();
        for (let optionIndex = 0; optionIndex < mapModeOptions.length; optionIndex++) {
            const mapModeOption = mapModeOptions[optionIndex];
            const buttonTopY =
                LeftSidebarComponent.BUTTON_START_Y_PX + optionIndex * LeftSidebarComponent.BUTTON_SPACING_PX;
            this.buttonTopYByMapModeCode.set(mapModeOption.getMapModeCode(), buttonTopY);
            const buttonContainer = UiPanelFactory.createBrassButton(
                scene,
                8,
                buttonTopY,
                LeftSidebarComponent.BUTTON_WIDTH_PX,
                LeftSidebarComponent.BUTTON_HEIGHT_PX,
                mapModeOption.getDisplayName(),
                () => this.handleMapModeButtonClicked(mapModeOption),
            );
            this.add(buttonContainer);
        }

        this.activeHighlightGraphics = scene.add.graphics();
        this.add(this.activeHighlightGraphics);
        this.redrawActiveHighlight();
    }

    public setActiveMapMode(mapModeCode: string): void {
        this.activeMapModeCode = mapModeCode;
        this.redrawActiveHighlight();
    }

    public getActiveMapModeCode(): string {
        return this.activeMapModeCode;
    }

    private handleMapModeButtonClicked(mapModeOption: MapModeOption): void {
        this.setActiveMapMode(mapModeOption.getMapModeCode());
        EventBus.getInstance().publish(
            GameEventTypes.UI_MAP_MODE_SELECTED,
            new MapModeSelectedPayload(mapModeOption.getMapModeCode()),
        );
    }

    private redrawActiveHighlight(): void {
        this.activeHighlightGraphics.clear();
        const buttonTopY = this.buttonTopYByMapModeCode.get(this.activeMapModeCode);
        if (buttonTopY === undefined) {
            return;
        }
        this.activeHighlightGraphics.fillStyle(UiPalette.HIGHLIGHT_BRASS, 0.16);
        this.activeHighlightGraphics.fillRect(6, buttonTopY - 2, 120, 44);
        this.activeHighlightGraphics.lineStyle(3, UiPalette.HIGHLIGHT_BRASS, 1);
        this.activeHighlightGraphics.strokeRect(8, buttonTopY, 116, 40);
    }
}
