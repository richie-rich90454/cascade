import type { GameState } from "../../core/GameState";
import { GameSystem } from "../../core/GameSystem";
import { Rubrics } from "../../data/Rubrics";
import { LearningObjective } from "../../types/LearningObjective";
import { ReasoningProcess } from "../../types/ReasoningProcess";
import { ResourceType } from "../../types/ResourceType";
import { SuggestedSkill } from "../../types/SuggestedSkill";
import { ThematicFocus } from "../../types/ThematicFocus";
import { WorldState1900 } from "../WorldState1900";
import {
    ArgumentDefinition,
    CausalChainDefinition,
    ComparisonDefinition,
    ContinuityChangeDefinition,
    ContinuityChangeMarker,
    DecisionOption,
    DecisionRecord,
    FocusTreeDefinition,
    Scenario,
    ScenarioEvaluationResult,
    ScenarioEventRecord,
    TestimonyRecord,
} from "./Scenario";
import { ArtSystem } from "./systems/ArtSystem";
import { ColonialMobilizationSystem } from "./systems/ColonialMobilizationSystem";
import { ColonialTroopSystem } from "./systems/ColonialTroopSystem";
import { ConscriptionSystem } from "./systems/ConscriptionSystem";
import { HomeMobilizationSystem } from "./systems/HomeMobilizationSystem";
import { IndustrialMobilizationSystem } from "./systems/IndustrialMobilizationSystem";
import { MediaSystem } from "./systems/MediaSystem";
import { NationalismSystem } from "./systems/NationalismSystem";
import { PropagandaSystem } from "./systems/PropagandaSystem";

export class ScenarioThree extends Scenario {
    private static readonly METHOD_FLAG_IDENTIFIERS: string[] = [
        "method_s3_propaganda",
        "method_s3_art",
        "method_s3_media",
        "method_s3_conscription",
        "method_s3_colonial_troops",
        "method_s3_industrial_mobilization",
        "method_s3_home_mobilization",
    ];

    private readonly playableSystems: GameSystem[];

    constructor() {
        super("scenario_three_the_home_front");
        this.playableSystems = [
            new PropagandaSystem(),
            new ArtSystem(),
            new MediaSystem(),
            new ConscriptionSystem(),
            new ColonialTroopSystem(),
            new IndustrialMobilizationSystem(),
            new HomeMobilizationSystem(),
            new ColonialMobilizationSystem(),
            new NationalismSystem(),
        ];
    }

    public override getScenarioNumber(): number {
        return 3;
    }

    public override getScenarioTitle(): string {
        return "The Home Front";
    }

    public override getScenarioSubtitle(): string {
        return "1914-1918";
    }

    public override getStartYear(): number {
        return 1914;
    }

    public override getEndYear(): number {
        return 1918;
    }

    public override getDurationInMinutes(): number {
        return 60;
    }

    public override getTurnCount(): number {
        return 8;
    }

    public override getThematicFocus(): ThematicFocus {
        return ThematicFocus.TECHNOLOGY_AND_INNOVATION;
    }

    public override getSuggestedSkill(): SuggestedSkill {
        return SuggestedSkill.SKILL_3_B;
    }

    public override getReasoningProcess(): ReasoningProcess {
        return ReasoningProcess.CONTINUITY_AND_CHANGE;
    }

    public override getLearningObjective(): LearningObjective {
        return LearningObjective.OBJECTIVE_C;
    }

    public override getPerspectiveLabels(): string[] {
        return ["Great Britain", "France", "Germany", "Austria-Hungary", "Ottoman Empire", "Russia"];
    }

