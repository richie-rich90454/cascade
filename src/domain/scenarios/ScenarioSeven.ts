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
    ArgumentDefinition,
    CausalChainDefinition,
    ComparisonDefinition,
    ComparisonRow,
    ContinuityChangeDefinition,
    DecisionOption,
    DecisionRecord,
    FocusNodeDefinition,
    FocusTreeDefinition,
    Scenario,
    ScenarioEvaluationResult,
    ScenarioEventRecord,
    TestimonyRecord,
} from "./Scenario";
import { ArtSystem } from "./systems/ArtSystem";
import { ColonialMobilizationSystem } from "./systems/ColonialMobilizationSystem";
import { CommunistIdeologySystem } from "./systems/CommunistIdeologySystem";
import { FascistIdeologySystem } from "./systems/FascistIdeologySystem";
import { HomeMobilizationSystem } from "./systems/HomeMobilizationSystem";
import { MediaSystem } from "./systems/MediaSystem";
import { NationalismSystem } from "./systems/NationalismSystem";
import { PropagandaSystem } from "./systems/PropagandaSystem";
import { TotalitarianRepressionSystem } from "./systems/TotalitarianRepressionSystem";

export class ScenarioSeven extends Scenario {
    private readonly playableSystems: GameSystem[];

    constructor() {
        super("scenario_seven_the_storm_breaks");
        this.playableSystems = [
            new FascistIdeologySystem(),
            new CommunistIdeologySystem(),
            new TotalitarianRepressionSystem(),
            new ChurchillPath(),
            new RooseveltPath(),
            new HitlerPath(),
            new StalinPath(),
            new PropagandaSystem(),
            new ArtSystem(),
            new MediaSystem(),
            new NationalismSystem(),
            new HomeMobilizationSystem(),
            new ColonialMobilizationSystem(),
        ];
    }

    public override getScenarioNumber(): number {
        return 7;
    }

    public override getScenarioTitle(): string {
        return "The Storm Breaks";
    }

    public override getScenarioSubtitle(): string {
        return "1939-1941";
    }

    public override getStartYear(): number {
        return 1939;
    }

    public override getEndYear(): number {
        return 1941;
    }

    public override getDurationInMinutes(): number {
        return 60;
    }

    public override getTurnCount(): number {
        return 10;
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
        return ["Great Britain (Churchill)", "United States (Roosevelt)", "Germany (Hitler)", "USSR (Stalin)"];
    }

    public override getBriefingParagraphs(): string[] {
        return [
            "In September 1939 the German invasion of Poland ended the twenty-year armistice of Versailles. Within two years the war reached from the Atlantic to the approaches of Moscow and across every ocean, drawing in the British Empire, the Soviet Union, and at last the United States. This was total war on a scale that dwarfed 1914-1918: whole societies were conscripted, whole economies were directed, and the line between soldier and civilian eroded.",
            "The four great belligerents fought the same war in radically different ways. Germany and the Soviet Union organized their peoples through single-party rule, mass propaganda, and terror. Great Britain and the United States mobilized free societies through parliament, broadcast, and private industry, though both conscripted their citizens and both directed their economies once the emergency came.",
            "Yet the methods converged as the war demanded more. Every government rationed, conscripted, censored, and planned; every government asked its people to endure losses without precedent. The differences lay in ideology and political structure; the similarities lay in the totality of the effort and in the scale of the war itself.",
            "Your task across four perspectives is to compare the ways of war, to complete the Four Ways of War focus tree, to record the great decisions of Churchill, Roosevelt, Hitler, and Stalin, and to judge how far the differences between dictatorship and democracy shaped the war that broke the old world.",
        ];
    }

