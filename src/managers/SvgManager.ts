import type Phaser from "phaser";
import { SeedRandom } from "../core/SeedRandom";

export class CascadeSvgPalette {
    public static readonly NEAR_BLACK_LEATHER = "#1A1410";
    public static readonly DARK_OLIVE = "#2B2520";
    public static readonly MID_OLIVE = "#3D3A31";
    public static readonly FIELD_GRAY = "#6E6A5C";
    public static readonly BRASS_TAN = "#B6A472";
    public static readonly BRIGHT_BRASS = "#C9A961";
    public static readonly HIGHLIGHT_BRASS = "#E5CC8A";
    public static readonly DEEP_BRASS = "#7D6634";
    public static readonly BLOOD_RED = "#8B1A1A";
    public static readonly BRIGHT_BLOOD = "#C43D3D";
    public static readonly PARCHMENT = "#F2E8D5";
    public static readonly AGED_PARCHMENT = "#D4C29A";
    public static readonly DEEP_PARCHMENT = "#8B7355";
}

export class SvgManager {
    private static readonly terrainFillColorsByTerrainCode: Record<string, string> = {
        plains: "#5A6B42",
        forest: "#3D5233",
        mountains: "#6E6A5C",
        desert: "#B6A472",
        ocean: "#22364F",
        coastal: "#2D4A6B",
        urban: "#7D6634",
        industrial: "#4A4A4A",
        tundra: "#8B8B7E",
        swamp: "#4A5540",
    };

    public static generateTerrainTileSvgMarkup(terrainTypeCode: string, pixelSize: number, seed: number): string {
        const seedRandom = new SeedRandom(seed);
        const fillColor = SvgManager.terrainFillColorsByTerrainCode[terrainTypeCode] ?? "#5A6B42";
        const speckleMarkupParts: string[] = [];
        const speckleCount = terrainTypeCode === "urban" || terrainTypeCode === "industrial" ? 14 : 20;
        for (let speckleIndex = 0; speckleIndex < speckleCount; speckleIndex++) {
            const speckleX = seedRandom.nextInt(0, pixelSize);
            const speckleY = seedRandom.nextInt(0, pixelSize);
            const speckleRadius = seedRandom.nextInt(1, 3);
            const speckleOpacity = seedRandom.nextFloatInRange(0.05, 0.18).toFixed(2);
            const speckleColor = seedRandom.nextBoolean(0.5) ? CascadeSvgPalette.DARK_OLIVE : CascadeSvgPalette.PARCHMENT;
            speckleMarkupParts.push(
                `<circle cx="${speckleX}" cy="${speckleY}" r="${speckleRadius}" fill="${speckleColor}" opacity="${speckleOpacity}" />`,
            );
        }
        return [
            `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelSize}" height="${pixelSize}" viewBox="0 0 ${pixelSize} ${pixelSize}">`,
            `<rect width="${pixelSize}" height="${pixelSize}" fill="${fillColor}" />`,
            ...speckleMarkupParts,
            `</svg>`,
        ].join("");
    }

    public static generateParchmentPanelSvgMarkup(pixelWidth: number, pixelHeight: number, seed: number): string {
        const seedRandom = new SeedRandom(seed);
        const grainMarkupParts: string[] = [];
        const grainCount = Math.floor((pixelWidth * pixelHeight) / 900);
        for (let grainIndex = 0; grainIndex < grainCount; grainIndex++) {
            const grainX = seedRandom.nextInt(0, pixelWidth);
            const grainY = seedRandom.nextInt(0, pixelHeight);
            const grainRadius = seedRandom.nextInt(1, 2);
            const grainOpacity = seedRandom.nextFloatInRange(0.02, 0.06).toFixed(2);
            grainMarkupParts.push(
                `<circle cx="${grainX}" cy="${grainY}" r="${grainRadius}" fill="${CascadeSvgPalette.DEEP_PARCHMENT}" opacity="${grainOpacity}" />`,
            );
        }
        return [
            `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelWidth}" height="${pixelHeight}" viewBox="0 0 ${pixelWidth} ${pixelHeight}">`,
            `<defs><linearGradient id="parchmentGradient" x1="0" y1="0" x2="0" y2="1">`,
            `<stop offset="0%" stop-color="${CascadeSvgPalette.PARCHMENT}" />`,
            `<stop offset="100%" stop-color="${CascadeSvgPalette.AGED_PARCHMENT}" />`,
            `</linearGradient></defs>`,
            `<rect width="${pixelWidth}" height="${pixelHeight}" fill="url(#parchmentGradient)" />`,
            ...grainMarkupParts,
            `<rect x="2" y="2" width="${pixelWidth - 4}" height="${pixelHeight - 4}" fill="none" stroke="${CascadeSvgPalette.DEEP_BRASS}" stroke-width="3" />`,
            `<rect x="6" y="6" width="${pixelWidth - 12}" height="${pixelHeight - 12}" fill="none" stroke="${CascadeSvgPalette.BRASS_TAN}" stroke-width="1" />`,
            `</svg>`,
        ].join("");
    }