    public override getBriefingParagraphs(): string[] {
        return [
            "When the great powers went to war in August 1914, most believed the fighting would be short. The German advance was stopped at the Marne, the armies dug in, and by Christmas the trenches ran from the North Sea to the Alps. The war of movement had become a war of attrition.",
            "Fighting such a war demanded more than armies. It demanded the productive and human capacity of whole nations: shells and guns by the millions, food and fuel for the home front, and men to replace the fallen. Between 1914 and 1918 governments developed the methods of total war, from mass conscription and state-directed industry to propaganda, official films, and commissioned war art.",
            "The war also widened. Britain's empire, France's colonies, and the Ottoman and Russian lands drew millions of soldiers into a European war, while submarines, poison gas, tanks, and aircraft changed how battles were fought and how civilians experienced the war.",
            "Your task across six perspectives is to examine how governments used these methods of mobilization, to trace what changed and what continued in the conduct of war between 1900 and 1918, and to analyze the primary sources that recorded the human cost.",
        ];
    }

    public override getObjectiveSummaries(): string[] {
        return [
            "Deploy at least five mobilization methods to sustain the war effort across eight turns.",
            "Complete the Continuity and Change chart tracing the conduct of war from 1900 to 1918.",
            "Analyze at least three primary sources correctly in the source analysis.",
            "Explain how governments used propaganda, conscription, industry, and colonial manpower to conduct total war.",
        ];
    }

    public override getScenarioResourceCodes(): string[] {
        return [
            ResourceType.PRODUCTION.getCode(),
            ResourceType.MANPOWER.getCode(),
            ResourceType.OPINION.getCode(),
            ResourceType.COLONIAL_RESOURCES.getCode(),
            ResourceType.TECHNOLOGY.getCode(),
        ];
    }

    public override getPlayableSystems(): GameSystem[] {
        return this.playableSystems;
    }

    public override getFocusTreeDefinition(): FocusTreeDefinition | null {
        return null;
    }

    public override getPrimarySourceIdentifiers(): string[] {
        return [
            "kitchener_recruitment_poster",
            "women_of_britain_say_go_poster",
            "owen_dulce_et_decorum_est",
            "hindenburg_programme_memorandum",
        ];
    }

