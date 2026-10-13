import { UnitCategory } from "../types/UnitCategory";

export class Units {
    public static readonly TEMPLATE_INFANTRY = {
        identifier: "template_infantry",
        displayName: "Infantry Division",
        unitCategoryCode: "infantry",
        equipmentCost: 12,
        manpowerCost: 12000,
        description: "The universal formation of the century of total war.",
    };
    public static readonly TEMPLATE_ARMOR = {
        identifier: "template_armor",
        displayName: "Armored Division",
        unitCategoryCode: "armor",
        equipmentCost: 40,
        manpowerCost: 9000,
        description: "Concentrated striking power that broke the stalemate of the trenches.",
    };
    public static readonly TEMPLATE_ARTILLERY = {
        identifier: "template_artillery",
        displayName: "Artillery Regiment",
        unitCategoryCode: "artillery",
        equipmentCost: 18,
        manpowerCost: 4000,
        description: "The god of war, softening positions before the advance.",
    };
    public static readonly TEMPLATE_CAVALRY = {
        identifier: "template_cavalry",
        displayName: "Cavalry Brigade",
        unitCategoryCode: "cavalry",
        equipmentCost: 8,
        manpowerCost: 3000,
        description: "Screening and pursuit on the flanks of the battle.",
    };
    public static readonly TEMPLATE_AIR = {
        identifier: "template_air",
        displayName: "Fighter Wing",
        unitCategoryCode: "air",
        equipmentCost: 30,
        manpowerCost: 1500,
        description: "Command of the skies over army and fleet alike.",
    };
    public static readonly TEMPLATE_NAVAL = {
        identifier: "template_naval",
        displayName: "Capital Squadron",
        unitCategoryCode: "naval",
        equipmentCost: 60,
        manpowerCost: 3200,
        description: "Dreadnoughts upholding the command of the sea.",
    };
    public static readonly TEMPLATE_SUBMARINE = {
        identifier: "template_submarine",
        displayName: "Submarine Flotilla",
        unitCategoryCode: "submarine",
        equipmentCost: 25,
        manpowerCost: 800,
        description: "The commerce raider that starved island nations.",
    };
    public static readonly TEMPLATE_CARRIER = {
        identifier: "template_carrier",
        displayName: "Carrier Task Group",
        unitCategoryCode: "carrier",
        equipmentCost: 80,
        manpowerCost: 5200,
        description: "Mobile airfields projecting power across the oceans.",
    };
    public static readonly TEMPLATE_GARRISON = {
        identifier: "template_garrison",
        displayName: "Garrison Regiment",
        unitCategoryCode: "garrison",
        equipmentCost: 6,
        manpowerCost: 5000,
        description: "Holding conquered and colonial territory.",
    };
    public static readonly TEMPLATE_ENGINEER = {
        identifier: "template_engineer",
        displayName: "Engineer Battalion",
        unitCategoryCode: "engineer",
        equipmentCost: 10,
        manpowerCost: 2200,
        description: "Entrenchments, bridges, and demolitions.",
    };
    public static readonly TEMPLATE_MEDIC = {
        identifier: "template_medic",
        displayName: "Medical Battalion",
        unitCategoryCode: "medic",
        equipmentCost: 5,
        manpowerCost: 1200,
        description: "Caring for the wounded of every nation.",
    };
    public static readonly TEMPLATE_HEADQUARTERS = {
        identifier: "template_headquarters",
        displayName: "Corps Headquarters",
        unitCategoryCode: "headquarters",
        equipmentCost: 9,
        manpowerCost: 900,
        description: "The nerve center coordinating formations.",
    };
    public static readonly TEMPLATE_MILITIA = {
        identifier: "template_militia",
        displayName: "Partisan Detachment",
        unitCategoryCode: "militia",
        equipmentCost: 3,
        manpowerCost: 1600,
        description: "Irregulars striking from forest and mountain.",
    };
    public static readonly TEMPLATE_MECHANIZED = {
        identifier: "template_mechanized",
        displayName: "Mechanized Corps",
        unitCategoryCode: "mechanized",
        equipmentCost: 35,
        manpowerCost: 8000,
        description: "Motorized infantry keeping pace with the armor.",
    };
    public static readonly TEMPLATE_PARATROOPER = {
        identifier: "template_paratrooper",
        displayName: "Parachute Regiment",
        unitCategoryCode: "paratrooper",
        equipmentCost: 20,
        manpowerCost: 2000,
        description: "Airborne troops dropped behind the enemy.",
    };
    public static readonly TEMPLATE_MARINE = {
        identifier: "template_marine",
        displayName: "Marine Brigade",
        unitCategoryCode: "marine",
        equipmentCost: 22,
        manpowerCost: 4000,
        description: "Assault infantry for the landing beaches.",
    };

    public static getAllUnitTemplates(): Array<{
        identifier: string;
        displayName: string;
        unitCategoryCode: string;
        equipmentCost: number;
        manpowerCost: number;
        description: string;
    }> {
        return [
            Units.TEMPLATE_INFANTRY,
            Units.TEMPLATE_ARMOR,
            Units.TEMPLATE_ARTILLERY,
            Units.TEMPLATE_CAVALRY,
            Units.TEMPLATE_AIR,
            Units.TEMPLATE_NAVAL,
            Units.TEMPLATE_SUBMARINE,
            Units.TEMPLATE_CARRIER,
            Units.TEMPLATE_GARRISON,
            Units.TEMPLATE_ENGINEER,
            Units.TEMPLATE_MEDIC,
            Units.TEMPLATE_HEADQUARTERS,
            Units.TEMPLATE_MILITIA,
            Units.TEMPLATE_MECHANIZED,
            Units.TEMPLATE_PARATROOPER,
            Units.TEMPLATE_MARINE,
        ];
    }

    public static findUnitTemplateByIdentifier(identifier: string): {
        identifier: string;
        displayName: string;
        unitCategoryCode: string;
        equipmentCost: number;
        manpowerCost: number;
        description: string;
    } | null {
        for (const unitTemplate of Units.getAllUnitTemplates()) {
            if (unitTemplate.identifier === identifier) {
                return unitTemplate;
            }
        }
        return null;
    }

    public static resolveUnitCategoryForTemplate(unitCategoryCode: string): UnitCategory | null {
        return UnitCategory.findByUnitCategoryCode(unitCategoryCode);
    }
}
