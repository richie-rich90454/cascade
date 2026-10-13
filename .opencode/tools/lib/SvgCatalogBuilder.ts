import { CatalogAssetEntry } from "./CatalogAssetEntry";

export class SvgCatalogBuilder {
    public static readonly TERRAIN_TYPES: string[] = [
        "plains",
        "forest",
        "mountains",
        "desert",
        "ocean",
        "coastal",
        "urban",
        "industrial",
        "tundra",
        "swamp",
    ];
    public static readonly FACTION_KEYS: string[] = [
        "germany",
        "austria_hungary",
        "ottoman",
        "russia",
        "ussr",
        "france",
        "britain",
        "italy",
        "japan",
        "usa",
        "china",
    ];
    public static readonly UNIT_TYPE_KEYS: string[] = [
        "infantry",
        "armor",
        "artillery",
        "cavalry",
        "air",
        "naval",
        "submarine",
        "carrier",
        "garrison",
        "engineer",
        "medic",
        "hq",
        "militia",
        "mechanized",
        "paratrooper",
        "marine",
    ];
    public static readonly RESOURCE_ICON_KEYS: string[] = [
        "food",
        "fuel",
        "steel",
        "rubber",
        "manpower",
        "treasury",
        "legitimacy",
        "influence",
        "production",
        "research",
        "morale",
        "stability",
        "supply",
        "intelligence",
        "ideology",
        "technology",
        "industry",
        "agriculture",
        "infrastructure",
        "population",
    ];
    public static readonly TECH_ICON_KEYS: string[] = [
        "machine_gun",
        "artillery",
        "tank",
        "airplane",
        "submarine",
        "dreadnought",
        "aircraft_carrier",
        "atomic_bomb",
        "radar",
        "sonar",
        "radio",
        "encryption",
        "railroad",
        "telegraph",
        "telephone",
        "automobile",
        "aviation",
        "chemical",
        "medical",
        "motorized",
        "mechanized",
        "jet",
        "rocket",
        "nuclear",
    ];
    public static readonly IDEA_ICON_KEYS: string[] = [
        "fascism",
        "communism",
        "democracy",
        "monarchy",
        "nationalism",
        "imperialism",
        "militarism",
        "pacifism",
        "isolationism",
        "internationalism",
        "capitalism",
        "socialism",
        "liberalism",
        "conservatism",
        "revolution",
        "reform",
        "propaganda",
        "censorship",
        "total_war",
        "blitzkrieg",
        "trench_warfare",
        "guerrilla",
        "naval_supremacy",
        "air_supremacy",
    ];
    public static readonly EVENT_ILLUSTRATION_KEYS: string[] = [
        "event_assassination_sarajevo",
        "event_schlieffen_plan",
        "event_trench_warfare",
        "event_tank_first_use",
        "event_poison_gas",
        "event_lusitania",
        "event_zimmermann_telegram",
        "event_russian_revolution",
        "event_treaty_versailles",
        "event_league_of_nations",
        "event_great_depression",
        "event_new_deal",
        "event_five_year_plan",
        "event_march_on_rome",
        "event_reichstag_fire",
        "event_munich_conference",
        "event_molotov_ribbentrop",
        "event_invasion_poland",
        "event_dunkirk",
        "event_battle_britain",
        "event_operation_barbarossa",
        "event_pearl_harbor",
        "event_stalingrad",
        "event_d_day",
        "event_hiroshima",
        "event_holocaust",
        "event_armenian_genocide",
        "event_cambodian_genocide",
        "event_rwandan_genocide",
        "event_holodomor",
        "event_united_nations",
    ];
    public static readonly MISC_ICON_KEYS: string[] = [
        "cursor_default",
        "cursor_pointer",
        "cursor_attack",
        "cursor_move",
        "cursor_build",
        "cursor_diplomacy",
        "logo_cascade",
        "logo_developer",
        "watermark_ap",
        "watermark_college_board",
        "splash_screen",
        "loading_bar",
        "loading_spinner",
        "error_icon",
        "warning_icon",
        "info_icon",
        "success_icon",
        "save_icon",
        "load_icon",
        "settings_icon",
        "exit_icon",
        "back_icon",
        "forward_icon",
        "menu_icon",
        "close_icon",
        "minimize_icon",
        "maximize_icon",
        "chronicle_ornament_01",
        "chronicle_ornament_02",
        "chronicle_ornament_03",
        "chronicle_ornament_04",
        "chronicle_ornament_05",
        "chronicle_ornament_06",
        "chronicle_ornament_07",
        "chronicle_ornament_08",
        "chronicle_ornament_09",
        "chronicle_ornament_10",
        "vignette_soft",
        "vignette_heavy",
        "grain_overlay",
        "sepia_overlay",
    ];