    public override getDecisionRecords(): DecisionRecord[] {
        return [
            new DecisionRecord(
                "s3_decision_propaganda",
                "Posters and Proclamations",
                "From the first weeks of the war, governments understood that total war would be won on the home front as much as at the front. Millions of men had to be persuaded to enlist, and millions of families had to be persuaded to endure. Parliamentary recruiting committees, press bureaus, and poster campaigns became the instruments through which the state spoke to the entire nation.",
                "The causes lay in the scale of the war itself: mass armies required mass consent, and as the casualty lists lengthened, appeals to duty and shame had to replace news of easy victory.",
                "Compare the British recruiting poster with the German proclamations and the new official films; each government used the same modern media to address an entire population.",
                "Patriotic appeals are as old as the state itself, but the systematic direction of the press, the poster, and the film by government offices is a change of the war years.",
                "The Kitchener poster and the Women of Britain Say GO poster show official purpose and audience: a government committee speaking to young men through duty, shame, and family feeling.",
                [
                    new DecisionOption(
                        "s3_propaganda_option_official_campaign",
                        "Fund the Parliamentary Recruiting Committee and the official press bureaus.",
                        "The posters and proclamations reach every town; enlistment rises and public opinion rallies behind the war, though the state now manages what the nation reads.",
                        "method_s3_propaganda",
                        ResourceType.OPINION.getCode(),
                        6,
                    ),
                    new DecisionOption(
                        "s3_propaganda_option_local_committees",
                        "Leave recruitment to local committees and private patriotic societies.",
                        "The voluntary societies raise men slowly and the government loses control of its own message, so the mobilization falls short of what total war demands.",
                        "unused_s3_propaganda",
                        ResourceType.OPINION.getCode(),
                        2,
                    ),
                    new DecisionOption(
                        "s3_propaganda_option_free_press",
                        "Allow the press to report the front without official direction.",
                        "Uncensored reports of the trenches spread grief and doubt faster than patriotic appeals can answer, and the recruiting campaign never finds its voice.",
                        "unused_s3_propaganda",
                        ResourceType.OPINION.getCode(),
                        -3,
                    ),
                ],
            ),
            new DecisionRecord(
                "s3_decision_art",
                "Painters and War Artists",
                "Total war demanded not only soldiers and shells but meaning. Governments commissioned painters, sculptors, and illustrators to record the front and present it to the nation. Art became an instrument of the war effort, shaping how civilians at home imagined the trenches.",
                "The casualties of the industrial battlefield made the older heroic imagery of war obsolete, and the state looked to artists to give the war a face that the public could bear.",
                "Compare the official war artists of Britain and France with the soldiers who drew and wrote from the trenches, from Paul Nash to the letters of the Poilu.",
                "Painters have always served patrons of war, but the official commissioning of artists to document a mass war for a mass public is a change of these years.",
                "An official commission tells us what a government wanted the war to look like, while a soldier's sketch tells us what it looked like from the trench.",
                [
                    new DecisionOption(
                        "s3_art_option_official_artists",
                        "Commission official war artists to record the front.",
                        "The exhibitions bring the trenches home to civilians without breaking the nation's will, and the state gains an enduring record of the war it is fighting.",
                        "method_s3_art",
                        ResourceType.OPINION.getCode(),
                        4,
                    ),
                    new DecisionOption(
                        "s3_art_option_academies",
                        "Let the academies continue to paint the old heroic subjects.",
                        "The galleries stay quiet, and the gulf widens between what the public sees on canvas and what the armies endure on the front.",
                        "unused_s3_art",
                        ResourceType.OPINION.getCode(),
                        1,
                    ),
                    new DecisionOption(
                        "s3_art_option_private_painters",
                        "Leave the imagery of the war to private painters and the commercial press.",
                        "Some artists find the war on their own, but the state gains no coherent picture to offer a nation hungry for understanding.",
                        "unused_s3_art",
                        ResourceType.OPINION.getCode(),
                        1,
                    ),
                ],
            ),
            new DecisionRecord(
                "s3_decision_media",
                "The Newspapers and the Films",
                "By 1915 newspapers and the new moving pictures had become the chief ways a nation understood the war. Governments learned to direct both, from the British official films of the Somme to the German press bureaus. Controlling the story of total war became as important as supplying its armies.",
                "The sheer size of the casualty lists and the appetite of a literate public for news forced governments to organize censorship and official media.",
                "Compare the British and German information ministries: both censored the bad news, both fed the public victories, and both learned the same new craft.",
                "Newspapers had covered every war of the century, but the systematic censorship and official film production of the state is a change of the Great War.",
                "Official films are sources with an obvious purpose: they were made to sustain a war effort, and they show what their makers needed the public to believe.",
                [
                    new DecisionOption(
                        "s3_media_option_official_media",
                        "Put the press under the direction of the Ministry of Information and fund official war films.",
                        "The public reads and watches what the state decides it should see; morale holds through the worst seasons, though trust in the printed word is spent to buy it.",
                        "method_s3_media",
                        ResourceType.OPINION.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s3_media_option_free_press",
                        "Let the press operate freely and rely on its patriotism.",
                        "Papers print what they find, including the defeats, and the government discovers it cannot answer bad news it never managed.",
                        "unused_s3_media",
                        ResourceType.OPINION.getCode(),
                        -2,
                    ),
                    new DecisionOption(
                        "s3_media_option_private_films",
                        "Trust private film companies to document the war.",
                        "The commercial films entertain more than they explain, and the state loses its best instrument for reaching a nation that no longer reads long columns.",
                        "unused_s3_media",
                        ResourceType.OPINION.getCode(),
                        1,
                    ),
                ],
            ),
            new DecisionRecord(
                "s3_decision_conscription",
                "The Call of the Country",
                "The volunteer armies of 1914 could not survive the attrition of the trenches. By 1916 Britain, alone among the great powers without peacetime conscription, faced the choice that France and Germany had made long before: to compel service. Total war made the state the master of every man's labor.",
                "The immediate cause was the arithmetic of the front, where trench warfare consumed men faster than volunteers could replace them.",
                "Compare the British Military Service Act of 1916 with the conscription systems of France and Germany, where universal service had existed since the nineteenth century.",
                "Compulsory service continued the older tradition of the nation in arms, but extending it to every able-bodied man and to industry is a change of the war.",
                "A conscription law is a source of state power declared in advance; the recruiting posters that preceded it show how opinion was prepared for compulsion.",
                [
                    new DecisionOption(
                        "s3_conscription_option_compulsory_service",
                        "Pass compulsory military service for all able-bodied men.",
                        "Millions of men pass from the workshops to the army and the trenches are filled again, but the labor pool shrinks and willing service gives way to compulsion.",
                        "method_s3_conscription",
                        ResourceType.MANPOWER.getCode(),
                        -8000,
                    ),
                    new DecisionOption(
                        "s3_conscription_option_volunteers",
                        "Rely on volunteers to fill the ranks.",
                        "The voluntary system cannot keep pace with the losses, and the understrength battalions at the front pay for the homes that were spared the call.",
                        "unused_s3_conscription",
                        ResourceType.OPINION.getCode(),
                        2,
                    ),
                    new DecisionOption(
                        "s3_conscription_option_defer",
                        "Exempt essential workers and postpone the decision.",
                        "The factories keep their skilled men and production holds, but the armies go without replacements through the decisive year.",
                        "unused_s3_conscription",
                        ResourceType.PRODUCTION.getCode(),
                        3,
                    ),
                ],
            ),
            new DecisionRecord(
                "s3_decision_colonial_troops",
                "The Empire Sends Its Sons",
                "The First World War was a war of empires. Britain drew on India, the dominions, and the African colonies; France called on Senegal, Algeria, and Indochina; the Central Powers levied their subject peoples in turn. Total war reached across the oceans for men.",
                "The deadlock in Europe and the bottomless demand of the trenches drove the empires to tap the manpower of their overseas possessions.",
                "Compare the Indian Army, the Senegalese tirailleurs, and the ANZAC divisions: each empire asked its subjects and its settler societies for the same sacrifice under very different terms.",
                "Imperial powers had long used colonial soldiers in colonial wars, but the mass transfer of colonial manpower to the front in Europe is a change of the Great War.",
                "Official histories and recruiting posters show how empires justified the call; the letters and service records of the soldiers show what the call cost.",
                [
                    new DecisionOption(
                        "s3_colonial_troops_option_call_empire",
                        "Call on the dominions, India, and the African colonies for men.",
                        "More than a million colonial subjects and dominion volunteers serve in Europe and the Middle East, and the empire's reserves of manpower hold the front.",
                        "method_s3_colonial_troops",
                        ResourceType.COLONIAL_RESOURCES.getCode(),
                        8,
                    ),
                    new DecisionOption(
                        "s3_colonial_troops_option_home_recruitment",
                        "Keep colonial garrisons at their posts and recruit only at home.",
                        "The colonies remain quiet and the home front bears the whole burden, but the armies lose the manpower the empire could have sent.",
                        "unused_s3_colonial_troops",
                        ResourceType.OPINION.getCode(),
                        2,
                    ),
                    new DecisionOption(
                        "s3_colonial_troops_option_dominions_only",
                        "Accept only volunteers from the settler dominions.",
                        "White dominion troops arrive in steady numbers, yet the vast reserve of the subject empire goes untouched by the war.",
                        "unused_s3_colonial_troops",
                        ResourceType.OPINION.getCode(),
                        1,
                    ),
                ],
            ),
            new DecisionRecord(
                "s3_decision_industrial_mobilization",
                "Factories Under Orders",
                "The shell crisis of 1915 taught every belligerent that total war is fought in the factory as much as in the trench. Germany answered with the Hindenburg Programme, Britain with the Ministry of Munitions; both placed the economy under state orders.",
                "The immediate cause was the shortage of shells and guns at the front and the discovery that private industry alone would not close the gap.",
                "Compare the Hindenburg Programme's munitions targets with the British Ministry of Munitions and the French war industries: different constitutions, one logic of state direction.",
                "Industrial mobilization continued the arms industries of the nineteenth century, but the setting of compulsory production targets for a whole economy is a change.",
                "The Hindenburg memorandum is a source of state intention: it records targets, compulsion, and the confidence of planners who had not yet met the winter of 1917.",
                [
                    new DecisionOption(
                        "s3_industrial_mobilization_option_state_orders",
                        "Place the munitions industry under state orders and targets.",
                        "Shell output doubles and the guns keep firing, though labor is conscripted and the food of the nation is subordinated to the needs of the trenches.",
                        "method_s3_industrial_mobilization",
                        ResourceType.PRODUCTION.getCode(),
                        8,
                    ),
                    new DecisionOption(
                        "s3_industrial_mobilization_option_private_industry",
                        "Leave production targets to private industry.",
                        "Firms fill the contracts they find profitable, and the shortage at the front becomes a crisis the government must answer for.",
                        "unused_s3_industrial_mobilization",
                        ResourceType.OPINION.getCode(),
                        1,
                    ),
                    new DecisionOption(
                        "s3_industrial_mobilization_option_requisition",
                        "Requisition factories without a central plan.",
                        "Each ministry demands what it needs in its own hour, and the confusion wastes the very capacity the state sought to command.",
                        "unused_s3_industrial_mobilization",
                        ResourceType.PRODUCTION.getCode(),
                        -2,
                    ),
                ],
            ),
            new DecisionRecord(
                "s3_decision_home_mobilization",
                "The Whole Nation at Work",
                "Total war turned every kitchen, farm, and workshop into part of the war effort. Women entered the munitions factories, food was rationed, and labor was directed as the state's reach into daily life grew deeper than any government in 1900 could have imagined.",
                "The cause was need: the battles consumed shells, food, and transport faster than the ordinary economy could provide them.",
                "Compare British women in the munitions works with German compulsory labor service and the French employment of women in the war industries.",
                "Women had always worked, but their entry into heavy industry, and the rationing of the national diet by decree, are changes of the Great War.",
                "The Women of Britain Say GO poster is a source of official intention; it tells us how the state framed the war's claim on the whole nation.",
                [
                    new DecisionOption(
                        "s3_home_mobilization_option_whole_nation",
                        "Bring women into the factories and ration the nation's food.",
                        "Women's labor keeps the shells coming and the ration book holds the nation fed, though every household feels the state's hand at the table.",
                        "method_s3_home_mobilization",
                        ResourceType.PRODUCTION.getCode(),
                        6,
                    ),
                    new DecisionOption(
                        "s3_home_mobilization_option_ordinary_labor",
                        "Leave the shops and farms to their ordinary labor.",
                        "The ordinary economy bends but does not break, and the front is told to expect less of everything it asks for.",
                        "unused_s3_home_mobilization",
                        ResourceType.OPINION.getCode(),
                        2,
                    ),
                    new DecisionOption(
                        "s3_home_mobilization_option_charity",
                        "Rely on charitable societies to organize relief.",
                        "Voluntary societies patch the shortages one parish at a time, but no hand directs the labor of the whole nation.",
                        "unused_s3_home_mobilization",
                        ResourceType.OPINION.getCode(),
                        1,
                    ),
                ],
            ),
        ];
    }

