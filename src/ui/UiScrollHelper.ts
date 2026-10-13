import Phaser from "phaser";

import { HighDpiConfigurator } from "../core/HighDpiConfigurator";
import { ScrollRegion, UiPointerRouting } from "./UiPointerRouting";

class ScrollState {
    public scrollOffsetPx: number;

    constructor() {
        this.scrollOffsetPx = 0;
    }
}

export class UiScrollHelper {
    public static enableWheelScrolling(
        scene: Phaser.Scene,
        viewportX: number,
        viewportY: number,
        viewportWidth: number,
        viewportHeight: number,
        contentContainer: Phaser.GameObjects.Container,
        contentHeightPx: number,
    ): void {
        const maximumScrollOffsetPx = Math.max(0, contentHeightPx - viewportHeight + 16);
        if (maximumScrollOffsetPx <= 0) {
            return;
        }
        const maskShape = scene.make.graphics({});
        maskShape.fillStyle(0xffffff, 1);
        maskShape.fillRect(viewportX, viewportY, viewportWidth, viewportHeight);
        const geometryMask = maskShape.createGeometryMask();
        contentContainer.setMask(geometryMask);
        const registeredScrollRegion = new ScrollRegion(viewportX, viewportY, viewportWidth, viewportHeight);
        UiPointerRouting.registerScrollRegion(registeredScrollRegion);

        const scrollState = new ScrollState();
        const wheelHandler = (
            pointer: Phaser.Input.Pointer,
            currentlyOver: Phaser.GameObjects.GameObject[],
            deltaX: number,
            deltaY: number,
            deltaZ: number,
        ): void => {
            void currentlyOver;
            void deltaX;
            void deltaZ;
            const pointerCssX = HighDpiConfigurator.getInstance().toCssPixels(pointer.x);
            const pointerCssY = HighDpiConfigurator.getInstance().toCssPixels(pointer.y);
            if (!registeredScrollRegion.containsPoint(pointerCssX, pointerCssY)) {
                return;
            }
            scrollState.scrollOffsetPx = Phaser.Math.Clamp(
                scrollState.scrollOffsetPx + deltaY * 0.5,
                0,
                maximumScrollOffsetPx,
            );
            contentContainer.y = viewportY - scrollState.scrollOffsetPx;
        };
        scene.input.on(Phaser.Input.Events.POINTER_WHEEL, wheelHandler);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            scene.input.off(Phaser.Input.Events.POINTER_WHEEL, wheelHandler);
            UiPointerRouting.unregisterScrollRegion(registeredScrollRegion);
            geometryMask.destroy();
        });
    }

    public static enableWheelScrollingForRect(
        scene: Phaser.Scene,
        viewportX: number,
        viewportY: number,
        viewportWidth: number,
        viewportHeight: number,
        contentContainer: Phaser.GameObjects.Container,
    ): void {
        UiScrollHelper.enableWheelScrolling(
            scene,
            viewportX,
            viewportY,
            viewportWidth,
            viewportHeight,
            contentContainer,
            contentContainer.height,
        );
    }
}