    public static buildCatalog(): CatalogAssetEntry[] {
        const catalogEntries: CatalogAssetEntry[] = [];
        SvgCatalogBuilder.appendTileEntries(catalogEntries);
        SvgCatalogBuilder.appendMarkerEntries(catalogEntries);
        SvgCatalogBuilder.appendCounterEntries(catalogEntries);
        SvgCatalogBuilder.appendInsigniaEntries(catalogEntries);
        SvgCatalogBuilder.appendIconEntries(catalogEntries);
        SvgCatalogBuilder.appendUiEntries(catalogEntries);
        SvgCatalogBuilder.appendOrnamentEntries(catalogEntries);
        SvgCatalogBuilder.appendPatternEntries(catalogEntries);
        SvgCatalogBuilder.appendScenarioEntries(catalogEntries);
        SvgCatalogBuilder.appendTimelineEntries(catalogEntries);
        SvgCatalogBuilder.appendEventEntries(catalogEntries);
        SvgCatalogBuilder.appendPortraitEntries(catalogEntries);
        SvgCatalogBuilder.appendOverlayEntries(catalogEntries);
        SvgCatalogBuilder.appendLedgerEntries(catalogEntries);
        SvgCatalogBuilder.appendFocusEntries(catalogEntries);
        SvgCatalogBuilder.appendStatusEntries(catalogEntries);
        SvgCatalogBuilder.appendNewspaperEntries(catalogEntries);
        SvgCatalogBuilder.appendMiscEntries(catalogEntries);
        return catalogEntries;
    }

    private static appendTileEntries(catalogEntries: CatalogAssetEntry[]): void {
        for (const terrainType of SvgCatalogBuilder.TERRAIN_TYPES) {
            for (let variantIndex = 1; variantIndex <= 12; variantIndex++) {
                const variantSuffix = variantIndex < 10 ? `0${variantIndex}` : `${variantIndex}`;
                catalogEntries.push(
                    new CatalogAssetEntry(
                        `tile_${terrainType}_${variantSuffix}`,
                        "tile",
                        64,
                        64,
                        `tile_${terrainType}_${variantSuffix}`,
                    ),
                );
                catalogEntries.push(
                    new CatalogAssetEntry(
                        `tile_${terrainType}_detail_${variantSuffix}`,
                        "tile",
                        128,
                        128,
                        `tile_detail_${terrainType}_${variantSuffix}`,
                    ),
                );
            }
        }
        for (const riverOrientation of ["horizontal", "vertical", "corner"]) {
            catalogEntries.push(
                new CatalogAssetEntry(`tile_river_${riverOrientation}`, "tile", 64, 64, `river_${riverOrientation}`),
            );
        }
        for (const railroadOrientation of ["horizontal", "vertical", "corner"]) {
            catalogEntries.push(
                new CatalogAssetEntry(
                    `tile_railroad_${railroadOrientation}`,
                    "tile",
                    64,
                    64,
                    `railroad_${railroadOrientation}`,
                ),
            );
        }
        catalogEntries.push(new CatalogAssetEntry("tile_border_brass", "tile", 64, 64, "border_brass"));
        catalogEntries.push(new CatalogAssetEntry("tile_border_dashed", "tile", 64, 64, "border_dashed"));
        catalogEntries.push(new CatalogAssetEntry("tile_coastline_glow", "tile", 64, 64, "coastline_glow"));
    }

