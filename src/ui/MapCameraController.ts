import Phaser from "phaser";

import { HighDpiConfigurator } from "../core/HighDpiConfigurator";
import { UiPointerRouting } from "./UiPointerRouting";

export class MapCameraController {
    private static readonly RELATIVE_MINIMUM_ZOOM = 0.75;
    private static readonly RELATIVE_MAXIMUM_ZOOM = 2.5;
    private static readonly RELATIVE_ZOOM_STEP = 0.12;
    private static readonly FOCUS_TWEEN_DURATION_MS = 450;

    private readonly scene: Phaser.Scene;
    private readonly mapPixelWidth: number;
    private readonly mapPixelHeight: number;

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
        this.hasPanningEnabled = false;
        this.hasZoomEnabled = false;
        this.focusTween = null;
        this.panMoveHandler = null;
        this.zoomWheelHandler = null;
    }

    public enablePanning(): void {
        if (this.hasPanningEnabled) {
            return;
        }
        this.hasPanningEnabled = true;
        this.panMoveHandler = (pointer: Phaser.Input.Pointer) => {
            if (!pointer.isDown) {
                return;
            }
            const pointerCssX = HighDpiConfigurator.getInstance().toCssPixels(pointer.x);
            const pointerCssY = HighDpiConfigurator.getInstance().toCssPixels(pointer.y);
            if (UiPointerRouting.isPointOverAnyScrollRegion(pointerCssX, pointerCssY)) {
                return;
            }
            this.cancelFocusTween();
            const camera = this.scene.cameras.main;
            camera.scrollX -= (pointer.x - pointer.prevPosition.x) / camera.zoom;
            camera.scrollY -= (pointer.y - pointer.prevPosition.y) / camera.zoom;
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
            const pointerCssX = HighDpiConfigurator.getInstance().toCssPixels(pointer.x);
            const pointerCssY = HighDpiConfigurator.getInstance().toCssPixels(pointer.y);
            if (UiPointerRouting.isPointOverAnyScrollRegion(pointerCssX, pointerCssY)) {
                return;
            }
            this.cancelFocusTween();
            const camera = this.scene.cameras.main;
            const zoomDirection = deltaY > 0 ? -1 : 1;
            const targetZoomValue = Phaser.Math.Clamp(
                camera.zoom + zoomDirection * this.getBaseZoomValue() * MapCameraController.RELATIVE_ZOOM_STEP,
                this.getMinimumZoomValue(),
                this.getMaximumZoomValue(),
            );
            if (targetZoomValue === camera.zoom) {
                return;
            }
            const worldPointBeforeZoom = camera.getWorldPoint(pointer.x, pointer.y);
            camera.setZoom(targetZoomValue);
            const worldPointAfterZoom = camera.getWorldPoint(pointer.x, pointer.y);
            camera.scrollX += worldPointBeforeZoom.x - worldPointAfterZoom.x;
            camera.scrollY += worldPointBeforeZoom.y - worldPointAfterZoom.y;
        };
        this.scene.input.on("wheel", this.zoomWheelHandler);
        this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this.zoomWheelHandler !== null) {
                this.scene.input.off("wheel", this.zoomWheelHandler);
                this.zoomWheelHandler = null;
            }
        });
    }

    public focusOnPoint(worldX: number, worldY: number, relativeZoomValue: number): void {
        this.cancelFocusTween();
        const camera = this.scene.cameras.main;
        const clampedZoomValue = Phaser.Math.Clamp(
            relativeZoomValue * this.getBaseZoomValue(),
            this.getMinimumZoomValue(),
            this.getMaximumZoomValue(),
        );
        const tweenState = {
            zoomValue: camera.zoom,
            centerX: camera.scrollX + camera.width / 2,
            centerY: camera.scrollY + camera.height / 2,
        };
        this.focusTween = this.scene.tweens.add({
            targets: tweenState,
            zoomValue: clampedZoomValue,
            centerX: worldX,
            centerY: worldY,
            duration: MapCameraController.FOCUS_TWEEN_DURATION_MS,
            ease: "Sine.easeInOut",
            onUpdate: () => {
                camera.setZoom(tweenState.zoomValue);
                camera.centerOn(tweenState.centerX, tweenState.centerY);
            },
            onComplete: () => {
                this.focusTween = null;
            },
        });
    }

    public update(): void {
        const camera = this.scene.cameras.main;
        const viewWorldWidth = camera.width / camera.zoom;
        const viewWorldHeight = camera.height / camera.zoom;
        camera.scrollX = Phaser.Math.Clamp(camera.scrollX, 0, Math.max(0, this.mapPixelWidth - viewWorldWidth));
        camera.scrollY = Phaser.Math.Clamp(camera.scrollY, 0, Math.max(0, this.mapPixelHeight - viewWorldHeight));
    }

    private getBaseZoomValue(): number {
        return HighDpiConfigurator.getInstance().getDevicePixelRatio();
    }

    private getMinimumZoomValue(): number {
        return this.getBaseZoomValue() * MapCameraController.RELATIVE_MINIMUM_ZOOM;
    }

    private getMaximumZoomValue(): number {
        return this.getBaseZoomValue() * MapCameraController.RELATIVE_MAXIMUM_ZOOM;
    }

    private cancelFocusTween(): void {
        if (this.focusTween !== null) {
            this.focusTween.stop();
            this.focusTween = null;
        }
    }
}