    public override getScenarioEventSchedule(): ScenarioEventRecord[] {
        return [
            new ScenarioEventRecord(
                1,
                "trench_warfare_begins",
                "TRENCH WARFARE BEGINS: THE ARMIES DIG IN ACROSS FRANCE",
                "newspaper_masthead_britain",
                "ENG",
                "event_trench_warfare",
            ),
            new ScenarioEventRecord(
                2,
                "poison_gas_used",
                "GERMANY UNLEASHES POISON GAS AT YPRES",
                "newspaper_masthead_germany",
                "GER",
                "event_poison_gas",
            ),
            new ScenarioEventRecord(
                3,
                "unrestricted_submarine_warfare",
                "GERMANY DECLARES THE SEAS A WAR ZONE: ALL SHIPS ARE TARGETS",
                "newspaper_masthead_germany",
                "GER",
                "event_lusitania",
            ),
            new ScenarioEventRecord(
                4,
                "lusitania_sunk",
                "THE LUSITANIA TORPEDOED: AMERICAN LIVES LOST AT SEA",
                "newspaper_masthead_britain",
                "ENG",
                "event_lusitania",
            ),
            new ScenarioEventRecord(
                5,
                "zimmermann_telegram",
                "SECRET TELEGRAM REVEALED: GERMANY PROPOSES ALLIANCE WITH MEXICO",
                "newspaper_masthead_usa",
                "USA",
                "event_zimmermann_telegram",
            ),
            new ScenarioEventRecord(
                6,
                "tank_first_use",
                "BRITISH TANKS BREAK THE GERMAN LINES AT THE SOMME",
                "newspaper_masthead_britain",
                "ENG",
                "event_tank_first_use",
            ),
            new ScenarioEventRecord(
                7,
                "russian_revolution",
                "REVOLUTION IN RUSSIA: THE TSAR IS OVERTHROWN",
                "newspaper_masthead_ussr",
                "RUS",
                "event_russian_revolution",
            ),
            new ScenarioEventRecord(
                8,
                "armistice_1918",
                "ARMISTICE SIGNED: THE GUNS FALL SILENT AFTER FOUR YEARS",
                "newspaper_masthead_france",
                "FRA",
                "event_trench_warfare",
            ),
        ];
    }

