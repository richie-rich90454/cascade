import Phaser from "phaser";

export class HighDpiConfigurator {
    private static readonly SINGLETON_INSTANCE = new HighDpiConfigurator();
    private static readonly MAXIMUM_DEVICE_PIXEL_RATIO = 2;

    private devicePixelRatioValue: number;
    private hasInstalledTextResolutionPatch: boolean;

    private constructor() {
        this.devicePixelRatioValue =
            typeof window === "undefined"
                ? 1
                : Math.min(window.devicePixelRatio || 1, HighDpiConfigurator.MAXIMUM_DEVICE_PIXEL_RATIO);
        this.hasInstalledTextResolutionPatch = false;
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

    // ponytail: the engine patch is the single choke point for crisp text; every scene.add.text goes through it.
    public installTextResolutionPatch(): void {
        if (this.hasInstalledTextResolutionPatch) {
            return;
        }
        this.hasInstalledTextResolutionPatch = true;
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
            createdTextObject.setResolution(devicePixelRatioForPatch);
            return createdTextObject;
        };
    }

    public registerScene(scene: Phaser.Scene): void {
        this.applyHighDpiToScene(scene);
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
        const cssWidth = scene.scale.width;
        const cssHeight = scene.scale.height;
        scene.game.renderer.resize(cssWidth * devicePixelRatioValue, cssHeight * devicePixelRatioValue);
        scene.cameras.main.setViewport(0, 0, cssWidth * devicePixelRatioValue, cssHeight * devicePixelRatioValue);
        scene.cameras.main.setZoom(devicePixelRatioValue);
    }
}
