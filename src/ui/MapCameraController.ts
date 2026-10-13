import Phaser from "phaser";

export class MapCameraController {
    private static readonly MINIMUM_ZOOM = 0.5;
    private static readonly MAXIMUM_ZOOM = 2.5;
    private static readonly ZOOM_STEP = 0.12;
    private static readonly FOCUS_TWEEN_DURATION_MS = 450;

    private readonly scene: Phaser.Scene;
    private readonly mapPixelWidth: number;
    private readonly mapPixelHeight: number;

    private hasPanningEnabled: boolean;
    private hasZoomEnabled: boolean;
    private focusTween: Phaser.Tweens.Tween | null;

    constructor(scene: Phaser.Scene, mapPixelWidth: number, mapPixelHeight: number) {
        this.scene = scene;
        this.mapPixelWidth = mapPixelWidth;
        this.mapPixelHeight = mapPixelHeight;
        this.hasPanningEnabled = false;
        this.hasZoomEnabled = false;
        this.focusTween = null;
    }

    public enablePanning(): void {
        if (this.hasPanningEnabled) {
            return;
        }
        this.hasPanningEnabled = true;
        this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (!pointer.isDown) {
                return;
            }
            this.cancelFocusTween();
            const camera = this.scene.cameras.main;
            camera.scrollX -= (pointer.x - pointer.prevPosition.x) / camera.zoom;
            camera.scrollY -= (pointer.y - pointer.prevPosition.y) / camera.zoom;
        });
    }

    public enableZoom(): void {
        if (this.hasZoomEnabled) {
            return;
        }
        this.hasZoomEnabled = true;
        this.scene.input.on(
            "wheel",
            (
                pointer: Phaser.Input.Pointer,
                _currentlyOver: Phaser.GameObjects.GameObject[],
                _deltaX: number,
                deltaY: number,
                _deltaZ: number,
            ) => {
                this.cancelFocusTween();
                const camera = this.scene.cameras.main;
                const zoomDirection = deltaY > 0 ? -1 : 1;
                const targetZoomValue = Phaser.Math.Clamp(
                    camera.zoom + zoomDirection * MapCameraController.ZOOM_STEP,
                    MapCameraController.MINIMUM_ZOOM,
                    MapCameraController.MAXIMUM_ZOOM,
                );
                if (targetZoomValue === camera.zoom) {
                    return;
                }
                const worldPointBeforeZoom = camera.getWorldPoint(pointer.x, pointer.y);
                camera.setZoom(targetZoomValue);
                const worldPointAfterZoom = camera.getWorldPoint(pointer.x, pointer.y);
                camera.scrollX += worldPointBeforeZoom.x - worldPointAfterZoom.x;
                camera.scrollY += worldPointBeforeZoom.y - worldPointAfterZoom.y;
            },
        );
    }

    public focusOnPoint(worldX: number, worldY: number, zoomValue: number): void {
        this.cancelFocusTween();
        const camera = this.scene.cameras.main;
        const clampedZoomValue = Phaser.Math.Clamp(
            zoomValue,
            MapCameraController.MINIMUM_ZOOM,
            MapCameraController.MAXIMUM_ZOOM,
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

    private cancelFocusTween(): void {
        if (this.focusTween !== null) {
            this.focusTween.stop();
            this.focusTween = null;
        }
    }
}
