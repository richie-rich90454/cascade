import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { HighDpiConfigurator } from "../core/HighDpiConfigurator";
import { SceneKeys } from "../core/SceneKeys";
import { AssetManager } from "../managers/AssetManager";
import { FontFamilies, FontManager } from "../managers/FontManager";
import { UiPalette } from "../ui/UiPalette";

export class BootScene extends Phaser.Scene {
    private static readonly LOADING_BAR_WIDTH_PX = 420;
    private static readonly LOADING_BAR_HEIGHT_PX = 8;
    private static readonly LOADING_BAR_OFFSET_BELOW_CENTER_PX = 44;

    public constructor() {
        super({ key: SceneKeys.BOOT });
    }

    public create(): void {
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        this.add
            .rectangle(0, this.scale.height / 2 - 130, this.scale.width, 260, UiPalette.DARK_OLIVE)
            .setOrigin(0, 0)
            .setAlpha(0.5);
        const screenCenterX = this.scale.width / 2;
        const screenCenterY = this.scale.height / 2;
        this.add
            .text(screenCenterX, screenCenterY - 80, "CASCADE", {
                fontFamily: FontFamilies.GOTHIC,
                fontSize: "56px",
                color: UiPalette.HIGHLIGHT_BRASS_CSS,
            })
            .setOrigin(0.5, 0.5);
        const loadingStatusText = this.add
            .text(screenCenterX, screenCenterY - 16, "Loading...", {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "15px",
                color: UiPalette.AGED_PARCHMENT_CSS,
            })
            .setOrigin(0.5, 0.5);
        const loadingBarBackground = this.add.graphics();
        loadingBarBackground.fillStyle(UiPalette.DARK_OLIVE, 1);
        loadingBarBackground.fillRect(
            this.getLoadingBarLeftX(),
            this.getLoadingBarTopY(),
            BootScene.LOADING_BAR_WIDTH_PX,
            BootScene.LOADING_BAR_HEIGHT_PX,
        );
        loadingBarBackground.lineStyle(1, UiPalette.DEEP_BRASS, 0.9);
        loadingBarBackground.strokeRect(
            this.getLoadingBarLeftX() - 1,
            this.getLoadingBarTopY() - 1,
            BootScene.LOADING_BAR_WIDTH_PX + 2,
            BootScene.LOADING_BAR_HEIGHT_PX + 2,
        );
        const loadingBarFill = this.add.graphics();
        void this.runBootSequence(loadingStatusText, loadingBarFill);
    }

    private static isRuntimePriorityAsset(assetIdentifier: string): boolean {
        if (assetIdentifier.startsWith("tile_")) {
            return false;
        }
        if (assetIdentifier.startsWith("counter_")) {
            return false;
        }
        if (/_alt_0\d$/.test(assetIdentifier)) {
            return false;
        }
        if (/^pattern_.*_v0\d$/.test(assetIdentifier)) {
            return false;
        }
        if (
            assetIdentifier.endsWith("_wide") ||
            assetIdentifier.endsWith("_tall") ||
            assetIdentifier.endsWith("_small")
        ) {
            return false;
        }
        if (/^scenario_\d+_icon_banner$/.test(assetIdentifier)) {
            return false;
        }
        return true;
    }

    private async runBootSequence(
        loadingStatusText: Phaser.GameObjects.Text,
        loadingBarFill: Phaser.GameObjects.Graphics,
    ): Promise<void> {
        try {
            loadingStatusText.setText("Loading fonts...");
            await FontManager.getInstance().loadAllFonts();
            loadingStatusText.setText("Loading asset manifest...");
            await AssetManager.getInstance().loadManifest();
            const svgEntries = AssetManager.getInstance()
                .getSvgEntries()
                .filter((svgEntry) => BootScene.isRuntimePriorityAsset(svgEntry.assetIdentifier));
            const devicePixelRatioForTextureLoading = HighDpiConfigurator.getInstance().getDevicePixelRatio();
            loadingStatusText.setText("Queueing artwork... 0 of " + svgEntries.length);
            let queuedEntryCount = 0;
            for (const svgEntry of svgEntries) {
                this.load.svg(
                    AssetManager.getInstance().getTextureKey(svgEntry.assetIdentifier),
                    svgEntry.relativeFilePath,
                    {
                        width: Math.ceil(svgEntry.pixelWidth * devicePixelRatioForTextureLoading),
                        height: Math.ceil(svgEntry.pixelHeight * devicePixelRatioForTextureLoading),
                    },
                );
                queuedEntryCount += 1;
                loadingStatusText.setText("Queueing artwork... " + queuedEntryCount + " of " + svgEntries.length);
            }
            if (svgEntries.length > 0) {
                loadingStatusText.setText("Loading artwork...");
                await new Promise<void>((resolveCompletion) => {
                    this.load.on("progress", (progressValue: number) => {
                        this.drawLoadingBarFill(loadingBarFill, progressValue);
                    });
                    this.load.once("complete", () => {
                        resolveCompletion();
                    });
                    this.load.start();
                });
            }
            this.drawLoadingBarFill(loadingBarFill, 1);
            loadingStatusText.setText("Preparing music...");
            await GameSession.getInstance().getAudioManager().loadAndRegisterParsedSequencesFromManifest();
            this.appendVignetteOverlay();
        } catch (bootError) {
            console.error(
                "Cascade boot sequence failed to load external assets. Starting the main menu in zero-asset mode.",
                bootError,
            );
        }
        this.scene.start(SceneKeys.MAIN_MENU);
    }

    private drawLoadingBarFill(loadingBarFill: Phaser.GameObjects.Graphics, fillRatio: number): void {
        const clampedFillRatio = Phaser.Math.Clamp(fillRatio, 0, 1);
        loadingBarFill.clear();
        loadingBarFill.fillStyle(UiPalette.HIGHLIGHT_BRASS, 1);
        loadingBarFill.fillRect(
            this.getLoadingBarLeftX() + 1,
            this.getLoadingBarTopY() + 1,
            Math.max(0, (BootScene.LOADING_BAR_WIDTH_PX - 2) * clampedFillRatio),
            BootScene.LOADING_BAR_HEIGHT_PX - 2,
        );
    }

    private getLoadingBarLeftX(): number {
        return this.scale.width / 2 - BootScene.LOADING_BAR_WIDTH_PX / 2;
    }

    private getLoadingBarTopY(): number {
        return this.scale.height / 2 + BootScene.LOADING_BAR_OFFSET_BELOW_CENTER_PX;
    }

    private appendVignetteOverlay(): void {
        const vignetteElement = document.createElement("div");
        vignetteElement.className = "vignette-overlay";
        document.getElementById("cascade-game-root")?.appendChild(vignetteElement);
    }
}
