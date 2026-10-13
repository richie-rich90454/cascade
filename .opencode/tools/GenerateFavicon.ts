import { execSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

class FaviconGenerationStep {
    public readonly stepDescription: string;
    public readonly commandLine: string;

    constructor(stepDescription: string, commandLine: string) {
        this.stepDescription = stepDescription;
        this.commandLine = commandLine;
    }
}

function buildFaviconGenerationSteps(): FaviconGenerationStep[] {
    return [
        new FaviconGenerationStep(
            "android chrome 512",
            "magick -background none -density 768 public/favicon.svg -resize 512x512 public/icons/android-chrome-512x512.png",
        ),
        new FaviconGenerationStep(
            "android chrome 192",
            "magick -background none -density 288 public/favicon.svg -resize 192x192 public/icons/android-chrome-192x192.png",
        ),
        new FaviconGenerationStep(
            "apple touch icon 180",
            'magick -background "#1A1410" -density 270 public/favicon.svg -resize 180x180 -alpha remove -alpha off public/icons/apple-touch-icon.png',
        ),
        new FaviconGenerationStep(
            "favicon 48",
            "magick -background none -density 72 public/favicon.svg -resize 48x48 public/icons/favicon-48x48.png",
        ),
        new FaviconGenerationStep(
            "favicon 32",
            "magick -background none -density 48 public/favicon.svg -resize 32x32 public/icons/favicon-32x32.png",
        ),
        new FaviconGenerationStep(
            "favicon 16",
            "magick -background none -density 24 public/favicon.svg -resize 16x16 public/icons/favicon-16x16.png",
        ),
        new FaviconGenerationStep(
            "multi resolution favicon.ico",
            "magick public/icons/favicon-16x16.png public/icons/favicon-32x32.png public/icons/favicon-48x48.png public/favicon.ico",
        ),
        new FaviconGenerationStep(
            "maskable 512",
            'magick -background "#1A1410" -density 768 public/favicon-maskable.svg -resize 512x512 -alpha remove -alpha off public/icons/maskable-512x512.png',
        ),
    ];
}

function runFaviconGeneration(): void {
    const repositoryRootPath = process.cwd();
    mkdirSync(join(repositoryRootPath, "public", "icons"), { recursive: true });
    const faviconGenerationSteps = buildFaviconGenerationSteps();
    for (const faviconGenerationStep of faviconGenerationSteps) {
        execSync(faviconGenerationStep.commandLine, { cwd: repositoryRootPath, stdio: "pipe" });
        console.log(`GenerateFavicon: ${faviconGenerationStep.stepDescription} done.`);
    }
    const expectedOutputPaths = [
        "public/favicon.ico",
        "public/icons/favicon-16x16.png",
        "public/icons/favicon-32x32.png",
        "public/icons/favicon-48x48.png",
        "public/icons/apple-touch-icon.png",
        "public/icons/android-chrome-192x192.png",
        "public/icons/android-chrome-512x512.png",
        "public/icons/maskable-512x512.png",
    ];
    for (const expectedOutputPath of expectedOutputPaths) {
        const resolvedOutputPath = join(repositoryRootPath, expectedOutputPath);
        if (!existsSync(resolvedOutputPath) || statSync(resolvedOutputPath).size === 0) {
            throw new Error(`GenerateFavicon: expected output missing or empty: ${expectedOutputPath}`);
        }
        const identificationOutput = execSync(`magick identify -format "%wx%h" "${resolvedOutputPath}"`, {
            cwd: repositoryRootPath,
            stdio: "pipe",
        })
            .toString()
            .trim();
        console.log(`GenerateFavicon: ${expectedOutputPath} verified at ${identificationOutput}.`);
    }
}

runFaviconGeneration();
console.log("GenerateFavicon: all favicon assets generated and verified.");
