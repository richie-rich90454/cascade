import Phaser from "phaser";

import { HighDpiConfigurator } from "../core/HighDpiConfigurator";
import { UiPointerRouting } from "./UiPointerRouting";

export class MapCameraController {
    private static readonly RELATIVE_MINIMUM_SCALE = 0.75;
    private static readonly RELATIVE_MAXIMUM_SCALE = 2.5;
    private static readonly SCALE_STEP_FACTOR = 1.1;
    private static readonly FOCUS_TWEEN_DURATION_MS = 450;

    private readonly scene: Phaser.Scene;
    private readonly mapPixelWidth: number;
    private readonly mapPixelHeight: number;

    private targetContainer: Phaser.GameObjects.Container | null;
    private mapScaleValue: number;
    private hasPanningEnabled: boolean;
    private hasZoomEnabled: boolean;
    private focusTween: Phaser.Tweens.Tween | null;
    private panMoveHandler: ((pointer: Phaser.Input.Pointer) => void) | null;
    private zoomWheelHandler:
        | ((
              pointer: Phaser.Input.Pointer,
              currentlyOver: Phaser.GameObjects.GameObject[],
              deltaX: number,
              deltaY: number,
              deltaZ: number,
          ) => void)
        | null;

    constructor(scene: Phaser.Scene, mapPixelWidth: number, mapPixelHeight: number) {
        this.scene = scene;
        this.mapPixelWidth = mapPixelWidth;
        this.mapPixelHeight = mapPixelHeight;
        this.targetContainer = null;
        this.mapScaleValue = 1;
        this.hasPanningEnabled = false;
        this.hasZoomEnabled = false;
        this.focusTween = null;
        this.panMoveHandler = null;
        this.zoomWheelHandler = null;
    }

    public setTargetContainer(targetContainer: Phaser.GameObjects.Container): void {
        this.targetContainer = targetContainer;
    }

