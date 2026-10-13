import type { GameState } from "../../core/GameState";
import { GameSystem } from "../../core/GameSystem";
import { Nations } from "../../data/Nations";
import { Rubrics } from "../../data/Rubrics";
import { LearningObjective } from "../../types/LearningObjective";
import { ReasoningProcess } from "../../types/ReasoningProcess";
import { ResourceType } from "../../types/ResourceType";
import { SuggestedSkill } from "../../types/SuggestedSkill";
import { ThematicFocus } from "../../types/ThematicFocus";
import { Nation } from "../Nation";
import { WorldState1900 } from "../WorldState1900";
import { ChurchillPath } from "./paths/ChurchillPath";
import { HitlerPath } from "./paths/HitlerPath";
import { RooseveltPath } from "./paths/RooseveltPath";
import { StalinPath } from "./paths/StalinPath";
import {
    ComparisonDefinition,
    ComparisonRow,
    DecisionOption,
    DecisionRecord,
    FocusNodeDefinition,
    FocusTreeDefinition,
    Scenario,
    ScenarioEvaluationResult,
    ScenarioEventRecord,
} from "./Scenario";
import type {
    ArgumentDefinition,
    CausalChainDefinition,
    ContinuityChangeDefinition,
    TestimonyRecord,
} from "./Scenario";
import { ArtSystem } from "./systems/ArtSystem";
import { CoalitionCoordinationSystem } from "./systems/CoalitionCoordinationSystem";
import { ColonialMobilizationSystem } from "./systems/ColonialMobilizationSystem";
import { CommunistIdeologySystem } from "./systems/CommunistIdeologySystem";
import { FascistIdeologySystem } from "./systems/FascistIdeologySystem";
import { HomeMobilizationSystem } from "./systems/HomeMobilizationSystem";
import { MediaSystem } from "./systems/MediaSystem";
import { NationalismSystem } from "./systems/NationalismSystem";
import { PropagandaSystem } from "./systems/PropagandaSystem";
import { TotalitarianRepressionSystem } from "./systems/TotalitarianRepressionSystem";

export class ScenarioEight extends Scenario {
    private readonly playableSystems: GameSystem[];

    constructor() {
        super("scenario_eight_the_world_at_war");
        this.playableSystems = [
            new CoalitionCoordinationSystem(),
            new PropagandaSystem(),
            new ArtSystem(),
            new MediaSystem(),
            new NationalismSystem(),
            new HomeMobilizationSystem(),
            new ColonialMobilizationSystem(),
            new FascistIdeologySystem(),
            new CommunistIdeologySystem(),
            new TotalitarianRepressionSystem(),
            new HitlerPath(),
            new StalinPath(),
            new ChurchillPath(),
            new RooseveltPath(),
        ];
    }

    public override getScenarioNumber(): number {
        return 8;
    }

    public override getScenarioTitle(): string {
        return "The World at War";
    }

    public override getScenarioSubtitle(): string {
        return "1941-1945";
    }

    public override getStartYear(): number {
        return 1941;
    }

    public override getEndYear(): number {
        return 1945;
    }

    public override getDurationInMinutes(): number {
        return 60;
    }

    public override getTurnCount(): number {
        return 12;
    }

    public override getThematicFocus(): ThematicFocus {
        return ThematicFocus.GOVERNANCE;
    }

    public override getSuggestedSkill(): SuggestedSkill {
        return SuggestedSkill.SKILL_3_D;
    }

    public override getReasoningProcess(): ReasoningProcess {
        return ReasoningProcess.COMPARISON;
    }

    public override getLearningObjective(): LearningObjective {
        return LearningObjective.OBJECTIVE_G;
    }

    public override getPerspectiveLabels(): string[] {
        return ["United States", "Great Britain", "Soviet Union", "Germany", "Japan"];
    }

    public override getBriefingParagraphs(): string[] {
        return [
            "In December 1941 Japan attacked Pearl Harbor and Germany declared war on the United States, turning a European war into a world war. Within days the United States, Great Britain, and the Soviet Union stood together in a grand coalition against Germany, Italy, and Japan, an alliance of liberal democracies and a communist dictatorship held together by a common enemy.",
            "The Grand Alliance fought on a scale the world had never seen. Entire economies were directed by the state, millions were conscripted, colonies from India to West Africa and the Philippines were mobilized for the war, and the Allies coordinated their strategy through a series of summit conferences from Washington in 1941 to Potsdam in 1945.",
            "The Axis fought for conquest, living space, and racial empire, and its occupation of Europe and Asia meant forced labor, terror, and the murder of millions, including the Holocaust. The Allies proclaimed liberation and unconditional surrender, and their bombing campaigns brought death to civilians on every side.",
            "Your task across five perspectives is to compare how the Grand Alliance and the Axis conducted the war between 1941 and 1945: their war aims, command arrangements, mobilization of colonies, treatment of subject peoples, and industrial strategies, and to judge what their similarities and differences meant for the world they made.",
        ];
    }