    private static appendMarkerEntries(catalogEntries: CatalogAssetEntry[]): void {
        const markerIds: Array<{ assetId: string; width: number; height: number }> = [
            { assetId: "marker_capital", width: 48, height: 48 },
            { assetId: "marker_city_major", width: 32, height: 32 },
            { assetId: "marker_city_minor", width: 16, height: 16 },
            { assetId: "marker_port", width: 32, height: 32 },
            { assetId: "marker_airbase", width: 32, height: 32 },
            { assetId: "marker_fortress", width: 32, height: 32 },
            { assetId: "marker_resource_coal", width: 24, height: 24 },
            { assetId: "marker_resource_oil", width: 24, height: 24 },
            { assetId: "marker_resource_steel", width: 24, height: 24 },
            { assetId: "marker_resource_food", width: 24, height: 24 },
            { assetId: "marker_resource_rubber", width: 24, height: 24 },
            { assetId: "marker_resource_manpower", width: 24, height: 24 },
            { assetId: "marker_battle", width: 32, height: 32 },
            { assetId: "marker_battle_major", width: 48, height: 48 },
            { assetId: "marker_treaty", width: 32, height: 32 },
            { assetId: "marker_atrocity", width: 32, height: 32 },
            { assetId: "marker_victory_point", width: 24, height: 24 },
        ];
        for (const markerDefinition of markerIds) {
            catalogEntries.push(
                new CatalogAssetEntry(
                    markerDefinition.assetId,
                    "marker",
                    markerDefinition.width,
                    markerDefinition.height,
                    markerDefinition.assetId,
                ),
            );
        }
    }

    private static appendCounterEntries(catalogEntries: CatalogAssetEntry[]): void {
        for (const unitType of SvgCatalogBuilder.UNIT_TYPE_KEYS) {
            for (const factionKey of SvgCatalogBuilder.FACTION_KEYS) {
                catalogEntries.push(
                    new CatalogAssetEntry(
                        `counter_${unitType}_${factionKey}`,
                        "counter",
                        56,
                        32,
                        `counter_${unitType}_${factionKey}`,
                    ),
                );
                catalogEntries.push(
                    new CatalogAssetEntry(
                        `counter_${unitType}_${factionKey}_small`,
                        "counter",
                        40,
                        24,
                        `counter_small_${unitType}_${factionKey}`,
                    ),
                );
                catalogEntries.push(
                    new CatalogAssetEntry(
                        `counter_${unitType}_${factionKey}_large`,
                        "counter",
                        72,
                        44,
                        `counter_large_${unitType}_${factionKey}`,
                    ),
                );
            }
        }
    }

    private static appendInsigniaEntries(catalogEntries: CatalogAssetEntry[]): void {
        const insigniaFactionKeys = [...SvgCatalogBuilder.FACTION_KEYS, "india"];
        for (const insigniaFactionKey of insigniaFactionKeys) {
            catalogEntries.push(
                new CatalogAssetEntry(
                    `faction_${insigniaFactionKey}`,
                    "insignia",
                    64,
                    64,
                    `faction_${insigniaFactionKey}`,
                ),
            );
        }
    }