    public override getCausalChainDefinitions(): CausalChainDefinition[] {
        return [];
    }

    public override getComparisonDefinition(): ComparisonDefinition | null {
        return null;
    }

    public override getContinuityChangeDefinition(): ContinuityChangeDefinition | null {
        return new ContinuityChangeDefinition("Continuity and Change: The Conduct of War, 1900-1918", 1900, 1918, [
            new ContinuityChangeMarker(
                "s3_marker_conscript_armies",
                "Mass conscript armies",
                1900,
                "continuity",
                "The great powers entered the century with systems of universal military service, and the war of 1914 expanded those systems rather than inventing them.",
            ),
            new ContinuityChangeMarker(
                "s3_marker_defensive_firepower",
                "Defensive firepower and entrenchment",
                1914,
                "continuity",
                "Machine guns, quick-firing artillery, and trench lines made the defensive dominant, extending patterns of firepower that long predated the war.",
            ),
            new ContinuityChangeMarker(
                "s3_marker_state_economy",
                "Government direction of the economy",
                1915,
                "change",
                "States began to set production targets, allocate raw materials, and direct labor, a reach into economic life without precedent in peacetime.",
            ),
            new ContinuityChangeMarker(
                "s3_marker_poison_gas",
                "Poison gas",
                1915,
                "change",
                "Chlorine at Ypres and later mustard gas introduced weapons that industrialized the battlefield, and Owen's poem records their human cost.",
            ),
            new ContinuityChangeMarker(
                "s3_marker_tanks",
                "Tanks",
                1916,
                "change",
                "Armored vehicles first crossed the lines at the Somme, opening a new mechanical form of warfare that would define the century.",
            ),
            new ContinuityChangeMarker(
                "s3_marker_aircraft",
                "Aircraft in warfare",
                1914,
                "change",
                "Aeroplanes moved from reconnaissance experiments to mass-produced instruments of war, scouting and fighting above the trenches.",
            ),
            new ContinuityChangeMarker(
                "s3_marker_colonial_troops",
                "Colonial troops drawn to Europe",
                1914,
                "change",
                "Millions of soldiers from India, Africa, and the dominions served in European theaters, globalizing the war's manpower as never before.",
            ),
            new ContinuityChangeMarker(
                "s3_marker_state_reach",
                "The state's reach into daily life",
                1916,
                "change",
                "Conscription, rationing, and censorship brought the government into kitchens, workplaces, and newspapers to a degree unknown in 1900.",
            ),
            new ContinuityChangeMarker(
                "s3_marker_nationalism",
                "Nationalism sustaining the war effort",
                1914,
                "continuity",
                "National feeling, already a powerful force in 1900, sustained mass mobilization as governments converted patriotic loyalty into endurance.",
            ),
        ]);
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
        return Rubrics.getRubricItemsForScenario(3).map((item) => item.promptText);
    }

