export class SceneKeys {
    public static readonly BOOT = "boot";
    public static readonly MAIN_MENU = "main_menu";
    public static readonly CAMPAIGN_SELECTOR = "campaign_selector";
    public static readonly SCENARIO_BRIEFING = "scenario_briefing";
    public static readonly SCENARIO_PLAY = "scenario_play";
    public static readonly SOURCE_ANALYSIS = "source_analysis";
    public static readonly DEBRIEF = "debrief";
    public static readonly JOURNAL = "journal";
    public static readonly PROGRESS_CHECK = "progress_check";
    public static readonly TEACHER_DASHBOARD = "teacher_dashboard";
    public static readonly SETTINGS = "settings";
    public static readonly STUDENT_PROFILES = "student_profiles";
    public static readonly LEDGER = "ledger";
    public static readonly FOCUS_TREE = "focus_tree";
    public static readonly PRODUCTION_QUEUE = "production_queue";
    public static readonly DIVISION_DESIGNER = "division_designer";
    public static readonly WAR_SCORE = "war_score";
    public static readonly DIPLOMATIC_PLAY = "diplomatic_play";

    public static getAllSceneKeys(): string[] {
        return [
            SceneKeys.BOOT,
            SceneKeys.MAIN_MENU,
            SceneKeys.CAMPAIGN_SELECTOR,
            SceneKeys.SCENARIO_BRIEFING,
            SceneKeys.SCENARIO_PLAY,
            SceneKeys.SOURCE_ANALYSIS,
            SceneKeys.DEBRIEF,
            SceneKeys.JOURNAL,
            SceneKeys.PROGRESS_CHECK,
            SceneKeys.TEACHER_DASHBOARD,
            SceneKeys.SETTINGS,
            SceneKeys.STUDENT_PROFILES,
            SceneKeys.LEDGER,
            SceneKeys.FOCUS_TREE,
            SceneKeys.PRODUCTION_QUEUE,
            SceneKeys.DIVISION_DESIGNER,
            SceneKeys.WAR_SCORE,
            SceneKeys.DIPLOMATIC_PLAY,
        ];
    }
}
