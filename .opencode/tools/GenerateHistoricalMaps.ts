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
    "#a17d54",
    "#748fa3",
    "#9b806f",
    "#7e9a78",
    "#9b7591",
    "#75968f",
    "#b18a63",
    "#797fa0",
    "#a17270",
    "#89986a",
    "#917fa2",
    "#6f8794",
    "#ab906e",
    "#718f71",
    "#9b7187",
    "#7f998d",
    "#a27c5e",
    "#788ba8",
    "#a1837d",
    "#82966f",
];

function projectCoordinate(longitude: number, latitude: number): [number, number] {
    return [((longitude + 180) / 360) * MAP_WIDTH, ((90 - latitude) / 180) * MAP_HEIGHT];
}

function getSubjectName(feature: GeoJsonFeature, year: number): string {
    const territoryName = feature.properties.NAME ?? "Unknown territory";
    const sourceSubjectName = feature.properties.SUBJECTO ?? territoryName;
    if (year >= 1960 && territoryName === "Tibet") {
        return "China";
    }
    if (year >= 1945 && territoryName === "Taiwan") {
        return "China";
    }
    return canonicalizeSubjectName(sourceSubjectName);
}

function canonicalizeSubjectName(subjectName: string): string {
    if (/japan/i.test(subjectName)) {
        return "Japan";
    }
    if (/korea/i.test(subjectName)) {
        return "Korea";
    }
    if (/kazakhstan/i.test(subjectName)) {
        return "Kazakhstan";
    }
    if (/russia|soviet|ussr/i.test(subjectName)) {
        return "Russia";
    }
    return subjectName;
}

function getPolygonRings(feature: GeoJsonFeature): number[][][] {
    return feature.geometry.type === "Polygon"
        ? (feature.geometry.coordinates as number[][][])
        : (feature.geometry.coordinates as number[][][][]).flat();
}

function getRgbDistance(firstColor: string, secondColor: string): number {
    const firstChannelValues = firstColor.match(/[a-f\d]{2}/gi)?.map((channel) => Number.parseInt(channel, 16)) ?? [];
    const secondChannelValues = secondColor.match(/[a-f\d]{2}/gi)?.map((channel) => Number.parseInt(channel, 16)) ?? [];
    return Math.sqrt(
        firstChannelValues.reduce(
            (sum, firstChannel, channelIndex) => sum + (firstChannel - (secondChannelValues[channelIndex] ?? 0)) ** 2,
            0,
        ),
    );
}

