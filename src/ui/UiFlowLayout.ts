import Phaser from "phaser";

export class FlowCursor {
    private readonly startX: number;
    private currentY: number;

    constructor(startX: number, startY: number) {
        this.startX = startX;
        this.currentY = startY;
    }

    public getCurrentY(): number {
        return this.currentY;
    }

    public setCurrentY(currentY: number): void {
        this.currentY = currentY;
    }

    public placeText(
        container: Phaser.GameObjects.Container,
        textObject: Phaser.GameObjects.Text,
        gapAfterPx: number = 10,
    ): Phaser.GameObjects.Text {
        textObject.setPosition(this.startX, this.currentY);
        container.add(textObject);
        this.currentY += textObject.displayHeight + gapAfterPx;
        return textObject;
    }

    public placeContainer(
        container: Phaser.GameObjects.Container,
        childContainer: Phaser.GameObjects.Container,
        gapAfterPx: number = 12,
    ): Phaser.GameObjects.Container {
        childContainer.setPosition(this.startX, this.currentY);
        container.add(childContainer);
        const childHeight = childContainer.displayHeight > 0 ? childContainer.displayHeight : 48;
        this.currentY += childHeight + gapAfterPx;
        return childContainer;
    }

    public placeGraphics(
        container: Phaser.GameObjects.Container,
        graphicsObject: Phaser.GameObjects.Graphics,
        gapAfterPx: number = 10,
    ): void {
        graphicsObject.setPosition(this.startX, this.currentY);
        container.add(graphicsObject);
        this.currentY += gapAfterPx;
    }

    public addGap(gapPx: number): void {
        this.currentY += gapPx;
    }
}

export class FlowLayout {
    public static measureTextHeight(textObject: Phaser.GameObjects.Text): number {
        return textObject.displayHeight;
    }

    public static clampContentWidth(availableWidthPx: number, maximumWidthPx: number): number {
        return Math.max(240, Math.min(availableWidthPx, maximumWidthPx));
    }

    public static fitContentIntoViewport(
        contentContainer: Phaser.GameObjects.Container,
        contentHeightPx: number,
        viewportHeightPx: number,
    ): void {
        if (contentHeightPx <= viewportHeightPx) {
            return;
        }
        const fitScaleValue = Math.max(0.55, viewportHeightPx / contentHeightPx);
        contentContainer.setScale(fitScaleValue);
    }
}
