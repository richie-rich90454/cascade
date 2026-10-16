export interface WorldCoordinate {
    readonly longitude: number;
    readonly latitude: number;
}

/** Location anchors for the scenario's named map regions; the SVG supplies the geographic boundaries. */
export const WORLD_PROVINCE_GEOGRAPHY: Readonly<Record<string, WorldCoordinate>> = {
    prov_london: { longitude: -0.1276, latitude: 51.5072 },
    prov_liverpool: { longitude: -2.978, latitude: 53.4084 },
    prov_paris: { longitude: 2.3522, latitude: 48.8566 },
    prov_algiers: { longitude: 3.0588, latitude: 36.7538 },
    prov_brussels: { longitude: 4.3517, latitude: 50.8503 },
    prov_berlin: { longitude: 13.405, latitude: 52.52 },
    prov_rhineland: { longitude: 7.5, latitude: 50.8 },
    prov_vienna: { longitude: 16.3738, latitude: 48.2082 },
    prov_budapest: { longitude: 19.0402, latitude: 47.4979 },
    prov_belgrade: { longitude: 20.4489, latitude: 44.7866 },
    prov_rome: { longitude: 12.4964, latitude: 41.9028 },
    prov_athens: { longitude: 23.7275, latitude: 37.9838 },
    prov_madrid: { longitude: -3.7038, latitude: 40.4168 },
    prov_moscow: { longitude: 37.6173, latitude: 55.7558 },
    prov_kyiv: { longitude: 30.5234, latitude: 50.4501 },
    prov_warsaw: { longitude: 21.0122, latitude: 52.2297 },
    prov_vladivostok: { longitude: 131.8855, latitude: 43.1155 },
    prov_istanbul: { longitude: 28.9784, latitude: 41.0082 },
    prov_ankara: { longitude: 32.8597, latitude: 39.9334 },
    prov_damascus: { longitude: 36.2765, latitude: 33.5138 },
    prov_baghdad: { longitude: 44.3661, latitude: 33.3152 },
    prov_mecca: { longitude: 39.8579, latitude: 21.3891 },
    prov_cairo: { longitude: 31.2357, latitude: 30.0444 },
    prov_new_york: { longitude: -74.006, latitude: 40.7128 },
    prov_washington: { longitude: -77.0369, latitude: 38.9072 },
    prov_chicago: { longitude: -87.6298, latitude: 41.8781 },
    prov_san_francisco: { longitude: -122.4194, latitude: 37.7749 },
    prov_havana: { longitude: -82.3666, latitude: 23.1136 },
    prov_mexico_city: { longitude: -99.1332, latitude: 19.4326 },
    prov_veracruz: { longitude: -96.1342, latitude: 19.1738 },
    prov_rio_de_janeiro: { longitude: -43.1729, latitude: -22.9068 },
    prov_sao_paulo: { longitude: -46.6333, latitude: -23.5505 },
    prov_tokyo: { longitude: 139.6917, latitude: 35.6895 },
    prov_seoul: { longitude: 126.978, latitude: 37.5665 },
    prov_beijing: { longitude: 116.4074, latitude: 39.9042 },
    prov_shanghai: { longitude: 121.4737, latitude: 31.2304 },
    prov_hong_kong: { longitude: 114.1694, latitude: 22.3193 },
    prov_manila: { longitude: 120.9842, latitude: 14.5995 },
    prov_delhi: { longitude: 77.209, latitude: 28.6139 },
    prov_calcutta: { longitude: 88.3639, latitude: 22.5726 },
    prov_bombay: { longitude: 72.8777, latitude: 19.076 },
    prov_singapore: { longitude: 103.8198, latitude: 1.3521 },
    prov_sydney: { longitude: 151.2093, latitude: -33.8688 },
    prov_cape_town: { longitude: 18.4241, latitude: -33.9249 },
    prov_nairobi: { longitude: 36.8219, latitude: -1.2921 },
    prov_lagos: { longitude: 3.3792, latitude: 6.5244 },
    prov_dakar: { longitude: -17.4677, latitude: 14.7167 },
    prov_west_africa_interior: { longitude: -8.0029, latitude: 12.6392 },
    prov_sofia: { longitude: 23.3219, latitude: 42.6977 },
};

export function getWorldProvinceCoordinate(provinceIdentifier: string): WorldCoordinate | null {
    return WORLD_PROVINCE_GEOGRAPHY[provinceIdentifier] ?? null;
}
