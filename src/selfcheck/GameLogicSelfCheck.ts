import { GameState } from "../core/GameState";
import { CED_UNIT_SEVEN_TOPICS, getCedUnitSevenCoverageIssues } from "../data/CedUnitSevenCoverage";
import { ProgressCheckBank } from "../data/ProgressCheckBank";
import { Rubrics } from "../data/Rubrics";
import { getWorldProvinceCoordinate } from "../data/WorldProvinceGeography";
import { ScenarioRegistry } from "../domain/ScenarioRegistry";
import { ScenarioOne } from "../domain/scenarios/ScenarioOne";
import { AssessmentManager } from "../managers/AssessmentManager";
import { ResourceType } from "../types/ResourceType";

function assertCondition(condition: boolean, failureMessage: string): void {
    if (!condition) {
        throw new Error(`Self-check failed: ${failureMessage}`);
    }
}

function runGameLogicSelfCheck(): void {
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
    assertCondition(scenarioOne.getDurationInMinutes() === 30, "scenario one must target a 25 to 30 minute playthrough");
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
