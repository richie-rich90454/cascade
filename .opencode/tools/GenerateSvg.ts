import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CatalogAssetEntry } from "./lib/CatalogAssetEntry";
import { SvgCatalogBuilder } from "./lib/SvgCatalogBuilder";
import { SvgMarkupFactoryCore } from "./lib/SvgMarkupFactoryCore";
import { SvgMarkupFactoryDecorative } from "./lib/SvgMarkupFactoryDecorative";

class SvgGenerationResult {
    public readonly generatedFileCount: number;
    public readonly generatedAssetIds: string[];

    constructor(generatedFileCount: number, generatedAssetIds: string[]) {
        this.generatedFileCount = generatedFileCount;
        this.generatedAssetIds = generatedAssetIds;
    }
}

class ManifestWriter {
    public static writeSvgManifestEntries(
        outputManifestPath: string,
        svgManifestEntries: Array<{ assetId: string; category: string; tier: number; source: string; file: string; width: number; height: number; status: string }>,
    ): void {
        const manifestRecord = {
            generatedAtIsoTimestamp: new Date().toISOString(),
            assets: svgManifestEntries,
        };
        writeFileSync(outputManifestPath, JSON.stringify(manifestRecord, null, 2), "utf8");
    }
}

function generateSvgMarkupForEntry(catalogEntry: CatalogAssetEntry): string {
    switch (catalogEntry.category) {
        case "tile":
            return SvgMarkupFactoryCore.generateTileMarkup(catalogEntry);
        case "marker":
            return SvgMarkupFactoryCore.generateMarkerMarkup(catalogEntry);
        case "counter":
            return SvgMarkupFactoryCore.generateCounterMarkup(catalogEntry);
        case "insignia":
            return SvgMarkupFactoryCore.generateInsigniaMarkup(catalogEntry);
        case "icon":
            return SvgMarkupFactoryCore.generateIconMarkup(catalogEntry);
        case "ui":
            return SvgMarkupFactoryCore.generateUiElementMarkup(catalogEntry);
        case "ornament":
            return SvgMarkupFactoryDecorative.generateOrnamentMarkup(catalogEntry);
        case "pattern":
            return SvgMarkupFactoryDecorative.generatePatternMarkup(catalogEntry);
        case "scenario":
            return SvgMarkupFactoryDecorative.generateScenarioMarkup(catalogEntry);
        case "timeline":
            return SvgMarkupFactoryDecorative.generateTimelineMarkup(catalogEntry);
        case "event":
            return SvgMarkupFactoryDecorative.generateEventIllustrationMarkup(catalogEntry);
        case "portrait":
            return SvgMarkupFactoryDecorative.generatePortraitMarkup(catalogEntry);
        case "overlay":
            return SvgMarkupFactoryDecorative.generateOverlayMarkup(catalogEntry);
        case "ledger":
            return SvgMarkupFactoryDecorative.generateLedgerMarkup(catalogEntry);
        case "focus":
            return SvgMarkupFactoryDecorative.generateFocusMarkup(catalogEntry);
        case "status":
            return SvgMarkupFactoryDecorative.generateStatusMarkup(catalogEntry);
        case "newspaper":
            return SvgMarkupFactoryDecorative.generateNewspaperMarkup(catalogEntry);
        case "misc":
            return SvgMarkupFactoryDecorative.generateMiscMarkup(catalogEntry);
        default:
            return SvgMarkupFactoryCore.wrapSvg(catalogEntry, "");
    }
}

function runSvgGeneration(): SvgGenerationResult {
    const repositoryRootPath = process.cwd();
    const svgOutputDirectoryPath = join(repositoryRootPath, "public", "assets", "svg");
    const manifestOutputPath = join(repositoryRootPath, "public", "assets", "manifest.json");
    mkdirSync(svgOutputDirectoryPath, { recursive: true });

    const catalogEntries = SvgCatalogBuilder.buildCatalog();
    const svgManifestEntries: Array<{ assetId: string; category: string; tier: number; source: string; file: string; width: number; height: number; status: string }> = [];
    const generatedAssetIds: string[] = [];

    for (const catalogEntry of catalogEntries) {
        const svgMarkup = generateSvgMarkupForEntry(catalogEntry);
        const outputFilePath = join(svgOutputDirectoryPath, `${catalogEntry.assetId}.svg`);
        writeFileSync(outputFilePath, svgMarkup, "utf8");
        generatedAssetIds.push(catalogEntry.assetId);
        svgManifestEntries.push({
            assetId: catalogEntry.assetId,
            category: catalogEntry.category,
            tier: 1,
            source: "procedural",
            file: `assets/svg/${catalogEntry.assetId}.svg`,
            width: catalogEntry.width,
            height: catalogEntry.height,
            status: "generated",
        });
    }

    ManifestWriter.writeSvgManifestEntries(manifestOutputPath, svgManifestEntries);
    return new SvgGenerationResult(generatedAssetIds.length, generatedAssetIds);
}

const svgGenerationResult = runSvgGeneration();
console.log(`GenerateSvg: wrote ${svgGenerationResult.generatedFileCount} procedural SVG assets to public/assets/svg/.`);
console.log(`GenerateSvg: manifest written to public/assets/manifest.json with ${svgGenerationResult.generatedFileCount} entries.`);