    private static appendIconEntries(catalogEntries: CatalogAssetEntry[]): void {
        for (const resourceIconKey of SvgCatalogBuilder.RESOURCE_ICON_KEYS) {
            catalogEntries.push(
                new CatalogAssetEntry(
                    `icon_resource_${resourceIconKey}`,
                    "icon",
                    32,
                    32,
                    `resource_${resourceIconKey}`,
                ),
            );
            for (let alternativeIndex = 1; alternativeIndex <= 3; alternativeIndex++) {
                catalogEntries.push(
                    new CatalogAssetEntry(
                        `icon_resource_${resourceIconKey}_alt_0${alternativeIndex}`,
                        "icon",
                        32,
                        32,
                        `resource_alt_${resourceIconKey}_${alternativeIndex}`,
                    ),
                );
            }
        }
        for (const techIconKey of SvgCatalogBuilder.TECH_ICON_KEYS) {
            catalogEntries.push(new CatalogAssetEntry(`tech_${techIconKey}`, "icon", 40, 40, `tech_${techIconKey}`));
            for (let alternativeIndex = 1; alternativeIndex <= 2; alternativeIndex++) {
                catalogEntries.push(
                    new CatalogAssetEntry(
                        `tech_${techIconKey}_alt_0${alternativeIndex}`,
                        "icon",
                        40,
                        40,
                        `tech_alt_${techIconKey}_${alternativeIndex}`,
                    ),
                );
            }
        }
        for (const ideaIconKey of SvgCatalogBuilder.IDEA_ICON_KEYS) {
            catalogEntries.push(new CatalogAssetEntry(`idea_${ideaIconKey}`, "icon", 40, 40, `idea_${ideaIconKey}`));
            for (let alternativeIndex = 1; alternativeIndex <= 2; alternativeIndex++) {
                catalogEntries.push(
                    new CatalogAssetEntry(
                        `idea_${ideaIconKey}_alt_0${alternativeIndex}`,
                        "icon",
                        40,
                        40,
                        `idea_alt_${ideaIconKey}_${alternativeIndex}`,
                    ),
                );
            }
        }
    }

    private static appendUiEntries(catalogEntries: CatalogAssetEntry[]): void {
        const uiElementDefinitions: Array<{ assetId: string; width: number; height: number }> = [
            { assetId: "ui_panel_parchment_large", width: 400, height: 300 },
            { assetId: "ui_panel_parchment_medium", width: 300, height: 200 },
            { assetId: "ui_panel_parchment_small", width: 200, height: 150 },
            { assetId: "ui_panel_brass_frame", width: 300, height: 200 },
            { assetId: "ui_panel_dark_leather", width: 300, height: 200 },
            { assetId: "ui_panel_newspaper", width: 300, height: 200 },
            { assetId: "ui_panel_telegram", width: 300, height: 200 },
            { assetId: "ui_panel_ledger", width: 300, height: 200 },
            { assetId: "ui_button_primary", width: 160, height: 40 },
            { assetId: "ui_button_primary_hover", width: 160, height: 40 },
            { assetId: "ui_button_primary_pressed", width: 160, height: 40 },
            { assetId: "ui_button_primary_disabled", width: 160, height: 40 },
            { assetId: "ui_button_secondary", width: 160, height: 40 },
            { assetId: "ui_button_danger", width: 160, height: 40 },
            { assetId: "ui_button_icon", width: 40, height: 40 },
            { assetId: "ui_border_ornate", width: 200, height: 200 },
            { assetId: "ui_border_simple", width: 200, height: 200 },
            { assetId: "ui_border_double", width: 200, height: 200 },
            { assetId: "ui_border_corner", width: 32, height: 32 },
            { assetId: "ui_divider_horizontal", width: 200, height: 8 },
            { assetId: "ui_divider_vertical", width: 8, height: 200 },
            { assetId: "ui_divider_ornate", width: 200, height: 16 },
            { assetId: "ui_progress_bar_bg", width: 200, height: 16 },
            { assetId: "ui_progress_bar_fill", width: 200, height: 16 },
            { assetId: "ui_progress_bar_brass", width: 200, height: 16 },
            { assetId: "ui_progress_bar_blood", width: 200, height: 16 },
            { assetId: "ui_checkbox_checked", width: 24, height: 24 },
            { assetId: "ui_checkbox_unchecked", width: 24, height: 24 },
            { assetId: "ui_radio_selected", width: 24, height: 24 },
            { assetId: "ui_radio_unselected", width: 24, height: 24 },
            { assetId: "ui_dropdown_closed", width: 160, height: 32 },
            { assetId: "ui_dropdown_open", width: 160, height: 32 },
            { assetId: "ui_dropdown_item", width: 160, height: 28 },
            { assetId: "ui_tab_active", width: 120, height: 32 },
            { assetId: "ui_tab_inactive", width: 120, height: 32 },
            { assetId: "ui_tooltip_bg", width: 260, height: 120 },
            { assetId: "ui_tooltip_arrow", width: 16, height: 12 },
            { assetId: "ui_modal_overlay", width: 200, height: 200 },
            { assetId: "ui_scrollbar_track", width: 12, height: 200 },
            { assetId: "ui_scrollbar_thumb", width: 12, height: 60 },
            { assetId: "ui_slider_track", width: 200, height: 8 },
            { assetId: "ui_slider_thumb", width: 20, height: 20 },
            { assetId: "ui_badge_gov", width: 56, height: 24 },
            { assetId: "ui_badge_tec", width: 56, height: 24 },
            { assetId: "ui_badge_ecn", width: 56, height: 24 },
            { assetId: "ui_badge_sio", width: 56, height: 24 },
            { assetId: "ui_badge_causation", width: 88, height: 24 },
            { assetId: "ui_badge_comparison", width: 88, height: 24 },
            { assetId: "ui_badge_continuity", width: 88, height: 24 },
            { assetId: "ui_badge_context", width: 88, height: 24 },
            { assetId: "ui_badge_skill_1b", width: 80, height: 24 },
            { assetId: "ui_badge_skill_2c", width: 80, height: 24 },
            { assetId: "ui_badge_skill_3b", width: 80, height: 24 },
            { assetId: "ui_badge_skill_3d", width: 80, height: 24 },
            { assetId: "ui_badge_skill_4b", width: 80, height: 24 },
            { assetId: "ui_badge_skill_5b", width: 80, height: 24 },
            { assetId: "ui_badge_skill_6d", width: 80, height: 24 },
        ];
        for (const uiElementDefinition of uiElementDefinitions) {
            catalogEntries.push(
                new CatalogAssetEntry(
                    uiElementDefinition.assetId,
                    "ui",
                    uiElementDefinition.width,
                    uiElementDefinition.height,
                    uiElementDefinition.assetId,
                ),
            );
        }
    }

