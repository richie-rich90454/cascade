import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface GeoJsonFeature {
    properties: { NAME?: string; SUBJECTO?: string; BORDERPRECISION?: number };
    geometry: {
        type: "Polygon" | "MultiPolygon";
        coordinates: number[][][] | number[][][][];
    };
}

interface GeoJsonFeatureCollection {
    features: GeoJsonFeature[];
}

const REPOSITORY_ROOT = process.cwd();
const MAP_SOURCE_DIRECTORY = join(REPOSITORY_ROOT, "public", "assets", "maps");
const OUTPUT_DIRECTORY = join(REPOSITORY_ROOT, "public", "assets", "svg");
const MAP_YEARS = [1900, 1914, 1920, 1930, 1938, 1945, 1960, 1994, 2000, 2010];
const MAP_WIDTH = 1800;
const MAP_HEIGHT = 900;
const TERRITORY_PALETTE = [
    "#9e7658",
    "#7d9272",
    "#9d9a78",
    "#7a8794",
    "#a97c70",
    "#6f8d87",
    "#a18e63",
    "#80729a",
    "#8097a2",
    "#8e9972",
    "#a17883",
    "#85806b",
    "#6e8877",
];

function projectCoordinate(longitude: number, latitude: number): [number, number] {
    return [((longitude + 180) / 360) * MAP_WIDTH, ((90 - latitude) / 180) * MAP_HEIGHT];
}

function getSubjectColor(subjectName: string): string {
    let hashValue = 2166136261;
    for (let characterIndex = 0; characterIndex < subjectName.length; characterIndex += 1) {
        hashValue ^= subjectName.charCodeAt(characterIndex);
        hashValue = Math.imul(hashValue, 16777619);
    }
    return TERRITORY_PALETTE[(hashValue >>> 0) % TERRITORY_PALETTE.length];
}

function projectRingPath(ring: number[][]): string {
    return (
        ring
            .map((coordinate, coordinateIndex) => {
                const [x, y] = projectCoordinate(coordinate[0], coordinate[1]);
                return `${coordinateIndex === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(" ") + " Z"
    );
}

function getPolygonPath(rings: number[][][]): string {
    return rings.map(projectRingPath).join(" ");
}

function getFeaturePath(feature: GeoJsonFeature): string {
    const polygons =
        feature.geometry.type === "Polygon"
            ? [feature.geometry.coordinates as number[][][]]
            : (feature.geometry.coordinates as number[][][][]);
    return polygons.map(getPolygonPath).join(" ");
}

function escapeXml(text: string): string {
    return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
}

function renderWorldMapSvg(year: number, source: GeoJsonFeatureCollection): string {
    const graticuleLines: string[] = [];
    for (let longitude = -150; longitude <= 180; longitude += 30) {
        const [x] = projectCoordinate(longitude, 0);
        graticuleLines.push(`<path d="M${x.toFixed(2)},0 V${MAP_HEIGHT}"/>`);
    }
    for (let latitude = -60; latitude <= 60; latitude += 30) {
        const [, y] = projectCoordinate(0, latitude);
        graticuleLines.push(`<path d="M0,${y.toFixed(2)} H${MAP_WIDTH}"/>`);
    }

    const featurePaths = source.features
        .filter(
            (feature) =>
                feature.geometry !== null &&
                (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon"),
        )
        .map((feature, featureIndex) => {
            const territoryName = feature.properties.NAME ?? `Territory ${featureIndex + 1}`;
            const subjectName = feature.properties.SUBJECTO ?? territoryName;
            const borderPrecision = feature.properties.BORDERPRECISION ?? 2;
            const safeIdentifier = territoryName
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            return `<path id="territory-${safeIdentifier}-${featureIndex}" data-name="${escapeXml(territoryName)}" data-subject="${escapeXml(subjectName)}" data-border-precision="${borderPrecision}" d="${getFeaturePath(feature)}" fill="${getSubjectColor(subjectName)}" fill-rule="evenodd"/>`;
        })
        .join("\n");

    return (
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_WIDTH}" height="${MAP_HEIGHT}" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" role="img" aria-labelledby="map-title map-description">\n` +
        `<title id="map-title">World political boundaries, ${year}</title>\n` +
        `<desc id="map-description">A historical atlas map generated from the historical-basemaps GeoJSON dataset. Territorial authority is indicated by muted color; boundary precision varies by region.</desc>\n` +
        `<rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="#294047"/>\n` +
        `<g fill="none" stroke="#aeb8ac" stroke-opacity=".16" stroke-width="1">${graticuleLines.join("")}</g>\n` +
        `<g stroke="#e5d5b5" stroke-width="1.15" stroke-linejoin="round" stroke-linecap="round">${featurePaths}</g>\n` +
        `</svg>`
    );
}

for (const year of MAP_YEARS) {
    const sourcePath = join(MAP_SOURCE_DIRECTORY, `world_${year}.geojson`);
    if (!existsSync(sourcePath)) {
        throw new Error(`Missing historical map source: ${sourcePath}`);
    }
    const sourceData = JSON.parse(readFileSync(sourcePath, "utf8")) as GeoJsonFeatureCollection;
    const outputPath = join(OUTPUT_DIRECTORY, `world_map_${year}.svg`);
    writeFileSync(outputPath, renderWorldMapSvg(year, sourceData), "utf8");
    console.log(`Generated ${outputPath} from ${sourceData.features.length} territorial features.`);
}
