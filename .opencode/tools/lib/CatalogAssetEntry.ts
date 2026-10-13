export class CatalogAssetEntry {
    public readonly assetId: string;
    public readonly category: string;
    public readonly width: number;
    public readonly height: number;
    public readonly seedKey: string;

    constructor(assetId: string, category: string, width: number, height: number, seedKey: string) {
        this.assetId = assetId;
        this.category = category;
        this.width = width;
        this.height = height;
        this.seedKey = seedKey;
    }
}

export class SvgPalette {
    public static readonly NEAR_BLACK_LEATHER = "#1A1410";
    public static readonly DARK_OLIVE = "#2B2520";
    public static readonly MID_OLIVE = "#3D3A31";
    public static readonly FIELD_GRAY = "#6E6A5C";
    public static readonly BRASS_TAN = "#B6A472";
    public static readonly BRIGHT_BRASS = "#C9A961";
    public static readonly HIGHLIGHT_BRASS = "#E5CC8A";
    public static readonly DEEP_BRASS = "#7D6634";
    public static readonly BLOOD_RED = "#8B1A1A";
    public static readonly BRIGHT_BLOOD = "#C43D3D";
    public static readonly PARCHMENT = "#F2E8D5";
    public static readonly AGED_PARCHMENT = "#D4C29A";
    public static readonly DEEP_PARCHMENT = "#8B7355";
}

export class FactionColorTable {
    public static readonly PRIMARY_COLORS: Record<string, string> = {
        germany: "#3A3A3A",
        austria_hungary: "#8B1A1A",
        ottoman: "#2D5A3A",
        russia: "#8B1A1A",
        ussr: "#8B1A1A",
        france: "#2D4A8B",
        britain: "#1A3A5C",
        italy: "#4A5D3A",
        japan: "#8B1A1A",
        usa: "#2D4A8B",
        china: "#2D4A8B",
        india: "#B6A472",
    };
    public static readonly ACCENT_COLORS: Record<string, string> = {
        germany: "#C9A961",
        austria_hungary: "#F2E8D5",
        ottoman: "#C9A961",
        russia: "#C9A961",
        ussr: "#C9A961",
        france: "#C9A961",
        britain: "#C9A961",
        italy: "#C9A961",
        japan: "#F2E8D5",
        usa: "#F2E8D5",
        china: "#C9A961",
        india: "#8B1A1A",
    };
}

export class TerrainFillTable {
    public static readonly FILL_COLORS: Record<string, string> = {
        plains: "#5A6B42",
        forest: "#3D5233",
        mountains: "#6E6A5C",
        desert: "#B6A472",
        ocean: "#22364F",
        coastal: "#2D4A6B",
        urban: "#7D6634",
        industrial: "#4A4A4A",
        tundra: "#8B8B7E",
        swamp: "#4A5540",
    };
}
