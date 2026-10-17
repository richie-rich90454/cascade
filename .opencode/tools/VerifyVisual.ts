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

const EDGE_EXECUTABLE_PATH =
    process.env.CASCADE_BROWSER_EXECUTABLE_PATH ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
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
        await browserPage.mouse.move(720, 450);
        const lineModeScroll = await browserPage.evaluate(async () => {
            const gameInstance = (
                window as unknown as {
                    cascadeGame?: {
                        scene: { getScene: (key: string) => { campaignContentContainer?: { y: number } | null } };
                    };
                }
            ).cascadeGame;
            const canvas = document.querySelector("canvas");
            const container = gameInstance?.scene.getScene("campaign_selector").campaignContentContainer;
            if (canvas === null || container === undefined || container === null) {
                return null;
            }
            const previousY = container.y;
            const bounds = canvas.getBoundingClientRect();
            canvas.dispatchEvent(
                new WheelEvent("wheel", {
                    deltaY: 1,
                    deltaMode: WheelEvent.DOM_DELTA_LINE,
                    clientX: bounds.left + bounds.width * 0.5,
                    clientY: bounds.top + bounds.height * 0.5,
                    bubbles: true,
                    cancelable: true,
                }),
            );
            await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
            return {
                movedCssPx: Math.abs(container.y - previousY) / window.devicePixelRatio,
                devicePixelRatio: window.devicePixelRatio,
            };
        });
        if (lineModeScroll === null || lineModeScroll.movedCssPx < 24) {
            throw new Error(
                `One line-mode wheel tick moved only ${lineModeScroll?.movedCssPx ?? 0} CSS px; scroll feels unresponsive.`,
            );
        }
        await browserPage.mouse.wheel({ deltaY: 700 });
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
        const campaignScrolledDown = await browserPage.evaluate(() => {
            const gameInstance = (
                window as unknown as {
                    cascadeGame?: {
                        scene: { getScene: (key: string) => { campaignContentContainer?: { y: number } | null } };
                    };
                }
            ).cascadeGame;
            return (gameInstance?.scene.getScene("campaign_selector").campaignContentContainer?.y ?? 0) < 0;
        });
        if (!campaignScrolledDown) {
            throw new Error("Mouse wheel did not scroll the campaign list.");
        }
        const campaignButtonMetrics = await browserPage.evaluate(() => {
            const gameInstance = (
                window as unknown as {
                    cascadeGame?: { scene: { getScene: (key: string) => { children: { list: unknown[] } } } };
                }
            ).cascadeGame;
            const metrics: Array<{
                label: string;
                fontSizeCss: number;
                width: number;
                height: number;
                availableWidth: number;
                availableHeight: number;
            }> = [];
            const pendingObjects = [
                ...(gameInstance?.scene.getScene("campaign_selector").children.list ?? []),
            ] as any[];
            while (pendingObjects.length > 0) {
                const object = pendingObjects.pop();
                if (!object || object.visible === false || object.active === false) continue;
                if (Array.isArray(object.list)) {
                    let label: any = null;
                    let zone: any = null;
                    if (object.name === "cascade-ui-button") {
                        for (const child of object.list) {
                            if (label === null && typeof child?.text === "string") label = child;
                            if (zone === null && child?.input?.hitArea !== undefined) zone = child;
                        }
                    }
                    if (label && zone) {
                        metrics.push({
                            label: label.text,
                            fontSizeCss: Number.parseFloat(String(label.style.fontSize)) * label.scaleX * object.scaleX,
                            width: label.displayWidth * object.scaleX,
                            height: label.displayHeight * object.scaleY,
                            availableWidth: zone.input.hitArea.width - 20,
                            availableHeight: zone.input.hitArea.height - 4,
                        });
                    }
                    pendingObjects.push(...object.list);
                }
            }
            return metrics;
        });
        if (campaignButtonMetrics.length === 0) {
            throw new Error("The browser regression loop could not inspect campaign button labels.");
        }
        const invalidButtonMetric = campaignButtonMetrics.find(
            (metric) =>
                metric.fontSizeCss < 12 ||
                metric.width > metric.availableWidth + 1 ||
                metric.height > metric.availableHeight + 1,
        );
        if (invalidButtonMetric !== undefined) {
            throw new Error(`Campaign button label is too small or clipped: ${JSON.stringify(invalidButtonMetric)}`);
        }
        await browserPage.mouse.wheel({ deltaY: -900 });
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
        await captureScreenshot("02-campaign-selector.png");

        await browserPage.mouse.click(270, 230);
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 1800));
        const briefingSceneIsActive = await browserPage.evaluate(() => {
            const gameInstance = (
                window as unknown as {
                    cascadeGame?: { scene: { getScenes: (isActive: boolean) => Array<{ scene: { key: string } }> } };
                }
            ).cascadeGame;
            return (
                gameInstance?.scene
                    .getScenes(true)
                    .some((activeScene) => activeScene.scene.key === "scenario_briefing") ?? false
            );
        });
        if (!briefingSceneIsActive) {
            throw new Error("Clicking the unlocked campaign card did not open its scenario briefing.");
        }
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 5600));
        await captureScreenshot("03-scenario-briefing.png");
        await browserPage.mouse.move(720, 450);
        await browserPage.mouse.wheel({ deltaY: 700 });
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
        const briefingScrolledDown = await browserPage.evaluate(() => {
            const gameInstance = (
                window as unknown as {
                    cascadeGame?: {
                        scene: {
                            getScene: (key: string) => {
                                briefingContentContainer?: { y: number } | null;
                                briefingContentHeightPx?: number;
                            };
                        };
                    };
                }
            ).cascadeGame;
            const scene = gameInstance?.scene.getScene("scenario_briefing");
            return (scene?.briefingContentContainer?.y ?? 96) < 96;
        });
        if (!briefingScrolledDown) {
            throw new Error("Mouse wheel did not scroll the scenario briefing.");
        }
        await browserPage.mouse.wheel({ deltaY: -900 });
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));

        await browserPage.mouse.click(720, 844);
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 3500));
        const playSceneIsActive = await browserPage.evaluate(() => {
            const gameInstance = (
                window as unknown as {
                    cascadeGame?: { scene: { getScenes: (isActive: boolean) => Array<{ scene: { key: string } }> } };
                }
            ).cascadeGame;
            return (
                gameInstance?.scene.getScenes(true).some((activeScene) => activeScene.scene.key === "scenario_play") ??
                false
            );
        });
        if (!playSceneIsActive) {
            throw new Error("Clicking Begin Scenario did not open the scenario play scene.");
        }
        await captureScreenshot("04-scenario-play.png");

        await browserPage.mouse.click(1262, 439);
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 2200));
        await captureScreenshot("05-scenario-play-next-step.png");
        const scenarioButtonMetrics = await browserPage.evaluate(() => {
            const gameInstance = (
                window as unknown as {
                    cascadeGame?: { scene: { getScene: (key: string) => { children: { list: unknown[] } } } };
                }
            ).cascadeGame;
            const metrics: Array<{
                label: string;
                fontSizeCss: number;
                width: number;
                height: number;
                availableWidth: number;
                availableHeight: number;
            }> = [];
            const pendingObjects = [...(gameInstance?.scene.getScene("scenario_play").children.list ?? [])] as any[];
            while (pendingObjects.length > 0) {
                const object = pendingObjects.pop();
                if (!object || object.visible === false || object.active === false) continue;
                if (object.name === "cascade-ui-button" && Array.isArray(object.list)) {
                    let label: any = null;
                    for (const child of object.list) {
                        if (typeof child?.text === "string") {
                            label = child;
                            break;
                        }
                    }
                    if (label !== null) {
                        const width = Number(object.getData("buttonWidthPx"));
                        const height = Number(object.getData("buttonHeightPx"));
                        metrics.push({
                            label: label.text,
                            fontSizeCss: Number.parseFloat(String(label.style.fontSize)) * label.scaleX * object.scaleX,
                            width: label.displayWidth * object.scaleX,
                            height: label.displayHeight * object.scaleY,
                            availableWidth: width - 20,
                            availableHeight: height - 4,
                        });
                    }
                }
                if (Array.isArray(object.list)) pendingObjects.push(...object.list);
            }
            return metrics;
        });
        if (scenarioButtonMetrics.length === 0) {
            throw new Error("The browser regression loop could not inspect scenario play button labels.");
        }
        const clippedScenarioButton = scenarioButtonMetrics.find(
            (metric) =>
                metric.fontSizeCss < 12 ||
                metric.width > metric.availableWidth + 1 ||
                metric.height > metric.availableHeight + 1,
        );
        if (clippedScenarioButton !== undefined) {
            throw new Error(
                `Scenario play button label is too small or clipped: ${JSON.stringify(clippedScenarioButton)}`,
            );
        }

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
