export class TierThreeAssetDefinition {
    public readonly assetId: string;
    public readonly assetType: string;
    public readonly targetTool: string;
    public readonly dimensions: string;
    public readonly styleReference: string;
    public readonly promptText: string;
    public readonly negativePromptText: string;
    public readonly expectedFileName: string;
    public readonly usageNotes: string;
    public readonly fallbackDescription: string;

    constructor(
        assetId: string,
        assetType: string,
        targetTool: string,
        dimensions: string,
        styleReference: string,
        promptText: string,
        negativePromptText: string,
        expectedFileName: string,
        usageNotes: string,
        fallbackDescription: string,
    ) {
        this.assetId = assetId;
        this.assetType = assetType;
        this.targetTool = targetTool;
        this.dimensions = dimensions;
        this.styleReference = styleReference;
        this.promptText = promptText;
        this.negativePromptText = negativePromptText;
        this.expectedFileName = expectedFileName;
        this.usageNotes = usageNotes;
        this.fallbackDescription = fallbackDescription;
    }
}

export class TierThreeAssetCatalog {
    public static buildCatalog(): TierThreeAssetDefinition[] {
        const catalogDefinitions: TierThreeAssetDefinition[] = [];
        const leaderPortraitDefinitions: Array<{ assetId: string; subjectName: string }> = [
            { assetId: "leader_portrait_wilhelm_ii", subjectName: "Kaiser Wilhelm II" },
            { assetId: "leader_portrait_franz_joseph", subjectName: "Emperor Franz Joseph" },
            { assetId: "leader_portrait_clemenceau", subjectName: "Georges Clemenceau" },
            { assetId: "leader_portrait_lloyd_george", subjectName: "David Lloyd George" },
            { assetId: "leader_portrait_wilson", subjectName: "Woodrow Wilson" },
            { assetId: "leader_portrait_lenin", subjectName: "Vladimir Lenin" },
            { assetId: "leader_portrait_ataturk", subjectName: "Mustafa Kemal Ataturk" },
            { assetId: "leader_portrait_roosevelt", subjectName: "Franklin D. Roosevelt" },
            { assetId: "leader_portrait_churchill", subjectName: "Winston Churchill" },
            { assetId: "leader_portrait_hitler", subjectName: "Adolf Hitler" },
            { assetId: "leader_portrait_stalin", subjectName: "Joseph Stalin" },
            { assetId: "leader_portrait_hirohito", subjectName: "Emperor Hirohito" },
        ];
        for (const leaderPortraitDefinition of leaderPortraitDefinitions) {
            catalogDefinitions.push(
                new TierThreeAssetDefinition(
                    leaderPortraitDefinition.assetId,
                    "image",
                    "midjourney",
                    "512 x 640",
                    "Period black-and-white or sepia studio portrait, 1900-1945 press photography, dignified and historical.",
                    `A period-accurate photographic portrait of ${leaderPortraitDefinition.subjectName}, head and shoulders, formal attire of the era, neutral studio backdrop, sepia or black-and-white, suitable for a grand strategy game leader panel.`,
                    "cartoonish, modern clothing, saturated color, smiling, fantasy elements, text, watermark, distorted features",
                    `${leaderPortraitDefinition.assetId}.png`,
                    "Displayed inside the corresponding portrait_frame SVG in nation and event panels.",
                    "Falls back to the procedural portrait_frame SVG with a silhouette.",
                ),
            );
        }
        const newspaperPhotoDefinitions: Array<{ assetId: string; subjectName: string }> = [
            { assetId: "newspaper_photo_sarajevo_1914", subjectName: "the aftermath of the Sarajevo assassination" },
            { assetId: "newspaper_photo_mobilization_1914", subjectName: "European crowds cheering mobilization in 1914" },
            { assetId: "newspaper_photo_trench_1916", subjectName: "soldiers in a trench at the Somme in 1916" },
            { assetId: "newspaper_photo_revolution_1917", subjectName: "a crowd in Petrograd during the 1917 revolution" },
            { assetId: "newspaper_photo_versailles_1919", subjectName: "the signing hall of the Treaty of Versailles in 1919" },
            { assetId: "newspaper_photo_depression_1930", subjectName: "a bread line during the Great Depression" },
            { assetId: "newspaper_photo_blitz_1940", subjectName: "Londoners sheltering during the Blitz" },
            { assetId: "newspaper_photo_stalingrad_1943", subjectName: "the ruins of Stalingrad in 1943" },
            { assetId: "newspaper_photo_dday_1944", subjectName: "landing craft approaching Normandy on D-Day" },
            { assetId: "newspaper_photo_hiroshima_1945", subjectName: "the aftermath in Hiroshima in 1945" },
        ];
        for (const newspaperPhotoDefinition of newspaperPhotoDefinitions) {
            catalogDefinitions.push(
                new TierThreeAssetDefinition(
                    newspaperPhotoDefinition.assetId,
                    "image",
                    "midjourney",
                    "512 x 384",
                    "Grainy period newsprint photograph, high contrast, authentic 1900-1945 press photo aesthetic.",
                    `A period-style newsprint photograph depicting ${newspaperPhotoDefinition.subjectName}, grainy black-and-white press photography, documentary framing, suitable for a historical newspaper front page in a grand strategy game.`,
                    "modern elements, color photography, text, watermark, anachronistic uniforms, gore",
                    `${newspaperPhotoDefinition.assetId}.png`,
                    "Displayed inside newspaper_photo_frame in newspaper popups.",
                    "Falls back to the corresponding event illustration SVG.",
                ),
            );
        }
        catalogDefinitions.push(
            new TierThreeAssetDefinition(
                "loading_screen_art",
                "image",
                "midjourney",
                "1920 x 1080",
                "Epic grand strategy key art: dark leather and brass, map table, period documents, painterly historical style.",
                "A wide cinematic key art painting of a 1900-1945 world map on a dark wooden strategy table, brass instruments, stacked newspapers, candlelight, oil painting style, dark olive and brass palette.",
                "text, watermark, modern objects, bright saturated colors",
                "loading_screen_art.png",
                "Optional splash art behind the loading bar in the boot scene.",
                "Falls back to the splash_screen procedural SVG.",
            ),
        );
        catalogDefinitions.push(
            new TierThreeAssetDefinition(
                "title_art",
                "image",
                "midjourney",
                "1600 x 900",
                "Gothic-tinged grand strategy title illustration, dark and dignified.",
                "A title illustration for a historical grand strategy game called Cascade: silhouetted crowds, rising smoke, a turning globe, dark leather and brass tones, painterly and grave.",
                "text, watermark, cartoon style",
                "title_art.png",
                "Optional art behind the main menu title.",
                "Falls back to the logo_cascade procedural SVG on a dark background.",
            ),
        );
        return catalogDefinitions;
    }
}
