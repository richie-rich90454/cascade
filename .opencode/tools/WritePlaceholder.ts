import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TierThreeAssetCatalog } from "./lib/TierThreeAssetCatalog";

function runPlaceholderWriting(): number {
    const repositoryRootPath = process.cwd();
    const placeholderOutputDirectoryPath = join(repositoryRootPath, "public", "assets", "placeholders");
    const manifestPath = join(repositoryRootPath, "public", "assets", "manifest.json");
    mkdirSync(placeholderOutputDirectoryPath, { recursive: true });

    const tierThreeDefinitions = TierThreeAssetCatalog.buildCatalog();
    const placeholderManifestEntries: Array<{ assetId: string; category: string; tier: number; source: string; file: string; width: number; height: number; status: string }> = [];

    for (const tierThreeDefinition of tierThreeDefinitions) {
        const placeholderText = [
            `CASCADE TIER 2 PLACEHOLDER`,
            `Asset: ${tierThreeDefinition.assetId}`,
            `Type: ${tierThreeDefinition.assetType}`,
            `Intended dimensions: ${tierThreeDefinition.dimensions}`,
            `Usage: ${tierThreeDefinition.usageNotes}`,
            `Procedural fallback: ${tierThreeDefinition.fallbackDescription}`,
            ``,
            `Replace this file with the final asset named ${tierThreeDefinition.expectedFileName}.`,
            `A generation prompt for this asset is written to assets/prompts/${tierThreeDefinition.assetId}.txt.`,
        ].join("\n");
        writeFileSync(join(placeholderOutputDirectoryPath, `${tierThreeDefinition.assetId}.txt`), placeholderText, "utf8");
        placeholderManifestEntries.push({
            assetId: tierThreeDefinition.assetId,
            category: "tier3",
            tier: 3,
            source: "manual",
            file: `assets/placeholders/${tierThreeDefinition.assetId}.txt`,
            width: 0,
            height: 0,
            status: "placeholder",
        });
    }

    const existingManifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
        generatedAtIsoTimestamp: string;
        assets: Array<{ assetId: string; category: string; tier: number; source: string; file: string; width: number; height: number; status: string }>;
    };
    const nonTierThreeAssets = existingManifest.assets.filter((manifestEntry) => manifestEntry.tier !== 3);
    existingManifest.assets = [...nonTierThreeAssets, ...placeholderManifestEntries];
    existingManifest.generatedAtIsoTimestamp = new Date().toISOString();
    writeFileSync(manifestPath, JSON.stringify(existingManifest, null, 2), "utf8");

    return placeholderManifestEntries.length;
}

const writtenPlaceholderCount = runPlaceholderWriting();
console.log(`WritePlaceholder: wrote ${writtenPlaceholderCount} Tier 2 placeholder files to public/assets/placeholders/.`);
