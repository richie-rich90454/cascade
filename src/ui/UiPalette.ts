export class UiPalette {
    public static readonly NEAR_BLACK_LEATHER = 0x1a1410;
    public static readonly DARK_OLIVE = 0x2b2520;
    public static readonly MID_OLIVE = 0x3d3a31;
    public static readonly FIELD_GRAY = 0x6e6a5c;
    public static readonly BRASS_TAN = 0xb6a472;
    public static readonly BRIGHT_BRASS = 0xc9a961;
    public static readonly HIGHLIGHT_BRASS = 0xe5cc8a;
    public static readonly DEEP_BRASS = 0x7d6634;
    public static readonly BLOOD_RED = 0x8b1a1a;
    public static readonly BRIGHT_BLOOD = 0xc43d3d;
    public static readonly PARCHMENT = 0xf2e8d5;
    public static readonly AGED_PARCHMENT = 0xd4c29a;
    public static readonly DEEP_PARCHMENT = 0x8b7355;
    public static readonly WHITE_INK = 0xfaf5ea;

    public static readonly NEAR_BLACK_LEATHER_CSS = "#1A1410";
    public static readonly DARK_OLIVE_CSS = "#2B2520";
    public static readonly MID_OLIVE_CSS = "#3D3A31";
    public static readonly FIELD_GRAY_CSS = "#6E6A5C";
    public static readonly BRASS_TAN_CSS = "#B6A472";
    public static readonly BRIGHT_BRASS_CSS = "#C9A961";
    public static readonly HIGHLIGHT_BRASS_CSS = "#E5CC8A";
    public static readonly DEEP_BRASS_CSS = "#7D6634";
    public static readonly BLOOD_RED_CSS = "#8B1A1A";
    public static readonly BRIGHT_BLOOD_CSS = "#C43D3D";
    public static readonly PARCHMENT_CSS = "#F2E8D5";
    public static readonly AGED_PARCHMENT_CSS = "#D4C29A";
    public static readonly DEEP_PARCHMENT_CSS = "#8B7355";

    public static readonly UI_DEPTH_BASE = 0;
    public static readonly UI_DEPTH_PANEL = 100;
    public static readonly UI_DEPTH_SIDEBAR = 200;
    public static readonly UI_DEPTH_POPUP = 500;
    public static readonly UI_DEPTH_TOOLTIP = 1000;

    public static getFactionColorForNationCode(nationCode: string): number {
        switch (nationCode) {
            case "GER":
                return 0x3a3a3a;
            case "AUH":
                return 0x8b1a1a;
            case "OTT":
            case "TUR":
                return 0x2d5a3a;
            case "RUS":
            case "SOV":
                return 0x8b1a1a;
            case "FRA":
                return 0x2d4a8b;
            case "ENG":
                return 0x1a3a5c;
            case "ITA":
                return 0x4a5d3a;
            case "JAP":
                return 0x8b1a1a;
            case "USA":
                return 0x2d4a8b;
            case "QNG":
            case "CHN":
                return 0x2d4a8b;
            case "RAJ":
                return 0xb6a472;
            case "MEX":
            case "KHM":
                return 0x2d5a3a;
            case "BRZ":
            case "RWA":
                return 0x4a5d3a;
            case "SER":
                return 0x6e2b2b;
            case "BEL":
                return 0x8b1a1a;
            case "WAF":
                return 0x2d4a8b;
            default:
                return 0x6e6a5c;
        }
    }
}
