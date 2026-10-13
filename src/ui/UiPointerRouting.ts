export class ScrollRegion {
    public readonly viewportX: number;
    public readonly viewportY: number;
    public readonly width: number;
    public readonly height: number;

    constructor(viewportX: number, viewportY: number, width: number, height: number) {
        this.viewportX = viewportX;
        this.viewportY = viewportY;
        this.width = width;
        this.height = height;
    }

    public containsPoint(pointX: number, pointY: number): boolean {
        return (
            pointX >= this.viewportX &&
            pointX <= this.viewportX + this.width &&
            pointY >= this.viewportY &&
            pointY <= this.viewportY + this.height
        );
    }
}

export class UiPointerRouting {
    private static readonly registeredScrollRegions: ScrollRegion[] = [];

    public static registerScrollRegion(scrollRegion: ScrollRegion): void {
        UiPointerRouting.registeredScrollRegions.push(scrollRegion);
    }

    public static unregisterScrollRegion(scrollRegion: ScrollRegion): void {
        const regionIndex = UiPointerRouting.registeredScrollRegions.indexOf(scrollRegion);
        if (regionIndex >= 0) {
            UiPointerRouting.registeredScrollRegions.splice(regionIndex, 1);
        }
    }

    public static isPointOverAnyScrollRegion(pointX: number, pointY: number): boolean {
        for (const scrollRegion of UiPointerRouting.registeredScrollRegions) {
            if (scrollRegion.containsPoint(pointX, pointY)) {
                return true;
            }
        }
        return false;
    }
}
