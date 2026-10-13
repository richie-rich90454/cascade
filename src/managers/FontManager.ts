export class FontFamilies {
    public static readonly GOTHIC: string = '"UnifrakturMaguntia", serif';
    public static readonly DISPLAY_SERIF: string = '"Cinzel", serif';
    public static readonly BODY_SERIF: string = '"EB Garamond", serif';
    public static readonly TYPEWRITER_HEADER: string = '"Special Elite", monospace';
    public static readonly TYPEWRITER_BODY: string = '"Courier Prime", monospace';
    public static readonly SMALL_CAPS: string = '"Spectral SC", serif';

    public static readonly ALL_FAMILY_NAMES: string[] = [
        "UnifrakturMaguntia",
        "Cinzel",
        "EB Garamond",
        "Special Elite",
        "Courier Prime",
        "Spectral SC",
    ];

    public static getFontFamilyForRole(fontRole: string): string {
        switch (fontRole) {
            case "gothic":
                return FontFamilies.GOTHIC;
            case "display":
                return FontFamilies.DISPLAY_SERIF;
            case "body":
                return FontFamilies.BODY_SERIF;
            case "typewriter_header":
                return FontFamilies.TYPEWRITER_HEADER;
            case "typewriter_body":
                return FontFamilies.TYPEWRITER_BODY;
            case "small_caps":
                return FontFamilies.SMALL_CAPS;
            default:
                return FontFamilies.BODY_SERIF;
        }
    }
}

export class FontManager {
    private static readonly SINGLETON_INSTANCE = new FontManager();

    private hasCompletedFontLoading: boolean;

    private constructor() {
        this.hasCompletedFontLoading = false;
    }

    public static getInstance(): FontManager {
        return FontManager.SINGLETON_INSTANCE;
    }

    public async loadAllFonts(): Promise<boolean> {
        if (typeof document === "undefined" || !("fonts" in document)) {
            this.hasCompletedFontLoading = true;
            return this.hasCompletedFontLoading;
        }
        const fontLoadPromises: Promise<unknown>[] = [];
        for (const fontFamilyName of FontFamilies.ALL_FAMILY_NAMES) {
            fontLoadPromises.push(document.fonts.load(`16px "${fontFamilyName}"`, "Cascade"));
            fontLoadPromises.push(document.fonts.load(`bold 16px "${fontFamilyName}"`, "Cascade"));
        }
        try {
            await Promise.all(fontLoadPromises);
            await document.fonts.ready;
        } catch {
            this.hasCompletedFontLoading = true;
            return this.hasCompletedFontLoading;
        }
        this.hasCompletedFontLoading = FontFamilies.ALL_FAMILY_NAMES.every((fontFamilyName) =>
            document.fonts.check(`16px "${fontFamilyName}"`),
        );
        return this.hasCompletedFontLoading;
    }

    public isFontLoadingComplete(): boolean {
        return this.hasCompletedFontLoading;
    }
}
