import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

class AssetVerificationReport {
    public readonly totalAssetCount: number;
    public readonly presentTierOneCount: number;
    public readonly missingTierOneAssetIds: string[];
    public readonly presentTierTwoCount: number;
    public readonly missingTierTwoAssetIds: string[];
    public readonly tierThreeAssetIds: string[];

    constructor(
        totalAssetCount: number,
        presentTierOneCount: number,
        missingTierOneAssetIds: string[],
        presentTierTwoCount: number,
        missingTierTwoAssetIds: string[],
        tierThreeAssetIds: string[],
    ) {
        this.totalAssetCount = totalAssetCount;
        this.presentTierOneCount = presentTierOneCount;
        this.missingTierOneAssetIds = missingTierOneAssetIds;
        this.presentTierTwoCount = presentTierTwoCount;
        this.missingTierTwoAssetIds = missingTierTwoAssetIds;
        this.tierThreeAssetIds = tierThreeAssetIds;
    }

    public isGameFullyPlayableWithoutTierThreeAssets(): boolean {
        return this.missingTierOneAssetIds.length === 0 && this.missingTierTwoAssetIds.length === 0;
    }
}

function runAssetVerification(): AssetVerificationReport {
    const repositoryRootPath = process.cwd();
    const publicAssetsRootPath = join(repositoryRootPath, "public");
    const manifestPath = join(repositoryRootPath, "public", "assets", "manifest.json");
    const manifestRecord = JSON.parse(readFileSync(manifestPath, "utf8")) as {
        assets: Array<{ assetId: string; tier: number; file: string }>;
    };

    const missingTierOneAssetIds: string[] = [];
    const missingTierTwoAssetIds: string[] = [];
    const tierThreeAssetIds: string[] = [];
    let presentTierOneCount = 0;
    let presentTierTwoCount = 0;

    for (const manifestEntry of manifestRecord.assets) {
        const resolvedFilePath = join(publicAssetsRootPath, manifestEntry.file);
        const doesFileExist = existsSync(resolvedFilePath);
        if (manifestEntry.tier === 1) {
            if (doesFileExist) {
                presentTierOneCount += 1;
            } else {
                missingTierOneAssetIds.push(manifestEntry.assetId);
            }
        } else if (manifestEntry.tier === 2) {
            if (doesFileExist) {
                presentTierTwoCount += 1;
            } else {
                missingTierTwoAssetIds.push(manifestEntry.assetId);
            }
        } else {
            tierThreeAssetIds.push(manifestEntry.assetId);
        }
    }

    return new AssetVerificationReport(
        manifestRecord.assets.length,
        presentTierOneCount,
        missingTierOneAssetIds,
        presentTierTwoCount,
        missingTierTwoAssetIds,
        tierThreeAssetIds,
    );
}

const verificationReport = runAssetVerification();
console.log(`VerifyAssets: manifest lists ${verificationReport.totalAssetCount} assets.`);
console.log(`VerifyAssets: Tier 1 procedural assets present: ${verificationReport.presentTierOneCount}.`);
console.log(`VerifyAssets: Tier 2 placeholders present: ${verificationReport.presentTierTwoCount}.`);
console.log(`VerifyAssets: Tier 3 manual assets (fallbacks in place): ${verificationReport.tierThreeAssetIds.length}.`);
if (!verificationReport.isGameFullyPlayableWithoutTierThreeAssets()) {
    console.error(`VerifyAssets: missing Tier 1 assets: ${verificationReport.missingTierOneAssetIds.join(", ")}`);
    console.error(`VerifyAssets: missing Tier 2 placeholders: ${verificationReport.missingTierTwoAssetIds.join(", ")}`);
    process.exitCode = 1;
} else {
    console.log("VerifyAssets: the game is fully playable with zero Tier 3 assets.");
}
