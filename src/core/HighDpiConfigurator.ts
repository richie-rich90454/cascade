import Phaser from "phaser";
import { getTextScale } from "./AccessibilityPreferences";

export class HighDpiConfigurator {
    private static readonly MAXIMUM_DEVICE_PIXEL_RATIO = 2;
    private static readonly SINGLETON_INSTANCE = new HighDpiConfigurator();

    private devicePixelRatioValue: number;
    private hasInstalledTextPatch: boolean;

    private constructor() {
        const detectedDevicePixelRatio = typeof window === "undefined" ? 1 : window.devicePixelRatio;
        const finiteDevicePixelRatio =
            Number.isFinite(detectedDevicePixelRatio) && detectedDevicePixelRatio > 0 ? detectedDevicePixelRatio : 1;
        this.devicePixelRatioValue = Math.min(finiteDevicePixelRatio, HighDpiConfigurator.MAXIMUM_DEVICE_PIXEL_RATIO);
        this.hasInstalledTextPatch = false;
    }

    public static getInstance(): HighDpiConfigurator {
        return HighDpiConfigurator.SINGLETON_INSTANCE;
    }

    public getDevicePixelRatio(): number {
        return this.devicePixelRatioValue;
    }

    public toCssPixels(devicePixelValue: number): number {
        return devicePixelValue / this.devicePixelRatioValue;
    }

    // ponytail: one factory patch is the choke point for crisp text; text renders at dpi font size and scales back down.
    public installHighDpiTextPatch(): void {
        if (this.hasInstalledTextPatch) {
            return;
        }
        this.hasInstalledTextPatch = true;
        const devicePixelRatioForPatch = this.devicePixelRatioValue;
        const originalTextMethod = Phaser.GameObjects.GameObjectFactory.prototype.text;
        Phaser.GameObjects.GameObjectFactory.prototype.text = function (
            this: Phaser.GameObjects.GameObjectFactory,
            x: number,
            y: number,
            text: string,
            style?: Phaser.Types.GameObjects.Text.TextStyle,
        ): Phaser.GameObjects.Text {
            const createdTextObject = originalTextMethod.call(this, x, y, text, style);
            const parsedFontSizePx = Number.parseFloat(String(createdTextObject.style.fontSize));
            if (Number.isFinite(parsedFontSizePx) && parsedFontSizePx > 0) {
                const textScale = getTextScale();
                createdTextObject.setFontSize(parsedFontSizePx * devicePixelRatioForPatch * textScale);
                const wordWrapWidthPx = createdTextObject.style.wordWrapWidth;
                if (wordWrapWidthPx !== null && wordWrapWidthPx > 0) {
                    createdTextObject.style.setWordWrapWidth(wordWrapWidthPx * devicePixelRatioForPatch, true);
                }
                const lineSpacingPx = createdTextObject.lineSpacing;
                if (lineSpacingPx !== 0) {
                    createdTextObject.setLineSpacing(lineSpacingPx * devicePixelRatioForPatch * textScale);
                }
                if (devicePixelRatioForPatch !== 1) {
                    createdTextObject.setScale(1 / devicePixelRatioForPatch);
                }
            }
            return createdTextObject;
        };
    }

    public registerScene(scene: Phaser.Scene): void {
        this.applyHighDpiToScene(scene);
        scene.events.once(Phaser.Scenes.Events.POST_UPDATE, () => {
            this.applyHighDpiToScene(scene);
        });
        const resizeHandler = (): void => {
            this.applyHighDpiToScene(scene);
        };
        scene.scale.on(Phaser.Scale.Events.RESIZE, resizeHandler);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            scene.scale.off(Phaser.Scale.Events.RESIZE, resizeHandler);
        });
    }

    public applyHighDpiToScene(scene: Phaser.Scene): void {
        const devicePixelRatioValue = this.devicePixelRatioValue;
        if (devicePixelRatioValue === 1) {
            return;
        }
        const cssWidth = Number(scene.scale.width);
        const cssHeight = Number(scene.scale.height);
        if (!Number.isFinite(cssWidth) || !Number.isFinite(cssHeight) || cssWidth <= 0 || cssHeight <= 0) {
            return;
        }
        const targetCanvasWidth = Math.floor(cssWidth * devicePixelRatioValue);
        const targetCanvasHeight = Math.floor(cssHeight * devicePixelRatioValue);
        const gameCanvas = scene.game.canvas;
        if (gameCanvas.width !== targetCanvasWidth || gameCanvas.height !== targetCanvasHeight) {
            gameCanvas.width = targetCanvasWidth;
            gameCanvas.height = targetCanvasHeight;
        }
        gameCanvas.style.width = `${cssWidth}px`;
        gameCanvas.style.height = `${cssHeight}px`;
        scene.game.renderer.resize(targetCanvasWidth, targetCanvasHeight);
        for (const sceneCamera of scene.cameras.cameras) {
            sceneCamera.setOrigin(0, 0);
            sceneCamera.setViewport(0, 0, targetCanvasWidth, targetCanvasHeight);
            sceneCamera.setZoom(devicePixelRatioValue);
        }
        scene.scale.displayScale.set(devicePixelRatioValue, devicePixelRatioValue);
    }
}