    public override getJournalPrompts(): string[] {
        return [
            "How did governments persuade their populations to endure four years of total war? Use evidence from the posters, films, and newspapers you studied.",
            "What did the mobilization of women, colonies, and factories change about the relationship between the state and its people?",
            "Owen asks whether it is sweet and fitting to die for one's country. Using the sources from this scenario, explain how the home front and the trenches answered that question differently.",
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
        return "This scenario presents chemical warfare and mass casualties factually and in historical context for educational purposes.";
    }

    public override registerInitialState(gameState: GameState): void {
        WorldState1900.registerInitialWorldIntoGameState(gameState);
        gameState.setScenarioIdentifier(this.getSystemName());
        gameState.setPlayerNationIdentifier("british_empire");
        gameState.setResourceQuantity(ResourceType.PRODUCTION, 50);
        gameState.setResourceQuantity(ResourceType.MANPOWER, 90000);
        gameState.setResourceQuantity(ResourceType.OPINION, 60);
        gameState.setResourceQuantity(ResourceType.COLONIAL_RESOURCES, 40);
        gameState.setResourceQuantity(ResourceType.TECHNOLOGY, 35);
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        for (const playableSystem of this.playableSystems) {
            playableSystem.simulateTurn(turnNumber, gameState);
        }
    }

    public override evaluateVictory(gameState: GameState): ScenarioEvaluationResult {
        const flagStatus = this.collectFlagStatus(gameState, [
            {
                flagIdentifier: "method_s3_propaganda",
                flagDescription: "Deployed propaganda through Posters and Proclamations",
            },
            { flagIdentifier: "method_s3_art", flagDescription: "Deployed war art through Painters and War Artists" },
            {
                flagIdentifier: "method_s3_media",
                flagDescription: "Deployed official media through The Newspapers and the Films",
            },
            {
                flagIdentifier: "method_s3_conscription",
                flagDescription: "Deployed conscription through The Call of the Country",
            },
            {
                flagIdentifier: "method_s3_colonial_troops",
                flagDescription: "Deployed colonial troops through The Empire Sends Its Sons",
            },
            {
                flagIdentifier: "method_s3_industrial_mobilization",
                flagDescription: "Deployed industrial mobilization through Factories Under Orders",
            },
            {
                flagIdentifier: "method_s3_home_mobilization",
                flagDescription: "Deployed home mobilization through The Whole Nation at Work",
            },
            {
                flagIdentifier: "continuity_chart_s3_complete",
                flagDescription: "Continuity and Change chart for 1900 to 1918 completed",
            },
            {
                flagIdentifier: "sources_s3_three_correct",
                flagDescription: "Three or more primary sources analyzed correctly",
            },
        ]);
        let methodFlagCount = 0;
        for (const methodFlagIdentifier of ScenarioThree.METHOD_FLAG_IDENTIFIERS) {
            if (gameState.isScenarioFlagSet(methodFlagIdentifier)) {
                methodFlagCount += 1;
            }
        }
        const isContinuityChartComplete = gameState.isScenarioFlagSet("continuity_chart_s3_complete");
        const isSourceAnalysisComplete = gameState.isScenarioFlagSet("sources_s3_three_correct");
        const isVictory = methodFlagCount >= 5 && isContinuityChartComplete && isSourceAnalysisComplete;
        return new ScenarioEvaluationResult(
            3,
            isVictory,
            flagStatus.satisfiedCount,
            9,
            flagStatus.satisfiedCriteria,
            flagStatus.unmetCriteria,
        );
    }
}
