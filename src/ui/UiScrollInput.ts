import Phaser from "phaser";

import { HighDpiConfigurator } from "../core/HighDpiConfigurator";

export interface CssPointerPosition {
    x: number;
    y: number;
}

export class UiScrollInput {
    private static readonly WHEEL_LINE_HEIGHT_PX = 40;
    private static readonly MAXIMUM_VIEWPORT_FRACTION_PER_EVENT = 0.9;

    public static getCssPointerPosition(pointer: Phaser.Input.Pointer): CssPointerPosition {
        const dpiConfigurator = HighDpiConfigurator.getInstance();
        return {
            x: dpiConfigurator.toCssPixels(pointer.x),
            y: dpiConfigurator.toCssPixels(pointer.y),
        };
    }

    public static getWheelDeltaPx(pointer: Phaser.Input.Pointer, deltaY: number, viewportHeightPx: number): number {
        const deltaMode = "deltaMode" in pointer.event ? pointer.event.deltaMode : 0;
        return UiScrollInput.normalizeWheelDelta(
            deltaY,
            deltaMode,
            viewportHeightPx,
            HighDpiConfigurator.getInstance().getDevicePixelRatio(),
        );
    }

    public static normalizeWheelDelta(
        deltaY: number,
        deltaMode: number,
        viewportHeightPx: number,
        devicePixelRatio: number = 1,
    ): number {
        if (!Number.isFinite(deltaY) || deltaY === 0) {
            return 0;
        }
        const safeViewportHeightPx =
            Number.isFinite(viewportHeightPx) && viewportHeightPx > 0
                ? viewportHeightPx
                : UiScrollInput.WHEEL_LINE_HEIGHT_PX;
        const safeDevicePixelRatio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
        const deltaScale =
            deltaMode === 1
                ? UiScrollInput.WHEEL_LINE_HEIGHT_PX * safeDevicePixelRatio
                : deltaMode === 2
                  ? safeViewportHeightPx
                  : safeDevicePixelRatio;
        const maximumDeltaPx = Math.max(
            UiScrollInput.WHEEL_LINE_HEIGHT_PX * safeDevicePixelRatio,
            safeViewportHeightPx * UiScrollInput.MAXIMUM_VIEWPORT_FRACTION_PER_EVENT,
        );
        return Phaser.Math.Clamp(deltaY * deltaScale, -maximumDeltaPx, maximumDeltaPx);
    }
}