    public override getObjectiveSummaries(): string[] {
        return [
            "Compare how Germany, the Soviet Union, Great Britain, and the United States mobilized their societies and economies for total war.",
            "Complete the Four Ways of War focus tree for all four perspectives.",
            "Record the decisions of 1940 and 1941: Britain's refusal to yield, America's turn to the arsenal of democracy, Germany's drive for living space, and the Soviet Union's patriotic war.",
            "Complete the comparison chart on the four ways of war and write an SAQ on how the conduct of the war supports, modifies, or refutes the term total war.",
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
        return new FocusTreeDefinition("Four Ways of War", [
            new FocusNodeDefinition(
                "focus_s7_churchill",
                "The Finest Hour",
                "After the fall of France in June 1940, Winston Churchill led a Britain standing alone, refusing any negotiated peace with Germany. His speeches framed the struggle as a defense of civilization itself.",
                "Committing to the Churchill path raises British support and stability from turn 3 as the empire rallies to fight on.",
                [],
                "",
                0,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s7_roosevelt",
                "The Arsenal of Democracy",
                "Franklin D. Roosevelt moved the United States from neutrality toward material support for Britain, arguing in 1940 that American industry must become the arsenal of democracy.",
                "Choosing the Roosevelt path converts American neutrality into small economic gains through turn 4 and then into production and support for the coalition.",
                [],
                "",
                1,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s7_hitler",
                "The Struggle for Living Space",
                "Adolf Hitler drove Germany toward war to win living space in the east, pairing rearmament and Blitzkrieg with the racial and political terror of the Nazi state.",
                "The Hitler path raises German production and supply but erodes German stability from turn 8 as the war turns against the Reich.",
                [],
                "",
                2,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s7_stalin",
                "The Great Patriotic War",
                "After the German invasion of June 1941, Joseph Stalin called the struggle the Great Patriotic War, mobilizing the Soviet peoples and demanding production and manpower at any cost.",
                "The Stalin path adds Soviet manpower and production while the mobilization drains public support after turn 6.",
                [],
                "",
                3,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s7_arsenal_of_democracy",
                "Lend-Lease to the Allies",
                "The Lend-Lease Act of March 1941 made American factories and farms the supply depot of the Allied war effort before the United States itself entered the fighting.",
                "Completing the arsenal node converts American industry into a sustained flow of production and support for the coalition.",
                ["focus_s7_roosevelt"],
                "",
                1,
                1,
            ),
            new FocusNodeDefinition(
                "focus_s7_total_war_economy",
                "The Total War Economy",
                "Germany answered the failure of Blitzkrieg before Moscow by driving its economy toward total mobilization under state direction.",
                "Completing the total war economy node presses German production upward while German stability continues to erode.",
                ["focus_s7_hitler"],
                "",
                2,
                1,
            ),
        ]);
    }

    public override getPrimarySourceIdentifiers(): string[] {
        return [
            "churchill_blood_toil_tears_and_sweat",
            "roosevelt_arsenal_of_democracy_1940",
            "goebbels_total_war_sportpalast_1943",
            "stalin_radio_address_1941",
        ];
    }

    public override getDecisionRecords(): DecisionRecord[] {
        return [
            new DecisionRecord(
                "s7_decision_finest_hour",
                "The Finest Hour",
                "In May 1940 the German armies broke through the Ardennes and drove the British Expeditionary Force to the sea at Dunkirk. Winston Churchill, prime minister for a month, faced the choice that defined his premiership: seek terms with Hitler through neutral intermediaries, or fight on with the empire and whatever help the New World might send.",
                "The fall of France and the failure of the Norwegian campaign destroyed the policy of appeasement and brought Churchill to power; the question of a negotiated peace followed directly from military catastrophe.",
                "Churchill's refusal to yield stands against the alternatives of 1940 in occupied Europe, yet it resembles Stalin's refusal to quit under the invasion of 1941: both leaders made survival itself the aim of the war.",
                "What continued was Britain's reliance on its empire and, increasingly, on American industry; what changed was the collapse of the continental balance and the island's refusal to treat defeat as settled.",
                "Churchill's speeches survive as both policy and persuasion, spoken to stiffen his own public at home and to move opinion in Washington; they record what Britain wished America to hear.",
                [
                    new DecisionOption(
                        "s7_churchill_option_fight_on",
                        "Fight on alone and refuse any negotiated peace.",
                        "Britain stands alone through the Battle of Britain, the empire rallies, and the cause of resistance survives the fall of France.",
                        "path_s7_churchill",
                        ResourceType.SUPPORT.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s7_churchill_option_negotiate",
                        "Explore peace terms through neutral intermediaries.",
                        "A negotiated settlement might spare the cities, but it abandons the occupied nations of Europe and invites demands that grow with every concession.",
                        "path_s7_churchill_deferred",
                        ResourceType.SUPPORT.getCode(),
                        -5,
                    ),
                    new DecisionOption(
                        "s7_churchill_option_empire_first",
                        "Hold the empire first and fight a defensive war outward from Egypt and India.",
                        "The imperial lifeline is secured, but Britain's capacity to strike at Europe stays limited for another year.",
                        "path_s7_churchill_deferred",
                        ResourceType.IDEOLOGY.getCode(),
                        3,
                    ),
                ],
            ),
            new DecisionRecord(
                "s7_decision_arsenal_of_democracy",
                "The Arsenal of Democracy",
                "Through 1940 the United States watched the fall of France from behind its neutrality laws. Franklin D. Roosevelt, elected to a third term during that year, offered Britain destroyers for bases, pressed the cash-and-carry trade, and called on American industry to become the arsenal of democracy, yet the country would not yet enter the war.",
                "The German victories of 1940 destroyed the assumption that Britain could hold the Atlantic alone, and American policy had to choose between strict isolation and a material alliance short of war.",
                "Roosevelt's method resembles Churchill's in its use of rhetoric to prepare a free people for war, but it differs in being the policy of a neutral power arming the cause while refusing the fight.",
                "What continued was America's reluctance to shed blood in Europe; what changed was the abandonment of strict neutrality as the arsenal of democracy began to supply Britain.",
                "Roosevelt's speeches were addressed to a divided public, so they must be read as persuasion first and as doctrine second.",
                [
                    new DecisionOption(
                        "s7_roosevelt_option_industrial_arsenal",
                        "Commit industry to the Allies short of war and become the arsenal of democracy.",
                        "American factories begin arming Britain while the country stays formally neutral, and the Allies gain the resources to survive until America enters.",
                        "path_s7_roosevelt",
                        ResourceType.PRODUCTION.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s7_roosevelt_option_strict_neutrality",
                        "Keep strict neutrality and keep America out of the war.",
                        "The country avoids the fighting, but the Allies face the Axis with what they can produce alone.",
                        "path_s7_roosevelt_deferred",
                        ResourceType.SUPPORT.getCode(),
                        -3,
                    ),
                    new DecisionOption(
                        "s7_roosevelt_option_hemisphere_first",
                        "Defend the hemisphere first and let Europe settle its own war.",
                        "The Americas are shielded from the Atlantic war, and Britain goes to the wall without American ships and supplies.",
                        "path_s7_roosevelt_deferred",
                        ResourceType.TECHNOLOGY.getCode(),
                        2,
                    ),
                ],
            ),
            new DecisionRecord(
                "s7_decision_living_space",
                "The Struggle for Living Space",
                "In 1941 the German armies stood at the Channel, in the Balkans, and in North Africa, and Hitler turned east. The conquest of the Soviet Union, he believed, would win the land and resources to make Germany a world power and complete the racial order at home. The choice was where to strike and how completely to bind the war to the idea of living space.",
                "Fascist ideology made eastern conquest the purpose of the war; the farms and oil of Ukraine and the Caucasus were the prize that would let Germany outlast a maritime blockade.",
                "Hitler's war of annihilation in the east reflected a fascist ideology of race and space, while Stalin's system reflected a communist ideology of class; both used ideology to claim the whole of their peoples' labor and lives.",
                "The old ambition of expansion in the east continued from the First World War; what changed was the total, racialized character of the campaign that began in June 1941.",
                "The decision survives in the orders of the war machine itself, written to justify the occupation and exploitation of conquered peoples, and it must be read as evidence of intent.",
                [
                    new DecisionOption(
                        "s7_hitler_option_barbarossa",
                        "Turn east and conquer living space in the Soviet Union.",
                        "Operation Barbarossa opens the largest front in history, and the German war economy is bound to a conquest it may not be able to digest.",
                        "path_s7_hitler",
                        ResourceType.PRODUCTION.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s7_hitler_option_mediterranean",
                        "Strike south through the Mediterranean and the Middle East first.",
                        "The routes to Suez and the oil of the Middle East become the war's center, and the eastern settlement waits.",
                        "path_s7_hitler_deferred",
                        ResourceType.PRODUCTION.getCode(),
                        3,
                    ),
                    new DecisionOption(
                        "s7_hitler_option_consolidate",
                        "Consolidate the conquests already held before launching new offensives.",
                        "Occupied Europe is organized by force, but the initiative passes to the Allies, who grow stronger across the Atlantic.",
                        "path_s7_hitler_deferred",
                        ResourceType.SUPPORT.getCode(),
                        -3,
                    ),
                ],
            ),
            new DecisionRecord(
                "s7_decision_great_patriotic_war",
                "The Great Patriotic War",
                "On June 22, 1941, more than three million German and Axis soldiers crossed the Soviet frontier. Joseph Stalin at first withdrew into silence, then spoke to the nation in July as the German armies drove toward Moscow. He had to decide how to mobilize a state whose regime had impoverished and terrorized its own people in the name of transforming it.",
                "The Non-Aggression Pact of 1939 had bought the Soviet Union twenty-two months of time and territory; the German decision to invade converted Soviet industry and manpower into the deciding assets of the European war.",
                "Stalin's mobilization by decree stands against Roosevelt's mobilization by production and persuasion, yet both turned the war into an industrial contest at continental scale.",
                "What continued was the one-party state and its apparatus of control; what changed was that the war was proclaimed a patriotic struggle that embraced the traditions of the old Russia.",
                "Stalin's radio address of 1941 speaks to a population he addressed as brothers and sisters, a register chosen for a moment of catastrophe, and it shows how the regime wished its emergency to be heard.",
                [
                    new DecisionOption(
                        "s7_stalin_option_great_patriotic_war",
                        "Call the nation to the Great Patriotic War.",
                        "The Soviet peoples are mobilized for total defense, and manpower and production flow to the front at enormous cost.",
                        "path_s7_stalin",
                        ResourceType.MANPOWER.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s7_stalin_option_party_first",
                        "Rely on the party apparatus and the security services to hold the state together.",
                        "The regime tightens its control and disciplines the army, but initiative at the front suffers under political oversight.",
                        "path_s7_stalin_deferred",
                        ResourceType.IDEOLOGY.getCode(),
                        3,
                    ),
                    new DecisionOption(
                        "s7_stalin_option_scorched_defense",
                        "Trade space for time, whatever the price to the population.",
                        "The retreat buys time and leaves a wake of destruction that falls hardest on the civilians it is meant to protect.",
                        "path_s7_stalin_deferred",
                        ResourceType.SUPPORT.getCode(),
                        -4,
                    ),
                ],
            ),
            new DecisionRecord(
                "s7_decision_war_of_ideologies",
                "The War of Ideologies",
                "By 1941 the four great belligerents each claimed to represent a different future for humanity. Germany and the Soviet Union had signed a pact in 1939 and then fallen upon each other in 1941, while Britain and the United States stood for a liberal order neither had fully realized at home. Every observer of the war had to decide what the war was really about.",
                "The total claims of fascism, communism, and democracy made the war a contest of ideas as much as of armies, and each government worked to define the conflict in a way that justified its demands.",
                "Comparison reveals shared methods — mobilization, propaganda, conscription, and direction of economies — beneath opposed ideologies, a pattern that tests any account of the war as a simple clash of systems.",
                "The ideological contest continued the long argument over political order that had run since 1917; what changed was that the war made the argument total.",
                "The speeches of all four leaders take the meaning of the war as their subject, and each must be read as an argument made for a particular audience rather than a neutral description.",
                [
                    new DecisionOption(
                        "s7_ideology_option_similarities",
                        "Emphasize the similarities in how the belligerents conducted the war.",
                        "The common methods of total war stand out: whole societies mobilized, propaganda everywhere, conscription everywhere, and economies directed by the state.",
                        "factor_s7_ideology_similarities",
                        ResourceType.IDEOLOGY.getCode(),
                        4,
                    ),
                    new DecisionOption(
                        "s7_ideology_option_differences",
                        "Emphasize the differences between dictatorships and democracies at war.",
                        "The distance between terror and consent stands out: votes, courts, and open argument on one side, and camps, censorship, and the leader's will on the other.",
                        "factor_s7_ideology_differences",
                        ResourceType.SUPPORT.getCode(),
                        4,
                    ),
                ],
            ),
        ];
    }

    public override getScenarioEventSchedule(): ScenarioEventRecord[] {
        return [
            new ScenarioEventRecord(
                1,
                "invasion_of_poland",
                "GERMAN ARMIES INVADE POLAND; BLITZKRIEG OPENS THE WAR IN EUROPE",
                "newspaper_masthead_germany",
                "GER",
                "event_invasion_poland",
            ),
            new ScenarioEventRecord(
                2,
                "phoney_war",
                "PHONEY WAR: FRANCE AND BRITAIN MOBILIZE WHILE THE WESTERN FRONT STAYS QUIET",
                "newspaper_masthead_france",
                "FRA",
                "event_trench_warfare",
            ),
            new ScenarioEventRecord(
                3,
                "dunkirk",
                "ALLIED ARMIES EVACUATED FROM DUNKIRK; BRITAIN VOWS TO FIGHT ON",
                "newspaper_masthead_britain",
                "ENG",
                "event_dunkirk",
            ),
            new ScenarioEventRecord(
                4,
                "battle_of_britain",
                "LUFTWAFFE MET OVER LONDON AS THE BATTLE OF BRITAIN RAGES",
                "newspaper_masthead_britain",
                "ENG",
                "event_battle_britain",
            ),
            new ScenarioEventRecord(
                5,
                "tripartite_pact",
                "TRIPARTITE PACT BINDS GERMANY, ITALY, AND JAPAN TO A NEW ORDER",
                "newspaper_masthead_japan",
                "JAP",
                "event_munich_conference",
            ),
            new ScenarioEventRecord(
                6,
                "operation_barbarossa",
                "GERMANY INVADES THE SOVIET UNION; OPERATION BARBAROSSA BEGINS",
                "newspaper_masthead_ussr",
                "SOV",
                "event_operation_barbarossa",
            ),
            new ScenarioEventRecord(
                7,
                "atlantic_charter",
                "CHURCHILL AND ROOSEVELT PROCLAIM THE ATLANTIC CHARTER",
                "newspaper_masthead_usa",
                "USA",
                "event_united_nations",
            ),
            new ScenarioEventRecord(
                8,
                "lend_lease",
                "LEND-LEASE ACT TURNS AMERICAN INDUSTRY INTO THE ARSENAL OF DEMOCRACY",
                "newspaper_masthead_usa",
                "USA",
                "event_new_deal",
            ),
            new ScenarioEventRecord(
                9,
                "german_declaration_of_war_on_usa",
                "GERMANY DECLARES WAR ON THE UNITED STATES",
                "newspaper_masthead_germany",
                "GER",
                "event_munich_conference",
            ),
            new ScenarioEventRecord(
                10,
                "pearl_harbor",
                "JAPAN ATTACKS PEARL HARBOR; THE UNITED STATES ENTERS THE WAR",
                "newspaper_masthead_usa",
                "USA",
                "event_pearl_harbor",
            ),
        ];
    }

    public override getCausalChainDefinitions(): CausalChainDefinition[] {
        return [];
    }

    public override getComparisonDefinition(): ComparisonDefinition | null {
        return new ComparisonDefinition(
            "Four Ways of Waging Total War",
            "Germany and the Soviet Union",
            "Great Britain and the United States",
            [
                new ComparisonRow(
                    "s7_comparison_row_propaganda_cult",
                    "Political propaganda and the cult of the leader",
                    "Fascist Germany fused propaganda with a cult of the leader and the race, and the communist Soviet Union fused it with the cult of Stalin and the party.",
                    "Democratic Britain and America used broadcast, film, and the press to rally free publics, but their leaders remained contested figures answerable to voters.",
                    false,
                ),
                new ComparisonRow(
                    "s7_comparison_row_colonial_mobilization",
                    "Mobilization of colonies and former colonies for the war effort",
                    "Germany and the Soviet Union pressed the peoples of occupied Europe or of their own regions into labor and military service under central direction.",
                    "Britain and the United States drew on colonial and hemispheric manpower and resources, from India and Africa to the Philippines and Latin America.",
                    false,
                ),
                new ComparisonRow(
                    "s7_comparison_row_repression",
                    "Repression of basic freedoms",
                    "Fascist and communist states extended terror, deportation, and the camp system over their own and conquered populations, punishing dissent as treason.",
                    "Democratic states censored the press, interned suspect groups, and limited speech under emergency powers, though elections and courts endured.",
                    false,
                ),
                new ComparisonRow(
                    "s7_comparison_row_ideology_resources",
                    "Ideology used to mobilize all state resources",
                    "Fascism and communism claimed to fulfill the destiny of race or class, making the individual's total sacrifice to the state a moral duty.",
                    "Democracy mobilized its peoples through the language of freedom and rights, demanding sacrifice for a way of life rather than a racial or class mission.",
                    false,
                ),
                new ComparisonRow(
                    "s7_comparison_row_industry_direction",
                    "Direction of industry and labor for war production",
                    "Fascist and communist economies set production targets by state plan or decree, binding factories and workers to the war machine.",
                    "Democratic economies converted private industry through contracts, priorities, and rationing, preserving private ownership under government direction.",
                    false,
                ),
                new ComparisonRow(
                    "s7_comparison_similarity_propaganda",
                    "Political propaganda and the cult of the leader",
                    "All four powers used propaganda on an unprecedented scale, and all four presented the war as a struggle for their people's survival.",
                    "All four leaders addressed their nations as the voice of the cause, and all four governments took control of the news their publics received.",
                    true,
                ),
                new ComparisonRow(
                    "s7_comparison_similarity_colonial_mobilization",
                    "Mobilization of colonies and former colonies for the war effort",
                    "All four mobilized whole societies, drawing soldiers, workers, and supplies from every region and people their power could reach.",
                    "All four carried the war's demands across oceans and continents, and all four taught subject peoples to expect a share in the peace.",
                    true,
                ),
                new ComparisonRow(
                    "s7_comparison_similarity_repression",
                    "Repression of basic freedoms",
                    "All four conscripted their peoples and punished those who refused the state's demands, whether by camp, prison, or military tribunal.",
                    "All four restricted free expression in the name of military necessity and treated dissent as disloyalty.",
                    true,
                ),
                new ComparisonRow(
                    "s7_comparison_similarity_ideology_resources",
                    "Ideology used to mobilize all state resources",
                    "All four justified total sacrifice with an ideology, each insisting that its cause — race, class, or freedom — deserved the last measure of devotion.",
                    "All four claimed that the war would decide the future of civilization itself, and all four asked their peoples to believe it.",
                    true,
                ),
                new ComparisonRow(
                    "s7_comparison_similarity_industry_direction",
                    "Direction of industry and labor for war production",
                    "All four directed their economies toward war production, and all four fought total wars whose scale dwarfed 1914-1918.",
                    "All four made industry, science, and labor serve the front, so that no major belligerent left its war economy to the market alone.",
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
        return Rubrics.getRubricItemsForScenario(7).map((rubricItem) => rubricItem.promptText);
    }

    public override getJournalPrompts(): string[] {
        return [
            "Compare the four ways of war: which method of conducting the war — propaganda, colonial and home mobilization, repression, ideology, or direction of industry — shows the greatest difference between Germany and the Soviet Union on one side and Great Britain and the United States on the other?",
            "Explain how the claims of Churchill, Roosevelt, Hitler, and Stalin in 1940 and 1941 support, modify, or refute the argument that the Second World War was a single total war fought by the same methods everywhere.",
            'Prepare for the Socratic seminar on "The Century of Total War" by Richard P. Tucker: state the author\'s argument, evaluate the evidence he uses, and bring additional evidence from the conduct of the four powers between 1939 and 1941 that supports or refutes him.',
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
        return "This scenario presents the terror, repression, and mass violence of the Second World War, including the conduct of totalitarian regimes, in factual historical and educational terms.";
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
        gameState.setPlayerNationIdentifier("british_empire");
        gameState.setResourceQuantity(ResourceType.PRODUCTION, 55);
        gameState.setResourceQuantity(ResourceType.MANPOWER, 85000);
        gameState.setResourceQuantity(ResourceType.IDEOLOGY, 50);
        gameState.setResourceQuantity(ResourceType.SUPPORT, 45);
        gameState.setResourceQuantity(ResourceType.TECHNOLOGY, 45);
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        for (const playableSystem of this.playableSystems) {
            playableSystem.simulateTurn(turnNumber, gameState);
        }
    }

    public override evaluateVictory(gameState: GameState): ScenarioEvaluationResult {
        const flagStatus = this.collectFlagStatus(gameState, [
            {
                flagIdentifier: "comparison_s7_complete",
                flagDescription: "Comparison completed: Four Ways of Waging Total War",
            },
            {
                flagIdentifier: "socratic_seminar_s7_saved",
                flagDescription: "Socratic seminar saved: The Century of Total War",
            },
        ]);
        const isVictory = flagStatus.satisfiedCount === 2;
        return new ScenarioEvaluationResult(
            7,
            isVictory,
            flagStatus.satisfiedCount,
            2,
            flagStatus.satisfiedCriteria,
            flagStatus.unmetCriteria,
        );
    }
}
