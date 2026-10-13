import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function runManifestSynchronization(): number {
    const repositoryRootPath = process.cwd();
    const publicAssetsRootPath = join(repositoryRootPath, "public");
    const manifestPath = join(repositoryRootPath, "public", "assets", "manifest.json");
    const manifestRecord = JSON.parse(readFileSync(manifestPath, "utf8")) as {
        generatedAtIsoTimestamp: string;
        assets: Array<{ assetId: string; category: string; tier: number; source: string; file: string; width: number; height: number; status: string }>;
    };

    let updatedStatusCount = 0;
    for (const manifestEntry of manifestRecord.assets) {
        const resolvedFilePath = join(publicAssetsRootPath, manifestEntry.file);
        const doesFileExist = existsSync(resolvedFilePath);
        const previousStatus = manifestEntry.status;
        if (!doesFileExist && manifestEntry.tier === 1) {
            manifestEntry.status = "missing";
        } else if (doesFileExist && manifestEntry.tier === 1 && previousStatus !== "generated") {
            manifestEntry.status = "generated";
        } else if (doesFileExist && manifestEntry.tier === 2 && previousStatus !== "placeholder") {
            manifestEntry.status = "placeholder";
        }
        if (manifestEntry.status !== previousStatus) {
            updatedStatusCount += 1;
        }
    }

    manifestRecord.generatedAtIsoTimestamp = new Date().toISOString();
    writeFileSync(manifestPath, JSON.stringify(manifestRecord, null, 2), "utf8");
    return updatedStatusCount;
}

const updatedManifestEntryCount = runManifestSynchronization();
console.log(`SyncManifest: updated ${updatedManifestEntryCount} manifest entries from disk state.`);
