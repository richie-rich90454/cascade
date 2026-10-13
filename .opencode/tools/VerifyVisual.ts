import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

import puppeteer from "puppeteer-core";

class VisualCheckResult {
    public readonly screenshotPaths: string[];
    public readonly consoleErrors: string[];
    public readonly canvasBackingWidth: number;
    public readonly canvasCssWidth: number;
    public readonly devicePixelRatio: number;
    public readonly displayScaleValue: number;

    constructor(
        screenshotPaths: string[],
        consoleErrors: string[],
        canvasBackingWidth: number,
        canvasCssWidth: number,
        devicePixelRatio: number,
        displayScaleValue: number,
    ) {
        this.screenshotPaths = screenshotPaths;
        this.consoleErrors = consoleErrors;
        this.canvasBackingWidth = canvasBackingWidth;
        this.canvasCssWidth = canvasCssWidth;
        this.devicePixelRatio = devicePixelRatio;
        this.displayScaleValue = displayScaleValue;
    }
}

const EDGE_EXECUTABLE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DEVELOPMENT_SERVER_PORT = 5342;
const OUTPUT_DIRECTORY_PATH = join(process.cwd(), ".opencode", "visual-checks");

async function waitForDevelopmentServer(maximumAttempts: number): Promise<boolean> {
    for (let attemptIndex = 0; attemptIndex < maximumAttempts; attemptIndex++) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 1000));
        try {
            const probeResponse = await fetch(`http://localhost:${DEVELOPMENT_SERVER_PORT}/`);
            if (probeResponse.ok) {
                return true;
            }
        } catch {
            continue;
        }
    }
    return false;
}

