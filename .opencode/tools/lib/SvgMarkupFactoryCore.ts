import { SeedRandom } from "../../../src/core/SeedRandom";
import { CatalogAssetEntry, FactionColorTable, SvgPalette, TerrainFillTable } from "./CatalogAssetEntry";

export class SvgMarkupFactoryCore {
    public static wrapSvg(catalogEntry: CatalogAssetEntry, bodyMarkup: string): string {
        return [
            `<svg xmlns="http://www.w3.org/2000/svg" width="${catalogEntry.width}" height="${catalogEntry.height}" viewBox="0 0 ${catalogEntry.width} ${catalogEntry.height}">`,
            bodyMarkup,
            `</svg>`,
        ].join("");
    }

    public static buildSeededSpeckles(
        seedRandom: SeedRandom,
        width: number,
        height: number,
        speckleCount: number,
        speckleColor: string,
        minimumOpacity: number,
        maximumOpacity: number,
    ): string[] {
        const speckleMarkupParts: string[] = [];
        for (let speckleIndex = 0; speckleIndex < speckleCount; speckleIndex++) {
            const speckleX = seedRandom.nextInt(0, width);
            const speckleY = seedRandom.nextInt(0, height);
            const speckleRadius = seedRandom.nextInt(1, 3);
            const speckleOpacity = seedRandom.nextFloatInRange(minimumOpacity, maximumOpacity).toFixed(2);
            speckleMarkupParts.push(
                `<circle cx="${speckleX}" cy="${speckleY}" r="${speckleRadius}" fill="${speckleColor}" opacity="${speckleOpacity}" />`,
            );
        }
        return speckleMarkupParts;
    }

    public static buildStarPath(centerX: number, centerY: number, outerRadius: number, innerRadius: number): string {
        const pathParts: string[] = [];
        for (let pointIndex = 0; pointIndex < 10; pointIndex++) {
            const pointRadius = pointIndex % 2 === 0 ? outerRadius : innerRadius;
            const pointAngle = (Math.PI / 5) * pointIndex - Math.PI / 2;
            const pointX = centerX + pointRadius * Math.cos(pointAngle);
            const pointY = centerY + pointRadius * Math.sin(pointAngle);
            pathParts.push(`${pointIndex === 0 ? "M" : "L"} ${pointX.toFixed(1)} ${pointY.toFixed(1)}`);
        }
        pathParts.push("Z");
        return `<path d="${pathParts.join(" ")}" fill="${SvgPalette.HIGHLIGHT_BRASS}" />`;
    }

