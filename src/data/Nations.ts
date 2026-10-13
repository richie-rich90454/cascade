export class NationDefinition {
    public readonly identifier: string;
    public readonly displayName: string;
    public readonly nationCode: string;
    public readonly primaryColorHex: string;
    public readonly accentColorHex: string;
    public readonly regionDescription: string;

    constructor(
        identifier: string,
        displayName: string,
        nationCode: string,
        primaryColorHex: string,
        accentColorHex: string,
        regionDescription: string,
    ) {
        this.identifier = identifier;
        this.displayName = displayName;
        this.nationCode = nationCode;
        this.primaryColorHex = primaryColorHex;
        this.accentColorHex = accentColorHex;
        this.regionDescription = regionDescription;
    }
}

export class Nations {
    public static readonly BRITISH_EMPIRE = new NationDefinition(
        "british_empire",
        "Great Britain",
        "ENG",
        "#1A3A5C",
        "#C9A961",
        "The world's largest maritime empire, spanning every continent.",
    );
    public static readonly FRENCH_REPUBLIC = new NationDefinition(
        "french_republic",
        "France",
        "FRA",
        "#2D4A8B",
        "#C9A961",
        "The Third Republic, holder of the second largest colonial empire.",
    );
    public static readonly GERMAN_EMPIRE = new NationDefinition(
        "german_empire",
        "Germany",
        "GER",
        "#3A3A3A",
        "#C9A961",
        "The Kaiserreich, an industrial power demanding its place in the sun.",
    );
    public static readonly RUSSIAN_EMPIRE = new NationDefinition(
        "russian_empire",
        "Russia",
        "RUS",
        "#8B1A1A",
        "#C9A961",
        "The Romanov autocracy, a land-based empire straining under modernization.",
    );
    public static readonly AUSTRO_HUNGARIAN_EMPIRE = new NationDefinition(
        "austro_hungarian_empire",
        "Austria-Hungary",
        "AUH",
        "#8B1A1A",
        "#F2E8D5",
        "The Dual Monarchy, a patchwork of nationalities on the Danube.",
    );
    public static readonly OTTOMAN_EMPIRE = new NationDefinition(
        "ottoman_empire",
        "Ottoman Empire",
        "OTT",
        "#2D5A3A",
        "#C9A961",
        "The Sublime Porte, the sick man of Europe straddling three continents.",
    );
    public static readonly KINGDOM_OF_ITALY = new NationDefinition(
        "kingdom_of_italy",
        "Italy",
        "ITA",
        "#4A5D3A",
        "#C9A961",
        "The young kingdom, unified but hungry for colonies and prestige.",
    );
    public static readonly UNITED_STATES = new NationDefinition(
        "united_states",
        "United States",
        "USA",
        "#2D4A8B",
        "#F2E8D5",
        "The industrial giant of the Western Hemisphere, newly overseas empire.",
    );
    public static readonly EMPIRE_OF_JAPAN = new NationDefinition(
        "empire_of_japan",
        "Japan",
        "JAP",
        "#8B1A1A",
        "#F2E8D5",
        "The island empire that modernized in a generation and now expands.",
    );
    public static readonly QING_CHINA = new NationDefinition(
        "qing_china",
        "Qing China",
        "QNG",
        "#2D4A8B",
        "#C9A961",
        "The celestial empire, humbled by foreign powers and internal revolt.",
    );
    public static readonly SERBIA = new NationDefinition(
        "serbia",
        "Serbia",
        "SER",
        "#6E2B2B",
        "#F2E8D5",
        "The Balkan kingdom dreaming of uniting the South Slavs.",
    );
    public static readonly BELGIUM = new NationDefinition(
        "belgium",
        "Belgium",
        "BEL",
        "#8B1A1A",
        "#C9A961",
        "A small neutral kingdom with a large African colony.",
    );
    public static readonly SOVIET_UNION = new NationDefinition(
        "soviet_union",
        "Soviet Union",
        "SOV",
        "#8B1A1A",
        "#C9A961",
        "The workers' state born of revolution, industrialized by five-year plans.",
    );
    public static readonly REPUBLIC_OF_CHINA = new NationDefinition(
        "republic_of_china",
        "Republic of China",
        "CHN",
        "#2D4A8B",
        "#C9A961",
        "The successor of the Qing, beset by warlords and foreign pressure.",
    );
    public static readonly BRITISH_RAJ = new NationDefinition(
        "british_raj",
        "India",
        "RAJ",
        "#B6A472",
        "#8B1A1A",
        "The jewel in the crown of the British Empire, stirring with nationalism.",
    );
    public static readonly MEXICO = new NationDefinition(
        "mexico",
        "Mexico",
        "MEX",
        "#2D5A3A",
        "#F2E8D5",
        "The land of revolution, remaking its state after 1910.",
    );
    public static readonly BRAZIL = new NationDefinition(
        "brazil",
        "Brazil",
        "BRZ",
        "#4A5D3A",
        "#C9A961",
        "The coffee republic of South America.",
    );
    public static readonly REPUBLIC_OF_TURKEY = new NationDefinition(
        "republic_of_turkey",
        "Turkey",
        "TUR",
        "#2D5A3A",
        "#F2E8D5",
        "The nation-state rising from the ashes of the Ottoman Empire.",
    );
    public static readonly WEST_AFRICAN_COLONIES = new NationDefinition(
        "west_african_colonies",
        "French West Africa",
        "WAF",
        "#2D4A8B",
        "#C9A961",
        "The federation of French colonial territories in West Africa.",
    );

    public static getAllNationDefinitions(): NationDefinition[] {
        return [
            Nations.BRITISH_EMPIRE,
            Nations.FRENCH_REPUBLIC,
            Nations.GERMAN_EMPIRE,
            Nations.RUSSIAN_EMPIRE,
            Nations.AUSTRO_HUNGARIAN_EMPIRE,
            Nations.OTTOMAN_EMPIRE,
            Nations.KINGDOM_OF_ITALY,
            Nations.UNITED_STATES,
            Nations.EMPIRE_OF_JAPAN,
            Nations.QING_CHINA,
            Nations.SERBIA,
            Nations.BELGIUM,
            Nations.SOVIET_UNION,
            Nations.REPUBLIC_OF_CHINA,
            Nations.BRITISH_RAJ,
            Nations.MEXICO,
            Nations.BRAZIL,
            Nations.REPUBLIC_OF_TURKEY,
            Nations.WEST_AFRICAN_COLONIES,
        ];
    }

    public static findNationDefinitionByIdentifier(identifier: string): NationDefinition | null {
        for (const nationDefinition of Nations.getAllNationDefinitions()) {
            if (nationDefinition.identifier === identifier) {
                return nationDefinition;
            }
        }
        return null;
    }

    public static findNationDefinitionByNationCode(nationCode: string): NationDefinition | null {
        for (const nationDefinition of Nations.getAllNationDefinitions()) {
            if (nationDefinition.nationCode === nationCode) {
                return nationDefinition;
            }
        }
        return null;
    }
}