async function runVisualChecks(): Promise<VisualCheckResult> {
    mkdirSync(OUTPUT_DIRECTORY_PATH, { recursive: true });
    const developmentServerProcess = spawn(
        process.execPath,
        ["node_modules/vite/bin/vite.js", "--port", String(DEVELOPMENT_SERVER_PORT), "--strictPort"],
        { stdio: "ignore" },
    );
    const screenshotPaths: string[] = [];
    const consoleErrors: string[] = [];
    let canvasBackingWidth = 0;
    let canvasCssWidth = 0;
    let devicePixelRatioValue = 0;
    let displayScaleValue = 0;
    try {
        const serverReady = await waitForDevelopmentServer(30);
        if (!serverReady) {
            throw new Error("Development server did not become ready.");
        }
        const browserInstance = await puppeteer.launch({
            executablePath: EDGE_EXECUTABLE_PATH,
            headless: true,
            args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--window-size=1440,900"],
            defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
        });
        const browserPage = await browserInstance.newPage();
        browserPage.on("console", (consoleMessage) => {
            if (consoleMessage.type() === "error") {
                consoleErrors.push(consoleMessage.text());
            }
        });
        browserPage.on("pageerror", (pageError) => {
            consoleErrors.push(String(pageError));
        });
        await browserPage.evaluateOnNewDocument(() => {
            window.localStorage.setItem("cascade.tutorial.seen", "true");
            window.localStorage.setItem("cascade.onboarding.seen", "true");
        });
        await browserPage.goto(`http://localhost:${DEVELOPMENT_SERVER_PORT}/`, { waitUntil: "load", timeout: 60000 });
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 12000));

        const captureScreenshot = async (fileName: string): Promise<void> => {
            const screenshotPath = join(OUTPUT_DIRECTORY_PATH, fileName);
            await browserPage.screenshot({ path: screenshotPath });
            screenshotPaths.push(screenshotPath);
        };
        const switchToSingleScene = async (sceneKey: string, data?: unknown): Promise<void> => {
            await browserPage.evaluate(
                (targetSceneKey: string, sceneData: unknown) => {
                    const gameInstance = (
                        window as unknown as {
                            cascadeGame?: {
                                scene: {
                                    getScenes: (isActive: boolean) => Array<{ scene: { key: string } }>;
                                    stop: (key: string) => void;
                                    start: (key: string, data?: unknown) => void;
                                };
                            };
                        }
                    ).cascadeGame;
                    if (gameInstance === undefined) {
                        return;
                    }
                    for (const activeScene of gameInstance.scene.getScenes(true)) {
                        gameInstance.scene.stop(activeScene.scene.key);
                    }
                    gameInstance.scene.start(targetSceneKey, sceneData);
                },
                sceneKey,
                data,
            );
        };

        await captureScreenshot("01-main-menu.png");

        await switchToSingleScene("campaign_selector");
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 2000));
        await captureScreenshot("02-campaign-selector.png");

        await switchToSingleScene("scenario_briefing", { scenarioNumber: 1 });
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 5600));
        await captureScreenshot("03-scenario-briefing.png");

        await browserPage.mouse.click(720, 844);
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 3500));
        await captureScreenshot("04-scenario-play.png");

        await browserPage.mouse.click(1262, 439);
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 2200));
        await captureScreenshot("05-scenario-play-next-step.png");

        const trackerDebugState = await browserPage.evaluate(() => {
            const gameInstance = (
                window as unknown as {
                    cascadeGame?: {
                        scene: {
                            getScene: (key: string) => {
                                questTrackerComponent?: {
                                    panelHeight: number;
                                    contentContainer: { list: unknown[] };
                                    requiredObjectives: unknown[];
                                    recommendedObjectives: unknown[];
                                };
                            };
                        };
                    };
                }
            ).cascadeGame;
            const playScene = gameInstance?.scene.getScene("scenario_play");
            const tracker = playScene?.questTrackerComponent;
            return {
                panelHeight: tracker?.panelHeight ?? -1,
                contentChildCount: tracker?.contentContainer.list.length ?? -1,
                requiredCount: tracker?.requiredObjectives.length ?? -1,
                recommendedCount: tracker?.recommendedObjectives.length ?? -1,
            };
        });
        console.log(`VerifyVisual tracker debug: ${JSON.stringify(trackerDebugState)}`);

        const dpiState = await browserPage.evaluate(() => {
            const gameCanvasElement = document.querySelector("canvas");
            const cascadeGameInstance = (
                window as unknown as { cascadeGame?: { scale: { displayScale: { x: number } } } }
            ).cascadeGame;
            return {
                canvasBackingWidth: gameCanvasElement === null ? 0 : gameCanvasElement.width,
                canvasCssWidth: gameCanvasElement === null ? 0 : gameCanvasElement.clientWidth,
                devicePixelRatio: window.devicePixelRatio,
                displayScaleValue: cascadeGameInstance === undefined ? 0 : cascadeGameInstance.scale.displayScale.x,
            };
        });
        canvasBackingWidth = dpiState.canvasBackingWidth;
        canvasCssWidth = dpiState.canvasCssWidth;
        devicePixelRatioValue = dpiState.devicePixelRatio;
        displayScaleValue = dpiState.displayScaleValue;
        await browserInstance.close();
    } finally {
        developmentServerProcess.kill();
    }
    return new VisualCheckResult(
        screenshotPaths,
        consoleErrors,
        canvasBackingWidth,
        canvasCssWidth,
        devicePixelRatioValue,
        displayScaleValue,
    );
}

const visualCheckResult = await runVisualChecks();
console.log(`VerifyVisual: screenshots written: ${visualCheckResult.screenshotPaths.join(", ")}`);
console.log(
    `VerifyVisual: canvas backing width ${visualCheckResult.canvasBackingWidth}, css width ${visualCheckResult.canvasCssWidth}, devicePixelRatio ${visualCheckResult.devicePixelRatio}, displayScale ${visualCheckResult.displayScaleValue}`,
);
if (visualCheckResult.consoleErrors.length > 0) {
    console.error(`VerifyVisual: console errors (${visualCheckResult.consoleErrors.length}):`);
    for (const consoleError of visualCheckResult.consoleErrors.slice(0, 12)) {
        console.error(`  ${consoleError}`);
    }
    process.exitCode = 1;
} else {
    console.log("VerifyVisual: no console errors.");
}