    private static appendOrnamentEntries(catalogEntries: CatalogAssetEntry[]): void {
        const ornamentIds = [
            "ornament_corner_brass",
            "ornament_corner_laurel",
            "ornament_corner_iron_cross",
            "ornament_corner_star",
            "ornament_flourish_horizontal",
            "ornament_flourish_vertical",
            "ornament_rule_line",
            "ornament_drop_cap",
            "ornament_section_divider",
            "ornament_chapter_number",
            "ornament_medal",
            "ornament_ribbon",
            "ornament_laurel_wreath",
            "ornament_eagle",
            "ornament_lion",
            "ornament_star_burst",
            "ornament_crosshatch",
            "ornament_diamond",
            "ornament_chevron",
            "ornament_damask",
        ];
        for (const ornamentId of ornamentIds) {
            catalogEntries.push(new CatalogAssetEntry(ornamentId, "ornament", 48, 48, ornamentId));
            catalogEntries.push(
                new CatalogAssetEntry(`${ornamentId}_alt_01`, "ornament", 48, 48, `${ornamentId}_alt_01`),
            );
            catalogEntries.push(
                new CatalogAssetEntry(`${ornamentId}_alt_02`, "ornament", 48, 48, `${ornamentId}_alt_02`),
            );
        }
    }