    public static generateBrassFrameSvgMarkup(pixelWidth: number, pixelHeight: number, seed: number): string {
        const seedRandom = new SeedRandom(seed);
        const rivetMarkupParts: string[] = [];
        const rivetSpacing = 48;
        for (let rivetX = rivetSpacing; rivetX < pixelWidth; rivetX += rivetSpacing) {
            const rivetOpacity = seedRandom.nextFloatInRange(0.6, 0.95).toFixed(2);
            rivetMarkupParts.push(
                `<circle cx="${rivetX}" cy="10" r="3" fill="${CascadeSvgPalette.HIGHLIGHT_BRASS}" opacity="${rivetOpacity}" />`,
            );
            rivetMarkupParts.push(
                `<circle cx="${rivetX}" cy="${pixelHeight - 10}" r="3" fill="${CascadeSvgPalette.HIGHLIGHT_BRASS}" opacity="${rivetOpacity}" />`,
            );
        }
        return [
            `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelWidth}" height="${pixelHeight}" viewBox="0 0 ${pixelWidth} ${pixelHeight}">`,
            `<defs><linearGradient id="brassGradient" x1="0" y1="0" x2="0" y2="1">`,
            `<stop offset="0%" stop-color="${CascadeSvgPalette.HIGHLIGHT_BRASS}" />`,
            `<stop offset="45%" stop-color="${CascadeSvgPalette.BRIGHT_BRASS}" />`,
            `<stop offset="55%" stop-color="${CascadeSvgPalette.DEEP_BRASS}" />`,
            `<stop offset="100%" stop-color="${CascadeSvgPalette.BRASS_TAN}" />`,
            `</linearGradient></defs>`,
            `<rect x="0" y="0" width="${pixelWidth}" height="20" fill="url(#brassGradient)" />`,
            `<rect x="0" y="${pixelHeight - 20}" width="${pixelWidth}" height="20" fill="url(#brassGradient)" />`,
            `<rect x="0" y="0" width="20" height="${pixelHeight}" fill="url(#brassGradient)" />`,
            `<rect x="${pixelWidth - 20}" y="0" width="20" height="${pixelHeight}" fill="url(#brassGradient)" />`,
            ...rivetMarkupParts,
            `</svg>`,
        ].join("");
    }

    public static generateVignetteSvgMarkup(pixelWidth: number, pixelHeight: number): string {
        return [
            `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelWidth}" height="${pixelHeight}" viewBox="0 0 ${pixelWidth} ${pixelHeight}">`,
            `<defs><radialGradient id="vignetteGradient" cx="50%" cy="50%" r="75%">`,
            `<stop offset="55%" stop-color="#000000" stop-opacity="0" />`,
            `<stop offset="100%" stop-color="#000000" stop-opacity="0.3" />`,
            `</radialGradient></defs>`,
            `<rect width="${pixelWidth}" height="${pixelHeight}" fill="url(#vignetteGradient)" />`,
            `</svg>`,
        ].join("");
    }

    public static getSvgDataUri(svgMarkup: string): string {
        return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgMarkup)))}`;
    }

    public static createTextureFromSvgMarkup(
        scene: Phaser.Scene,
        textureKey: string,
        svgMarkup: string,
        onTextureReady: () => void,
    ): void {
        if (scene.textures.exists(textureKey)) {
            onTextureReady();
            return;
        }
        const svgDataUri = SvgManager.getSvgDataUri(svgMarkup);
        const svgImageElement = new Image();
        svgImageElement.onload = () => {
            if (!scene.textures.exists(textureKey)) {
                scene.textures.addImage(textureKey, svgImageElement);
            }
            onTextureReady();
        };
        svgImageElement.onerror = () => {
            onTextureReady();
        };
        svgImageElement.src = svgDataUri;
    }
}