function buildSubjectColorMap(sourceByYear: Map<number, GeoJsonFeatureCollection>): Map<string, string> {
    const neighborsBySubject = new Map<string, Set<string>>();
    const subjectByVertex = new Map<string, Set<string>>();
    const addSubject = (subjectName: string): void => {
        if (!neighborsBySubject.has(subjectName)) {
            neighborsBySubject.set(subjectName, new Set<string>());
        }
    };

    for (const [year, source] of sourceByYear) {
        for (const feature of source.features) {
            if (feature.geometry === null) {
                continue;
            }
            const subjectName = getSubjectName(feature, year);
            addSubject(subjectName);
            const vertexKeys = new Set<string>();
            for (const ring of getPolygonRings(feature)) {
                for (const coordinate of ring) {
                    vertexKeys.add(`${coordinate[0].toFixed(4)},${coordinate[1].toFixed(4)}`);
                }
            }
            for (const vertexKey of vertexKeys) {
                const subjectOwners = subjectByVertex.get(vertexKey) ?? new Set<string>();
                subjectOwners.add(subjectName);
                subjectByVertex.set(vertexKey, subjectOwners);
            }
        }
    }

    for (const subjectOwners of subjectByVertex.values()) {
        const ownerList = [...subjectOwners];
        for (let ownerIndex = 0; ownerIndex < ownerList.length; ownerIndex += 1) {
            for (let otherIndex = ownerIndex + 1; otherIndex < ownerList.length; otherIndex += 1) {
                const firstSubject = ownerList[ownerIndex];
                const secondSubject = ownerList[otherIndex];
                neighborsBySubject.get(firstSubject)?.add(secondSubject);
                neighborsBySubject.get(secondSubject)?.add(firstSubject);
            }
        }
    }

    // Keep prominent historical neighbors visually separate even where island geography
    // means the source boundaries share no vertices.
    for (const [firstName, secondName] of [
        ["Japan", "Korea"],
        ["Russia", "Kazakhstan"],
        ["China", "Japan"],
    ]) {
        addSubject(firstName);
        addSubject(secondName);
        neighborsBySubject.get(firstName)?.add(secondName);
        neighborsBySubject.get(secondName)?.add(firstName);
    }

    const colorBySubject = new Map<string, string>();
    while (colorBySubject.size < neighborsBySubject.size) {
        const uncoloredSubjects = [...neighborsBySubject.keys()].filter((name) => !colorBySubject.has(name));
        uncoloredSubjects.sort((firstName, secondName) => {
            const getSaturation = (name: string): number =>
                new Set(
                    [...(neighborsBySubject.get(name) ?? [])]
                        .map((neighborName) => colorBySubject.get(neighborName))
                        .filter((color): color is string => color !== undefined),
                ).size;
            return (
                getSaturation(secondName) -
                    getSaturation(firstName) +
                    (neighborsBySubject.get(secondName)?.size ?? 0) -
                    (neighborsBySubject.get(firstName)?.size ?? 0) || firstName.localeCompare(secondName)
            );
        });
        const subjectName = uncoloredSubjects[0];
        const assignedNeighborColors = new Set(
            [...(neighborsBySubject.get(subjectName) ?? [])]
                .map((neighborName) => colorBySubject.get(neighborName))
                .filter((color): color is string => color !== undefined),
        );
        const availableColors = TERRITORY_PALETTE.filter((color) => !assignedNeighborColors.has(color));
        const nextColor = availableColors.sort((firstColor, secondColor) => {
            const getMinimumDistanceToNeighbors = (color: string): number =>
                assignedNeighborColors.size === 0
                    ? Number.POSITIVE_INFINITY
                    : Math.min(
                          ...[...assignedNeighborColors].map((neighborColor) => getRgbDistance(color, neighborColor)),
                      );
            return getMinimumDistanceToNeighbors(secondColor) - getMinimumDistanceToNeighbors(firstColor);
        })[0];
        if (nextColor === undefined) {
            throw new Error(`The territory palette has no distinct color left for ${subjectName}.`);
        }
        colorBySubject.set(subjectName, nextColor);
    }
    for (const [subjectName, neighboringSubjects] of neighborsBySubject) {
        for (const neighboringSubjectName of neighboringSubjects) {
            if (colorBySubject.get(subjectName) === colorBySubject.get(neighboringSubjectName)) {
                throw new Error(`Adjacent map subjects share a color: ${subjectName} and ${neighboringSubjectName}.`);
            }
        }
    }
    return colorBySubject;
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

function renderWorldMapSvg(
    year: number,
    source: GeoJsonFeatureCollection,
    colorBySubject: Map<string, string>,
): string {
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
            // Historical Basemaps keeps Tibet as a separate region in the 1960 snapshot.
            // Color it with China to show PRC administration by then while preserving the
            // regional geometry and original source attribution.
            const subjectName = getSubjectName(feature, year);
            const borderPrecision = feature.properties.BORDERPRECISION ?? 2;
            const safeIdentifier = territoryName
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            const territoryContextTitle =
                year >= 1960 && territoryName === "Tibet"
                    ? "Tibet region shown within PRC administration by 1960; accounts of the 1951 agreement differ. This retained regional outline is not an international border."
                    : year >= 1945 && territoryName === "Taiwan"
                      ? "Shown in the China color group from 1945. The Republic of China has governed Taiwan since 1945; the PRC claims Taiwan. This color does not indicate PRC administration."
                      : `Historical region: ${territoryName}. Boundary precision varies by region.`;
            return `<path id="territory-${safeIdentifier}-${featureIndex}" data-name="${escapeXml(territoryName)}" data-subject="${escapeXml(subjectName)}" data-border-precision="${borderPrecision}" d="${getFeaturePath(feature)}" fill="${colorBySubject.get(subjectName)}" fill-rule="evenodd"><title>${escapeXml(territoryContextTitle)}</title></path>`;
        })
        .join("\n");

    const [disputedMarkerX, disputedMarkerY] = projectCoordinate(94.4, 28.2);
    const disputedAreaOverlay =
        `<defs><pattern id="disputed-area-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
        `<rect width="9" height="9" fill="#111820" fill-opacity=".98"/>` +
        `<path d="M0 0 V9" stroke="#f2e8d5" stroke-width="3"/></pattern></defs>\n` +
        `<ellipse cx="${disputedMarkerX.toFixed(2)}" cy="${disputedMarkerY.toFixed(2)}" rx="25" ry="12" fill="url(#disputed-area-hatch)" stroke="#f2e8d5" stroke-width="2.5" stroke-dasharray="7 5">` +
        `<title>Modern disputed area reference: approximate location of Arunachal Pradesh, administered by India and claimed by China. This overlay appears on all period maps for geographic reference; it is not a historical boundary.</title></ellipse>`;
    return (
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_WIDTH}" height="${MAP_HEIGHT}" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" role="img" aria-labelledby="map-title map-description">\n` +
        `<title id="map-title">World political boundaries, ${year}</title>\n` +
        `<desc id="map-description">A historical atlas map generated from the historical-basemaps GeoJSON dataset. Muted color groups show historical political entities; boundary precision varies by region. A hatched oval marks the modern disputed area of Arunachal Pradesh, approximately administered by India and claimed by China; this modern reference overlay appears on every period map and is not a historical boundary.${year >= 1945 ? " Taiwan uses the China color group from 1945 for claim context. The Republic of China has governed Taiwan since 1945; the People's Republic of China claims Taiwan. The color does not indicate PRC administration." : " Taiwan is shown under Japanese rule in this snapshot."}${year >= 1960 ? " Tibet is shown within PRC administration by 1960; historical accounts of the 1951 agreement differ." : ""}</desc>\n` +
        `<rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="#294047"/>\n` +
        `<g fill="none" stroke="#aeb8ac" stroke-opacity=".16" stroke-width="1">${graticuleLines.join("")}</g>\n` +
        `<g stroke="#e5d5b5" stroke-width="1.15" stroke-linejoin="round" stroke-linecap="round">${featurePaths}</g>\n` +
        `${disputedAreaOverlay}\n` +
        `</svg>`
    );
}

const sourceByYear = new Map<number, GeoJsonFeatureCollection>();
for (const year of MAP_YEARS) {
    const sourcePath = join(MAP_SOURCE_DIRECTORY, `world_${year}.geojson`);
    if (!existsSync(sourcePath)) {
        throw new Error(`Missing historical map source: ${sourcePath}`);
    }
    const sourceData = JSON.parse(readFileSync(sourcePath, "utf8")) as GeoJsonFeatureCollection;
    sourceByYear.set(year, sourceData);
}
const subjectColorMap = buildSubjectColorMap(sourceByYear);

for (const year of MAP_YEARS) {
    const sourceData = sourceByYear.get(year);
    if (sourceData === undefined) {
        throw new Error(`Missing loaded historical map source for ${year}.`);
    }
    const outputPath = join(OUTPUT_DIRECTORY, `world_map_${year}.svg`);
    writeFileSync(outputPath, renderWorldMapSvg(year, sourceData, subjectColorMap), "utf8");
    console.log(`Generated ${outputPath} from ${sourceData.features.length} territorial features.`);
}
