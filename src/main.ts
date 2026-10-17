import Phaser from "phaser";

import "./style.css";
import { GameSession } from "./core/GameSession";
import { HighDpiConfigurator } from "./core/HighDpiConfigurator";
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
import { StudentProfilesScene } from "./scenes/StudentProfilesScene";
import { SourceAnalysisScene } from "./scenes/SourceAnalysisScene";
import { TeacherDashboardScene } from "./scenes/TeacherDashboardScene";
import { WarScoreScene } from "./scenes/WarScoreScene";

const cascadeGameConfiguration: Phaser.Types.Core.GameConfig = {
    // Scroll panels use Phaser geometry masks, which Phaser 4 supports only in Canvas.
    type: Phaser.CANVAS,
    parent: "cascade-game-root",
    backgroundColor: "#1A1410",
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720,
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
        StudentProfilesScene,
        LedgerScene,
        FocusTreeScene,
        ProductionQueueScene,
        DivisionDesignerScene,
        WarScoreScene,
        DiplomaticPlayScene,
    ],
};

HighDpiConfigurator.getInstance().installHighDpiTextPatch();

export const cascadeGame = new Phaser.Game(cascadeGameConfiguration);

(window as unknown as Record<string, unknown>).cascadeGame = cascadeGame;

const unlockGameAudio = (): void => {
    window.removeEventListener("pointerdown", unlockGameAudio);
    window.removeEventListener("keydown", unlockGameAudio);
    GameSession.getInstance().getAudioManager().activateAudioFromUserGesture();
};
window.addEventListener("pointerdown", unlockGameAudio, { once: true });
window.addEventListener("keydown", unlockGameAudio, { once: true });

cascadeGame.events.once(Phaser.Core.Events.READY, () => {
    cascadeGame.canvas.tabIndex = 0;
    cascadeGame.canvas.setAttribute("role", "application");
    cascadeGame.canvas.setAttribute(
        "aria-label",
        "Cascade historical strategy game. Press Tab to move between controls, then Enter or Space to activate. Use the arrow keys to inspect the map.",
    );
    cascadeGame.canvas.addEventListener("pointerdown", () => cascadeGame.canvas.focus());
    for (const registeredScene of cascadeGame.scene.scenes) {
        registeredScene.events.on(Phaser.Scenes.Events.CREATE, () => {
            HighDpiConfigurator.getInstance().registerScene(registeredScene);
        });
        if (registeredScene.sys.isActive()) {
            HighDpiConfigurator.getInstance().registerScene(registeredScene);
        }
    }
});