    public override getObjectiveSummaries(): string[] {
        return [
            "Compare how the Grand Alliance and the Axis conducted the war in five areas: war aims, command arrangements, colonial mobilization, treatment of subject populations, and industrial strategy.",
            "Identify the similarities that made the Second World War total for every belligerent, including mobilized economies, propaganda and censorship, mass conscription, civilian bombing, and global scale.",
            "Complete the Grand Coalition focus tree of Allied summit conferences from Washington in 1941 to Potsdam in 1945.",
            "Write a comparison explaining the significance of one similarity and one difference between Allied and Axis methods of conducting war.",
        ];
    }

    public override getScenarioResourceCodes(): string[] {
        return [
            ResourceType.PRODUCTION.getCode(),
            ResourceType.MANPOWER.getCode(),
            ResourceType.IDEOLOGY.getCode(),
            ResourceType.SUPPORT.getCode(),
            ResourceType.TECHNOLOGY.getCode(),
        ];
    }

    public override getPlayableSystems(): GameSystem[] {
        return this.playableSystems;
    }

    public override getFocusTreeDefinition(): FocusTreeDefinition | null {
        return new FocusTreeDefinition("The Grand Coalition", [
            new FocusNodeDefinition(
                "focus_s8_first_washington",
                "The First Washington Conference",
                "In December 1941 and January 1942, Roosevelt and Churchill met in Washington weeks after Pearl Harbor and agreed that Germany must be defeated first. The meeting produced a unified command and a pledge that neither ally would make a separate peace.",
                "Establishes coalition coordination between the Allies and opens the conference chain that carries the Grand Alliance through the war.",
                [],
                "",
                0,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s8_casablanca",
                "The Casablanca Conference",
                "In January 1943 Roosevelt and Churchill demanded the unconditional surrender of the Axis and agreed to invade Sicily, while Stalin was kept informed but not present. The demand fixed a war aim that distinguished the Allies from the Axis and committed them to total victory.",
                "Unlocks the unconditional surrender commitment and the Mediterranean strategy that knocked Italy out of the war.",
                ["focus_s8_first_washington"],
                "",
                1,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s8_tehran",
                "The Tehran Conference",
                "In November and December 1943 Roosevelt, Churchill, and Stalin met together for the first time and agreed to open a second front in France during 1944. The conference confirmed the cross-channel invasion as the centerpiece of Allied strategy and began the bargaining over the postwar world.",
                "Unlocks the second front commitment and coordinates the Allied war effort for the decisive campaigns of 1944.",
                ["focus_s8_casablanca"],
                "",
                2,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s8_yalta",
                "The Yalta Conference",
                "In February 1945 the Big Three planned the final defeat of Germany, agreed to occupy it in zones, and outlined the United Nations and the future of liberated Europe. The agreements on Poland and Eastern Europe became the most contested part of the wartime record.",
                "Unlocks the postwar settlement decisions, confirming Germany's division into occupation zones and the founding of the United Nations.",
                ["focus_s8_tehran"],
                "",
                1,
                1,
            ),
            new FocusNodeDefinition(
                "focus_s8_potsdam",
                "The Potsdam Conference",
                "In July and August 1945 Truman, Stalin, Churchill and then Attlee confirmed the occupation of Germany, drew new borders in central Europe, and issued the declaration demanding Japan's surrender. The atomic bomb and the growing rivalry among the Allies shadowed the last conference of the war.",
                "Completes the Grand Coalition focus tree and sets the terms of the occupation of Germany for the peace that followed.",
                ["focus_s8_yalta"],
                "",
                2,
                1,
            ),
        ]);
    }

    public override getPrimarySourceIdentifiers(): string[] {
        return [
            "roosevelt_day_of_infamy_1941",
            "careless_talk_costs_lives_poster",
            "japan_greater_east_asia_statement_1943",
            "soviet_order_227_1942",
        ];
    }