    private static appendPatternEntries(catalogEntries: CatalogAssetEntry[]): void {
        const patternIds = [
            "pattern_parchment_grain",
            "pattern_leather_grain",
            "pattern_canvas_grain",
            "pattern_paper_grain",
            "pattern_map_grid",
            "pattern_camouflage_germany",
            "pattern_camouflage_britain",
            "pattern_camouflage_france",
            "pattern_camouflage_italy",
            "pattern_camouflage_usa",
            "pattern_camouflage_ussr",
            "pattern_camouflage_japan",
            "pattern_stripe_diagonal",
            "pattern_stripe_vertical",
            "pattern_chevron_up",
            "pattern_chevron_down",
            "pattern_dots",
            "pattern_crosses",
            "pattern_hatching",
            "pattern_noise",
        ];
        for (const patternId of patternIds) {
            for (let variantIndex = 1; variantIndex <= 4; variantIndex++) {
                const variantSuffix = `_v0${variantIndex}`;
                catalogEntries.push(
                    new CatalogAssetEntry(
                        `${patternId}${variantSuffix}`,
                        "pattern",
                        64,
                        64,
                        `${patternId}${variantSuffix}`,
                    ),
                );
            }
            catalogEntries.push(new CatalogAssetEntry(patternId, "pattern", 64, 64, patternId));
        }
    }

    private static appendScenarioEntries(catalogEntries: CatalogAssetEntry[]): void {
        for (let scenarioNumber = 1; scenarioNumber <= 10; scenarioNumber++) {
            catalogEntries.push(
                new CatalogAssetEntry(
                    `scenario_${scenarioNumber}_icon`,
                    "scenario",
                    96,
                    96,
                    `scenario_${scenarioNumber}_icon`,
                ),
            );
            catalogEntries.push(
                new CatalogAssetEntry(
                    `scenario_${scenarioNumber}_icon_banner`,
                    "scenario",
                    320,
                    96,
                    `scenario_${scenarioNumber}_banner`,
                ),
            );
        }
    }

    private static appendTimelineEntries(catalogEntries: CatalogAssetEntry[]): void {
        const timelineIds = [
            "timeline_axis",
            "timeline_tick_major",
            "timeline_tick_minor",
            "timeline_marker_event",
            "timeline_marker_war",
            "timeline_marker_treaty",
            "timeline_marker_atrocity",
            "timeline_marker_revolution",
            "timeline_marker_economic",
        ];
        for (const timelineId of timelineIds) {
            catalogEntries.push(new CatalogAssetEntry(timelineId, "timeline", 48, 48, timelineId));
        }
    }

    private static appendEventEntries(catalogEntries: CatalogAssetEntry[]): void {
        for (const eventIllustrationKey of SvgCatalogBuilder.EVENT_ILLUSTRATION_KEYS) {
            catalogEntries.push(new CatalogAssetEntry(eventIllustrationKey, "event", 320, 180, eventIllustrationKey));
            catalogEntries.push(
                new CatalogAssetEntry(
                    `${eventIllustrationKey}_wide`,
                    "event",
                    480,
                    200,
                    `${eventIllustrationKey}_wide`,
                ),
            );
            catalogEntries.push(
                new CatalogAssetEntry(
                    `${eventIllustrationKey}_small`,
                    "event",
                    160,
                    120,
                    `${eventIllustrationKey}_small`,
                ),
            );
            catalogEntries.push(
                new CatalogAssetEntry(
                    `${eventIllustrationKey}_tall`,
                    "event",
                    240,
                    320,
                    `${eventIllustrationKey}_tall`,
                ),
            );
        }
    }

    private static appendPortraitEntries(catalogEntries: CatalogAssetEntry[]): void {
        const portraitFrameKeys = [
            "germany",
            "britain",
            "france",
            "russia",
            "ussr",
            "italy",
            "japan",
            "usa",
            "ottoman",
        ];
        for (const portraitFrameKey of portraitFrameKeys) {
            catalogEntries.push(
                new CatalogAssetEntry(
                    `portrait_frame_${portraitFrameKey}`,
                    "portrait",
                    120,
                    150,
                    `portrait_${portraitFrameKey}`,
                ),
            );
            catalogEntries.push(
                new CatalogAssetEntry(
                    `portrait_frame_${portraitFrameKey}_small`,
                    "portrait",
                    80,
                    100,
                    `portrait_small_${portraitFrameKey}`,
                ),
            );
        }
        const interestGroupIds = [
            "ig_aristocracy",
            "ig_bourgeoisie",
            "ig_workers",
            "ig_clergy",
            "ig_military",
            "ig_intelligentsia",
            "ig_peasants",
            "ig_merchants",
        ];
        for (const interestGroupId of interestGroupIds) {
            catalogEntries.push(new CatalogAssetEntry(interestGroupId, "portrait", 64, 80, interestGroupId));
        }
    }

