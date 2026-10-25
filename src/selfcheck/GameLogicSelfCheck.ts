import { GameSession } from "../core/GameSession";
import { GameState } from "../core/GameState";
import { CED_UNIT_SEVEN_TOPICS, getCedUnitSevenCoverageIssues } from "../data/CedUnitSevenCoverage";
import { ProgressCheckBank } from "../data/ProgressCheckBank";
import { Rubrics } from "../data/Rubrics";
import { getWorldProvinceCoordinate } from "../data/WorldProvinceGeography";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import { ScenarioOne } from "../domain/scenarios/ScenarioOne";
import { AssessmentManager } from "../managers/AssessmentManager";
import { MidiManager } from "../managers/MidiManager";
import { ResourceType } from "../types/ResourceType";
import { formatUiDisplayCase } from "../ui/UiTextCase";

function assertCondition(condition: boolean, failureMessage: string): void {
    if (!condition) {
        throw new Error(`Self-check failed: ${failureMessage}`);
    }
}

function runGameLogicSelfCheck(): void {
    assertCondition(
        formatUiDisplayCase("CAMPAIGN PROGRESS") === "Campaign Progress",
        "all-caps interface labels must render in readable title case",
    );
    assertCondition(
        formatUiDisplayCase("AP WORLD HISTORY UNIT 7") === "Advanced Placement World History Unit 7",
        "student-facing academic shorthand must be expanded in readable interface copy",
    );
    assertCondition(
        formatUiDisplayCase("LOCAL PROFILE · STUDENT · CAMPAIGN SAVED") === "Local Profile · Student · Campaign Saved",
        "all-caps phrases must be normalized even when used in mixed-case interface contexts",
    );

    const midiManager = new MidiManager();
    const validMidiBytes = new Uint8Array([
        0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01, 0x01, 0xe0, 0x4d, 0x54, 0x72, 0x6b,
        0x00, 0x00, 0x00, 0x1e, 0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20, 0x00, 0xc0, 0x00, 0x00, 0x90, 0x3c, 0x64,
        0x83, 0x60, 0xff, 0x51, 0x03, 0x03, 0xd0, 0x90, 0x00, 0x80, 0x3c, 0x00, 0x00, 0xff, 0x2f, 0x00,
    ]);
    const parsedMidi = midiManager.parseMidiArrayBuffer(validMidiBytes.buffer, "tempo-change-check");
    assertCondition(parsedMidi.notes.length === 1, "MIDI parsing must preserve valid note events");
    assertCondition(
        Math.abs((parsedMidi.notes[0]?.durationSeconds ?? 0) - 0.5) < 0.001,
        "MIDI tempo changes must advance event time using the tempo active during each delta",
    );
    assertCondition(
        parsedMidi.initialTempoMicrosecondsPerQuarter === 500000,
        "parsed MIDI metadata must retain the initial default tempo",
    );
    let malformedMidiRejected = false;
    const malformedMidiBytes = new Uint8Array([
        0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01, 0x01, 0xe0, 0x4d, 0x54, 0x72, 0x6b,
        0x00, 0x00, 0x00, 0x05, 0x80, 0x80, 0x80, 0x80, 0x00,
    ]);
    try {
        midiManager.parseMidiArrayBuffer(malformedMidiBytes.buffer, "overlong-variable-length-check");
    } catch (error) {
        malformedMidiRejected = error instanceof Error && error.message.includes("four bytes");
    }
    assertCondition(malformedMidiRejected, "malformed overlong MIDI values must fail with a bounded parser error");

    const scenarioRegistry = ScenarioRegistry.getInstance();
    assertCondition(scenarioRegistry.getAllScenarios().length === 10, "registry must contain exactly ten scenarios");
    for (let scenarioNumber = 1; scenarioNumber <= 10; scenarioNumber++) {
        const registeredScenario = scenarioRegistry.getScenarioByNumber(scenarioNumber);
        assertCondition(registeredScenario !== null, `scenario ${scenarioNumber} must be registered`);
        if (registeredScenario !== null) {
            assertCondition(
                registeredScenario.getDebriefQuestionPrompts().length >= 4,
                `scenario ${scenarioNumber} must expose at least four debrief prompts`,
            );
            assertCondition(
                registeredScenario.getTurnCount() >= 5,
                `scenario ${scenarioNumber} must span at least five turns`,
            );
            const initialState = new GameState();
            registeredScenario.registerInitialState(initialState);
            initialState.setTurnNumber(1);
            const initialSnapshot = initialState.createSnapshot();
            const restoredState = new GameState();
            registeredScenario.registerInitialState(restoredState);
            restoredState.setTurnNumber(1);
            assertCondition(
                restoredState.restoreSnapshot(initialSnapshot),
                `scenario ${scenarioNumber} must restore a complete initial save`,
            );
            if (scenarioNumber === 1) {
                const corruptedSnapshot = structuredClone(initialSnapshot);
                const secondProvince = corruptedSnapshot.provinces[1];
                if (secondProvince !== undefined) {
                    corruptedSnapshot.provinces[0].identifier = secondProvince.identifier;
                }
                const stateBeforeRejectedRestore = JSON.stringify(restoredState.createSnapshot());
                assertCondition(
                    !restoredState.restoreSnapshot(corruptedSnapshot),
                    "a save with duplicate province identities must be rejected",
                );
                assertCondition(
                    JSON.stringify(restoredState.createSnapshot()) === stateBeforeRejectedRestore,
                    "a rejected save must not partially change the playable world",
                );
            }
        }
    }

    const scenarioOne = new ScenarioOne();
    const gameState = new GameState();
    scenarioOne.registerInitialState(gameState);
    assertCondition(gameState.getNation("ottoman_empire") !== null, "scenario one must register the Ottoman Empire");
    assertCondition(gameState.getAllProvinces().length > 40, "scenario one must register the world province map");
    assertCondition(getCedUnitSevenCoverageIssues().length === 0, "CED topics 7.1-7.9 must all map to scenarios");
    assertCondition(CED_UNIT_SEVEN_TOPICS.length === 9, "the Fall 2026 Unit 7 crosswalk must contain nine topics");
    assertCondition(
        CED_UNIT_SEVEN_TOPICS.every((topic) =>
            ProgressCheckBank.getAllMultipleChoiceQuestions().some(
                (question) => question.cedTopicCode === topic.topicCode,
            ),
        ),
        "each CED topic must have at least one tagged multiple-choice knowledge check",
    );
    assertCondition(
        gameState.getAllProvinces().every((province) => getWorldProvinceCoordinate(province.getIdentifier()) !== null),
        "every playable location must have a geographic map anchor",
    );
    assertCondition(
        gameState.getResourceQuantity(ResourceType.LEGITIMACY) === 45,
        "scenario one must seed legitimacy at 45",
    );
    assertCondition(scenarioOne.getTurnCount() === 6, "scenario one must use a 1900 setup and five dated chapters");
    assertCondition(
        scenarioOne.getDurationInMinutes() === 30,
        "scenario one must target a 25 to 30 minute playthrough",
    );
    assertCondition(
        scenarioOne.getScenarioEventSchedule().length === 1 &&
            scenarioOne.getScenarioEventSchedule()[0].eventIdentifier === "assassination_at_sarajevo" &&
            scenarioOne.getScenarioEventSchedule()[0].turnNumber === 6,
        "scenario one must end its documented event schedule with Sarajevo in 1914",
    );
    assertCondition(
        !scenarioOne.getScenarioEventSchedule().some((event) => event.eventIdentifier === "russian_revolution"),
        "the 1917 Bolshevik event must stay outside the 1900 to 1914 scenario schedule",
    );
    assertCondition(
        scenarioOne.getPerspectiveBriefingSections().length === 5,
        "scenario one must present four state perspectives and their shared global context",
    );

    const initialEvaluation = scenarioOne.evaluateVictory(gameState);
    assertCondition(!initialEvaluation.isVictory, "scenario one must not be won before any flags are set");

    gameState.setScenarioFlag("source_s1_analyzed_october_manifesto");
    gameState.setScenarioFlag("source_s1_analyzed_madero_plan_of_san_luis_potosi");
    gameState.setScenarioFlag("event_s1_sarajevo_read");
    for (const decision of scenarioOne.getDecisionRecords()) {
        const firstOption = decision.options[0];
        if (firstOption !== undefined) {
            gameState.setScenarioFlag(firstOption.resultingFlagIdentifier);
        }
    }
    gameState.setScenarioFlag("causal_chain_s1_ottoman_complete");
    gameState.setScenarioFlag("causal_chain_s1_russian_complete");
    gameState.setScenarioFlag("causal_chain_s1_qing_complete");
    gameState.setScenarioFlag("causal_chain_s1_mexican_complete");
    gameState.setScenarioFlag("continuity_chart_s1_complete");
    const nearVictoryEvaluation = scenarioOne.evaluateVictory(gameState);
    assertCondition(
        !nearVictoryEvaluation.isVictory,
        "scenario one must still require the contextualization criterion",
    );
    gameState.setScenarioFlag("contextualization_s1_scored");
    const victoryEvaluation = scenarioOne.evaluateVictory(gameState);
    assertCondition(victoryEvaluation.isVictory, "scenario one must be won when all ten learning criteria are met");
    assertCondition(victoryEvaluation.earnedScore === 10, "scenario one victory must award ten of ten criteria");

    const gameSession = GameSession.getInstance();
    gameSession.startScenario(scenarioOne);
    const validCampaignSave = gameSession.createCampaignSnapshot();
    assertCondition(validCampaignSave !== null, "an active scenario must produce a resumable campaign save");
    if (validCampaignSave !== null) {
        assertCondition(gameSession.restoreCampaign(validCampaignSave), "a valid campaign save must restore");
        const stateBeforeInvalidRestore = JSON.stringify(gameSession.getGameState().createSnapshot());
        const campaignSaveBeyondScenario = structuredClone(validCampaignSave);
        campaignSaveBeyondScenario.turnManager.turnNumber = scenarioOne.getTurnCount() + 1;
        campaignSaveBeyondScenario.gameState.turnNumber = campaignSaveBeyondScenario.turnManager.turnNumber;
        assertCondition(
            !gameSession.restoreCampaign(campaignSaveBeyondScenario),
            "a campaign save beyond its scenario timeline must be rejected",
        );
        const campaignSaveWithInvalidPhase = structuredClone(validCampaignSave);
        campaignSaveWithInvalidPhase.playProgress.phaseIndex = 99;
        assertCondition(
            !gameSession.restoreCampaign(campaignSaveWithInvalidPhase),
            "a campaign save with an invalid phase must be rejected before it reaches the interface",
        );
        assertCondition(
            JSON.stringify(gameSession.getGameState().createSnapshot()) === stateBeforeInvalidRestore,
            "a campaign rejected before restore must leave the active game state intact",
        );
    }

    const assessmentManager = AssessmentManager.getInstance();
    const scenarioOneRubricItems = Rubrics.getRubricItemsForScenario(1);
    assertCondition(scenarioOneRubricItems.length === 4, "scenario one must expose four short answer rubric items");
    const firstRubricItem = scenarioOneRubricItems[0];
    const emptyResponseScore = assessmentManager.scoreShortAnswerResponse(firstRubricItem, "");
    assertCondition(emptyResponseScore === 0, "an empty response must score zero");
    const strongResponseScore = assessmentManager.scoreShortAnswerResponse(
        firstRubricItem,
        "Both revolutions challenged an entrenched autocrat and demanded constitutional limits on power, but Russia conceded a duma while Mexico sought a republic, because the historical situations differed.",
    );
    assertCondition(strongResponseScore === 3, "a response touching every concept group must score the maximum");
    const contextualizationScore = assessmentManager.scoreContextualizationParagraph(
        "This development is situated within the broader context of Western industrial power because the pressures of imperialism shaped reform, and this illustrates how global forces produced local revolutions across the period of 1900 to 1924.",
    );
    assertCondition(contextualizationScore >= 2, "a substantive contextualization paragraph must score at least two");

    console.log("GameLogicSelfCheck: all scenario registry, victory, and rubric scoring checks passed.");
}

runGameLogicSelfCheck();
