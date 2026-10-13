import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { TierThreeAssetCatalog } from "./lib/TierThreeAssetCatalog";

function runAssetPromptWriting(): number {
    const repositoryRootPath = process.cwd();
    const promptOutputDirectoryPath = join(repositoryRootPath, "public", "assets", "prompts");
    mkdirSync(promptOutputDirectoryPath, { recursive: true });

    const tierThreeDefinitions = TierThreeAssetCatalog.buildCatalog();

    for (const tierThreeDefinition of tierThreeDefinitions) {
        const promptText = [
            `ASSET_ID: ${tierThreeDefinition.assetId}`,
            `ASSET_TYPE: ${tierThreeDefinition.assetType}`,
            `TARGET_TOOL: ${tierThreeDefinition.targetTool}`,
            `DIMENSIONS: ${tierThreeDefinition.dimensions}`,
            `STYLE_REFERENCE: ${tierThreeDefinition.styleReference}`,
            `PROMPT: ${tierThreeDefinition.promptText}`,
            `NEGATIVE_PROMPT: ${tierThreeDefinition.negativePromptText}`,
            `FILENAME: ${tierThreeDefinition.expectedFileName}`,
            `NOTES: ${tierThreeDefinition.usageNotes}`,
            `FALLBACK: ${tierThreeDefinition.fallbackDescription}`,
        ].join("\n");
        writeFileSync(join(promptOutputDirectoryPath, `${tierThreeDefinition.assetId}.txt`), promptText, "utf8");
    }

    return tierThreeDefinitions.length;
}

const writtenPromptCount = runAssetPromptWriting();
console.log(`WriteAssetPrompt: wrote ${writtenPromptCount} Tier 3 generation prompts to public/assets/prompts/.`);