    private static appendOverlayEntries(catalogEntries: CatalogAssetEntry[]): void {
        const overlayIds = [
            "overlay_fog_of_war",
            "overlay_supply_range",
            "overlay_attack_arrow",
            "overlay_defend_shield",
            "overlay_movement_arrow",
            "overlay_naval_route",
            "overlay_railway_route",
            "overlay_air_route",
            "overlay_front_line",
            "overlay_pocket",
            "overlay_landing_zone",
            "overlay_paradrop_zone",
            "overlay_bombing_target",
            "overlay_artillery_range",
            "overlay_radar_range",
        ];
        for (const overlayId of overlayIds) {
            catalogEntries.push(new CatalogAssetEntry(overlayId, "overlay", 64, 64, overlayId));
        }
    }

    private static appendLedgerEntries(catalogEntries: CatalogAssetEntry[]): void {
        const ledgerIds = [
            "ledger_row_odd",
            "ledger_row_even",
            "ledger_header_row",
            "ledger_column_divider",
            "ledger_total_row",
            "ledger_footer",
        ];
        for (const ledgerId of ledgerIds) {
            catalogEntries.push(new CatalogAssetEntry(ledgerId, "ledger", 400, 24, ledgerId));
        }
    }

    private static appendFocusEntries(catalogEntries: CatalogAssetEntry[]): void {
        const focusIds = [
            "focus_node_default",
            "focus_node_available",
            "focus_node_completed",
            "focus_node_locked",
            "focus_node_major",
            "focus_connector_straight",
            "focus_connector_corner",
            "focus_connector_cross",
            "focus_tree_background",
        ];
        for (const focusId of focusIds) {
            catalogEntries.push(new CatalogAssetEntry(focusId, "focus", 64, 64, focusId));
        }
    }

    private static appendStatusEntries(catalogEntries: CatalogAssetEntry[]): void {
        const statusIds = [
            "status_indicator_green",
            "status_indicator_yellow",
            "status_indicator_red",
            "status_indicator_gray",
            "status_indicator_blue",
            "status_arrow_up",
            "status_arrow_down",
            "status_arrow_flat",
            "status_star_full",
            "status_star_empty",
            "status_star_half",
        ];
        for (const statusId of statusIds) {
            catalogEntries.push(new CatalogAssetEntry(statusId, "status", 24, 24, statusId));
        }
    }

    private static appendNewspaperEntries(catalogEntries: CatalogAssetEntry[]): void {
        const newspaperIds = [
            "newspaper_masthead_default",
            "newspaper_masthead_britain",
            "newspaper_masthead_germany",
            "newspaper_masthead_france",
            "newspaper_masthead_usa",
            "newspaper_masthead_ussr",
            "newspaper_masthead_japan",
            "newspaper_column_divider",
            "newspaper_headline_banner",
            "newspaper_photo_frame",
            "telegram_header",
            "telegram_body_lines",
            "telegram_stamp",
        ];
        for (const newspaperId of newspaperIds) {
            catalogEntries.push(new CatalogAssetEntry(newspaperId, "newspaper", 200, 64, newspaperId));
        }
    }

    private static appendMiscEntries(catalogEntries: CatalogAssetEntry[]): void {
        for (const miscIconKey of SvgCatalogBuilder.MISC_ICON_KEYS) {
            catalogEntries.push(new CatalogAssetEntry(miscIconKey, "misc", 64, 64, miscIconKey));
        }
    }
}
