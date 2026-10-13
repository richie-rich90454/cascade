import { CatalogAssetEntry, FactionColorTable, SvgPalette } from "./CatalogAssetEntry";
import { SeedRandom } from "../../../src/core/SeedRandom";
import { SvgMarkupFactoryCore } from "./SvgMarkupFactoryCore";

export class SvgMarkupFactoryDecorative {
    public static generateOrnamentMarkup(catalogEntry: CatalogAssetEntry): string {
        const seedRandom = new SeedRandom(catalogEntry.seedKey);
        const width = catalogEntry.width;
        const height = catalogEntry.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const bodyMarkupParts: string[] = [];
        if (catalogEntry.assetId.startsWith("ornament_corner_brass")) {
            bodyMarkupParts.push(`<path d="M 4 ${height - 4} L 4 4 L ${width - 4} 4" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="3" />`);
            bodyMarkupParts.push(`<path d="M 10 ${height - 10} q 8 -20 24 -24" fill="none" stroke="${SvgPalette.BRASS_TAN}" stroke-width="2" />`);
            bodyMarkupParts.push(`<circle cx="12" cy="12" r="4" fill="${SvgPalette.HIGHLIGHT_BRASS}" />`);
        } else if (catalogEntry.assetId.startsWith("ornament_corner_iron_cross")) {
            bodyMarkupParts.push(
                `<path d="M ${centerX - 4} 8 h 8 v 10 h 10 v 8 h -10 v 10 h -8 v -10 h -10 v -8 h 10 Z" fill="${SvgPalette.NEAR_BLACK_LEATHER}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" />`,
            );
        } else if (catalogEntry.assetId.startsWith("ornament_corner_star")) {
            bodyMarkupParts.push(SvgMarkupFactoryCore.buildStarPath(centerX, centerY, centerX - 6, 5));
        } else if (catalogEntry.assetId.startsWith("ornament_corner_laurel")) {
            for (let leafIndex = 0; leafIndex < 5; leafIndex++) {
                const leafX = 8 + leafIndex * 7;
                bodyMarkupParts.push(`<ellipse cx="${leafX}" cy="${height - 10 - leafIndex * 6}" rx="6" ry="3" fill="#4A5D3A" transform="rotate(-45 ${leafX} ${height - 10 - leafIndex * 6})" />`);
            }
        } else if (catalogEntry.assetId.startsWith("ornament_flourish")) {
            bodyMarkupParts.push(
                `<path d="M 4 ${centerY} q ${width / 4} -14 ${width / 2} 0 q ${width / 4} 14 ${width / 2} 0" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" />`,
            );
            bodyMarkupParts.push(`<circle cx="4" cy="${centerY}" r="3" fill="${SvgPalette.HIGHLIGHT_BRASS}" />`);
            bodyMarkupParts.push(`<circle cx="${width - 4}" cy="${centerY}" r="3" fill="${SvgPalette.HIGHLIGHT_BRASS}" />`);
        } else if (catalogEntry.assetId.startsWith("ornament_rule_line") || catalogEntry.assetId.startsWith("ornament_section_divider")) {
            bodyMarkupParts.push(`<line x1="2" y1="${centerY}" x2="${width - 2}" y2="${centerY}" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="2" />`);
            bodyMarkupParts.push(`<path d="M ${centerX - 8} ${centerY} l 8 -6 l 8 6 l -8 6 Z" fill="${SvgPalette.BRIGHT_BRASS}" />`);
        } else if (catalogEntry.assetId.startsWith("ornament_star_burst")) {
            bodyMarkupParts.push(SvgMarkupFactoryCore.buildStarPath(centerX, centerY, centerX - 4, 6));
        } else if (catalogEntry.assetId.startsWith("ornament_laurel_wreath")) {
            for (let leafIndex = 0; leafIndex < 8; leafIndex++) {
                const leafAngle = (Math.PI * 2 * leafIndex) / 8;
                const leafX = centerX + Math.cos(leafAngle) * (centerX - 10);
                const leafY = centerY + Math.sin(leafAngle) * (centerY - 10);
                bodyMarkupParts.push(
                    `<ellipse cx="${leafX.toFixed(1)}" cy="${leafY.toFixed(1)}" rx="6" ry="3" fill="#4A5D3A" transform="rotate(${((leafAngle * 180) / Math.PI).toFixed(0)} ${leafX.toFixed(1)} ${leafY.toFixed(1)})" />`,
                );
            }
        } else if (catalogEntry.assetId.startsWith("ornament_medal")) {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY - 6}" r="12" fill="${SvgPalette.DEEP_BRASS}" stroke="${SvgPalette.HIGHLIGHT_BRASS}" stroke-width="2" />`);
            bodyMarkupParts.push(`<path d="M ${centerX - 8} ${centerY + 4} l 8 16 l 8 -16" fill="${SvgPalette.BLOOD_RED}" />`);
        } else if (catalogEntry.assetId.startsWith("ornament_ribbon")) {
            bodyMarkupParts.push(`<path d="M 6 ${height - 6} l 12 -30 l 12 30 l -12 -8 Z" fill="${SvgPalette.BLOOD_RED}" stroke="${SvgPalette.HIGHLIGHT_BRASS}" stroke-width="1" />`);
        } else if (catalogEntry.assetId.startsWith("ornament_drop_cap")) {
            bodyMarkupParts.push(`<rect x="4" y="4" width="${width - 8}" height="${height - 8}" fill="${SvgPalette.PARCHMENT}" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="2" />`);
            bodyMarkupParts.push(
                `<text x="${centerX}" y="${centerY + 10}" font-family="UnifrakturMaguntia, serif" font-size="30" fill="${SvgPalette.NEAR_BLACK_LEATHER}" text-anchor="middle">C</text>`,
            );
        } else if (catalogEntry.assetId.startsWith("ornament_chapter_number")) {
            bodyMarkupParts.push(`<rect x="6" y="6" width="${width - 12}" height="${height - 12}" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" />`);
            bodyMarkupParts.push(
                `<text x="${centerX}" y="${centerY + 7}" font-family="Cinzel, serif" font-size="22" fill="${SvgPalette.HIGHLIGHT_BRASS}" text-anchor="middle">I</text>`,
            );
        } else if (catalogEntry.assetId.startsWith("ornament_eagle") || catalogEntry.assetId.startsWith("ornament_lion")) {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX - 6}" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" />`);
            bodyMarkupParts.push(
                `<text x="${centerX}" y="${centerY + 6}" font-family="Cinzel, serif" font-size="12" fill="${SvgPalette.HIGHLIGHT_BRASS}" text-anchor="middle">${catalogEntry.assetId.includes("eagle") ? "EAGLE" : "LION"}</text>`,
            );
        } else if (catalogEntry.assetId.startsWith("ornament_diamond")) {
            bodyMarkupParts.push(`<path d="M ${centerX} 4 L ${width - 4} ${centerY} L ${centerX} ${height - 4} L 4 ${centerY} Z" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" />`);
        } else if (catalogEntry.assetId.startsWith("ornament_chevron")) {
            for (let chevronIndex = 0; chevronIndex < 3; chevronIndex++) {
                bodyMarkupParts.push(`<path d="M 6 ${10 + chevronIndex * 14} l ${centerX - 6} 8 l ${centerX - 6} -8" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" />`);
            }
        } else if (catalogEntry.assetId.startsWith("ornament_crosshatch") || catalogEntry.assetId.startsWith("ornament_damask")) {
            for (let hatchIndex = 0; hatchIndex < 4; hatchIndex++) {
                const hatchOffset = hatchIndex * 12;
                bodyMarkupParts.push(`<line x1="${hatchOffset}" y1="0" x2="0" y2="${hatchOffset}" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="1.5" opacity="0.7" />`);
                bodyMarkupParts.push(`<line x1="${width - hatchOffset}" y1="0" x2="${width}" y2="${hatchOffset}" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="1.5" opacity="0.7" />`);
            }
        } else {
            const ornamentColor = seedRandom.nextBoolean(0.6) ? SvgPalette.BRIGHT_BRASS : SvgPalette.BRASS_TAN;
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX - 6}" fill="none" stroke="${ornamentColor}" stroke-width="2" />`);
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generatePatternMarkup(catalogEntry: CatalogAssetEntry): string {
        const seedRandom = new SeedRandom(catalogEntry.seedKey);
        const width = catalogEntry.width;
        const height = catalogEntry.height;
        const bodyMarkupParts: string[] = [];
        if (catalogEntry.assetId.startsWith("pattern_camouflage_")) {
            const factionKey = catalogEntry.assetId.replace(/pattern_camouflage_|_v0\d$/, "");
            const factionColor = FactionColorTable.PRIMARY_COLORS[factionKey] ?? SvgPalette.MID_OLIVE;
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${factionColor}" />`);
            for (let blobIndex = 0; blobIndex < 8; blobIndex++) {
                const blobX = seedRandom.nextInt(0, width);
                const blobY = seedRandom.nextInt(0, height);
                const blobRadius = seedRandom.nextInt(6, 14);
                bodyMarkupParts.push(
                    `<circle cx="${blobX}" cy="${blobY}" r="${blobRadius}" fill="${seedRandom.nextBoolean(0.5) ? SvgPalette.NEAR_BLACK_LEATHER : SvgPalette.FIELD_GRAY}" opacity="0.5" />`,
                );
            }
        } else if (catalogEntry.assetId.startsWith("pattern_stripe_diagonal")) {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" />`);
            for (let stripeIndex = -height; stripeIndex < width; stripeIndex += 12) {
                bodyMarkupParts.push(`<line x1="${stripeIndex}" y1="0" x2="${stripeIndex + height}" y2="${height}" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="3" opacity="0.5" />`);
            }
        } else if (catalogEntry.assetId.startsWith("pattern_stripe_vertical")) {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" />`);
            for (let stripeIndex = 0; stripeIndex < width; stripeIndex += 12) {
                bodyMarkupParts.push(`<rect x="${stripeIndex}" y="0" width="4" height="${height}" fill="${SvgPalette.DEEP_BRASS}" opacity="0.5" />`);
            }
        } else if (catalogEntry.assetId.startsWith("pattern_chevron_up") || catalogEntry.assetId.startsWith("pattern_chevron_down")) {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" />`);
            const isChevronUp = catalogEntry.assetId.includes("_up");
            for (let chevronRowIndex = 0; chevronRowIndex < 4; chevronRowIndex++) {
                const chevronY = chevronRowIndex * 16 + 8;
                bodyMarkupParts.push(
                    `<path d="M 4 ${isChevronUp ? chevronY + 6 : chevronY} l ${width / 2 - 4} ${isChevronUp ? -6 : 6} l ${width / 2 - 4} ${isChevronUp ? 6 : -6}" fill="none" stroke="${SvgPalette.BRASS_TAN}" stroke-width="2" opacity="0.6" />`,
                );
            }
        } else if (catalogEntry.assetId.startsWith("pattern_dots")) {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" />`);
            for (let dotRowIndex = 0; dotRowIndex < 6; dotRowIndex++) {
                for (let dotColumnIndex = 0; dotColumnIndex < 6; dotColumnIndex++) {
                    bodyMarkupParts.push(`<circle cx="${dotColumnIndex * 12 + 6}" cy="${dotRowIndex * 12 + 6}" r="2" fill="${SvgPalette.BRASS_TAN}" opacity="0.45" />`);
                }
            }
        } else if (catalogEntry.assetId.startsWith("pattern_crosses")) {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" />`);
            for (let crossRowIndex = 0; crossRowIndex < 4; crossRowIndex++) {
                for (let crossColumnIndex = 0; crossColumnIndex < 4; crossColumnIndex++) {
                    const crossX = crossColumnIndex * 16 + 8;
                    const crossY = crossRowIndex * 16 + 8;
                    bodyMarkupParts.push(`<path d="M ${crossX - 4} ${crossY} h 8 M ${crossX} ${crossY - 4} v 8" stroke="${SvgPalette.BRASS_TAN}" stroke-width="1.5" opacity="0.5" />`);
                }
            }
        } else if (catalogEntry.assetId.startsWith("pattern_hatching")) {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" />`);
            for (let hatchIndex = 0; hatchIndex < 8; hatchIndex++) {
                bodyMarkupParts.push(`<line x1="0" y1="${hatchIndex * 8}" x2="${width}" y2="${hatchIndex * 8}" stroke="${SvgPalette.FIELD_GRAY}" stroke-width="1" opacity="0.35" />`);
            }
        } else if (catalogEntry.assetId.startsWith("pattern_noise")) {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" />`);
            bodyMarkupParts.push(...SvgMarkupFactoryCore.buildSeededSpeckles(seedRandom, width, height, 120, SvgPalette.PARCHMENT, 0.04, 0.12));
        } else {
            const baseFillColor = catalogEntry.assetId.includes("parchment")
                ? SvgPalette.PARCHMENT
                : catalogEntry.assetId.includes("leather")
                  ? SvgPalette.DARK_OLIVE
                  : catalogEntry.assetId.includes("canvas")
                    ? SvgPalette.AGED_PARCHMENT
                    : SvgPalette.PARCHMENT;
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${baseFillColor}" />`);
            if (catalogEntry.assetId.startsWith("pattern_map_grid")) {
                for (let gridIndex = 0; gridIndex < width; gridIndex += 16) {
                    bodyMarkupParts.push(`<line x1="${gridIndex}" y1="0" x2="${gridIndex}" y2="${height}" stroke="${SvgPalette.FIELD_GRAY}" stroke-width="1" opacity="0.4" />`);
                    bodyMarkupParts.push(`<line x1="0" y1="${gridIndex}" x2="${width}" y2="${gridIndex}" stroke="${SvgPalette.FIELD_GRAY}" stroke-width="1" opacity="0.4" />`);
                }
            } else {
                bodyMarkupParts.push(...SvgMarkupFactoryCore.buildSeededSpeckles(seedRandom, width, height, 60, SvgPalette.DEEP_PARCHMENT, 0.03, 0.1));
            }
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generateScenarioMarkup(catalogEntry: CatalogAssetEntry): string {
        const scenarioNumberText = catalogEntry.assetId.match(/\d+/)?.[0] ?? "1";
        const width = catalogEntry.width;
        const height = catalogEntry.height;
        const isBanner = catalogEntry.assetId.includes("banner");
        const bodyMarkupParts: string[] = [
            `<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="3" />`,
            `<rect x="6" y="6" width="${width - 12}" height="${height - 12}" fill="none" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="1.5" />`,
            `<text x="${width / 2}" y="${height / 2 + (isBanner ? 12 : 14)}" font-family="UnifrakturMaguntia, serif" font-size="${isBanner ? 48 : 44}" fill="${SvgPalette.HIGHLIGHT_BRASS}" text-anchor="middle">${scenarioNumberText}</text>`,
        ];
        if (isBanner) {
            bodyMarkupParts.push(`<circle cx="40" cy="${height / 2}" r="16" fill="none" stroke="${SvgPalette.BRASS_TAN}" stroke-width="2" />`);
            bodyMarkupParts.push(`<circle cx="${width - 40}" cy="${height / 2}" r="16" fill="none" stroke="${SvgPalette.BRASS_TAN}" stroke-width="2" />`);
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generateTimelineMarkup(catalogEntry: CatalogAssetEntry): string {
        const width = catalogEntry.width;
        const height = catalogEntry.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const bodyMarkupParts: string[] = [];
        if (catalogEntry.assetId === "timeline_axis") {
            bodyMarkupParts.push(`<line x1="0" y1="${centerY}" x2="${width}" y2="${centerY}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="3" />`);
        } else if (catalogEntry.assetId === "timeline_tick_major") {
            bodyMarkupParts.push(`<line x1="${centerX}" y1="8" x2="${centerX}" y2="${height - 8}" stroke="${SvgPalette.HIGHLIGHT_BRASS}" stroke-width="3" />`);
        } else if (catalogEntry.assetId === "timeline_tick_minor") {
            bodyMarkupParts.push(`<line x1="${centerX}" y1="16" x2="${centerX}" y2="${height - 16}" stroke="${SvgPalette.BRASS_TAN}" stroke-width="2" />`);
        } else if (catalogEntry.assetId === "timeline_marker_atrocity") {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="10" fill="${SvgPalette.NEAR_BLACK_LEATHER}" stroke="${SvgPalette.BLOOD_RED}" stroke-width="3" />`);
            bodyMarkupParts.push(`<path d="M ${centerX} ${centerY - 5} q 4 6 0 12 q -4 -6 0 -12 Z" fill="${SvgPalette.BRIGHT_BLOOD}" />`);
        } else if (catalogEntry.assetId === "timeline_marker_war") {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="10" fill="${SvgPalette.BLOOD_RED}" stroke="${SvgPalette.PARCHMENT}" stroke-width="2" />`);
        } else if (catalogEntry.assetId === "timeline_marker_treaty") {
            bodyMarkupParts.push(`<rect x="${centerX - 9}" y="${centerY - 11}" width="18" height="22" fill="${SvgPalette.PARCHMENT}" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="2" />`);
        } else if (catalogEntry.assetId === "timeline_marker_revolution") {
            bodyMarkupParts.push(`<path d="M ${centerX - 6} ${centerY + 10} l 6 -22 l 6 22 Z" fill="${SvgPalette.BRIGHT_BLOOD}" stroke="${SvgPalette.HIGHLIGHT_BRASS}" stroke-width="1" />`);
        } else if (catalogEntry.assetId === "timeline_marker_economic") {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="10" fill="${SvgPalette.DEEP_BRASS}" stroke="${SvgPalette.HIGHLIGHT_BRASS}" stroke-width="2" />`);
            bodyMarkupParts.push(`<text x="${centerX}" y="${centerY + 4}" font-family="Courier Prime, monospace" font-size="11" fill="${SvgPalette.PARCHMENT}" text-anchor="middle">$</text>`);
        } else {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="9" fill="${SvgPalette.BRIGHT_BRASS}" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="2" />`);
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generateEventIllustrationMarkup(catalogEntry: CatalogAssetEntry): string {
        const seedRandom = new SeedRandom(catalogEntry.seedKey);
        const width = catalogEntry.width;
        const height = catalogEntry.height;
        const baseEventKey = catalogEntry.assetId.replace(/_(wide|small|tall)$/, "");
        const bodyMarkupParts: string[] = [
            `<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" />`,
            `<rect x="4" y="4" width="${width - 8}" height="${height - 8}" fill="none" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="2" />`,
        ];
        const horizonY = height * 0.68;
        bodyMarkupParts.push(`<rect x="4" y="${horizonY}" width="${width - 8}" height="${height - horizonY - 4}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" opacity="0.65" />`);
        if (
            baseEventKey === "event_assassination_sarajevo" ||
            baseEventKey === "event_schlieffen_plan" ||
            baseEventKey === "event_invasion_poland" ||
            baseEventKey === "event_operation_barbarossa"
        ) {
            for (let arrowIndex = 0; arrowIndex < 4; arrowIndex++) {
                const arrowStartX = 20 + arrowIndex * (width / 5);
                bodyMarkupParts.push(`<path d="M ${arrowStartX} ${horizonY} l ${width / 6} -${height / 4} l 8 6 Z" fill="${SvgPalette.BRIGHT_BLOOD}" opacity="0.8" />`);
            }
        } else if (baseEventKey === "event_trench_warfare" || baseEventKey === "event_stalingrad" || baseEventKey === "event_d_day") {
            for (let sandbagIndex = 0; sandbagIndex < 7; sandbagIndex++) {
                bodyMarkupParts.push(`<ellipse cx="${20 + sandbagIndex * (width / 8)}" cy="${horizonY + 8}" rx="14" ry="7" fill="${SvgPalette.FIELD_GRAY}" opacity="0.85" />`);
            }
            bodyMarkupParts.push(`<path d="M 10 ${horizonY - 4} q ${width / 4} -18 ${width / 2} 0 q ${width / 4} 18 ${width / 2} 0" fill="none" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="2" />`);
        } else if (baseEventKey === "event_tank_first_use") {
            bodyMarkupParts.push(`<rect x="${width / 2 - 40}" y="${horizonY - 30}" width="80" height="26" rx="6" fill="${SvgPalette.MID_OLIVE}" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="2" />`);
            bodyMarkupParts.push(`<circle cx="${width / 2 - 22}" cy="${horizonY - 2}" r="9" fill="${SvgPalette.NEAR_BLACK_LEATHER}" />`);
            bodyMarkupParts.push(`<circle cx="${width / 2 + 22}" cy="${horizonY - 2}" r="9" fill="${SvgPalette.NEAR_BLACK_LEATHER}" />`);
        } else if (baseEventKey === "event_poison_gas") {
            bodyMarkupParts.push(`<circle cx="${width / 2}" cy="${horizonY - 34}" r="24" fill="${SvgPalette.FIELD_GRAY}" />`);
            bodyMarkupParts.push(`<rect x="${width / 2 - 14}" y="${horizonY - 18}" width="28" height="14" rx="4" fill="${SvgPalette.NEAR_BLACK_LEATHER}" />`);
        } else if (baseEventKey === "event_lusitania" || baseEventKey === "event_pearl_harbor") {
            bodyMarkupParts.push(`<path d="M ${width / 2 - 60} ${horizonY - 10} l 120 0 l -14 22 l -92 0 Z" fill="${SvgPalette.MID_OLIVE}" />`);
            bodyMarkupParts.push(`<rect x="${width / 2 - 16}" y="${horizonY - 26}" width="32" height="16" fill="${SvgPalette.MID_OLIVE}" />`);
            bodyMarkupParts.push(`<circle cx="${width / 2 + 46}" cy="${horizonY - 44}" r="14" fill="${SvgPalette.NEAR_BLACK_LEATHER}" opacity="0.6" />`);
        } else if (baseEventKey === "event_hiroshima") {
            bodyMarkupParts.push(`<path d="M ${width / 2} ${horizonY - 70} q 26 26 0 46 q -26 -20 0 -46 Z" fill="${SvgPalette.PARCHMENT}" opacity="0.85" />`);
            bodyMarkupParts.push(`<ellipse cx="${width / 2}" cy="${horizonY - 24}" rx="46" ry="16" fill="${SvgPalette.AGED_PARCHMENT}" opacity="0.7" />`);
        } else if (
            baseEventKey === "event_holocaust" ||
            baseEventKey === "event_armenian_genocide" ||
            baseEventKey === "event_cambodian_genocide" ||
            baseEventKey === "event_rwandan_genocide" ||
            baseEventKey === "event_holodomor"
        ) {
            bodyMarkupParts.push(`<path d="M ${width / 2} ${horizonY - 56} q 10 22 0 44 q -10 -22 0 -44 Z" fill="${SvgPalette.BRIGHT_BLOOD}" />`);
            for (let wireIndex = 0; wireIndex < 5; wireIndex++) {
                bodyMarkupParts.push(
                    `<line x1="${width / 2 - 60 + wireIndex * 30}" y1="${horizonY - 8}" x2="${width / 2 - 60 + wireIndex * 30}" y2="${horizonY + 22}" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="2" opacity="0.8" />`,
                );
            }
            bodyMarkupParts.push(`<line x1="${width / 2 - 70}" y1="${horizonY + 8}" x2="${width / 2 + 70}" y2="${horizonY + 8}" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="2" opacity="0.8" />`);
        } else if (baseEventKey === "event_russian_revolution" || baseEventKey === "event_march_on_rome") {
            for (let figureIndex = 0; figureIndex < 6; figureIndex++) {
                const figureX = 30 + figureIndex * ((width - 60) / 5);
                bodyMarkupParts.push(`<rect x="${figureX - 6}" y="${horizonY - 24}" width="12" height="24" rx="4" fill="${SvgPalette.NEAR_BLACK_LEATHER}" />`);
                bodyMarkupParts.push(`<circle cx="${figureX}" cy="${horizonY - 30}" r="5" fill="${SvgPalette.NEAR_BLACK_LEATHER}" />`);
            }
            bodyMarkupParts.push(`<rect x="${width / 2 + 30}" y="${horizonY - 60}" width="5" height="40" fill="${SvgPalette.BRIGHT_BLOOD}" />`);
            bodyMarkupParts.push(`<rect x="${width / 2 + 35}" y="${horizonY - 60}" width="26" height="18" fill="${SvgPalette.BRIGHT_BLOOD}" />`);
        } else if (
            baseEventKey === "event_treaty_versailles" ||
            baseEventKey === "event_munich_conference" ||
            baseEventKey === "event_molotov_ribbentrop" ||
            baseEventKey === "event_united_nations"
        ) {
            bodyMarkupParts.push(`<rect x="${width / 2 - 70}" y="${horizonY - 20}" width="140" height="12" fill="${SvgPalette.DEEP_BRASS}" />`);
            bodyMarkupParts.push(`<rect x="${width / 2 - 56}" y="${horizonY - 32}" width="40" height="14" fill="${SvgPalette.PARCHMENT}" />`);
            bodyMarkupParts.push(`<rect x="${width / 2 + 4}" y="${horizonY - 32}" width="40" height="14" fill="${SvgPalette.PARCHMENT}" />`);
        } else if (baseEventKey === "event_league_of_nations") {
            bodyMarkupParts.push(`<circle cx="${width / 2}" cy="${horizonY - 34}" r="30" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="3" />`);
            bodyMarkupParts.push(`<ellipse cx="${width / 2}" cy="${horizonY - 34}" rx="30" ry="12" fill="none" stroke="${SvgPalette.BRASS_TAN}" stroke-width="1.5" />`);
            bodyMarkupParts.push(`<line x1="${width / 2 - 30}" y1="${horizonY - 34}" x2="${width / 2 + 30}" y2="${horizonY - 34}" stroke="${SvgPalette.BRASS_TAN}" stroke-width="1.5" />`);
        } else if (baseEventKey === "event_great_depression") {
            for (let figureIndex = 0; figureIndex < 5; figureIndex++) {
                const figureX = 40 + figureIndex * ((width - 80) / 4);
                bodyMarkupParts.push(`<rect x="${figureX - 7}" y="${horizonY - 26}" width="14" height="26" rx="4" fill="${SvgPalette.FIELD_GRAY}" />`);
            }
            bodyMarkupParts.push(`<path d="M 20 ${horizonY - 60} l ${width / 3} 20 l ${width / 4} -34 l ${width / 5} 30" fill="none" stroke="${SvgPalette.BRIGHT_BLOOD}" stroke-width="3" />`);
        } else if (baseEventKey === "event_new_deal" || baseEventKey === "event_five_year_plan") {
            bodyMarkupParts.push(`<rect x="${width / 2 - 50}" y="${horizonY - 46}" width="30" height="46" fill="${SvgPalette.MID_OLIVE}" />`);
            bodyMarkupParts.push(`<rect x="${width / 2 - 12}" y="${horizonY - 62}" width="10" height="62" fill="${SvgPalette.MID_OLIVE}" />`);
            bodyMarkupParts.push(`<circle cx="${width / 2 + 8}" cy="${horizonY - 68}" r="8" fill="${SvgPalette.FIELD_GRAY}" />`);
            bodyMarkupParts.push(`<circle cx="${width / 2 + 34}" cy="${horizonY - 50}" r="12" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="3" />`);
        } else if (baseEventKey === "event_reichstag_fire") {
            bodyMarkupParts.push(`<rect x="${width / 2 - 60}" y="${horizonY - 50}" width="120" height="50" fill="${SvgPalette.MID_OLIVE}" />`);
            bodyMarkupParts.push(`<path d="M ${width / 2 - 30} ${horizonY - 50} q 10 -26 20 0 q 10 -18 20 0" fill="${SvgPalette.BRIGHT_BLOOD}" opacity="0.9" />`);
        } else if (baseEventKey === "event_zimmermann_telegram") {
            bodyMarkupParts.push(`<rect x="${width / 2 - 50}" y="${horizonY - 50}" width="100" height="56" fill="${SvgPalette.PARCHMENT}" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="2" />`);
            bodyMarkupParts.push(
                `<path d="M ${width / 2 - 40} ${horizonY - 38} h 80 M ${width / 2 - 40} ${horizonY - 26} h 80 M ${width / 2 - 40} ${horizonY - 14} h 56" stroke="${SvgPalette.DEEP_PARCHMENT}" stroke-width="2" />`,
            );
        } else if (baseEventKey === "event_dunkirk" || baseEventKey === "event_battle_britain") {
            for (let planeIndex = 0; planeIndex < 3; planeIndex++) {
                const planeX = width / 3 + planeIndex * (width / 4);
                const planeY = horizonY - 56 - planeIndex * 12;
                bodyMarkupParts.push(`<path d="M ${planeX} ${planeY} l 24 6 l -24 6 l 6 -6 Z" fill="${SvgPalette.PARCHMENT}" opacity="0.85" />`);
                bodyMarkupParts.push(`<path d="M ${planeX - 30} ${planeY + 30} q 40 20 80 0" fill="none" stroke="${SvgPalette.PARCHMENT}" stroke-width="2" opacity="0.5" />`);
            }
        } else {
            for (let silhouetteIndex = 0; silhouetteIndex < 5; silhouetteIndex++) {
                const silhouetteX = 30 + silhouetteIndex * ((width - 60) / 4);
                const silhouetteHeight = seedRandom.nextInt(24, 46);
                bodyMarkupParts.push(
                    `<rect x="${silhouetteX - 8}" y="${horizonY - silhouetteHeight}" width="16" height="${silhouetteHeight}" rx="4" fill="${SvgPalette.NEAR_BLACK_LEATHER}" opacity="0.85" />`,
                );
            }
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generatePortraitMarkup(catalogEntry: CatalogAssetEntry): string {
        const seedRandom = new SeedRandom(catalogEntry.seedKey);
        const width = catalogEntry.width;
        const height = catalogEntry.height;
        const bodyMarkupParts: string[] = [];
        if (catalogEntry.assetId.startsWith("portrait_frame_")) {
            const portraitFactionKey = catalogEntry.assetId.replace(/portrait_frame_|_small$/, "");
            const factionAccentColor = FactionColorTable.ACCENT_COLORS[portraitFactionKey] ?? SvgPalette.BRIGHT_BRASS;
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" />`);
            bodyMarkupParts.push(`<rect x="4" y="4" width="${width - 8}" height="${height - 8}" fill="none" stroke="${factionAccentColor}" stroke-width="4" />`);
            bodyMarkupParts.push(`<circle cx="${width / 2}" cy="${height * 0.38}" r="${width * 0.18}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" />`);
            bodyMarkupParts.push(`<path d="M ${width * 0.24} ${height - 12} q ${width * 0.26} -${height * 0.4} ${width * 0.52} 0 Z" fill="${SvgPalette.NEAR_BLACK_LEATHER}" />`);
        } else if (catalogEntry.assetId.startsWith("ig_")) {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.MID_OLIVE}" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="2" />`);
            bodyMarkupParts.push(`<circle cx="${width / 2}" cy="${height * 0.32}" r="${width * 0.16}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" />`);
            bodyMarkupParts.push(`<path d="M ${width * 0.26} ${height - 8} q ${width * 0.24} -${height * 0.34} ${width * 0.48} 0 Z" fill="${SvgPalette.NEAR_BLACK_LEATHER}" />`);
            const interestGroupLabelText = catalogEntry.assetId.replace("ig_", "").substring(0, 4).toUpperCase();
            bodyMarkupParts.push(
                `<text x="${width / 2}" y="${height - 10}" font-family="Spectral SC, serif" font-size="10" fill="${SvgPalette.AGED_PARCHMENT}" text-anchor="middle">${interestGroupLabelText}</text>`,
            );
        } else {
            const portraitSilhouetteColor = seedRandom.nextBoolean(0.5) ? SvgPalette.NEAR_BLACK_LEATHER : SvgPalette.FIELD_GRAY;
            bodyMarkupParts.push(`<circle cx="${width / 2}" cy="${height * 0.34}" r="${width * 0.2}" fill="${portraitSilhouetteColor}" />`);
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generateOverlayMarkup(catalogEntry: CatalogAssetEntry): string {
        const width = catalogEntry.width;
        const height = catalogEntry.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const bodyMarkupParts: string[] = [];
        if (catalogEntry.assetId === "overlay_fog_of_war") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" opacity="0.75" />`);
        } else if (catalogEntry.assetId === "overlay_supply_range") {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX - 4}" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" stroke-dasharray="6 4" />`);
        } else if (catalogEntry.assetId === "overlay_attack_arrow" || catalogEntry.assetId === "overlay_movement_arrow") {
            const arrowColor = catalogEntry.assetId.includes("attack") ? SvgPalette.BRIGHT_BLOOD : SvgPalette.HIGHLIGHT_BRASS;
            bodyMarkupParts.push(`<path d="M 8 ${height - 12} L ${width - 16} ${centerY} L 8 12" fill="none" stroke="${arrowColor}" stroke-width="4" />`);
            bodyMarkupParts.push(`<path d="M ${width - 20} ${centerY - 10} L ${width - 4} ${centerY} L ${width - 20} ${centerY + 10} Z" fill="${arrowColor}" />`);
        } else if (catalogEntry.assetId === "overlay_defend_shield") {
            bodyMarkupParts.push(`<path d="M ${centerX} 6 q ${centerX - 8} 10 ${centerX - 8} ${centerY} q 0 ${centerY - 12} ${centerX - 8} ${centerY - 6} q ${centerX - 8} 6 ${centerX - 8} -${centerY - 6} q 0 -${centerY - 8} ${centerX - 8} -${centerY} Z" fill="${SvgPalette.FIELD_GRAY}" stroke="${SvgPalette.PARCHMENT}" stroke-width="2" />`);
        } else if (catalogEntry.assetId === "overlay_naval_route" || catalogEntry.assetId === "overlay_railway_route" || catalogEntry.assetId === "overlay_air_route") {
            const routeColor = catalogEntry.assetId.includes("naval") ? "#2D4A6B" : catalogEntry.assetId.includes("railway") ? SvgPalette.DEEP_BRASS : SvgPalette.AGED_PARCHMENT;
            bodyMarkupParts.push(`<path d="M 4 ${height - 8} q ${centerX} -${height - 16} ${width - 4} 8" fill="none" stroke="${routeColor}" stroke-width="3" stroke-dasharray="8 5" />`);
        } else if (catalogEntry.assetId === "overlay_front_line") {
            for (let blockIndex = 0; blockIndex < 4; blockIndex++) {
                bodyMarkupParts.push(`<rect x="${blockIndex * 16 + 2}" y="${centerY - 5}" width="12" height="10" fill="${SvgPalette.BRIGHT_BLOOD}" />`);
            }
        } else if (catalogEntry.assetId === "overlay_pocket") {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX - 6}" fill="none" stroke="${SvgPalette.BRIGHT_BLOOD}" stroke-width="3" />`);
            bodyMarkupParts.push(`<path d="M ${centerX - 8} ${centerY - 8} L ${centerX + 8} ${centerY + 8} M ${centerX + 8} ${centerY - 8} L ${centerX - 8} ${centerY + 8}" stroke="${SvgPalette.BRIGHT_BLOOD}" stroke-width="3" />`);
        } else if (catalogEntry.assetId === "overlay_landing_zone" || catalogEntry.assetId === "overlay_paradrop_zone") {
            bodyMarkupParts.push(`<rect x="6" y="6" width="${width - 12}" height="${height - 12}" fill="${SvgPalette.BRIGHT_BRASS}" opacity="0.35" stroke="${SvgPalette.HIGHLIGHT_BRASS}" stroke-width="2" stroke-dasharray="6 4" />`);
        } else if (catalogEntry.assetId === "overlay_bombing_target") {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX - 6}" fill="none" stroke="${SvgPalette.BRIGHT_BLOOD}" stroke-width="3" />`);
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX / 3}" fill="${SvgPalette.BRIGHT_BLOOD}" />`);
        } else if (catalogEntry.assetId === "overlay_artillery_range" || catalogEntry.assetId === "overlay_radar_range") {
            const rangeColor = catalogEntry.assetId.includes("radar") ? SvgPalette.HIGHLIGHT_BRASS : SvgPalette.BLOOD_RED;
            bodyMarkupParts.push(`<path d="M 4 ${height - 4} q ${width - 8} -${height - 8} ${width - 8} -${height - 8}" fill="none" stroke="${rangeColor}" stroke-width="2" stroke-dasharray="4 4" />`);
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX / 4}" fill="${rangeColor}" opacity="0.6" />`);
        } else {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" stroke-dasharray="6 4" />`);
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generateLedgerMarkup(catalogEntry: CatalogAssetEntry): string {
        const width = catalogEntry.width;
        const height = catalogEntry.height;
        const bodyMarkupParts: string[] = [];
        if (catalogEntry.assetId === "ledger_row_odd") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" />`);
        } else if (catalogEntry.assetId === "ledger_row_even") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.MID_OLIVE}" />`);
        } else if (catalogEntry.assetId === "ledger_header_row") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.DEEP_BRASS}" />`);
        } else if (catalogEntry.assetId === "ledger_column_divider") {
            bodyMarkupParts.push(`<line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="${SvgPalette.FIELD_GRAY}" stroke-width="1" />`);
        } else if (catalogEntry.assetId === "ledger_total_row") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.BRASS_TAN}" />`);
        } else {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" />`);
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generateFocusMarkup(catalogEntry: CatalogAssetEntry): string {
        const width = catalogEntry.width;
        const height = catalogEntry.height;
        const bodyMarkupParts: string[] = [];
        if (catalogEntry.assetId.startsWith("focus_connector_")) {
            bodyMarkupParts.push(`<line x1="0" y1="${height / 2}" x2="${width}" y2="${height / 2}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="4" />`);
            if (catalogEntry.assetId.includes("corner")) {
                bodyMarkupParts.push(`<line x1="${width / 2}" y1="${height / 2}" x2="${width / 2}" y2="${height}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="4" />`);
            }
            if (catalogEntry.assetId.includes("cross")) {
                bodyMarkupParts.push(`<line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="4" />`);
            }
        } else if (catalogEntry.assetId === "focus_tree_background") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" opacity="0.9" />`);
        } else {
            const nodeFillColor = catalogEntry.assetId.includes("completed")
                ? SvgPalette.DEEP_BRASS
                : catalogEntry.assetId.includes("available")
                  ? SvgPalette.BRIGHT_BRASS
                  : catalogEntry.assetId.includes("locked")
                    ? SvgPalette.FIELD_GRAY
                    : SvgPalette.MID_OLIVE;
            bodyMarkupParts.push(`<rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="${nodeFillColor}" stroke="${SvgPalette.HIGHLIGHT_BRASS}" stroke-width="2" />`);
            if (catalogEntry.assetId.includes("major")) {
                bodyMarkupParts.push(SvgMarkupFactoryCore.buildStarPath(width / 2, height / 2, width / 3, 6));
            }
            if (catalogEntry.assetId.includes("completed")) {
                bodyMarkupParts.push(`<path d="M ${width / 2 - 8} ${height / 2} l 6 8 l 12 -16" stroke="${SvgPalette.PARCHMENT}" stroke-width="4" fill="none" />`);
            }
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generateStatusMarkup(catalogEntry: CatalogAssetEntry): string {
        const width = catalogEntry.width;
        const height = catalogEntry.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const bodyMarkupParts: string[] = [];
        const indicatorColors: Record<string, string> = {
            status_indicator_green: "#4A5D3A",
            status_indicator_yellow: SvgPalette.BRIGHT_BRASS,
            status_indicator_red: SvgPalette.BRIGHT_BLOOD,
            status_indicator_gray: SvgPalette.FIELD_GRAY,
            status_indicator_blue: "#2D4A8B",
        };
        if (catalogEntry.assetId in indicatorColors) {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX - 3}" fill="${indicatorColors[catalogEntry.assetId]}" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="2" />`);
        } else if (catalogEntry.assetId === "status_arrow_up") {
            bodyMarkupParts.push(`<path d="M ${centerX} 4 L ${width - 4} ${height - 6} L 4 ${height - 6} Z" fill="#4A5D3A" />`);
        } else if (catalogEntry.assetId === "status_arrow_down") {
            bodyMarkupParts.push(`<path d="M ${centerX} ${height - 4} L ${width - 4} 6 L 4 6 Z" fill="${SvgPalette.BRIGHT_BLOOD}" />`);
        } else if (catalogEntry.assetId === "status_arrow_flat") {
            bodyMarkupParts.push(`<rect x="4" y="${centerY - 3}" width="${width - 8}" height="6" fill="${SvgPalette.FIELD_GRAY}" />`);
        } else if (catalogEntry.assetId === "status_star_full") {
            bodyMarkupParts.push(SvgMarkupFactoryCore.buildStarPath(centerX, centerY, centerX - 3, 4));
        } else if (catalogEntry.assetId === "status_star_empty") {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX - 5}" fill="none" stroke="${SvgPalette.FIELD_GRAY}" stroke-width="2" />`);
        } else if (catalogEntry.assetId === "status_star_half") {
            bodyMarkupParts.push(`<path d="M ${centerX} 2 L ${centerX} ${height - 2} L ${centerX - 9} ${centerY} Z" fill="${SvgPalette.BRIGHT_BRASS}" />`);
        } else {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX - 4}" fill="${SvgPalette.FIELD_GRAY}" />`);
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generateNewspaperMarkup(catalogEntry: CatalogAssetEntry): string {
        const width = catalogEntry.width;
        const height = catalogEntry.height;
        const bodyMarkupParts: string[] = [];
        if (catalogEntry.assetId.startsWith("newspaper_masthead_")) {
            const mastheadNationKey = catalogEntry.assetId.replace("newspaper_masthead_", "");
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.AGED_PARCHMENT}" />`);
            bodyMarkupParts.push(`<line x1="4" y1="${height - 6}" x2="${width - 4}" y2="${height - 6}" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="3" />`);
            bodyMarkupParts.push(
                `<text x="${width / 2}" y="${height / 2 + 6}" font-family="UnifrakturMaguntia, serif" font-size="26" fill="${SvgPalette.NEAR_BLACK_LEATHER}" text-anchor="middle">${mastheadNationKey.toUpperCase()}</text>`,
            );
        } else if (catalogEntry.assetId === "newspaper_column_divider") {
            bodyMarkupParts.push(`<line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="2" />`);
        } else if (catalogEntry.assetId === "newspaper_headline_banner") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" />`);
            bodyMarkupParts.push(`<rect x="4" y="4" width="${width - 8}" height="${height - 8}" fill="none" stroke="${SvgPalette.AGED_PARCHMENT}" stroke-width="1" />`);
        } else if (catalogEntry.assetId === "newspaper_photo_frame") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" stroke="${SvgPalette.DEEP_PARCHMENT}" stroke-width="4" />`);
        } else if (catalogEntry.assetId === "telegram_header") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.PARCHMENT}" />`);
            bodyMarkupParts.push(`<line x1="4" y1="${height - 8}" x2="${width - 4}" y2="${height - 8}" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="2" />`);
            bodyMarkupParts.push(`<line x1="4" y1="${height - 14}" x2="${width - 4}" y2="${height - 14}" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="1" />`);
        } else if (catalogEntry.assetId === "telegram_body_lines") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.PARCHMENT}" />`);
            for (let lineIndex = 10; lineIndex < height - 6; lineIndex += 12) {
                bodyMarkupParts.push(`<line x1="8" y1="${lineIndex}" x2="${width - 8}" y2="${lineIndex}" stroke="${SvgPalette.FIELD_GRAY}" stroke-width="1" opacity="0.6" />`);
            }
        } else if (catalogEntry.assetId === "telegram_stamp") {
            bodyMarkupParts.push(`<rect x="6" y="6" width="${width - 12}" height="${height - 12}" fill="none" stroke="${SvgPalette.BLOOD_RED}" stroke-width="3" />`);
            bodyMarkupParts.push(
                `<text x="${width / 2}" y="${height / 2 + 6}" font-family="Special Elite, monospace" font-size="20" fill="${SvgPalette.BLOOD_RED}" text-anchor="middle">SECRET</text>`,
            );
        } else {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.AGED_PARCHMENT}" />`);
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }

    public static generateMiscMarkup(catalogEntry: CatalogAssetEntry): string {
        const seedRandom = new SeedRandom(catalogEntry.seedKey);
        const width = catalogEntry.width;
        const height = catalogEntry.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const bodyMarkupParts: string[] = [];
        if (catalogEntry.assetId.startsWith("cursor_")) {
            bodyMarkupParts.push(`<path d="M 8 6 L 8 ${height - 14} L 22 ${centerY + 4} L ${centerX + 8} ${centerY + 4} Z" fill="${SvgPalette.PARCHMENT}" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="2" />`);
        } else if (catalogEntry.assetId === "logo_cascade") {
            bodyMarkupParts.push(
                `<text x="${centerX}" y="${centerY + 10}" font-family="UnifrakturMaguntia, serif" font-size="26" fill="${SvgPalette.HIGHLIGHT_BRASS}" text-anchor="middle">CASCADE</text>`,
            );
        } else if (catalogEntry.assetId === "logo_developer") {
            bodyMarkupParts.push(
                `<text x="${centerX}" y="${centerY + 6}" font-family="Cinzel, serif" font-size="14" fill="${SvgPalette.BRASS_TAN}" text-anchor="middle">CASCADE</text>`,
            );
        } else if (catalogEntry.assetId.startsWith("watermark_")) {
            bodyMarkupParts.push(
                `<text x="${centerX}" y="${centerY + 6}" font-family="Cinzel, serif" font-size="16" fill="${SvgPalette.FIELD_GRAY}" text-anchor="middle" opacity="0.6">${catalogEntry.assetId.replace("watermark_", "").toUpperCase()}</text>`,
            );
        } else if (catalogEntry.assetId === "splash_screen") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" />`);
            bodyMarkupParts.push(
                `<text x="${centerX}" y="${centerY}" font-family="UnifrakturMaguntia, serif" font-size="22" fill="${SvgPalette.HIGHLIGHT_BRASS}" text-anchor="middle">CASCADE</text>`,
            );
        } else if (catalogEntry.assetId === "loading_bar") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.DARK_OLIVE}" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" />`);
        } else if (catalogEntry.assetId === "loading_spinner") {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX - 8}" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="4" stroke-dasharray="20 12" />`);
        } else if (catalogEntry.assetId === "error_icon" || catalogEntry.assetId === "warning_icon" || catalogEntry.assetId === "info_icon" || catalogEntry.assetId === "success_icon") {
            const statusIconColor = catalogEntry.assetId === "error_icon"
                ? SvgPalette.BRIGHT_BLOOD
                : catalogEntry.assetId === "warning_icon"
                  ? SvgPalette.BRIGHT_BRASS
                  : catalogEntry.assetId === "success_icon"
                    ? "#4A5D3A"
                    : "#2D4A8B";
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX - 6}" fill="${statusIconColor}" stroke="${SvgPalette.NEAR_BLACK_LEATHER}" stroke-width="2" />`);
            const statusIconGlyph = catalogEntry.assetId === "error_icon" ? "!" : catalogEntry.assetId === "warning_icon" ? "!" : catalogEntry.assetId === "success_icon" ? "+" : "i";
            bodyMarkupParts.push(
                `<text x="${centerX}" y="${centerY + 7}" font-family="Special Elite, monospace" font-size="22" fill="${SvgPalette.PARCHMENT}" text-anchor="middle">${statusIconGlyph}</text>`,
            );
        } else if (catalogEntry.assetId.startsWith("chronicle_ornament_")) {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX - 8}" fill="none" stroke="${SvgPalette.BRIGHT_BRASS}" stroke-width="2" />`);
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX - 16}" fill="none" stroke="${SvgPalette.DEEP_BRASS}" stroke-width="1" />`);
            bodyMarkupParts.push(SvgMarkupFactoryCore.buildStarPath(centerX, centerY, centerX - 20, 5));
        } else if (catalogEntry.assetId === "vignette_soft" || catalogEntry.assetId === "vignette_heavy") {
            const vignetteOpacity = catalogEntry.assetId === "vignette_heavy" ? 0.35 : 0.18;
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.NEAR_BLACK_LEATHER}" opacity="${vignetteOpacity}" />`);
        } else if (catalogEntry.assetId === "grain_overlay") {
            bodyMarkupParts.push(...SvgMarkupFactoryCore.buildSeededSpeckles(seedRandom, width, height, 60, SvgPalette.NEAR_BLACK_LEATHER, 0.04, 0.1));
        } else if (catalogEntry.assetId === "sepia_overlay") {
            bodyMarkupParts.push(`<rect width="${width}" height="${height}" fill="${SvgPalette.DEEP_PARCHMENT}" opacity="0.12" />`);
        } else if (catalogEntry.assetId === "settings_icon") {
            bodyMarkupParts.push(`<circle cx="${centerX}" cy="${centerY}" r="${centerX - 14}" fill="none" stroke="${SvgPalette.PARCHMENT}" stroke-width="4" />`);
            for (let toothIndex = 0; toothIndex < 8; toothIndex++) {
                const toothAngle = (Math.PI * 2 * toothIndex) / 8;
                bodyMarkupParts.push(
                    `<rect x="${centerX + Math.cos(toothAngle) * (centerX - 8) - 3}" y="${centerY + Math.sin(toothAngle) * (centerY - 8) - 3}" width="6" height="6" fill="${SvgPalette.PARCHMENT}" />`,
                );
            }
        } else if (catalogEntry.assetId === "save_icon" || catalogEntry.assetId === "load_icon") {
            bodyMarkupParts.push(`<rect x="10" y="8" width="${width - 20}" height="${height - 16}" fill="none" stroke="${SvgPalette.PARCHMENT}" stroke-width="4" />`);
            bodyMarkupParts.push(`<rect x="${centerX - 10}" y="8" width="20" height="14" fill="${SvgPalette.PARCHMENT}" />`);
        } else if (catalogEntry.assetId === "exit_icon" || catalogEntry.assetId === "close_icon") {
            bodyMarkupParts.push(`<path d="M 14 14 L ${width - 14} ${height - 14} M ${width - 14} 14 L 14 ${height - 14}" stroke="${SvgPalette.PARCHMENT}" stroke-width="5" />`);
        } else if (catalogEntry.assetId === "menu_icon") {
            for (let barIndex = 0; barIndex < 3; barIndex++) {
                bodyMarkupParts.push(`<rect x="10" y="${16 + barIndex * 12}" width="${width - 20}" height="6" fill="${SvgPalette.PARCHMENT}" />`);
            }
        } else if (catalogEntry.assetId === "back_icon") {
            bodyMarkupParts.push(`<path d="M ${width - 14} 10 L 14 ${centerY} L ${width - 14} ${height - 10} Z" fill="${SvgPalette.PARCHMENT}" />`);
        } else if (catalogEntry.assetId === "forward_icon") {
            bodyMarkupParts.push(`<path d="M 14 10 L ${width - 14} ${centerY} L 14 ${height - 10} Z" fill="${SvgPalette.PARCHMENT}" />`);
        } else if (catalogEntry.assetId === "minimize_icon") {
            bodyMarkupParts.push(`<rect x="12" y="${centerY}" width="${width - 24}" height="5" fill="${SvgPalette.PARCHMENT}" />`);
        } else if (catalogEntry.assetId === "maximize_icon") {
            bodyMarkupParts.push(`<rect x="12" y="12" width="${width - 24}" height="${height - 24}" fill="none" stroke="${SvgPalette.PARCHMENT}" stroke-width="5" />`);
        } else {
            bodyMarkupParts.push(`<rect x="8" y="8" width="${width - 16}" height="${height - 16}" fill="none" stroke="${SvgPalette.BRASS_TAN}" stroke-width="3" />`);
        }
        return SvgMarkupFactoryCore.wrapSvg(catalogEntry, bodyMarkupParts.join(""));
    }
}
