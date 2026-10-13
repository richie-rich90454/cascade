export class ResourceType {
    public static readonly PRODUCTION = new ResourceType(
        "production",
        "Production",
        "Industrial capacity available for supplying armies and completing construction.",
        "icon_resource_production",
        true,
    );
    public static readonly MANPOWER = new ResourceType(
        "manpower",
        "Manpower",
        "The population available for military service and industrial labor.",
        "icon_resource_manpower",
        true,
    );
    public static readonly TREASURY = new ResourceType(
        "treasury",
        "Treasury",
        "The financial reserves of the state, measured in the national currency.",
        "icon_resource_treasury",
        true,
    );
    public static readonly LEGITIMACY = new ResourceType(
        "legitimacy",
        "Legitimacy",
        "The popular and institutional acceptance of the government's right to rule.",
        "icon_resource_legitimacy",
        true,
    );
    public static readonly INFLUENCE = new ResourceType(
        "influence",
        "Influence",
        "Diplomatic weight available to sway other nations and hold alliances together.",
        "icon_resource_influence",
        true,
    );
    public static readonly MORALE = new ResourceType(
        "morale",
        "Morale",
        "The willingness of the population and the armed forces to continue the struggle.",
        "icon_resource_morale",
        true,
    );
    public static readonly INTELLIGENCE = new ResourceType(
        "intelligence",
        "Intelligence",
        "Usable knowledge gathered from espionage, codebreaking, and source analysis.",
        "icon_resource_intelligence",
        true,
    );
    public static readonly FOOD = new ResourceType(
        "food",
        "Food",
        "Agricultural output sustaining the population and the armies.",
        "icon_resource_food",
        false,
    );
    public static readonly FUEL = new ResourceType(
        "fuel",
        "Fuel",
        "Refined petroleum driving navies, armies, and air forces.",
        "icon_resource_fuel",
        false,
    );
    public static readonly STEEL = new ResourceType(
        "steel",
        "Steel",
        "Alloy output required for ships, guns, and machinery.",
        "icon_resource_steel",
        false,
    );
    public static readonly RUBBER = new ResourceType(
        "rubber",
        "Rubber",
        "Strategic material for tires, gaskets, and electrical insulation.",
        "icon_resource_rubber",
        false,
    );
    public static readonly RESEARCH = new ResourceType(
        "research",
        "Research",
        "Scientific and engineering effort applied to new technology.",
        "icon_resource_research",
        false,
    );
    public static readonly STABILITY = new ResourceType(
        "stability",
        "Stability",
        "The resilience of the political order against unrest and revolution.",
        "icon_resource_stability",
        false,
    );
    public static readonly SUPPLY = new ResourceType(
        "supply",
        "Supply",
        "Materiel stockpiles available to forward units.",
        "icon_resource_supply",
        false,
    );
    public static readonly IDEOLOGY = new ResourceType(
        "ideology",
        "Ideology",
        "The unifying political creed that mobilizes the state's resources.",
        "icon_resource_ideology",
        false,
    );
    public static readonly TECHNOLOGY = new ResourceType(
        "technology",
        "Technology",
        "The stock of applied engineering knowledge available to the state.",
        "icon_resource_technology",
        false,
    );
    public static readonly INDUSTRY = new ResourceType(
        "industry",
        "Industry",
        "The factory base of the nation and its smokestack capacity.",
        "icon_resource_industry",
        false,
    );
    public static readonly AGRICULTURE = new ResourceType(
        "agriculture",
        "Agriculture",
        "The plow-based rural economy and its output.",
        "icon_resource_agriculture",
        false,
    );
    public static readonly INFRASTRUCTURE = new ResourceType(
        "infrastructure",
        "Infrastructure",
        "Railways, bridges, and roads that move men and materiel.",
        "icon_resource_infrastructure",
        false,
    );
    public static readonly POPULATION = new ResourceType(
        "population",
        "Population",
        "The total number of people living under the state's authority.",
        "icon_resource_population",
        false,
    );
    public static readonly NATIONALISM = new ResourceType(
        "nationalism",
        "Nationalism",
        "The intensity of national feeling, capable of both uniting and inflaming a people.",
        "idea_nationalism",
        false,
    );
    public static readonly IMPERIAL_CONTROL = new ResourceType(
        "imperial_control",
        "Imperial Control",
        "The effectiveness with which an empire governs its distant territories.",
        "idea_imperialism",
        false,
    );
    public static readonly ALLIANCES = new ResourceType(
        "alliances",
        "Alliances",
        "The network of binding military commitments between states.",
        "marker_treaty",
        false,
    );
    public static readonly MOBILIZATION = new ResourceType(
        "mobilization",
        "Mobilization",
        "The speed and completeness of calling the armed forces to readiness.",
        "tech_railroad",
        false,
    );
    public static readonly IMPERIAL_PRESTIGE = new ResourceType(
        "imperial_prestige",
        "Imperial Prestige",
        "The standing of the empire among rivals and subjects alike.",
        "ornament_laurel_wreath",
        false,
    );
    public static readonly OPINION = new ResourceType(
        "opinion",
        "Opinion",
        "The attitude of the public toward the war and the government.",
        "idea_propaganda",
        false,
    );
    public static readonly COLONIAL_RESOURCES = new ResourceType(
        "colonial_resources",
        "Colonial Resources",
        "Men and materiel drawn from the colonies and dominions.",
        "idea_imperialism",
        false,
    );
    public static readonly SUPPORT = new ResourceType(
        "support",
        "Support",
        "The degree of popular backing for the regime and its programs.",
        "idea_democracy",
        false,
    );
    public static readonly REPRESSION = new ResourceType(
        "repression",
        "Repression",
        "The apparatus of coercion used to silence dissent.",
        "idea_censorship",
        false,
    );
    public static readonly GROWTH = new ResourceType(
        "growth",
        "Growth",
        "The rate at which the economy expands its output.",
        "status_arrow_up",
        false,
    );
    public static readonly TERRITORY = new ResourceType(
        "territory",
        "Territory",
        "The land under the direct administration of the state.",
        "marker_victory_point",
        false,
    );
    public static readonly MANDATES = new ResourceType(
        "mandates",
        "Mandates",
        "Territories entrusted to the state under the League of Nations mandate system.",
        "marker_treaty",
        false,
    );
    public static readonly RESISTANCE = new ResourceType(
        "resistance",
        "Resistance",
        "The organized opposition of subject peoples to imperial rule.",
        "idea_revolution",
        false,
    );
    public static readonly PRESTIGE = new ResourceType(
        "prestige",
        "Prestige",
        "The honor and standing of the nation in the eyes of the world.",
        "ornament_medal",
        false,
    );
    public static readonly MILITARY = new ResourceType(
        "military",
        "Military",
        "The armed strength of the state on land, sea, and air.",
        "counter_infantry",
        false,
    );
    public static readonly DIPLOMACY = new ResourceType(
        "diplomacy",
        "Diplomacy",
        "The art and practice of conducting negotiations between nations.",
        "icon_resource_influence",
        false,
    );
    public static readonly ECONOMY = new ResourceType(
        "economy",
        "Economy",
        "The overall health of production, exchange, and consumption.",
        "icon_resource_industry",
        false,
    );

    private readonly resourceTypeCode: string;
    private readonly resourceTypeDisplayName: string;
    private readonly resourceTypeDescription: string;
    private readonly iconAssetIdentifier: string;
    private readonly isDisplayedOnTopBar: boolean;

    private constructor(
        resourceTypeCode: string,
        resourceTypeDisplayName: string,
        resourceTypeDescription: string,
        iconAssetIdentifier: string,
        isDisplayedOnTopBar: boolean,
    ) {
        this.resourceTypeCode = resourceTypeCode;
        this.resourceTypeDisplayName = resourceTypeDisplayName;
        this.resourceTypeDescription = resourceTypeDescription;
        this.iconAssetIdentifier = iconAssetIdentifier;
        this.isDisplayedOnTopBar = isDisplayedOnTopBar;
    }

    public getCode(): string {
        return this.resourceTypeCode;
    }

    public getDisplayName(): string {
        return this.resourceTypeDisplayName;
    }

    public getDescription(): string {
        return this.resourceTypeDescription;
    }

    public getIconAssetId(): string {
        return this.iconAssetIdentifier;
    }

    public isTopBarResource(): boolean {
        return this.isDisplayedOnTopBar;
    }

    public static getAllResourceTypes(): ResourceType[] {
        return [
            ResourceType.PRODUCTION,
            ResourceType.MANPOWER,
            ResourceType.TREASURY,
            ResourceType.LEGITIMACY,
            ResourceType.INFLUENCE,
            ResourceType.MORALE,
            ResourceType.INTELLIGENCE,
            ResourceType.FOOD,
            ResourceType.FUEL,
            ResourceType.STEEL,
            ResourceType.RUBBER,
            ResourceType.RESEARCH,
            ResourceType.STABILITY,
            ResourceType.SUPPLY,
            ResourceType.IDEOLOGY,
            ResourceType.TECHNOLOGY,
            ResourceType.INDUSTRY,
            ResourceType.AGRICULTURE,
            ResourceType.INFRASTRUCTURE,
            ResourceType.POPULATION,
            ResourceType.NATIONALISM,
            ResourceType.IMPERIAL_CONTROL,
            ResourceType.ALLIANCES,
            ResourceType.MOBILIZATION,
            ResourceType.IMPERIAL_PRESTIGE,
            ResourceType.OPINION,
            ResourceType.COLONIAL_RESOURCES,
            ResourceType.SUPPORT,
            ResourceType.REPRESSION,
            ResourceType.GROWTH,
            ResourceType.TERRITORY,
            ResourceType.MANDATES,
            ResourceType.RESISTANCE,
            ResourceType.PRESTIGE,
            ResourceType.MILITARY,
            ResourceType.DIPLOMACY,
            ResourceType.ECONOMY,
        ];
    }

    public static findByResourceTypeCode(resourceTypeCode: string): ResourceType | null {
        for (const resourceType of ResourceType.getAllResourceTypes()) {
            if (resourceType.getCode() === resourceTypeCode) {
                return resourceType;
            }
        }
        return null;
    }

    public static getTopBarResourceTypes(): ResourceType[] {
        return ResourceType.getAllResourceTypes().filter((resourceType) => resourceType.isTopBarResource());
    }
}