    public override getDecisionRecords(): DecisionRecord[] {
        return [
            new DecisionRecord(
                "s8_decision_grand_alliance",
                "The Grand Alliance Holds",
                "After Japan attacked Pearl Harbor in December 1941, the United States joined Britain and the Soviet Union in a grand coalition that spanned oceans, ideologies, and competing strategies. Stalin demanded a second front in France, Churchill favored striking at the Mediterranean, and Roosevelt worked to hold the alliance together through summit conferences and combined planning.",
                "The common danger from Germany and Japan caused the coalition: a liberal democracy, a maritime empire, and a communist dictatorship set aside their differences because none of them could defeat the Axis alone.",
                "The Allies answered their divisions with combined chiefs of staff and coalition theater commands, while the Axis powers coordinated through divided national commands that never matched Allied unity.",
                "Suspicion among the Allies persisted through the war and into the peace, but what changed was the creation of permanent machinery for joint strategy that no coalition had possessed between 1914 and 1918.",
                "The record of the alliance survives in conference minutes, telegrams, and the memoirs of the leaders themselves, so it documents public commitments and private bargaining that each side later described in its own interest.",
                [
                    new DecisionOption(
                        "s8_grand_alliance_option_preserve",
                        "Keep the coalition together and subordinate national strategy to the common war effort.",
                        "Combined planning lets the Allies concentrate their production and forces, and the coalition survives every crisis of the war.",
                        "path_s8_coalition_preserved",
                        ResourceType.SUPPORT.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s8_grand_alliance_option_strain",
                        "Insist on each nation's own strategy first.",
                        "Separate campaigns strain shipping, supplies, and trust, and the second front slips further into the future.",
                        "path_s8_coalition_strained",
                        ResourceType.SUPPORT.getCode(),
                        -5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s8_decision_second_front",
                "The Second Front",
                "From 1941 Stalin pressed his allies to open a major front in northern France and relieve the Red Army, while Churchill argued for campaigns in North Africa and Italy that would strike at the Axis from the south. The cross-channel invasion Stalin wanted did not come until June 1944, when the Allies landed in Normandy.",
                "Stalin's demand grew out of the scale of Soviet losses on the eastern front, and the delay grew out of British reluctance and American shortages of landing craft and shipping.",
                "The eastern front absorbed the great majority of German divisions while the western Allies built up for a landing, so the timing of the second front measured how the coalition divided its burdens.",
                "The argument over where to strike divided the Allies throughout the war, but what changed by 1944 was that the coalition finally possessed the forces and equipment to invade France directly.",
                "The exchange of demands and promises survives in the leaders' correspondence and conference records, where each side's claims about military necessity served its own strategy.",
                [
                    new DecisionOption(
                        "s8_second_front_option_press",
                        "Press for the earliest possible cross-channel invasion.",
                        "The buildup for the invasion consumes landing craft, shipping, and production, and the Allies commit themselves to the battle for France.",
                        "factor_s8_second_front_pressed",
                        ResourceType.PRODUCTION.getCode(),
                        -5,
                    ),
                    new DecisionOption(
                        "s8_second_front_option_delay",
                        "Delay the invasion and strike through the Mediterranean first.",
                        "Campaigns in North Africa and Italy bring quicker gains, while Stalin watches the second front recede and the eastern front bears the weight of the war.",
                        "factor_s8_second_front_delayed",
                        ResourceType.PRODUCTION.getCode(),
                        5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s8_decision_atomic_bomb",
                "The Bomb",
                "The Manhattan Project produced the first atomic bombs in July 1945, and President Truman faced the decision of how to use them against a Japan that refused unconditional surrender. On August 6 and 9, 1945, atomic bombs destroyed Hiroshima and Nagasaki, and Japan surrendered within days.",
                "The decision grew out of the bomb's completion, the expected cost of invading the Japanese home islands, and the wish to end the war before the Soviet Union could claim a larger share of the victory in Asia.",
                "The atomic attacks stand alone in the war for the destruction a single weapon could cause, yet they came at the end of bombing campaigns against German and Japanese cities that had already killed hundreds of thousands of civilians.",
                "Terror bombing of cities had continued since the early years of the war, but what changed in August 1945 was the arrival of a weapon that made total war appear total by nature.",
                "The decision is documented in committee minutes and the recollections of officials, written with knowledge of how the war ended and in the shadow of the debate that followed.",
                [
                    new DecisionOption(
                        "s8_atomic_option_use",
                        "Use the atomic bomb to force Japan's surrender without an invasion.",
                        "The war ends in days at the cost of two cities, and the atomic age begins with the United States in sole possession of the weapon.",
                        "factor_s8_atomic_used",
                        ResourceType.SUPPORT.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s8_atomic_option_caution",
                        "Demonstrate the bomb's power and give Japan a final chance to surrender.",
                        "The war may end without destroying a city, or it may drag on into an invasion whose casualties were feared to be enormous.",
                        "factor_s8_atomic_caution",
                        ResourceType.SUPPORT.getCode(),
                        -5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s8_decision_settlement",
                "The Settlement to Come",
                "As victory over Germany approached in 1945, the Allies planned the postwar order: an occupied Germany, new borders in Europe, a United Nations, and the fate of liberated and conquered lands. Yalta and Potsdam set the framework, while the atomic bomb and the emerging rivalry among the Allies shadowed the peace.",
                "The scale of the Allied victory and the approaching end of the common enemy forced the leaders to settle the postwar order while their armies still stood on the ground they would claim.",
                "The wartime coalition had answered Axis conquest with the promise of liberation, and the question of 1945 was whether the peace would be settled by the United Nations the Allies proposed or by spheres of influence they already guarded.",
                "Great-power bargaining over the peace persisted from 1919 to 1945, but what changed was the creation of an international organization the great powers intended to lead and to dominate.",
                "The settlements of 1945 are recorded in conference protocols and published declarations, so they show the order the victors could agree to announce to the world.",
                [
                    new DecisionOption(
                        "s8_settlement_option_united_nations",
                        "Build the peace on the United Nations and the great-power council.",
                        "Collective security gains an institution with the victors at its center, though the veto preserves their power to disagree.",
                        "factor_s8_united_nations_shaped",
                        ResourceType.IDEOLOGY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s8_settlement_option_victors",
                        "Leave the settlement to a balance among the victors.",
                        "The peace rests on the strength and suspicion of the great powers, and the wartime alliance begins to fracture along the lines its armies occupy.",
                        "path_s8_settlement_victors_council",
                        ResourceType.IDEOLOGY.getCode(),
                        -5,
                    ),
                ],
            ),
        ];
    }

    public override getScenarioEventSchedule(): ScenarioEventRecord[] {
        return [
            new ScenarioEventRecord(
                1,
                "pearl_harbor",
                "JAPAN ATTACKS PEARL HARBOR; THE UNITED STATES ENTERS THE WAR",
                "newspaper_masthead_usa",
                "USA",
                "event_pearl_harbor",
            ),
            new ScenarioEventRecord(
                2,
                "midway",
                "AMERICAN CARRIERS TURN THE TIDE AT MIDWAY",
                "newspaper_masthead_usa",
                "USA",
                "event_pearl_harbor",
            ),
            new ScenarioEventRecord(
                3,
                "el_alamein",
                "MONTGOMERY'S EIGHTH ARMY BREAKS THE AXIS LINE AT EL ALAMEIN",
                "newspaper_masthead_britain",
                "ENG",
                "event_dunkirk",
            ),
            new ScenarioEventRecord(
                4,
                "stalingrad",
                "GERMAN SIXTH ARMY ENCIRCLED AT STALINGRAD",
                "newspaper_masthead_ussr",
                "SOV",
                "event_stalingrad",
            ),
            new ScenarioEventRecord(
                5,
                "guadalcanal",
                "MARINES HOLD GUADALCANAL AS JAPAN'S ADVANCE STOPS",
                "newspaper_masthead_usa",
                "USA",
                "event_pearl_harbor",
            ),
            new ScenarioEventRecord(
                6,
                "kursk",
                "GERMAN OFFENSIVE SHATTERED AT KURSK",
                "newspaper_masthead_ussr",
                "SOV",
                "event_stalingrad",
            ),
            new ScenarioEventRecord(
                7,
                "italy_invaded",
                "ALLIED ARMIES INVADE SICILY AND OPEN THE ITALIAN CAMPAIGN",
                "newspaper_masthead_usa",
                "USA",
                "event_d_day",
            ),
            new ScenarioEventRecord(
                8,
                "d_day",
                "ALLIED FORCES LAND IN NORMANDY ON D-DAY",
                "newspaper_masthead_usa",
                "USA",
                "event_d_day",
            ),
            new ScenarioEventRecord(
                9,
                "operation_bagration",
                "SOVIET ARMIES DESTROY ARMY GROUP CENTER IN BELARUS",
                "newspaper_masthead_ussr",
                "SOV",
                "event_operation_barbarossa",
            ),
            new ScenarioEventRecord(
                10,
                "yalta",
                "ROOSEVELT, CHURCHILL, AND STALIN PLAN THE POSTWAR WORLD AT YALTA",
                "newspaper_masthead_ussr",
                "SOV",
                "event_united_nations",
            ),
            new ScenarioEventRecord(
                11,
                "germany_surrenders",
                "GERMANY SURRENDERS: THE CAMPS ARE OPENED",
                "newspaper_masthead_britain",
                "ENG",
                "event_holocaust",
            ),
            new ScenarioEventRecord(
                12,
                "hiroshima",
                "ATOMIC BOMB DESTROYS HIROSHIMA; JAPAN SURRENDERS",
                "newspaper_masthead_usa",
                "USA",
                "event_hiroshima",
            ),
        ];
    }

    public override getCausalChainDefinitions(): CausalChainDefinition[] {
        return [];
    }

    public override getComparisonDefinition(): ComparisonDefinition | null {
        return new ComparisonDefinition(
            "The Grand Alliance and the Axis: Four Years of War",
            "The Grand Alliance",
            "The Axis",
            [
                new ComparisonRow(
                    "s8_comparison_row_war_aims",
                    "War aims: unconditional surrender and liberation compared with conquest and racial empire",
                    "The Allies demanded the unconditional surrender of the Axis and proclaimed the liberation of the peoples under Axis occupation.",
                    "Germany and Japan fought for conquest, living space, and racial empire over the peoples they subdued, and surrender was never part of their design.",
                    false,
                ),
                new ComparisonRow(
                    "s8_comparison_row_command",
                    "Command arrangements: combined chiefs and coalition theater commands compared with divided national commands",
                    "The Allies created combined chiefs of staff and coalition theater commands that coordinated strategy, shipping, and production across nations and oceans.",
                    "Germany and Japan kept divided national commands that shared no equivalent machinery and rarely coordinated campaigns with each other.",
                    false,
                ),
                new ComparisonRow(
                    "s8_comparison_row_colonies",
                    "Mobilization of colonies: India, West Africa, and the Philippines compared with the exploitation of occupied Europe",
                    "Britain drew soldiers, labor, and raw materials from India and West Africa, the United States from the Philippines, and both spoke of eventual self-rule.",
                    "Germany and Japan extracted forced labor, food, and raw materials from occupied Europe and Asia without any promise of return.",
                    false,
                ),
                new ComparisonRow(
                    "s8_comparison_row_subject_populations",
                    "Treatment of subject populations: liberation compared with occupation and forced labor",
                    "Allied war aims, repeated in the Atlantic Charter and the United Nations Declaration, spoke of liberation and of the right of peoples to choose their governments.",
                    "Axis occupation meant forced labor, requisition, terror, and, in the Holocaust, the murder of millions of Jews and other targeted peoples.",
                    false,
                ),
                new ComparisonRow(
                    "s8_comparison_row_industrial_strategy",
                    "Industrial strategy: mass production of carriers, landing craft, and trucks compared with prestige weapons and synthetic fuel",
                    "The American and Soviet war economies counted victory in carriers, landing craft, trucks, and standardized tanks produced by the tens of thousands.",
                    "Germany built prestige weapons and synthetic fuel plants while Japan scattered its production, and both lacked the shipping and vehicles to supply their fronts.",
                    false,
                ),
                new ComparisonRow(
                    "s8_comparison_row_economies",
                    "Mobilization of entire economies: state direction of production, rationing, and manpower in every belligerent",
                    "The Allied governments directed production, rationed food and fuel, and allocated labor to war industries in every member state.",
                    "The Axis governments subjected their own economies to the same rationing, production quotas, and manpower controls for the war effort.",
                    true,
                ),
                new ComparisonRow(
                    "s8_comparison_row_propaganda",
                    "Propaganda and censorship: official campaigns to shape opinion and silence dissent",
                    "Allied governments ran information agencies, censored the press, and produced posters and films to sustain the war effort at home.",
                    "Axis governments used propaganda ministries, censorship, and terror to enforce conformity and to present the war as a struggle for national survival.",
                    true,
                ),
                new ComparisonRow(
                    "s8_comparison_row_conscription",
                    "Conscription of millions: mass armies on a scale without precedent",
                    "The Allies conscripted tens of millions of men into armed forces and war industries across the world.",
                    "Germany and Japan conscripted their own peoples and drove the subject peoples of the territories they conquered into labor and service.",
                    true,
                ),
                new ComparisonRow(
                    "s8_comparison_row_bombing",
                    "Civilian bombing campaigns: cities as targets on every side",
                    "The Allies bombed German and Japanese cities from the air, killing hundreds of thousands of civilians and destroying whole urban districts.",
                    "Germany bombed British and Soviet cities and Japan bombed Chinese cities, and each side justified the attacks as a means to break the enemy's will.",
                    true,
                ),
                new ComparisonRow(
                    "s8_comparison_row_global_scale",
                    "A war on a global scale that dwarfed 1914-1918: every continent and ocean drawn into the fighting",
                    "The Allies fought in Europe, Africa, Asia, and the Pacific, and their economies and colonies were bound into a single world war.",
                    "Germany and Japan fought from the Atlantic to the Pacific, and in every theater millions of civilians were killed, displaced, or reduced to famine.",
                    true,
                ),
            ],
        );
    }

    public override getContinuityChangeDefinition(): ContinuityChangeDefinition | null {
        return null;
    }

    public override getArgumentDefinition(): ArgumentDefinition | null {
        return null;
    }

    public override getRelationshipPromptTexts(): string[] {
        return [];
    }

    public override getTestimonyRecords(): TestimonyRecord[] {
        return [];
    }

    public override getDebriefQuestionPrompts(): string[] {
        return Rubrics.getRubricItemsForScenario(8).map((rubricItem) => rubricItem.promptText);
    }

    public override getJournalPrompts(): string[] {
        return [
            "The Grand Alliance joined a liberal democracy, a maritime empire, and a communist dictatorship, while the Axis powers fought as divided national commands: how did the Allies hold their coalition together, and how much should coordination be credited for their victory?",
            "Compare how the Grand Alliance and the Axis conducted the war between 1941 and 1945 across at least three of these features: war aims, command, colonial mobilization, treatment of subject peoples, and industrial strategy.",
            "President Truman used atomic bombs on Hiroshima and Nagasaki: explain how this decision fits into the comparison of how governments conducted total war, addressing at least one counterargument.",
        ];
    }

    public override supportsDiplomaticPlay(): boolean {
        return false;
    }

    public override supportsTimelineScrubber(): boolean {
        return false;
    }

    public override supportsProductionQueue(): boolean {
        return true;
    }

    public override supportsDivisionDesigner(): boolean {
        return true;
    }

    public override getContentAdvisoryNote(): string {
        return "This scenario presents total war between 1941 and 1945, including civilian suffering and the Holocaust, and treats these events through historical documentation and testimony in an educational manner.";
    }

    public override registerInitialState(gameState: GameState): void {
        WorldState1900.registerInitialWorldIntoGameState(gameState);
        if (gameState.getNation("soviet_union") === null) {
            gameState.registerNation(
                new Nation(
                    Nations.SOVIET_UNION.identifier,
                    Nations.SOVIET_UNION.displayName,
                    Nations.SOVIET_UNION.nationCode,
                    Nations.SOVIET_UNION.primaryColorHex,
                    Nations.SOVIET_UNION.accentColorHex,
                    "prov_moscow",
                ),
            );
        }
        gameState.setScenarioIdentifier(this.getSystemName());
        gameState.setPlayerNationIdentifier("united_states");
        gameState.setResourceQuantity(ResourceType.PRODUCTION, 70);
        gameState.setResourceQuantity(ResourceType.MANPOWER, 95000);
        gameState.setResourceQuantity(ResourceType.IDEOLOGY, 55);
        gameState.setResourceQuantity(ResourceType.SUPPORT, 60);
        gameState.setResourceQuantity(ResourceType.TECHNOLOGY, 55);
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        for (const playableSystem of this.playableSystems) {
            playableSystem.simulateTurn(turnNumber, gameState);
        }
    }

    public override evaluateVictory(gameState: GameState): ScenarioEvaluationResult {
        const flagStatus = this.collectFlagStatus(gameState, [
            {
                flagIdentifier: "comparison_s8_complete",
                flagDescription: "Comparison completed: The Grand Alliance and the Axis: Four Years of War",
            },
            {
                flagIdentifier: "coalition_s8_held",
                flagDescription:
                    "The Grand Coalition held: at least two Allied nations allied to each other, or none at war with each other",
            },
        ]);
        return new ScenarioEvaluationResult(
            8,
            flagStatus.satisfiedCount === 2,
            flagStatus.satisfiedCount,
            2,
            flagStatus.satisfiedCriteria,
            flagStatus.unmetCriteria,
        );
    }
}