    public static generateTileMarkup(catalogEntry: CatalogAssetEntry): string {
        const seedRandom = new SeedRandom(catalogEntry.seedKey);
        const baseTerrainType = catalogEntry.assetId.startsWith("tile_detail_")
            ? catalogEntry.assetId.replace("tile_detail_", "").replace(/_\d{2}$/, "")
            : catalogEntry.assetId.replace("tile_", "").replace(/_\d{2}$/, "");
        const fillColor = TerrainFillTable.FILL_COLORS[baseTerrainType] ?? "#5A6B42";
        const bodyMarkupParts: string[] = [
            `<rect width="${catalogEntry.width}" height="${catalogEntry.height}" fill="${fillColor}" />`,
        ];
        bodyMarkupParts.push(
            ...SvgMarkupFactoryCore.buildSeededSpeckles(
                seedRandom,
                catalogEntry.width,
                catalogEntry.height,
                18,
                SvgPalette.NEAR_BLACK_LEATHER,
                0.05,
                0.16,
            ),
        );
        if (baseTerrainType === "forest") {
            for (let treeIndex = 0; treeIndex < 7; treeIndex++) {
                const treeX = seedRandom.nextInt(8, catalogEntry.width - 8);
                const treeY = seedRandom.nextInt(10, catalogEntry.height - 6);
                bodyMarkupParts.push(
                    `<path d="M ${treeX} ${treeY - 8} L ${treeX - 5} ${treeY + 4} L ${treeX + 5} ${treeY + 4} Z" fill="#2A3B22" opacity="0.85" />`,
                );
            }
        }
        if (baseTerrainType === "mountains") {
            for (let peakIndex = 0; peakIndex < 3; peakIndex++) {
                const peakX = seedRandom.nextInt(12, catalogEntry.width - 12);
                const peakY = seedRandom.nextInt(14, catalogEntry.height - 8);
                bodyMarkupParts.push(
                    `<path d="M ${peakX} ${peakY - 12} L ${peakX - 10} ${peakY + 8} L ${peakX + 10} ${peakY + 8} Z" fill="#8B8B7E" opacity="0.7" />`,
                );
            }
        }
        if (baseTerrainType === "desert") {
            for (let duneIndex = 0; duneIndex < 3; duneIndex++) {
                const duneY = seedRandom.nextInt(8, catalogEntry.height - 8);
                bodyMarkupParts.push(
                    `<path d="M 4 ${duneY} Q ${catalogEntry.width / 2} ${duneY - 10} ${catalogEntry.width - 4} ${duneY}" stroke="#8B7355" stroke-width="2" fill="none" opacity="0.5" />`,
                );
            }
        }
        if (baseTerrainType === "ocean" || baseTerrainType === "coastal") {
            for (let waveIndex = 0; waveIndex < 4; waveIndex++) {
                const waveY = seedRandom.nextInt(6, catalogEntry.height - 6);
                bodyMarkupParts.push(
                    `<path d="M 2 ${waveY} q 8 -4 16 0 q 8 4 16 0 q 8 -4 16 0 q 8 4 16 0" stroke="#7FA0C0" stroke-width="1.5" fill="none" opacity="0.4" />`,
                );
            }
        }
        if (baseTerrainType === "urban") {
            for (let buildingIndex = 0; buildingIndex < 5; buildingIndex++) {
                const buildingX = seedRandom.nextInt(4, catalogEntry.width - 16);
                const buildingY = seedRandom.nextInt(10, catalogEntry.height - 18);
                bodyMarkupParts.push(
                    `<rect x="${buildingX}" y="${buildingY}" width="10" height="14" fill="#5A4A2E" opacity="0.85" />`,
                );
                bodyMarkupParts.push(
                    `<rect x="${buildingX + 2}" y="${buildingY + 2}" width="2" height="2" fill="#E5CC8A" opacity="0.8" />`,
                );
            }
        }
        if (baseTerrainType === "industrial") {
            for (let factoryIndex = 0; factoryIndex < 3; factoryIndex++) {
                const factoryX = seedRandom.nextInt(4, catalogEntry.width - 20);
                const factoryY = seedRandom.nextInt(14, catalogEntry.height - 14);
                bodyMarkupParts.push(`<rect x="${factoryX}" y="${factoryY}" width="16" height="10" fill="#3A3A3A" />`);
                bodyMarkupParts.push(
                    `<rect x="${factoryX + 12}" y="${factoryY - 8}" width="4" height="10" fill="#5A5A5A" />`,
                );
                bodyMarkupParts.push(
                    `<circle cx="${factoryX + 14}" cy="${factoryY - 12}" r="3" fill="#8B8B7E" opacity="0.6" />`,
                );
            }
        }
        if (baseTerrainType === "tundra") {
            for (let iceIndex = 0; iceIndex < 6; iceIndex++) {
                const iceX = seedRandom.nextInt(4, catalogEntry.width - 8);
                const iceY = seedRandom.nextInt(4, catalogEntry.height - 8);
                bodyMarkupParts.push(`<path d="M ${iceX} ${iceY} l 6 3 l -3 6 Z" fill="#D4C29A" opacity="0.35" />`);
            }
        }
        if (baseTerrainType === "swamp") {
            for (let poolIndex = 0; poolIndex < 4; poolIndex++) {
                const poolX = seedRandom.nextInt(6, catalogEntry.width - 14);
                const poolY = seedRandom.nextInt(6, catalogEntry.height - 10);
                bodyMarkupParts.push(
                    `<ellipse cx="${poolX}" cy="${poolY}" rx="7" ry="4" fill="#2E3B2A" opacity="0.7" />`,
                );
            }
        }
        if (catalogEntry.assetId.startsWith("tile_river_")) {
            bodyMarkupParts.push(
                `<rect width="${catalogEntry.width}" height="${catalogEntry.height}" fill="#5A6B42" />`,
            );
            if (catalogEntry.assetId.endsWith("horizontal")) {
                bodyMarkupParts.push(`<rect x="0" y="24" width="${catalogEntry.width}" height="16" fill="#2D4A6B" />`);
            } else if (catalogEntry.assetId.endsWith("vertical")) {
                bodyMarkupParts.push(`<rect x="24" y="0" width="16" height="${catalogEntry.height}" fill="#2D4A6B" />`);
            } else {
                bodyMarkupParts.push(`<rect x="0" y="24" width="40" height="16" fill="#2D4A6B" />`);
                bodyMarkupParts.push(`<rect x="24" y="24" width="16" height="40" fill="#2D4A6B" />`);
            }
        }
        if (catalogEntry.assetId.startsWith("tile_railroad_")) {
            bodyMarkupParts.push(
                `<rect width="${catalogEntry.width}" height="${catalogEntry.height}" fill="#5A6B42" />`,
            );
            if (catalogEntry.assetId.endsWith("horizontal")) {
                bodyMarkupParts.push(`<rect x="0" y="29" width="${catalogEntry.width}" height="3" fill="#3A3A3A" />`);
                bodyMarkupParts.push(`<rect x="0" y="34" width="${catalogEntry.width}" height="3" fill="#3A3A3A" />`);
                for (let tieIndex = 4; tieIndex < catalogEntry.width; tieIndex += 10) {
                    bodyMarkupParts.push(`<rect x="${tieIndex}" y="27" width="3" height="12" fill="#5A4A2E" />`);
                }
            } else if (catalogEntry.assetId.endsWith("vertical")) {
                bodyMarkupParts.push(`<rect x="29" y="0" width="3" height="${catalogEntry.height}" fill="#3A3A3A" />`);
                bodyMarkupParts.push(`<rect x="34" y="0" width="3" height="${catalogEntry.height}" fill="#3A3A3A" />`);
                for (let tieIndex = 4; tieIndex < catalogEntry.height; tieIndex += 10) {
                    bodyMarkupParts.push(`<rect x="27" y="${tieIndex}" width="12" height="3" fill="#5A4A2E" />`);
                }
            } else {
                bodyMarkupParts.push(`<rect x="0" y="29" width="40" height="3" fill="#3A3A3A" />`);
                bodyMarkupParts.push(`<rect x="29" y="29" width="3" height="35" fill="#3A3A3A" />`);
            }
        }
        if (catalogEntry.assetId === "tile_border_brass") {
            bodyMarkupParts.push(
                `<rect x="1" y="1" width="${catalogEntry.width - 2}" height="${catalogEntry.height - 2}" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="3" />`,
            );
        }
        if (catalogEntry.assetId === "tile_border_dashed") {
            bodyMarkupParts.push(
                `<rect x="1" y="1" width="${catalogEntry.width - 2}" height="${catalogEntry.height - 2}" fill="none" stroke="${SvgPalette.BLOOD_RED}" stroke-width="3" stroke-dasharray="8 6" />`,
            );
        }
        if (catalogEntry.assetId === "tile_coastline_glow") {
            bodyMarkupParts.push(
                `<rect x="2" y="2" width="${catalogEntry.width - 4}" height="${catalogEntry.height - 4}" fill="none" stroke="${SvgPalette.HIGHLIGHT_BRASS}" stroke-width="4" opacity="0.55" />`,
            );
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generateMarkerMarkup(catalogEntry: CatalogAssetEntry): string {
        const seedRandom = new SeedRandom(catalogEntry.seedKey);
        const centerX = catalogEntry.width / 2;
        const centerY = catalogEntry.height / 2;
        const bodyMarkupParts: string[] = [];
        if (catalogEntry.assetId === "marker_capital") {
            bodyMarkupParts.push(
                `<circle cx="${centerX}" cy="${centerY}" r="${centerX - 4}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="3" />`,
            );
            bodyMarkupParts.push(SvgMarkupFactoryCore.buildStarPath(centerX, centerY, 14, 6));
        } else if (catalogEntry.assetId === "marker_city_major") {
            bodyMarkupParts.push(
                `<circle cx="${centerX}" cy="${centerY}" r="7" fill="${SvgPalette.PARCHMENT}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="3" />`,
            );
        } else if (catalogEntry.assetId === "marker_city_minor") {
            bodyMarkupParts.push(
                `<circle cx="${centerX}" cy="${centerY}" r="4" fill="${SvgPalette.PARCHMENT}" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="2" />`,
            );
        } else if (catalogEntry.assetId === "marker_port") {
            bodyMarkupParts.push(
                `<circle cx="${centerX}" cy="${centerY}" r="${centerX - 3}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" />`,
            );
            bodyMarkupParts.push(
                `<path d="M ${centerX} ${centerY - 9} L ${centerX} ${centerY + 7} M ${centerX - 6} ${centerY + 2} q 6 8 12 0" stroke="${SvgPalette.PARCHMENT}" stroke-width="2.5" fill="none" />`,
            );
        } else if (catalogEntry.assetId === "marker_airbase") {
            bodyMarkupParts.push(
                `<circle cx="${centerX}" cy="${centerY}" r="${centerX - 3}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" />`,
            );
            bodyMarkupParts.push(
                `<path d="M ${centerX} ${centerY - 8} L ${centerX} ${centerY + 8} M ${centerX - 8} ${centerY + 2} L ${centerX + 8} ${centerY + 2}" stroke="${SvgPalette.PARCHMENT}" stroke-width="2.5" />`,
            );
        } else if (catalogEntry.assetId === "marker_fortress") {
            bodyMarkupParts.push(
                `<circle cx="${centerX}" cy="${centerY}" r="${centerX - 3}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" />`,
            );
            bodyMarkupParts.push(
                `<rect x="${centerX - 7}" y="${centerY - 4}" width="14" height="10" fill="${SvgPalette.PARCHMENT}" />`,
            );
            bodyMarkupParts.push(
                `<rect x="${centerX - 7}" y="${centerY - 8}" width="4" height="4" fill="${SvgPalette.PARCHMENT}" />`,
            );
            bodyMarkupParts.push(
                `<rect x="${centerX - 2}" y="${centerY - 8}" width="4" height="4" fill="${SvgPalette.PARCHMENT}" />`,
            );
            bodyMarkupParts.push(
                `<rect x="${centerX + 3}" y="${centerY - 8}" width="4" height="4" fill="${SvgPalette.PARCHMENT}" />`,
            );
        } else if (catalogEntry.assetId.startsWith("marker_resource_")) {
            const resourceColor = seedRandom.nextBoolean(0.5) ? SvgPalette.BRIGHT_BRASS : SvgPalette.AGED_PARCHMENT;
            bodyMarkupParts.push(
                `<rect x="2" y="2" width="${catalogEntry.width - 4}" height="${catalogEntry.height - 4}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" stroke="${resourceColor}" stroke-width="2" />`,
            );
            bodyMarkupParts.push(
                `<circle cx="${centerX}" cy="${centerY}" r="5" fill="${resourceColor}" opacity="0.9" />`,
            );
        } else if (catalogEntry.assetId.startsWith("marker_battle")) {
            const circleRadius = catalogEntry.width === 48 ? 21 : 13;
            const circleFill = catalogEntry.width === 48 ? SvgPalette.BLOOD_RED : SvgPalette.NEAR_BLACK_LEATHER;
            bodyMarkupParts.push(
                `<circle cx="${centerX}" cy="${centerY}" r="${circleRadius}" fill="${circleFill}" stroke="${SvgPalette.PARCHMENT}" stroke-width="2" />`,
            );
            bodyMarkupParts.push(
                `<path d="M ${centerX - 8} ${centerY - 8} L ${centerX + 8} ${centerY + 8} M ${centerX + 8} ${centerY - 8} L ${centerX - 8} ${centerY + 8}" stroke="${SvgPalette.PARCHMENT}" stroke-width="2.5" />`,
            );
        } else if (catalogEntry.assetId === "marker_treaty") {
            bodyMarkupParts.push(
                `<rect x="6" y="4" width="20" height="24" fill="${SvgPalette.PARCHMENT}" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="2" />`,
            );
            bodyMarkupParts.push(
                `<path d="M 10 12 h 12 M 10 17 h 12 M 10 22 h 8" stroke="${SvgPalette.DEEP_PARCHMENT}" stroke-width="1.5" />`,
            );
        } else if (catalogEntry.assetId === "marker_atrocity") {
            bodyMarkupParts.push(
                `<path d="M ${centerX} ${centerY - 12} q 6 10 0 20 q -6 -10 0 -20 Z" fill="${SvgPalette.BLOOD_RED}" />`,
            );
            bodyMarkupParts.push(
                `<path d="M ${centerX} ${centerY - 12} q -6 10 0 20 q 6 -10 0 -20 Z" fill="${SvgPalette.BRIGHT_BLOOD}" />`,
            );
        } else if (catalogEntry.assetId === "marker_victory_point") {
            bodyMarkupParts.push(SvgMarkupFactoryCore.buildStarPath(centerX, centerY, 10, 4));
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generateCounterMarkup(catalogEntry: CatalogAssetEntry): string {
        const assetIdSegments = catalogEntry.assetId.split("_");
        const unitTypeKey = assetIdSegments[1];
        const factionKey = assetIdSegments.length >= 3 ? assetIdSegments[2] : "germany";
        const factionPrimaryColor = FactionColorTable.PRIMARY_COLORS[factionKey] ?? SvgPalette.MID_OLIVE;
        const factionAccentColor = FactionColorTable.ACCENT_COLORS[factionKey] ?? SvgPalette.BRIGHT_BRASS;
        const symbolTextByUnitType: Record<string, string> = {
            infantry: "X",
            armor: "O",
            artillery: "*",
            cavalry: "/",
            air: "W",
            naval: "A",
            submarine: "U",
            carrier: "CV",
            garrison: "G",
            engineer: "E",
            medic: "+",
            hq: "HQ",
            militia: "M",
            mechanized: "Xm",
            paratrooper: "P",
            marine: "Ms",
        };
        const fontSizePx = catalogEntry.height >= 44 ? 16 : catalogEntry.height >= 32 ? 13 : 10;
        const bodyMarkupParts: string[] = [
            `<rect x="1" y="1" width="${catalogEntry.width - 2}" height="${catalogEntry.height - 2}" fill="${factionPrimaryColor}" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="2" />`,
            `<rect x="3" y="3" width="${catalogEntry.width - 6}" height="${catalogEntry.height - 6}" fill="none" stroke="${factionAccentColor}" stroke-width="1" opacity="0.8" />`,
            `<text x="${catalogEntry.width / 2}" y="${catalogEntry.height / 2 + fontSizePx / 3}" font-family="Courier Prime, monospace" font-size="${fontSizePx}" fill="${SvgPalette.PARCHMENT}" text-anchor="middle">${symbolTextByUnitType[unitTypeKey] ?? "?"}</text>`,
            `<rect x="4" y="${catalogEntry.height - 6}" width="${(catalogEntry.width - 8) * 0.75}" height="3" fill="${SvgPalette.HIGHLIGHT_BRASS}" />`,
        ];
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generateInsigniaMarkup(catalogEntry: CatalogAssetEntry): string {
        const factionKey = catalogEntry.assetId.replace("faction_", "");
        const factionPrimaryColor = FactionColorTable.PRIMARY_COLORS[factionKey] ?? SvgPalette.MID_OLIVE;
        const factionAccentColor = FactionColorTable.ACCENT_COLORS[factionKey] ?? SvgPalette.BRIGHT_BRASS;
        const centerX = catalogEntry.width / 2;
        const centerY = catalogEntry.height / 2;
        const insigniaGlyphs: Record<string, string> = {
            germany: "IRON",
            austria_hungary: "AEIOU",
            ottoman: "C S",
            russia: "RUS",
            ussr: "CCCP",
            france: "RF",
            britain: "GR",
            italy: "IT",
            japan: "JP",
            usa: "US",
            china: "CH",
            india: "IN",
        };
        const bodyMarkupParts: string[] = [
            `<circle cx="${centerX}" cy="${centerY}" r="${centerX - 3}" fill="${factionPrimaryColor}" stroke="${factionAccentColor}" stroke-width="3" />`,
            `<circle cx="${centerX}" cy="${centerY}" r="${centerX - 9}" fill="none" stroke="${factionAccentColor}" stroke-width="1" opacity="0.7" />`,
            `<text x="${centerX}" y="${centerY + 5}" font-family="Cinzel, serif" font-size="13" fill="${factionAccentColor}" text-anchor="middle">${insigniaGlyphs[factionKey] ?? "?"}</text>`,
        ];
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generateIconMarkup(catalogEntry: CatalogAssetEntry): string {
        const seedRandom = new SeedRandom(catalogEntry.seedKey);
        const iconKey = catalogEntry.assetId.replace(/^icon_resource_|^tech_|^idea_/, "").replace(/_alt_0\d$/, "");
        const centerX = catalogEntry.width / 2;
        const centerY = catalogEntry.height / 2;
        const accentColor = seedRandom.nextBoolean(0.7) ? SvgPalette.BRIGHT_BRASS : SvgPalette.AGED_PARCHMENT;
        const iconGlyphs: Record<string, string> = {
            food: "WHT",
            fuel: "OIL",
            steel: "ST",
            rubber: "RB",
            manpower: "MP",
            treasury: "$",
            legitimacy: "CRN",
            influence: "HND",
            production: "FAC",
            research: "FLK",
            morale: "SUN",
            stability: "SCL",
            supply: "CRT",
            intelligence: "EYE",
            ideology: "BOK",
            technology: "GER",
            industry: "IND",
            agriculture: "PLW",
            infrastructure: "BRG",
            population: "POP",
            machine_gun: "MG",
            artillery: "ART",
            tank: "TNK",
            airplane: "AIR",
            submarine: "SUB",
            dreadnought: "BB",
            aircraft_carrier: "CV",
            atomic_bomb: "ATM",
            radar: "RDR",
            sonar: "SNR",
            radio: "RDO",
            encryption: "ENG",
            railroad: "RR",
            telegraph: "TEL",
            telephone: "PHN",
            automobile: "CAR",
            aviation: "PRP",
            chemical: "GAS",
            medical: "MED",
            motorized: "MTR",
            mechanized: "MEC",
            jet: "JET",
            rocket: "RKT",
            nuclear: "NUC",
            fascism: "FSC",
            communism: "CCCP",
            democracy: "VOT",
            monarchy: "KNG",
            nationalism: "FLG",
            imperialism: "GLB",
            militarism: "SWD",
            pacifism: "DOV",
            isolationism: "WLL",
            internationalism: "INT",
            capitalism: "CAP",
            socialism: "SOC",
            liberalism: "LIB",
            conservatism: "CON",
            revolution: "TOR",
            reform: "REF",
            propaganda: "MEG",
            censorship: "CEN",
            total_war: "TOT",
            blitzkrieg: "BLZ",
            trench_warfare: "TRN",
            guerrilla: "GUE",
            naval_supremacy: "NAV",
            air_supremacy: "SUP",
        };
        const glyphText = iconGlyphs[iconKey] ?? iconKey.substring(0, 3).toUpperCase();
        const fontSizePx = glyphText.length > 4 ? 9 : glyphText.length > 2 ? 11 : 15;
        const bodyMarkupParts: string[] = [
            `<circle cx="${centerX}" cy="${centerY}" r="${centerX - 2}" fill="${SvgPalette.DARK_OLIVE}" stroke="${accentColor}" stroke-width="2" />`,
            `<text x="${centerX}" y="${centerY + fontSizePx / 3}" font-family="Special Elite, monospace" font-size="${fontSizePx}" fill="${accentColor}" text-anchor="middle">${glyphText}</text>`,
        ];
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generateUiElementMarkup(catalogEntry: CatalogAssetEntry): string {
        const assetId = catalogEntry.assetId;
        const bodyMarkupParts: string[] = [];
        const width = catalogEntry.width;
        const height = catalogEntry.height;
        if (assetId.startsWith("ui_panel_parchment")) {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.PARCHMENT}" />`);
            bodyMarkupParts.push(
                ...SvgMarkupFactoryCore.buildSeededSpeckles(
                    new SeedRandom(catalogEntry.seedKey),
                    width,
                    height,
                    30,
                    SvgPalette.DEEP_PARCHMENT,
                    0.03,
                    0.08,
                ),
            );
            bodyMarkupParts.push(
                `<rect x="3" y="3" width="${width - 6}" height="${height - 6}" fill="none" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="3" />`,
            );
        } else if (assetId === "ui_panel_brass_frame") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.MID_OLIVE}" />`);
            bodyMarkupParts.push(
                `<rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="5" />`,
            );
        } else if (assetId === "ui_panel_dark_leather") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" />`);
            bodyMarkupParts.push(
                ...SvgMarkupFactoryCore.buildSeededSpeckles(
                    new SeedRandom(catalogEntry.seedKey),
                    width,
                    height,
                    24,
                    SvgPalette.NEAR_BLACK_LEATHER,
                    0.1,
                    0.25,
                ),
            );
            bodyMarkupParts.push(
                `<rect x="3" y="3" width="${width - 6}" height="${height - 6}" fill="none" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="2" />`,
            );
        } else if (assetId === "ui_panel_newspaper") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.AGED_PARCHMENT}" />`);
            bodyMarkupParts.push(
                `<rect x="6" y="6" width="${width - 12}" height="${height - 12}" fill="none" stroke="${SvgPalette.FIELD_GRAY}" stroke-width="1" />`,
            );
        } else if (assetId === "ui_panel_telegram") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.PARCHMENT}" />`);
            bodyMarkupParts.push(
                `<rect x="4" y="4" width="${width - 8}" height="${height - 8}" fill="none" stroke="${SvgPalette.FIELD_GRAY}" stroke-width="2" stroke-dasharray="6 4" />`,
            );
        } else if (assetId === "ui_panel_ledger") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" />`);
            for (let ledgerLineIndex = 12; ledgerLineIndex < height; ledgerLineIndex += 14) {
                bodyMarkupParts.push(
                    `<line x1="4" y1="${ledgerLineIndex}" x2="${width - 4}" y2="${ledgerLineIndex}" stroke="${SvgPalette.FIELD_GRAY}" stroke-width="1" opacity="0.5" />`,
                );
            }
        } else if (assetId.startsWith("ui_button_")) {
            const buttonFillColor = assetId.includes("danger")
                ? SvgPalette.BLOOD_RED
                : assetId.includes("secondary")
                  ? SvgPalette.PARCHMENT
                  : SvgPalette.DEEP_BRASS;
            const buttonStrokeColor = assetId.includes("hover")
                ? SvgPalette.HIGHLIGHT_BRASS
                : assetId.includes("pressed")
                  ? SvgPalette.NEAR_BLACK_LEATHER
                  : SvgPalette.BRIGHT_BRASS;
            const buttonOpacity = assetId.includes("disabled") ? 0.4 : 1;
            bodyMarkupParts.push(
                `<rect width="${width}" height="${height}" fill="${buttonFillColor}" opacity="${buttonOpacity}" />`,
            );
            bodyMarkupParts.push(
                `<rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="none" stroke="${buttonStrokeColor}" stroke-width="2" />`,
            );
        } else if (assetId.startsWith("ui_border_")) {
            bodyMarkupParts.push(
                `<rect x="4" y="4" width="${width - 8}" height="${height - 8}" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="3" />`,
            );
            if (assetId.includes("double")) {
                bodyMarkupParts.push(
                    `<rect x="10" y="10" width="${width - 20}" height="${height - 20}" fill="none" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="1.5" />`,
                );
            }
            if (assetId.includes("ornate")) {
                bodyMarkupParts.push(`<circle cx="10" cy="10" r="4" fill="${SvgPalette.HIGHLIGHT_BRASS}" />`);
                bodyMarkupParts.push(
                    `<circle cx="${width - 10}" cy="10" r="4" fill="${SvgPalette.HIGHLIGHT_BRASS}" />`,
                );
                bodyMarkupParts.push(
                    `<circle cx="10" cy="${height - 10}" r="4" fill="${SvgPalette.HIGHLIGHT_BRASS}" />`,
                );
                bodyMarkupParts.push(
                    `<circle cx="${width - 10}" cy="${height - 10}" r="4" fill="${SvgPalette.HIGHLIGHT_BRASS}" />`,
                );
            }
        } else if (assetId.startsWith("ui_divider_")) {
            bodyMarkupParts.push(
                `<line x1="0" y1="${height / 2}" x2="${width}" y2="${height / 2}" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="2" />`,
            );
            if (assetId.includes("ornate")) {
                bodyMarkupParts.push(
                    `<circle cx="${width / 2}" cy="${height / 2}" r="5" fill="${SvgPalette.BRIGHT_BRASS}" />`,
                );
            }
        } else if (assetId.startsWith("ui_progress_bar_")) {
            const barFillColor = assetId.includes("blood")
                ? SvgPalette.BLOOD_RED
                : assetId.includes("brass")
                  ? SvgPalette.BRIGHT_BRASS
                  : assetId.includes("bg")
                    ? SvgPalette.DARK_OLIVE
                    : SvgPalette.DEEP_BRASS;
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${barFillColor}" />`);
            bodyMarkupParts.push(
                `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" fill="none" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="1" />`,
            );
        } else if (assetId.startsWith("ui_checkbox_") || assetId.startsWith("ui_radio_")) {
            const isChecked = assetId.includes("checked") || assetId.includes("selected");
            bodyMarkupParts.push(
                assetId.startsWith("ui_radio_")
                    ? `<circle cx="${width / 2}" cy="${height / 2}" r="${width / 2 - 2}" fill="${SvgPalette.DARK_OLIVE}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" />`
                    : `<rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="${SvgPalette.DARK_OLIVE}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" />`,
            );
            if (isChecked) {
                bodyMarkupParts.push(
                    assetId.startsWith("ui_radio_")
                        ? `<circle cx="${width / 2}" cy="${height / 2}" r="${width / 4}" fill="${SvgPalette.HIGHLIGHT_BRASS}" />`
                        : `<path d="M 6 ${height / 2} l 4 5 l 8 -10" stroke="${SvgPalette.HIGHLIGHT_BRASS}" stroke-width="3" fill="none" />`,
                );
            }
        } else if (assetId.startsWith("ui_dropdown_") || assetId.startsWith("ui_tab_")) {
            const isActive = assetId.includes("open") || assetId.includes("active");
            bodyMarkupParts.push(
                `<rect width="${width}" height="${height}" fill="${isActive ? SvgPalette.DEEP_BRASS : SvgPalette.MID_OLIVE}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="1.5" />`,
            );
            bodyMarkupParts.push(
                `<path d="M ${width - 20} ${height / 2 - 3} l 6 0 l -3 6 Z" fill="${SvgPalette.PARCHMENT}" />`,
            );
        } else if (assetId === "ui_tooltip_bg") {
            bodyMarkupParts.push(
                `<rect width="${width}" height="${height}" fill="${SvgPalette.PARCHMENT}" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="3" />`,
            );
        } else if (assetId === "ui_tooltip_arrow") {
            bodyMarkupParts.push(
                `<path d="M 0 0 L ${width} 0 L ${width / 2} ${height} Z" fill="${SvgPalette.PARCHMENT}" />`,
            );
        } else if (assetId === "ui_modal_overlay") {
            bodyMarkupParts.push(
                `<rect width="${width}" height="${height}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" opacity="0.7" />`,
            );
        } else if (assetId.startsWith("ui_scrollbar_")) {
            bodyMarkupParts.push(
                `<rect width="${width}" height="${height}" rx="5" fill="${assetId.includes("thumb") ? SvgPalette.DEEP_BRASS : SvgPalette.DARK_OLIVE}" />`,
            );
        } else if (assetId.startsWith("ui_slider_")) {
            bodyMarkupParts.push(
                assetId.includes("thumb")
                    ? `<circle cx="${width / 2}" cy="${height / 2}" r="${width / 2 - 2}" fill="${SvgPalette.BRIGHT_BRASS}" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="2" />`
                    : `<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="1" />`,
            );
        } else if (assetId.startsWith("ui_badge_")) {
            const badgeLabelText = assetId.replace("ui_badge_", "").toUpperCase().replace("_", " ");
            bodyMarkupParts.push(
                `<rect width="${width}" height="${height}" fill="${SvgPalette.DEEP_BRASS}" stroke="${SvgPalette.HIGHLIGHT_BRASS}" stroke-width="1" />`,
            );
            bodyMarkupParts.push(
                `<text x="${width / 2}" y="${height / 2 + 4}" font-family="Spectral SC, serif" font-size="11" fill="${SvgPalette.PARCHMENT}" text-anchor="middle">${badgeLabelText}</text>`,
            );
        } else if (assetId === "ui_border_corner") {
            bodyMarkupParts.push(
                `<path d="M 2 30 L 2 2 L 30 2" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="3" />`,
            );
        } else {
            bodyMarkupParts.push(
                `<rect width="${width}" height="${height}" fill="${SvgPalette.MID_OLIVE}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" />`,
            );
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }
}