    public enablePanning(): void {
        if (this.hasPanningEnabled) {
            return;
        }
        this.hasPanningEnabled = true;
        this.panMoveHandler = (pointer: Phaser.Input.Pointer) => {
            if (!pointer.isDown || this.targetContainer === null) {
                return;
            }
            const pointerCssX = HighDpiConfigurator.getInstance().toCssPixels(pointer.x);
            const pointerCssY = HighDpiConfigurator.getInstance().toCssPixels(pointer.y);
            if (UiPointerRouting.isPointOverAnyScrollRegion(pointerCssX, pointerCssY)) {
                return;
            }
            this.cancelFocusTween();
            const devicePixelRatioValue = HighDpiConfigurator.getInstance().getDevicePixelRatio();
            this.targetContainer.x += (pointer.x - pointer.prevPosition.x) / devicePixelRatioValue;
            this.targetContainer.y += (pointer.y - pointer.prevPosition.y) / devicePixelRatioValue;
        };
        this.scene.input.on("pointermove", this.panMoveHandler);
        this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this.panMoveHandler !== null) {
                this.scene.input.off("pointermove", this.panMoveHandler);
                this.panMoveHandler = null;
            }
        });
    }

    public enableZoom(): void {
        if (this.hasZoomEnabled) {
            return;
        }
        this.hasZoomEnabled = true;
        this.zoomWheelHandler = (
            pointer: Phaser.Input.Pointer,
            _currentlyOver: Phaser.GameObjects.GameObject[],
            _deltaX: number,
            deltaY: number,
            _deltaZ: number,
        ) => {
            if (this.targetContainer === null) {
                return;
            }
            const pointerCssX = HighDpiConfigurator.getInstance().toCssPixels(pointer.x);
            const pointerCssY = HighDpiConfigurator.getInstance().toCssPixels(pointer.y);
            if (UiPointerRouting.isPointOverAnyScrollRegion(pointerCssX, pointerCssY)) {
                return;
            }
            this.cancelFocusTween();
            const scaleFactor =
                deltaY > 0 ? 1 / MapCameraController.SCALE_STEP_FACTOR : MapCameraController.SCALE_STEP_FACTOR;
            const targetScaleValue = Phaser.Math.Clamp(
                this.mapScaleValue * scaleFactor,
                MapCameraController.RELATIVE_MINIMUM_SCALE,
                MapCameraController.RELATIVE_MAXIMUM_SCALE,
            );
            if (targetScaleValue === this.mapScaleValue) {
                return;
            }
            const worldPointBeforeScale = this.convertViewPointToMapPoint(pointerCssX, pointerCssY);
            this.mapScaleValue = targetScaleValue;
            this.targetContainer.setScale(this.mapScaleValue);
            const worldPointAfterScale = this.convertViewPointToMapPoint(pointerCssX, pointerCssY);
            this.targetContainer.x += (worldPointAfterScale.x - worldPointBeforeScale.x) * this.mapScaleValue;
            this.targetContainer.y += (worldPointAfterScale.y - worldPointBeforeScale.y) * this.mapScaleValue;
        };
        this.scene.input.on("wheel", this.zoomWheelHandler);
        this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this.zoomWheelHandler !== null) {
                this.scene.input.off("wheel", this.zoomWheelHandler);
                this.zoomWheelHandler = null;
            }
        });
    }

    public focusOnPoint(mapPointX: number, mapPointY: number, relativeScaleValue: number): void {
        if (this.targetContainer === null) {
            return;
        }
        this.cancelFocusTween();
        const targetScaleValue = Phaser.Math.Clamp(
            relativeScaleValue,
            MapCameraController.RELATIVE_MINIMUM_SCALE,
            MapCameraController.RELATIVE_MAXIMUM_SCALE,
        );
        const viewportCenterX = this.scene.scale.width / 2;
        const viewportCenterY = this.scene.scale.height / 2;
        const tweenState = {
            scaleValue: this.mapScaleValue,
            containerX: this.targetContainer.x,
            containerY: this.targetContainer.y,
        };
        this.focusTween = this.scene.tweens.add({
            targets: tweenState,
            scaleValue: targetScaleValue,
            containerX: viewportCenterX - mapPointX * targetScaleValue,
            containerY: viewportCenterY - mapPointY * targetScaleValue,
            duration: MapCameraController.FOCUS_TWEEN_DURATION_MS,
            ease: "Sine.easeInOut",
            onUpdate: () => {
                if (this.targetContainer === null) {
                    return;
                }
                this.mapScaleValue = tweenState.scaleValue;
                this.targetContainer.setScale(tweenState.scaleValue);
                this.targetContainer.setPosition(tweenState.containerX, tweenState.containerY);
            },
            onComplete: () => {
                this.focusTween = null;
            },
        });
    }

    public update(): void {
        if (this.targetContainer === null) {
            return;
        }
        const viewportWidth = this.scene.scale.width;
        const viewportHeight = this.scene.scale.height;
        const scaledMapWidth = this.mapPixelWidth * this.mapScaleValue;
        const scaledMapHeight = this.mapPixelHeight * this.mapScaleValue;
        if (scaledMapWidth <= viewportWidth) {
            this.targetContainer.x = (viewportWidth - scaledMapWidth) / 2;
        } else {
            this.targetContainer.x = Phaser.Math.Clamp(this.targetContainer.x, viewportWidth - scaledMapWidth, 0);
        }
        if (scaledMapHeight <= viewportHeight) {
            this.targetContainer.y = Math.max(64, (viewportHeight - scaledMapHeight) / 2);
        } else {
            this.targetContainer.y = Phaser.Math.Clamp(this.targetContainer.y, viewportHeight - scaledMapHeight, 64);
        }
    }

    private convertViewPointToMapPoint(viewPointX: number, viewPointY: number): { x: number; y: number } {
        if (this.targetContainer === null) {
            return { x: 0, y: 0 };
        }
        return {
            x: (viewPointX - this.targetContainer.x) / this.mapScaleValue,
            y: (viewPointY - this.targetContainer.y) / this.mapScaleValue,
        };
    }

    private cancelFocusTween(): void {
        if (this.focusTween !== null) {
            this.focusTween.stop();
            this.focusTween = null;
        }
    }
}
