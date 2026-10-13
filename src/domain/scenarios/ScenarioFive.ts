import type { GameState } from "../../core/GameState";
import { GameSystem } from "../../core/GameSystem";
import { Rubrics } from "../../data/Rubrics";
import { LearningObjective } from "../../types/LearningObjective";
import { ReasoningProcess } from "../../types/ReasoningProcess";
import { ResourceType } from "../../types/ResourceType";
import { SuggestedSkill } from "../../types/SuggestedSkill";
import { ThematicFocus } from "../../types/ThematicFocus";
import { WorldState1900 } from "../WorldState1900";
import { GreaterEastAsiaCoProsperitySpherePath } from "./paths/GreaterEastAsiaCoProsperitySpherePath";
import { IndianNationalCongressPath } from "./paths/IndianNationalCongressPath";
import { LeagueOfNationsMandatePath } from "./paths/LeagueOfNationsMandatePath";
import { ManchukuoPath } from "./paths/ManchukuoPath";
import { WestAfricanResistancePath } from "./paths/WestAfricanResistancePath";
import {
    ContinuityChangeDefinition,
    ContinuityChangeMarker,
    DecisionOption,
    DecisionRecord,
    FocusNodeDefinition,
    FocusTreeDefinition,
    Scenario,
    ScenarioEvaluationResult,
    ScenarioEventRecord,
} from "./Scenario";
import type { ArgumentDefinition, CausalChainDefinition, ComparisonDefinition, TestimonyRecord } from "./Scenario";
import { AntiImperialResistanceSystem } from "./systems/AntiImperialResistanceSystem";
import { MaintainedControlSystem } from "./systems/MaintainedControlSystem";
import { TerritorialGainSystem } from "./systems/TerritorialGainSystem";

export class ScenarioFive extends Scenario {
    private readonly playableSystems: GameSystem[];

    constructor() {
        super("scenario_five_the_peace_to_end_all_peace");
        this.playableSystems = [
            new MaintainedControlSystem(),
            new TerritorialGainSystem(),
            new AntiImperialResistanceSystem(),
            new LeagueOfNationsMandatePath(),
            new ManchukuoPath(),
            new GreaterEastAsiaCoProsperitySpherePath(),
            new IndianNationalCongressPath(),
            new WestAfricanResistancePath(),
        ];
    }

    public override getScenarioNumber(): number {
        return 5;
    }

    public override getScenarioTitle(): string {
        return "The Peace to End All Peace";
    }

    public override getScenarioSubtitle(): string {
        return "The Settlements of 1919";
    }

    public override getStartYear(): number {
        return 1919;
    }

    public override getEndYear(): number {
        return 1919;
    }

    public override getDurationInMinutes(): number {
        return 45;
    }

    public override getTurnCount(): number {
        return 6;
    }

    public override getThematicFocus(): ThematicFocus {
        return ThematicFocus.GOVERNANCE;
    }

    public override getSuggestedSkill(): SuggestedSkill {
        return SuggestedSkill.SKILL_2_C;
    }

    public override getReasoningProcess(): ReasoningProcess {
        return ReasoningProcess.CONTINUITY_AND_CHANGE;
    }

    public override getLearningObjective(): LearningObjective {
        return LearningObjective.OBJECTIVE_E;
    }

    public override getPerspectiveLabels(): string[] {
        return ["Great Britain", "France", "Japan", "India", "West Africa"];
    }

    public override getBriefingParagraphs(): string[] {
        return [
            "When the guns fell silent in November 1918, the victors of the First World War met in Paris to remake the map of the world. The German colonies were theirs by conquest, the Ottoman Empire was broken, and the language of self-determination had been spoken loudly enough that the victors had to answer it.",
            "Their answer was the mandate system. Under Article 22 of the League Covenant, advanced nations would hold the conquered territories as a sacred trust of civilization, preparing their peoples for eventual self-rule. In practice the mandates extended British and French control over the Middle East and Africa under a new name.",
            "The settlement did not end imperial rivalry; it reorganized it. Japan expanded its claims in China and the Pacific, and the returning victors found their subjects in India, Egypt, and West Africa unwilling to remain patient. The war had raised expectations of self-determination that imperial administration, however reformed, could not satisfy.",
            "Your task across five perspectives is to trace continuity and change in territorial holdings from 1900 to 1925: to see which empires' territories changed hands, which patterns of control persisted, and how the peace of 1919 at once preserved and unsettled the old imperial order.",
        ];
    }

