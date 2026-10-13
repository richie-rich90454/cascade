import Phaser from "phaser";
import "./style.css";
import { BootScene } from "./scenes/BootScene";
import { CampaignSelectorScene } from "./scenes/CampaignSelectorScene";
import { DebriefScene } from "./scenes/DebriefScene";
import { DiplomaticPlayScene } from "./scenes/DiplomaticPlayScene";
import { DivisionDesignerScene } from "./scenes/DivisionDesignerScene";
import { FocusTreeScene } from "./scenes/FocusTreeScene";
import { JournalScene } from "./scenes/JournalScene";
import { LedgerScene } from "./scenes/LedgerScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { ProductionQueueScene } from "./scenes/ProductionQueueScene";
import { ProgressCheckScene } from "./scenes/ProgressCheckScene";
import { ScenarioBriefingScene } from "./scenes/ScenarioBriefingScene";
import { ScenarioPlayScene } from "./scenes/ScenarioPlayScene";
import { SettingsScene } from "./scenes/SettingsScene";
import { SourceAnalysisScene } from "./scenes/SourceAnalysisScene";
import { TeacherDashboardScene } from "./scenes/TeacherDashboardScene";
import { WarScoreScene } from "./scenes/WarScoreScene";

const cascadeGameConfiguration: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "cascade-game-root",
    backgroundColor: "#1A1410",
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: "100%",
        height: "100%",
    },
    render: {
        antialias: true,
        pixelArt: false,
    },
    audio: {
        noAudio: true,
    },
    scene: [
        BootScene,
        MainMenuScene,
        CampaignSelectorScene,
        ScenarioBriefingScene,
        ScenarioPlayScene,
        SourceAnalysisScene,
        DebriefScene,
        JournalScene,
        ProgressCheckScene,
        TeacherDashboardScene,
        SettingsScene,
        LedgerScene,
        FocusTreeScene,
        ProductionQueueScene,
        DivisionDesignerScene,
        WarScoreScene,
        DiplomaticPlayScene,
    ],
};

export const cascadeGame = new Phaser.Game(cascadeGameConfiguration);
