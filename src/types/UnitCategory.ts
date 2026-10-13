export class UnitCategory {
    public static readonly INFANTRY = new UnitCategory(
        "infantry",
        "Infantry",
        "counter_infantry",
        "Foot soldiers forming the backbone of every army.",
    );
    public static readonly ARMOR = new UnitCategory(
        "armor",
        "Armor",
        "counter_armor",
        "Tank formations breaking through entrenched lines.",
    );
    public static readonly ARTILLERY = new UnitCategory(
        "artillery",
        "Artillery",
        "counter_artillery",
        "Guns delivering fire support at range.",
    );
    public static readonly CAVALRY = new UnitCategory(
        "cavalry",
        "Cavalry",
        "counter_cavalry",
        "Mounted troops used for screening and pursuit.",
    );
    public static readonly AIR = new UnitCategory(
        "air",
        "Air",
        "counter_air",
        "Aircraft contesting command of the skies.",
    );
    public static readonly NAVAL = new UnitCategory(
        "naval",
        "Naval",
        "counter_naval",
        "Surface warships controlling the seas.",
    );
    public static readonly SUBMARINE = new UnitCategory(
        "submarine",
        "Submarine",
        "counter_submarine",
        "Undersea craft strangling seaborne trade.",
    );
    public static readonly CARRIER = new UnitCategory(
        "carrier",
        "Carrier",
        "counter_carrier",
        "Capital ships projecting air power across oceans.",
    );
    public static readonly GARRISON = new UnitCategory(
        "garrison",
        "Garrison",
        "counter_garrison",
        "Forces holding territory against unrest and raids.",
    );
    public static readonly ENGINEER = new UnitCategory(
        "engineer",
        "Engineer",
        "counter_engineer",
        "Troops entrenching, bridging, and demolishing.",
    );
    public static readonly MEDIC = new UnitCategory(
        "medic",
        "Medic",
        "counter_medic",
        "Medical units treating the wounded.",
    );
    public static readonly HEADQUARTERS = new UnitCategory(
        "headquarters",
        "Headquarters",
        "counter_hq",
        "Command elements coordinating formations.",
    );
    public static readonly MILITIA = new UnitCategory(
        "militia",
        "Militia",
        "counter_militia",
        "Irregular partisans and home guard formations.",
    );
    public static readonly MECHANIZED = new UnitCategory(
        "mechanized",
        "Mechanized",
        "counter_mechanized",
        "Motorized infantry moving with the armor.",
    );
    public static readonly PARATROOPER = new UnitCategory(
        "paratrooper",
        "Paratrooper",
        "counter_paratrooper",
        "Airborne troops dropped behind enemy lines.",
    );
    public static readonly MARINE = new UnitCategory(
        "marine",
        "Marine",
        "counter_marine",
        "Troops trained for amphibious assault.",
    );

    private readonly unitCategoryCode: string;
    private readonly unitCategoryDisplayName: string;
    private readonly natoCounterAssetIdentifier: string;
    private readonly unitCategoryDescription: string;

    private constructor(
        unitCategoryCode: string,
        unitCategoryDisplayName: string,
        natoCounterAssetIdentifier: string,
        unitCategoryDescription: string,
    ) {
        this.unitCategoryCode = unitCategoryCode;
        this.unitCategoryDisplayName = unitCategoryDisplayName;
        this.natoCounterAssetIdentifier = natoCounterAssetIdentifier;
        this.unitCategoryDescription = unitCategoryDescription;
    }

    public getCode(): string {
        return this.unitCategoryCode;
    }

    public getDisplayName(): string {
        return this.unitCategoryDisplayName;
    }

    public getNatoCounterAssetId(): string {
        return this.natoCounterAssetIdentifier;
    }

    public getDescription(): string {
        return this.unitCategoryDescription;
    }

    public static getAllUnitCategories(): UnitCategory[] {
        return [
            UnitCategory.INFANTRY,
            UnitCategory.ARMOR,
            UnitCategory.ARTILLERY,
            UnitCategory.CAVALRY,
            UnitCategory.AIR,
            UnitCategory.NAVAL,
            UnitCategory.SUBMARINE,
            UnitCategory.CARRIER,
            UnitCategory.GARRISON,
            UnitCategory.ENGINEER,
            UnitCategory.MEDIC,
            UnitCategory.HEADQUARTERS,
            UnitCategory.MILITIA,
            UnitCategory.MECHANIZED,
            UnitCategory.PARATROOPER,
            UnitCategory.MARINE,
        ];
    }

    public static findByUnitCategoryCode(unitCategoryCode: string): UnitCategory | null {
        for (const unitCategory of UnitCategory.getAllUnitCategories()) {
            if (unitCategory.getCode() === unitCategoryCode) {
                return unitCategory;
            }
        }
        return null;
    }
}