    public override getObjectiveSummaries(): string[] {
        return [
            "Explain how the peace settlements of 1919 redistributed territory through conquest, treaty, and the mandate system.",
            "Describe the continuities in imperial control over subject peoples from 1900 to 1925.",
            "Identify examples of anti-imperial resistance in India and West Africa and explain how imperial states responded.",
            "Complete the Continuity and Change chart for territorial holdings, 1900-1925.",
            "Analyze the Clemenceau letter and complete the quickwrite on the weaknesses of his argument.",
        ];
    }

    public override getScenarioResourceCodes(): string[] {
        return [
            ResourceType.TERRITORY.getCode(),
            ResourceType.MANDATES.getCode(),
            ResourceType.RESISTANCE.getCode(),
            ResourceType.PRESTIGE.getCode(),
        ];
    }

    public override getPlayableSystems(): GameSystem[] {
        return this.playableSystems;
    }

    public override getFocusTreeDefinition(): FocusTreeDefinition | null {
        return new FocusTreeDefinition("The Peace to End All Peace", [
            new FocusNodeDefinition(
                "focus_s5_mandates",
                "The Mandate Question",
                "Article 22 of the League Covenant placed the former German colonies and the Ottoman Arab provinces under mandates held by the victors of 1919. Britain and France administered these territories as a sacred trust while treating them as the spoils of war.",
                "Accepting the mandates converts conquest into international trusteeship, raising the mandates resource for Britain and France while the peoples of the territories register their resistance.",
                [],
                "",
                0,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s5_indian_congress",
                "The Congress Answers",
                "The Indian National Congress expanded through the war years, and the Amritsar massacre of 1919 turned Indian loyalty into organized grievance. The Congress claimed to speak for an Indian nation within the British Empire.",
                "Firm opposition raises resistance to British rule in India and drains the legitimacy of the imperial administration gradually.",
                [],
                "",
                1,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s5_west_africa",
                "West African Resistance",
                "From Senegal to Nigeria, veterans, clerks, and évolués organized against colonial rule after their service in the war. Strikes, petitions, and new political associations pressed West African claims on France and Britain.",
                "Anti-colonial organizing raises resistance across West Africa and drains the French treasury as the colonial state pays to contain it.",
                [],
                "",
                2,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s5_league_supervision",
                "League Supervision",
                "The Permanent Mandates Commission of the League required annual reports from the mandatory powers and heard petitions from the governed themselves. League oversight gave imperial rule a new international language of trusteeship and accountability.",
                "Submitting to supervision raises the prestige resource for the mandatory powers while the international record of resistance keeps growing.",
                [],
                "",
                3,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s5_manchukuo",
                "Japan's Northern Road",
                "Japanese railway and garrison privileges had made Manchuria a zone of informal control since 1905, and the European war freed Japan's hand in Asia. Chinese sovereignty in Manchuria survived on paper while Japanese power expanded on the ground.",
                "Pressing north adds territory to the Japanese empire and inflames Chinese resistance against foreign control.",
                [],
                "",
                0,
                2,
            ),
            new FocusNodeDefinition(
                "focus_s5_co_prosperity",
                "The Greater East Asia Co-Prosperity Sphere",
                "Japanese officials and writers imagined an Asian sphere under Japan's leadership and freed from Western domination. In practice the sphere meant Japanese command over the resources and peoples from Manchuria toward the south.",
                "Proclaiming the sphere raises Japanese prestige as a champion against Western empire while resistance to Japanese rule grows.",
                ["focus_s5_manchukuo"],
                "",
                1,
                2,
            ),
        ]);
    }

    public override getPrimarySourceIdentifiers(): string[] {
        return ["clemenceau_letter_may_1919"];
    }

