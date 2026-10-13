export class ThematicFocus {
    public static readonly GOVERNANCE = new ThematicFocus(
        "GOV",
        "Governance",
        "A variety of internal and external factors contribute to state formation, expansion, and decline. Governments maintain order through a variety of administrative institutions, policies, and procedures, and governments obtain, retain, and exercise power in different ways and for different purposes.",
        "ui_badge_gov",
    );
    public static readonly TECHNOLOGY_AND_INNOVATION = new ThematicFocus(
        "TEC",
        "Technology and Innovation",
        "Human adaptation and innovation have resulted in increased efficiency, comfort, and security, and technological advances have shaped human development and interactions with both intended and unintended consequences.",
        "ui_badge_tec",
    );
    public static readonly ECONOMIC_SYSTEMS = new ThematicFocus(
        "ECN",
        "Economic Systems",
        "As societies develop, they affect and are affected by the ways that they produce, exchange, and consume goods and services.",
        "ui_badge_ecn",
    );
    public static readonly SOCIAL_INTERACTIONS_AND_ORGANIZATION = new ThematicFocus(
        "SIO",
        "Social Interactions and Organization",
        "The process by which societies group their members and the norms that govern the interactions between these groups and between individuals influence political, economic, and cultural institutions and organization.",
        "ui_badge_sio",
    );

    private readonly thematicFocusCode: string;
    private readonly thematicFocusDisplayName: string;
    private readonly thematicFocusDescription: string;
    private readonly badgeAssetIdentifier: string;

    private constructor(
        thematicFocusCode: string,
        thematicFocusDisplayName: string,
        thematicFocusDescription: string,
        badgeAssetIdentifier: string,
    ) {
        this.thematicFocusCode = thematicFocusCode;
        this.thematicFocusDisplayName = thematicFocusDisplayName;
        this.thematicFocusDescription = thematicFocusDescription;
        this.badgeAssetIdentifier = badgeAssetIdentifier;
    }

    public getCode(): string {
        return this.thematicFocusCode;
    }

    public getDisplayName(): string {
        return this.thematicFocusDisplayName;
    }

    public getDescription(): string {
        return this.thematicFocusDescription;
    }

    public getBadgeAssetId(): string {
        return this.badgeAssetIdentifier;
    }

    public static getAllThematicFocuses(): ThematicFocus[] {
        return [
            ThematicFocus.GOVERNANCE,
            ThematicFocus.TECHNOLOGY_AND_INNOVATION,
            ThematicFocus.ECONOMIC_SYSTEMS,
            ThematicFocus.SOCIAL_INTERACTIONS_AND_ORGANIZATION,
        ];
    }

    public static findByThematicFocusCode(thematicFocusCode: string): ThematicFocus | null {
        for (const thematicFocus of ThematicFocus.getAllThematicFocuses()) {
            if (thematicFocus.getCode() === thematicFocusCode) {
                return thematicFocus;
            }
        }
        return null;
    }
}
