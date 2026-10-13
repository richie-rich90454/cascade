export class AssetManifestEntry {
    public readonly assetIdentifier: string;
    public readonly assetCategory: string;
    public readonly assetTier: number;
    public readonly assetSource: string;
    public readonly relativeFilePath: string;
    public readonly pixelWidth: number;
    public readonly pixelHeight: number;
    public readonly assetStatus: string;

    constructor(
        assetIdentifier: string,
        assetCategory: string,
        assetTier: number,
        assetSource: string,
        relativeFilePath: string,
        pixelWidth: number,
        pixelHeight: number,
        assetStatus: string,
    ) {
        this.assetIdentifier = assetIdentifier;
        this.assetCategory = assetCategory;
        this.assetTier = assetTier;
        this.assetSource = assetSource;
        this.relativeFilePath = relativeFilePath;
        this.pixelWidth = pixelWidth;
        this.pixelHeight = pixelHeight;
        this.assetStatus = assetStatus;
    }
}

interface RawManifestEntryRecord {
    assetId: string;
    category: string;
    tier: number;
    source: string;
    file: string;
    width: number;
    height: number;
    status: string;
}

export class AssetManager {
    private static readonly SINGLETON_INSTANCE = new AssetManager();
    private static readonly MANIFEST_URL = "assets/manifest.json";

    private readonly entriesByAssetIdentifier: Map<string, AssetManifestEntry>;

    private hasLoadedManifest: boolean;

    private constructor() {
        this.entriesByAssetIdentifier = new Map<string, AssetManifestEntry>();
        this.hasLoadedManifest = false;
    }

    public static getInstance(): AssetManager {
        return AssetManager.SINGLETON_INSTANCE;
    }

    public async loadManifest(): Promise<void> {
        if (this.hasLoadedManifest) {
            return;
        }
        const manifestResponse = await fetch(AssetManager.MANIFEST_URL);
        if (!manifestResponse.ok) {
            throw new Error(`Unable to load asset manifest from ${AssetManager.MANIFEST_URL}.`);
        }
        const parsedManifest = (await manifestResponse.json()) as { assets: RawManifestEntryRecord[] };
        for (const rawEntry of parsedManifest.assets) {
            this.entriesByAssetIdentifier.set(
                rawEntry.assetId,
                new AssetManifestEntry(
                    rawEntry.assetId,
                    rawEntry.category,
                    rawEntry.tier,
                    rawEntry.source,
                    rawEntry.file,
                    rawEntry.width,
                    rawEntry.height,
                    rawEntry.status,
                ),
            );
        }
        this.hasLoadedManifest = true;
    }

    public hasLoadedManifestData(): boolean {
        return this.hasLoadedManifest;
    }

    public getManifestEntry(assetIdentifier: string): AssetManifestEntry | null {
        return this.entriesByAssetIdentifier.get(assetIdentifier) ?? null;
    }

    public getAssetFilePath(assetIdentifier: string): string | null {
        const manifestEntry = this.entriesByAssetIdentifier.get(assetIdentifier);
        return manifestEntry === null || manifestEntry === undefined ? null : manifestEntry.relativeFilePath;
    }

    public getTextureKey(assetIdentifier: string): string {
        return `asset-${assetIdentifier}`;
    }

    public getEntryCount(): number {
        return this.entriesByAssetIdentifier.size;
    }

    public getEntriesByCategory(assetCategory: string): AssetManifestEntry[] {
        const matchingEntries: AssetManifestEntry[] = [];
        for (const manifestEntry of this.entriesByAssetIdentifier.values()) {
            if (manifestEntry.assetCategory === assetCategory) {
                matchingEntries.push(manifestEntry);
            }
        }
        return matchingEntries;
    }

    public getAllEntries(): AssetManifestEntry[] {
        return Array.from(this.entriesByAssetIdentifier.values());
    }

    public getSvgEntries(): AssetManifestEntry[] {
        return this.getAllEntries().filter((manifestEntry) => manifestEntry.relativeFilePath.endsWith(".svg"));
    }

    public getMidiEntries(): AssetManifestEntry[] {
        return this.getAllEntries().filter((manifestEntry) => manifestEntry.relativeFilePath.endsWith(".mid"));
    }
}
