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
        let browserPage = await browserInstance.newPage();
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
        const navigationStartedAtMs = Date.now();
        await browserPage.goto(`http://localhost:${DEVELOPMENT_SERVER_PORT}/`, { waitUntil: "load", timeout: 60000 });
        await browserPage.waitForFunction(
            () => {
                const gameInstance = (
                    window as unknown as {
                        cascadeGame?: { scene: { getScenes: (active: boolean) => Array<{ scene: { key: string } }> } };
                    }
                ).cascadeGame;
                return (
                    gameInstance?.scene.getScenes(true).some((activeScene) => activeScene.scene.key === "main_menu") ??
                    false
                );
            },
            { timeout: 10000 },
        );
        console.log(`VerifyVisual: main menu ready in ${Date.now() - navigationStartedAtMs} ms.`);

        const captureScreenshot = async (fileName: string): Promise<void> => {
            const screenshotPath = join(OUTPUT_DIRECTORY_PATH, fileName);
            await browserPage.screenshot({ path: screenshotPath });
            screenshotPaths.push(screenshotPath);
        };
        const assertNoAllCapsUiText = async (sceneKey: string): Promise<void> => {
            const allCapsText = await browserPage.evaluate((targetSceneKey: string) => {
                const gameInstance = (
                    window as unknown as {
                        cascadeGame?: { scene: { getScene: (key: string) => { children: { list: unknown[] } } } };
                    }
                ).cascadeGame;
                const scene = gameInstance?.scene.getScene(targetSceneKey);
                if (scene === undefined) return null;
                const pendingObjects = [...scene.children.list] as any[];
                const visitedObjects = new Set<any>();
                const foundText: string[] = [];
                while (pendingObjects.length > 0) {
                    const object = pendingObjects.pop();
                    if (!object || visitedObjects.has(object)) continue;
                    visitedObjects.add(object);
                    if (object.visible === false || object.active === false) continue;
                    if (typeof object.text === "string") {
                        const text = object.text.trim();
                        if (/[A-Z]/.test(text) && text === text.toLocaleUpperCase("en")) {
                            foundText.push(text);
                        }
                    }
                    if (Array.isArray(object.list)) pendingObjects.push(...object.list);
                }
                return foundText;
            }, sceneKey);
            if (allCapsText === null) {
                throw new Error(`The browser regression loop could not inspect the ${sceneKey} screen.`);
            }
            if (allCapsText.length > 0) {
                throw new Error(`${sceneKey} contains all-caps UI text: ${allCapsText.join(" | ")}`);
            }
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
        const waitForActiveScene = async (sceneKey: string): Promise<void> => {
            await browserPage.waitForFunction(
                (targetSceneKey: string) => {
                    const gameInstance = (
                        window as unknown as {
                            cascadeGame?: {
                                scene: { getScenes: (active: boolean) => Array<{ scene: { key: string } }> };
                            };
                        }
                    ).cascadeGame;
                    return (
                        gameInstance?.scene
                            .getScenes(true)
                            .some((activeScene) => activeScene.scene.key === targetSceneKey) ?? false
                    );
                },
                { timeout: 15000 },
                sceneKey,
            );
            await new Promise((resolveDelay) => setTimeout(resolveDelay, 400));
        };
        const assertSceneButtonsFit = async (sceneKey: string): Promise<void> => {
            const layout = await browserPage.evaluate((targetSceneKey: string) => {
                const gameInstance = (
                    window as unknown as {
                        cascadeGame?: {
                            scale: { width: number; height: number; displayScale: { x: number; y: number } };
                            scene: { getScene: (key: string) => { children: { list: unknown[] } } };
                        };
                    }
                ).cascadeGame;
                const scene = gameInstance?.scene.getScene(targetSceneKey);
                if (gameInstance === undefined || scene === undefined) return null;
                const pendingObjects = [...scene.children.list] as any[];
                const visitedObjects = new Set<any>();
                const buttonsOutsideViewport: Array<{ label: string; bounds: string }> = [];
                while (pendingObjects.length > 0) {
                    const object = pendingObjects.pop();
                    if (!object || visitedObjects.has(object)) continue;
                    visitedObjects.add(object);
                    if (object.visible === false || object.active === false) continue;
                    if (object.name === "cascade-ui-button" && Array.isArray(object.list)) {
                        let currentParent = object.parentContainer;
                        let isClippedByScrollMask = false;
                        const visitedParents = new Set<any>();
                        while (currentParent !== null && currentParent !== undefined) {
                            if (visitedParents.has(currentParent)) {
                                isClippedByScrollMask = true;
                                break;
                            }
                            visitedParents.add(currentParent);
                            if (currentParent.mask !== null && currentParent.mask !== undefined) {
                                isClippedByScrollMask = true;
                                break;
                            }
                            currentParent = currentParent.parentContainer;
                        }
                        const buttonBounds = object.getBounds();
                        const right = buttonBounds.x + buttonBounds.width;
                        const bottom = buttonBounds.y + buttonBounds.height;
                        if (
                            !isClippedByScrollMask &&
                            (buttonBounds.x < -1 ||
                                buttonBounds.y < -1 ||
                                right > gameInstance.scale.width * gameInstance.scale.displayScale.x + 1 ||
                                bottom > gameInstance.scale.height * gameInstance.scale.displayScale.y + 1)
                        ) {
                            const label = object.list.find((child: any) => typeof child?.text === "string");
                            buttonsOutsideViewport.push({
                                label: label?.text ?? "unlabeled button",
                                bounds: `${buttonBounds.x},${buttonBounds.y},${buttonBounds.width},${buttonBounds.height}`,
                            });
                        }
                    }
                    if (Array.isArray(object.list)) pendingObjects.push(...object.list);
                }
                return {
                    buttonsOutsideViewport,
                    width: gameInstance.scale.width * gameInstance.scale.displayScale.x,
                    height: gameInstance.scale.height * gameInstance.scale.displayScale.y,
                };
            }, sceneKey);
            if (layout === null) {
                throw new Error(`The browser regression loop could not inspect the ${sceneKey} layout.`);
            }
            if (layout.buttonsOutsideViewport.length > 0) {
                throw new Error(
                    `${sceneKey} has buttons outside the ${layout.width} × ${layout.height} viewport: ${JSON.stringify(layout.buttonsOutsideViewport)}`,
                );
            }
        };
        const activateUiButton = async (sceneKey: string, labelPart: string): Promise<void> => {
            const activated = await browserPage.evaluate(
                (target: { sceneKey: string; labelPart: string }) => {
                    const gameInstance = (
                        window as unknown as {
                            cascadeGame?: { scene: { getScene: (key: string) => { children: { list: unknown[] } } } };
                        }
                    ).cascadeGame;
                    const scene = gameInstance?.scene.getScene(target.sceneKey);
                    if (scene === undefined) return false;
                    const pendingObjects = [...scene.children.list] as any[];
                    const visitedObjects = new Set<any>();
                    while (pendingObjects.length > 0) {
                        const object = pendingObjects.pop();
                        if (!object || visitedObjects.has(object)) continue;
                        visitedObjects.add(object);
                        if (object.visible === false || object.active === false) continue;
                        if (object.name === "cascade-ui-button" && Array.isArray(object.list)) {
                            const label = object.list.find((child: any) => typeof child?.text === "string");
                            const zone = object.list.find((child: any) => child?.input?.hitArea !== undefined);
                            if (
                                typeof label?.text === "string" &&
                                label.text.toLocaleLowerCase("en").includes(target.labelPart.toLocaleLowerCase("en")) &&
                                zone !== undefined
                            ) {
                                zone.emit("pointerup");
                                return true;
                            }
                        }
                        if (Array.isArray(object.list)) pendingObjects.push(...object.list);
                    }
                    return false;
                },
                { sceneKey, labelPart },
            );
            if (!activated) {
                throw new Error(`Could not activate the ${labelPart} control in ${sceneKey}.`);
            }
        };

        await captureScreenshot("01-main-menu.png");
        await assertNoAllCapsUiText("main_menu");

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
            const visitedObjects = new Set<any>();
            while (pendingObjects.length > 0) {
                const object = pendingObjects.pop();
                if (!object || visitedObjects.has(object)) continue;
                visitedObjects.add(object);
                if (object.visible === false || object.active === false) continue;
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
        await assertNoAllCapsUiText("campaign_selector");

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
        await assertNoAllCapsUiText("scenario_briefing");
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
        await assertNoAllCapsUiText("scenario_play");

        await browserPage.mouse.click(1262, 439);
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 2200));
        await captureScreenshot("05-scenario-play-next-step.png");
        await assertNoAllCapsUiText("scenario_play");
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
            const visitedObjects = new Set<any>();
            while (pendingObjects.length > 0) {
                const object = pendingObjects.pop();
                if (!object || visitedObjects.has(object)) continue;
                visitedObjects.add(object);
                if (object.visible === false || object.active === false) continue;
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
        await assertSceneButtonsFit("scenario_play");

        browserPage = await browserInstance.newPage();
        await browserPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
        browserPage.on("console", (consoleMessage) => {
            if (consoleMessage.type() === "error") consoleErrors.push(consoleMessage.text());
        });
        browserPage.on("pageerror", (pageError) => consoleErrors.push(String(pageError)));
        await browserPage.evaluateOnNewDocument(() => {
            window.localStorage.setItem("cascade.tutorial.seen", "true");
            window.localStorage.setItem("cascade.onboarding.seen", "true");
        });
        await browserPage.goto(`http://localhost:${DEVELOPMENT_SERVER_PORT}/`, { waitUntil: "load", timeout: 60000 });
        await waitForActiveScene("main_menu");
        await captureScreenshot("06-mobile-main-menu.png");
        await assertSceneButtonsFit("main_menu");
        await activateUiButton("main_menu", "Start a Campaign");
        await waitForActiveScene("campaign_selector");
        await captureScreenshot("07-mobile-campaign-selector.png");
        await assertNoAllCapsUiText("campaign_selector");
        await assertSceneButtonsFit("campaign_selector");
        await switchToSingleScene("scenario_briefing", { scenarioNumber: 1 });
        await waitForActiveScene("scenario_briefing");
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 5600));
        await captureScreenshot("08-mobile-scenario-briefing.png");
        await assertSceneButtonsFit("scenario_briefing");
        await activateUiButton("scenario_briefing", "Begin Scenario");
        await waitForActiveScene("scenario_play");
        await captureScreenshot("09-mobile-scenario-play.png");
        await assertNoAllCapsUiText("scenario_play");
        await assertSceneButtonsFit("scenario_play");

        browserPage = await browserInstance.newPage();
        await browserPage.setViewport({ width: 844, height: 390, deviceScaleFactor: 2 });
        browserPage.on("console", (consoleMessage) => {
            if (consoleMessage.type() === "error") consoleErrors.push(consoleMessage.text());
        });
        browserPage.on("pageerror", (pageError) => consoleErrors.push(String(pageError)));
        await browserPage.evaluateOnNewDocument(() => {
            window.localStorage.setItem("cascade.tutorial.seen", "true");
            window.localStorage.setItem("cascade.onboarding.seen", "true");
        });
        await browserPage.goto(`http://localhost:${DEVELOPMENT_SERVER_PORT}/`, { waitUntil: "load", timeout: 60000 });
        await waitForActiveScene("main_menu");
        await activateUiButton("main_menu", "Resume Campaign");
        await waitForActiveScene("scenario_play");
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 700));
        const shortViewportLayout = await browserPage.evaluate(() => {
            const gameInstance = (
                window as unknown as {
                    cascadeGame?: {
                        scale: { height: number };
                        scene: { getScene: (key: string) => { getLayoutRects: () => any } };
                    };
                }
            ).cascadeGame;
            if (gameInstance === undefined) return null;
            const layout = gameInstance.scene.getScene("scenario_play").getLayoutRects();
            return {
                mapBottom: layout.map.topY + layout.map.height,
                phaseTop: layout.phaseCard.topY,
                phaseBottom: layout.phaseCard.topY + layout.phaseCard.height,
                viewportBottom: gameInstance.scale.height,
            };
        });
        if (
            shortViewportLayout === null ||
            shortViewportLayout.mapBottom > shortViewportLayout.phaseTop ||
            shortViewportLayout.phaseBottom > shortViewportLayout.viewportBottom - 56
        ) {
            throw new Error(
                `Short landscape scenario layout overlaps or exceeds its viewport: ${JSON.stringify(shortViewportLayout)}`,
            );
        }
        await captureScreenshot("10-short-landscape-scenario-play.png");
        await assertNoAllCapsUiText("scenario_play");
        await assertSceneButtonsFit("scenario_play");
        await activateUiButton("scenario_play", "+");
        const zoomedMapScale = await browserPage.evaluate(() => {
            const gameInstance = (
                window as unknown as {
                    cascadeGame?: {
                        scene: {
                            getScene: (key: string) => { mapCameraController?: { getCurrentScale: () => number } };
                        };
                    };
                }
            ).cascadeGame;
            return gameInstance?.scene.getScene("scenario_play").mapCameraController?.getCurrentScale() ?? 0;
        });
        if (zoomedMapScale <= 2.8) {
            throw new Error(`The short landscape zoom control did not zoom in: scale ${zoomedMapScale}.`);
        }
        await activateUiButton("scenario_play", "Overview");
        const overviewMapScale = await browserPage.evaluate(() => {
            const gameInstance = (
                window as unknown as {
                    cascadeGame?: {
                        scene: {
                            getScene: (key: string) => { mapCameraController?: { getCurrentScale: () => number } };
                        };
                    };
                }
            ).cascadeGame;
            return gameInstance?.scene.getScene("scenario_play").mapCameraController?.getCurrentScale() ?? 0;
        });
        if (overviewMapScale !== 1) {
            throw new Error(`The landscape overview control did not restore the full map: scale ${overviewMapScale}.`);
        }

        browserPage = await browserInstance.newPage();
        await browserPage.setViewport({ width: 320, height: 568, deviceScaleFactor: 2 });
        browserPage.on("console", (consoleMessage) => {
            if (consoleMessage.type() === "error") consoleErrors.push(consoleMessage.text());
        });
        browserPage.on("pageerror", (pageError) => consoleErrors.push(String(pageError)));
        await browserPage.evaluateOnNewDocument(() => {
            window.localStorage.setItem("cascade.tutorial.seen", "true");
            window.localStorage.setItem("cascade.onboarding.seen", "true");
        });
        await browserPage.goto(`http://localhost:${DEVELOPMENT_SERVER_PORT}/`, { waitUntil: "load", timeout: 60000 });
        await waitForActiveScene("main_menu");
        await activateUiButton("main_menu", "Resume Campaign");
        await waitForActiveScene("scenario_play");
        await captureScreenshot("11-small-phone-scenario-play.png");
        await assertNoAllCapsUiText("scenario_play");
        await assertSceneButtonsFit("scenario_play");

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