    public override getDecisionRecords(): DecisionRecord[] {
        return [
            new DecisionRecord(
                "s5_decision_mandate_question",
                "The Mandate Question",
                "In 1919 the Paris Peace Conference faced the disposition of the German colonies and the Ottoman Arab provinces. Article 22 of the League Covenant proposed that advanced nations hold these territories as mandates exercised on behalf of the League until their peoples were ready for self-rule. Britain and France had to decide whether to accept the mandate formula or press for outright annexation.",
                "The First World War stripped Germany of its colonies and broke Ottoman rule in the Arab lands, so the victors of 1919 claimed territory they had conquered. The language of self-determination made a simple partition politically difficult, and the mandate system was the compromise.",
                "The mandate formula resembled the older colonial language of trusteeship, but it attached imperial control to an international institution for the first time, where annexation had been conquest without apology.",
                "What changed in 1919 was the legal form of imperial control, from colony and province to mandate; what continued was the reality of administration by Britain and France over peoples denied self-rule.",
                "The Covenant of the League was drafted by the victors themselves, so its promise that mandates served the peoples of the territories must be read against the interests of the powers that wrote it.",
                [
                    new DecisionOption(
                        "s5_mandates_option_trust",
                        "Accept the mandates and administer the territories as a sacred trust.",
                        "Britain and France gain mandates over former German and Ottoman lands, and imperial control is legitimized by the League's language of trusteeship.",
                        "focus_node_s5_mandates_complete",
                        ResourceType.MANDATES.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s5_mandates_option_annex",
                        "Annex the conquered territories outright.",
                        "Annexation would gain territory and anger the peoples promised self-rule, deepening resistance to imperial control.",
                        "s5_mandates_annexation_chosen",
                        ResourceType.TERRITORY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s5_mandates_option_plebiscite",
                        "Let the peoples of the territories choose their own future.",
                        "Plebiscites honor the promise of self-determination but would surrender the spoils the war was fought to win.",
                        "s5_mandates_plebiscite_chosen",
                        ResourceType.RESISTANCE.getCode(),
                        -5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s5_decision_japan_northern_road",
                "Japan's Northern Road",
                "Japan arrived at Paris in 1919 as one of the five great powers, holding the Pacific islands and the Shandong concessions it had taken from Germany, while its army watched Manchuria, where Japanese railways and garrisons already lay across Chinese territory. The peace that settled Europe's empires left Japan's Asian ambitions unresolved.",
                "Japan's industrial growth and its victory over Russia in 1905 had made it a great power before 1914, and the European war left the Western empires too exhausted to check its ambitions in Asia.",
                "Japanese expansion through railway and garrison privileges paralleled the informal control that Britain and France exercised in their own spheres, and both were now recast in the language of mandates and trusteeship.",
                "What changed after 1919 was that Japan claimed a larger place in Asia and in the new League; what continued was the great-power contest for spheres of influence in China.",
                "The Japanese delegation's claims at Paris rested on wartime service and on treaties extracted from a weak Chinese government, so they record the victor's case rather than the view of the governed.",
                [
                    new DecisionOption(
                        "s5_japan_option_manchuria",
                        "Expand Japanese control northward into Manchuria.",
                        "Japan converts railway and garrison privileges into territorial control, and Chinese resistance to foreign rule hardens.",
                        "focus_node_s5_manchukuo_complete",
                        ResourceType.TERRITORY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s5_japan_option_mandates",
                        "Rest content with the Pacific mandates and the Shandong settlement.",
                        "The empire banks the prestige of a victor, but the army's faction in Manchuria waits for the next opening.",
                        "s5_japan_mandates_accepted",
                        ResourceType.PRESTIGE.getCode(),
                        3,
                    ),
                ],
            ),
            new DecisionRecord(
                "s5_decision_congress_answers",
                "The Congress Answers",
                "In India the wartime promises of reform gave way in 1919 to the Rowlatt Acts and the massacre at Amritsar, where troops fired on an unarmed crowd. The Indian National Congress, its membership swelling through the war years, had to decide how to answer an empire that had taken Indian loyalty and returned repression.",
                "The war's demands on colonial peoples, the Allied rhetoric of self-determination, and the new language of League trusteeship raised Indian expectations, and the responses of 1919 turned those expectations into organized grievance.",
                "The Congress organized within the structures of the Raj even as it challenged them, much as West African veterans and city associations were beginning to press their own claims within the French and British empires.",
                "What changed after 1919 was the scale of anti-imperial organization; what continued was the reliance of colonial politics on petitions, congresses, and negotiated reform rather than open revolt.",
                "Congress resolutions and West African petitions were written for imperial authorities as much as for their own supporters, so they show what colonial subjects could safely claim as much as what they believed.",
                [
                    new DecisionOption(
                        "s5_congress_option_firm",
                        "Answer Amritsar with firm nationwide opposition.",
                        "The Congress becomes the center of an organized mass movement, and resistance to British rule in India rises.",
                        "focus_node_s5_indian_congress_complete",
                        ResourceType.RESISTANCE.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s5_congress_option_west_africa",
                        "Carry the politics of the moment into West African organizing.",
                        "Veterans and city associations press their claims on France, and resistance grows across West Africa.",
                        "focus_node_s5_west_africa_complete",
                        ResourceType.RESISTANCE.getCode(),
                        4,
                    ),
                    new DecisionOption(
                        "s5_congress_option_reform",
                        "Accept the Montagu-Chelmsford reforms and work within the Empire.",
                        "Limited self-government buys imperial goodwill while Congress ranks grow impatient with petition politics.",
                        "s5_congress_reform_accepted",
                        ResourceType.PRESTIGE.getCode(),
                        3,
                    ),
                ],
            ),
            new DecisionRecord(
                "s5_decision_league_supervision",
                "The League Looks On",
                "The League of Nations took its seat at Geneva in 1919, and its Covenant obligated the mandatory powers to report on the welfare of the peoples entrusted to them. A Permanent Mandates Commission would examine the reports and hear petitions, and Britain and France had to decide how far to submit their imperial rule to international oversight.",
                "The costs of the war and the prominence of Wilsonian rhetoric made some machinery of international accountability politically unavoidable in 1919, and the victors accepted League oversight as the price of legitimacy for the territories they claimed.",
                "League supervision of mandates echoed the older consultations of the European concert, but unlike the concert it claimed universal principles, published reports, and maintained a permanent commission.",
                "What changed was the new language of tutelage and accountability in which imperial control was described; what continued was the great powers' hold on the territories themselves and their reluctance to accept real limits.",
                "Article 22 and the League's records present imperial rule through the reports of the ruling powers, so they must be read against the petitions and resistance that the commissions also recorded.",
                [
                    new DecisionOption(
                        "s5_league_option_submit",
                        "Submit to League mandate supervision and report annually.",
                        "The empire exchanges a measure of secrecy for international legitimacy, and League commissions begin to record the reality of resistance.",
                        "focus_node_s5_league_supervision_complete",
                        ResourceType.PRESTIGE.getCode(),
                        4,
                    ),
                    new DecisionOption(
                        "s5_league_option_defy",
                        "Hold Geneva's commissions at arm's length.",
                        "Britain and France preserve unchallenged imperial control but forfeit the goodwill that the mandate system was designed to earn.",
                        "s5_league_oversight_defied",
                        ResourceType.PRESTIGE.getCode(),
                        -4,
                    ),
                ],
            ),
        ];
    }

    public override getScenarioEventSchedule(): ScenarioEventRecord[] {
        return [
            new ScenarioEventRecord(
                1,
                "paris_peace_conference",
                "PARIS PEACE CONFERENCE OPENS AMID COMPETING IMPERIAL CLAIMS",
                "newspaper_masthead_france",
                "FRA",
                "event_treaty_versailles",
            ),
            new ScenarioEventRecord(
                2,
                "treaty_of_versailles",
                "TREATY OF VERSAILLES SIGNED; GERMANY STRIPPED OF ITS COLONIES",
                "newspaper_masthead_france",
                "FRA",
                "event_treaty_versailles",
            ),
            new ScenarioEventRecord(
                3,
                "league_of_nations_founded",
                "ARTICLE 22 ESTABLISHES THE LEAGUE MANDATE SYSTEM",
                "newspaper_masthead_britain",
                "ENG",
                "event_league_of_nations",
            ),
            new ScenarioEventRecord(
                4,
                "league_assembles",
                "LEAGUE OF NATIONS ASSEMBLES AS POWERS DIVIDE THE MANDATES",
                "newspaper_masthead_britain",
                "ENG",
                "event_league_of_nations",
            ),
            new ScenarioEventRecord(
                5,
                "unrest_in_india_and_egypt",
                "UNREST IN INDIA AND EGYPT TESTS IMPERIAL AUTHORITY",
                "newspaper_masthead_britain",
                "ENG",
                "event_league_of_nations",
            ),
            new ScenarioEventRecord(
                6,
                "mandate_commissions_report",
                "MANDATE COMMISSIONS REPORT AS RESISTANCE GROWS",
                "newspaper_masthead_britain",
                "ENG",
                "event_league_of_nations",
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
        return new ContinuityChangeDefinition("Continuity and Change: Territorial Holdings, 1900-1925", 1900, 1925, [
            new ContinuityChangeMarker(
                "s5_marker_german_colonies_mandates",
                "German colonies become mandates",
                1919,
                "change",
                "The Treaty of Versailles stripped Germany of its colonies, and the League assigned them as mandates to Britain, France, Japan, and the dominions. Imperial rule continued, but under a new legal form.",
            ),
            new ContinuityChangeMarker(
                "s5_marker_ottoman_arab_mandates",
                "Ottoman Arab lands become mandates",
                1920,
                "change",
                "At San Remo the Allied powers divided the Arab provinces of the defeated Ottoman Empire into mandates for Britain and France. Damascus and Baghdad passed from Istanbul's rule to new imperial administrations.",
            ),
            new ContinuityChangeMarker(
                "s5_marker_manchukuo",
                "Manchukuo under Japanese control",
                1925,
                "change",
                "Japan tightened its grip on Manchuria through the South Manchuria Railway, garrison privileges, and economic concessions after 1919. Chinese sovereignty remained on paper while Japan governed in fact.",
            ),
            new ContinuityChangeMarker(
                "s5_marker_raj_persists",
                "The British Raj persists",
                1900,
                "continuity",
                "The Raj continued to govern the Indian subcontinent through the reforms of 1919 and beyond. Amritsar answered Indian demands for self-rule with repression rather than independence.",
            ),
            new ContinuityChangeMarker(
                "s5_marker_west_africa_administration",
                "West African colonial administration persists",
                1900,
                "continuity",
                "French and British administrations in West Africa survived the war and the peace, collecting taxes and conscripting labor as before. Veterans' petitions and strikes changed the terms of debate, not yet the fact of colonial rule.",
            ),
            new ContinuityChangeMarker(
                "s5_marker_japanese_expansion",
                "Japanese imperial expansion",
                1919,
                "change",
                "Japan gained the Pacific islands north of the equator as mandates and pressed its claims in Shandong and Manchuria. Its empire expanded even as the peace promised international oversight of imperial rule.",
            ),
            new ContinuityChangeMarker(
                "s5_marker_imperial_rivalry",
                "Imperial rivalry continues in new forms",
                1900,
                "continuity",
                "Great-power competition over colonies, markets, and prestige outlived 1914 and reappeared in the peace itself. The new mandates and the League became arenas of the same rivalry.",
            ),
            new ContinuityChangeMarker(
                "s5_marker_league_oversight",
                "League oversight as a new language of rule",
                1919,
                "change",
                "Article 22 recast imperial control as a trusteeship accountable to the League of Nations. Mandatory powers now reported on their rule and answered petitions from the governed.",
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
        return Rubrics.getRubricItemsForScenario(5).map((rubricItem) => rubricItem.promptText);
    }

    public override getJournalPrompts(): string[] {
        return [
            "Based on what you learned about the causes of World War I, what are the weaknesses in Clemenceau's argument? Support your answer with evidence from Topic 7.2.",
            "Explain how the mandate system represented both continuity and change in imperial rule after the First World War.",
            "Choose one region of Asia or Africa and explain how its territorial holdings changed between 1900 and the mid-1920s, and why the change mattered.",
        ];
    }

    public override supportsDiplomaticPlay(): boolean {
        return true;
    }

    public override supportsTimelineScrubber(): boolean {
        return true;
    }

    public override supportsProductionQueue(): boolean {
        return false;
    }

    public override supportsDivisionDesigner(): boolean {
        return false;
    }

    public override getContentAdvisoryNote(): string {
        return "This scenario examines the peace settlements of 1919, the mandate system, and the suppression of anti-imperial resistance, including the Amritsar massacre; all presentations are historical and educational.";
    }

    public override registerInitialState(gameState: GameState): void {
        WorldState1900.registerInitialWorldIntoGameState(gameState);
        gameState.setScenarioIdentifier(this.getSystemName());
        gameState.setPlayerNationIdentifier("british_empire");
        gameState.setResourceQuantity(ResourceType.TERRITORY, 60);
        gameState.setResourceQuantity(ResourceType.MANDATES, 0);
        gameState.setResourceQuantity(ResourceType.RESISTANCE, 25);
        gameState.setResourceQuantity(ResourceType.PRESTIGE, 55);
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        for (const playableSystem of this.playableSystems) {
            playableSystem.simulateTurn(turnNumber, gameState);
        }
    }

    public override evaluateVictory(gameState: GameState): ScenarioEvaluationResult {
        const flagStatus = this.collectFlagStatus(gameState, [
            {
                flagIdentifier: "territorial_chart_s5_complete",
                flagDescription: "Continuity and Change chart of territorial holdings completed",
            },
            {
                flagIdentifier: "source_correct_clemenceau_letter_may_1919",
                flagDescription: "Clemenceau letter analyzed correctly for point of view and limitations",
            },
            {
                flagIdentifier: "quickwrite_s5_saved",
                flagDescription: "Quickwrite on the weaknesses of Clemenceau's argument saved",
            },
        ]);
        const isVictory = flagStatus.satisfiedCount === 3;
        return new ScenarioEvaluationResult(
            5,
            isVictory,
            flagStatus.satisfiedCount,
            3,
            flagStatus.satisfiedCriteria,
            flagStatus.unmetCriteria,
        );
    }
}
