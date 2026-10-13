import type { GameState } from "../../core/GameState";
import { GameSystem } from "../../core/GameSystem";
import { Rubrics } from "../../data/Rubrics";
import { LearningObjective } from "../../types/LearningObjective";
import { ReasoningProcess } from "../../types/ReasoningProcess";
import { SuggestedSkill } from "../../types/SuggestedSkill";
import { ThematicFocus } from "../../types/ThematicFocus";
import {
    CausalChainCause,
    CausalChainDefinition,
    DecisionRecord,
    Scenario,
    ScenarioEvaluationResult,
    ScenarioEventRecord,
    TestimonyRecord,
} from "./Scenario";
import type {
    ArgumentDefinition,
    ComparisonDefinition,
    ContinuityChangeDefinition,
    FocusTreeDefinition,
} from "./Scenario";
import { ArmenianAtrocitySystem } from "./systems/ArmenianAtrocitySystem";
import { CambodianAtrocitySystem } from "./systems/CambodianAtrocitySystem";
import { RwandanAtrocitySystem } from "./systems/RwandanAtrocitySystem";
import { UkrainianAtrocitySystem } from "./systems/UkrainianAtrocitySystem";

export class ScenarioNine extends Scenario {
    private readonly playableSystems: GameSystem[];

    constructor() {
        super("scenario_nine_the_historical_reckoning");
        this.playableSystems = [
            new ArmenianAtrocitySystem(),
            new UkrainianAtrocitySystem(),
            new CambodianAtrocitySystem(),
            new RwandanAtrocitySystem(),
        ];
    }

    public override getScenarioNumber(): number {
        return 9;
    }

    public override getScenarioTitle(): string {
        return "The Historical Reckoning";
    }

    public override getScenarioSubtitle(): string {
        return "1933-1945";
    }

    public override getStartYear(): number {
        return 1915;
    }

    public override getEndYear(): number {
        return 1994;
    }

    public override getDurationInMinutes(): number {
        return 60;
    }

    public override getTurnCount(): number {
        return 8;
    }

    public override getThematicFocus(): ThematicFocus {
        return ThematicFocus.SOCIAL_INTERACTIONS_AND_ORGANIZATION;
    }

    public override getSuggestedSkill(): SuggestedSkill {
        return SuggestedSkill.SKILL_5_B;
    }

    public override getReasoningProcess(): ReasoningProcess {
        return ReasoningProcess.CAUSATION;
    }

    public override getLearningObjective(): LearningObjective {
        return LearningObjective.OBJECTIVE_H;
    }

    public override getPerspectiveLabels(): string[] {
        return ["Documentation-based (no nation-state play)"];
    }

    public override getBriefingParagraphs(): string[] {
        return [
            "Between 1915 and 1994, mass atrocities destroyed communities across three continents: the deportation and killing of Armenians under the Ottoman Empire, the Holodomor in Soviet Ukraine, the Holocaust of Europe's Jews, the Cambodian genocide under the Khmer Rouge, and the genocide of the Tutsi in Rwanda. This scenario's subtitle, 1933-1945, is the archive label of these files, but its cases reach from the Armenian deportations of 1915 to the reckoning with Rwanda after 1994.",
            "This is a documentation-based scenario. You do not govern a nation, command armies, or manage resources. You work as the historian works: opening case files, reading sources against one another, ordering causes and consequences, and hearing the testimony of survivors.",
            "Across eight turns the four cases open in sequence, and the record of the Holocaust is set alongside them. Each file pairs the documents of the perpetrators with the accounts of the victims and the observations of witnesses.",
            "Your task is to explain the causes and consequences of these atrocities, to compare them across the century, and to do the work the subject demands: careful documentation, patient analysis, and remembrance.",
        ];
    }

    public override getObjectiveSummaries(): string[] {
        return [
            "Open and study the four case files: the Armenian deportations, the Holodomor, the Cambodian genocide, and the Rwandan genocide.",
            "Order six causes and consequences for each case, from long-term origins to long-term aftereffects.",
            "Analyze the primary sources of the four cases and analyze at least eight of the twelve correctly.",
            "Hear the testimony from each case and complete the relationship analysis that connects causes to consequences and case to case.",
        ];
    }

    public override getScenarioResourceCodes(): string[] {
        return [];
    }

    public override getPlayableSystems(): GameSystem[] {
        return this.playableSystems;
    }

    public override getFocusTreeDefinition(): FocusTreeDefinition | null {
        return null;
    }

    public override getPrimarySourceIdentifiers(): string[] {
        return [
            "morgenthau_dispatch_1915",
            "talat_pasha_directive_1915",
            "armenian_survivor_testimony",
            "gareth_jones_dispatch_1933",
            "law_of_three_spikelets_1932",
            "chamberlin_famine_report_1934",
            "pol_pot_party_speech_1976",
            "phnom_penh_evacuation_broadcast_1975",
            "tuol_sleng_survivor_testimony",
            "kangura_ten_hutu_commandments",
            "mugesera_speech_1992",
            "rtlm_broadcast_1994",
        ];
    }

    public override getDecisionRecords(): DecisionRecord[] {
        return [];
    }

    public override getScenarioEventSchedule(): ScenarioEventRecord[] {
        return [
            new ScenarioEventRecord(
                1,
                "armenian_case_opens",
                "THE HISTORIANS OPEN THE ARMENIAN RECORD",
                "newspaper_masthead_default",
                "OTT",
                "event_armenian_genocide",
            ),
            new ScenarioEventRecord(
                2,
                "armenian_case_documents",
                "THE DOCUMENTS OF THE DEPORTATIONS ARE READ",
                "newspaper_masthead_default",
                "OTT",
                "event_armenian_genocide",
            ),
            new ScenarioEventRecord(
                3,
                "holodomor_case_opens",
                "THE HOLODOMOR: THE FAMINE OF 1932-1933 IS DOCUMENTED",
                "newspaper_masthead_ussr",
                "RUS",
                "event_holodomor",
            ),
            new ScenarioEventRecord(
                4,
                "holocaust_documentation",
                "THE HOLOCAUST: THE RECORD IS CONFRONTED IN FULL",
                "newspaper_masthead_germany",
                "GER",
                "event_holocaust",
            ),
            new ScenarioEventRecord(
                5,
                "cambodian_case_opens",
                "THE KHMER ROUGE YEARS OPEN TO EXAMINATION",
                "newspaper_masthead_default",
                "KHM",
                "event_cambodian_genocide",
            ),
            new ScenarioEventRecord(
                6,
                "cambodian_case_documents",
                "THE EVIDENCE OF THE KILLING CENTERS IS READ",
                "newspaper_masthead_default",
                "KHM",
                "event_cambodian_genocide",
            ),
            new ScenarioEventRecord(
                7,
                "rwandan_case_opens",
                "RWANDA: ONE HUNDRED DAYS ARE SET IN THE RECORD",
                "newspaper_masthead_default",
                "RWA",
                "event_rwandan_genocide",
            ),
            new ScenarioEventRecord(
                8,
                "the_historical_reckoning",
                "THE HISTORICAL RECKONING: THE FOUR CASES ARE LAID SIDE BY SIDE",
                "newspaper_masthead_default",
                "RWA",
                "event_united_nations",
            ),
        ];
    }

    public override getCausalChainDefinitions(): CausalChainDefinition[] {
        return [
            new CausalChainDefinition(
                "causal_chain_s9_armenian",
                "The Armenian Case: The Deportations of 1915",
                "Order the causes from the embattled empire's deepest strains to the escalation of 1915, then the consequences from the destruction of communities to the long reckoning.",
                [
                    new CausalChainCause(
                        "armenian_cause_suspect_minority",
                        "Long decades in which the Ottoman state treated its Armenian subjects as a suspect community within a shrinking empire.",
                        "long_term",
                        true,
                    ),
                    new CausalChainCause(
                        "armenian_cause_cup_radicalization",
                        "The wartime radicalization of the Committee of Union and Progress, which cast the Armenians as a fifth column as defeats mounted.",
                        "intermediate",
                        true,
                    ),
                    new CausalChainCause(
                        "armenian_cause_great_power_war",
                        "The great-power war and Ottoman territorial losses, above all at Sarikamish in 1915, which fed the scapegoating of Armenians.",
                        "short_term",
                        false,
                    ),
                    new CausalChainCause(
                        "armenian_consequence_destroyed_communities",
                        "The deportations and killings destroyed Armenian communities across Anatolia and scattered survivors into a worldwide diaspora.",
                        "short_term",
                        false,
                    ),
                    new CausalChainCause(
                        "armenian_consequence_precedent",
                        "The case set a twentieth-century precedent for state-organized mass killing, studied by later jurists and historians.",
                        "intermediate",
                        false,
                    ),
                    new CausalChainCause(
                        "armenian_consequence_response_limits",
                        "The international response, from diplomatic protests to the incomplete trials of 1919, showed the limits of outside action.",
                        "long_term",
                        false,
                    ),
                ],
            ),
            new CausalChainDefinition(
                "causal_chain_s9_ukrainian",
                "The Ukrainian Case: The Holodomor of 1932-1933",
                "Order the causes from the regime's drive to collectivize to the catastrophe of 1932-1933, then the consequences from the deaths to the shaping of memory.",
                [
                    new CausalChainCause(
                        "ukrainian_cause_collectivization",
                        "The Soviet regime's decision to collectivize agriculture and extract grain at any price as the foundation of the Five-Year Plans.",
                        "long_term",
                        true,
                    ),
                    new CausalChainCause(
                        "ukrainian_cause_requisitions",
                        "Impossible procurement quotas enforced through dekulakization, house-to-house searches, and the seizure of seed grain.",
                        "intermediate",
                        true,
                    ),
                    new CausalChainCause(
                        "ukrainian_cause_harvest_and_blockade",
                        "A poor harvest in 1932, continued grain exports, and closed borders that trapped starving peasants in their districts.",
                        "short_term",
                        false,
                    ),
                    new CausalChainCause(
                        "ukrainian_consequence_starvation",
                        "Mass starvation killed millions across Ukraine and the Kuban in 1932 and 1933.",
                        "short_term",
                        false,
                    ),
                    new CausalChainCause(
                        "ukrainian_consequence_broken_countryside",
                        "The famine broke the Ukrainian countryside and its cultural life, and the state denied and concealed it while much of the world looked away.",
                        "intermediate",
                        false,
                    ),
                    new CausalChainCause(
                        "ukrainian_consequence_memory",
                        "The Holodomor entered Ukrainian national memory as a central trauma whose recognition became a subject of scholarship and politics.",
                        "long_term",
                        false,
                    ),
                ],
            ),
            new CausalChainDefinition(
                "causal_chain_s9_cambodian",
                "The Cambodian Case: The Khmer Rouge, 1975-1979",
                "Order the causes from an extremist ideology to its capture of power in 1975, then the consequences from the killing to the pursuit of justice.",
                [
                    new CausalChainCause(
                        "cambodian_cause_ideology",
                        "A radical communist vision of a purified, agrarian Cambodia, in which cities, money, and education were enemies to be erased.",
                        "long_term",
                        true,
                    ),
                    new CausalChainCause(
                        "cambodian_cause_foreign_war",
                        "The spread of the Vietnam War into Cambodia, whose bombing and invasion destabilized the country and swelled the Khmer Rouge ranks.",
                        "intermediate",
                        false,
                    ),
                    new CausalChainCause(
                        "cambodian_cause_total_power",
                        "The fall of Phnom Penh in April 1975, which handed an extremist party total power to remake society by force.",
                        "short_term",
                        true,
                    ),
                    new CausalChainCause(
                        "cambodian_consequence_killing",
                        "The emptying of the cities, the purges, and the prison at S-21 killed an estimated 1.5 to 2 million Cambodians between 1975 and 1979.",
                        "short_term",
                        false,
                    ),
                    new CausalChainCause(
                        "cambodian_consequence_occupation_and_war",
                        "The Vietnamese invasion of 1978-1979 ended the regime, but occupation and a long civil war followed.",
                        "intermediate",
                        false,
                    ),
                    new CausalChainCause(
                        "cambodian_consequence_justice",
                        "Cambodia's reconstruction and the later trials of the Extraordinary Chambers confronted the country with the crimes of the Khmer Rouge.",
                        "long_term",
                        false,
                    ),
                ],
            ),
            new CausalChainDefinition(
                "causal_chain_s9_rwandan",
                "The Rwandan Case: The Genocide of 1994",
                "Order the causes from the colonial construction of ethnicity to the crisis of April 1994, then the consequences from one hundred days of killing to the world's later reckoning.",
                [
                    new CausalChainCause(
                        "rwandan_cause_colonial_ethnicity",
                        "Colonial classification hardened Hutu and Tutsi identities, and post-independence regimes made ethnicity the instrument of politics.",
                        "long_term",
                        false,
                    ),
                    new CausalChainCause(
                        "rwandan_cause_propaganda",
                        "Hutu Power elites used newspapers like Kangura, speeches, and radio to brand every Tutsi an enemy and prepare the killing.",
                        "intermediate",
                        true,
                    ),
                    new CausalChainCause(
                        "rwandan_cause_april_crisis",
                        "Civil war with the Rwandan Patriotic Front and the death of the president in April 1994, which opened the way for the extremists' plan.",
                        "short_term",
                        true,
                    ),
                    new CausalChainCause(
                        "rwandan_consequence_one_hundred_days",
                        "In roughly one hundred days, between April and July 1994, an estimated 800,000 Tutsi and moderate Hutu were killed.",
                        "short_term",
                        false,
                    ),
                    new CausalChainCause(
                        "rwandan_consequence_exodus",
                        "The Rwandan Patriotic Front ended the genocide by force, and millions of displaced people crowded into camps beyond Rwanda's borders.",
                        "intermediate",
                        false,
                    ),
                    new CausalChainCause(
                        "rwandan_consequence_international_reckoning",
                        "The world's failure to intervene brought apologies, tribunals, and reforms, and the memory of 1994 shaped later debates on intervention.",
                        "long_term",
                        false,
                    ),
                ],
            ),
        ];
    }

    public override getComparisonDefinition(): ComparisonDefinition | null {
        return null;
    }

    public override getContinuityChangeDefinition(): ContinuityChangeDefinition | null {
        return null;
    }

    public override getArgumentDefinition(): ArgumentDefinition | null {
        return null;
    }

    public override getRelationshipPromptTexts(): string[] {
        return [
            "Explain how the wartime scapegoating of the Armenian minority relates to the deportations and killings that followed in 1915.",
            "Explain how the world's response to the Armenian deportations relates to the limits of international protection for targeted peoples.",
            "Compare the place of propaganda and suspicion in the Armenian case with the role of media in the Rwandan case.",
            "Explain how forced collectivization and grain requisitions relate to the mass starvation of 1932 and 1933.",
            "Explain how the decree known as the Law of Three Spikelets relates to the choices that starvation forced on peasant families.",
            "Compare how the Holodomor and the Holocaust each used the machinery of a modern state to target a population, and explain what the comparison reveals.",
            "Explain how the Khmer Rouge vision of a purified agrarian society relates to the evacuation of the cities and the terror of the S-21 prison.",
            "Explain how the war in neighboring Vietnam and the bombing of Cambodia relate to the rise of the Khmer Rouge.",
            "Compare the role of ideology in the Cambodian genocide with the role of ideology in the Armenian or Ukrainian case.",
            "Explain how the colonial and post-independence politics of ethnicity relate to the genocide of 1994.",
            "Explain how Kangura and RTLM prepared and directed the killing, and how that propaganda relates to the speed of the genocide.",
            "Compare the international response to the Rwandan genocide with the responses to the earlier cases in this scenario, and explain what the comparison reveals about change and continuity across the century.",
        ];
    }

    public override getTestimonyRecords(): TestimonyRecord[] {
        return [
            new TestimonyRecord(
                "testimony_armenian_survivor",
                "Testimony: a survivor of the Armenian deportations",
                "They came to our village at dawn and told us we were to be relocated. We walked for days without enough water, and I lost my mother and my brother before the journey ended. I survived by continuing to walk and by being taken in by a family who hid me at the end. I have told this story so that the record will include what happened to ordinary people.",
                "What does this testimony reveal about the human reality behind the deportations of 1915?",
            ),
            new TestimonyRecord(
                "testimony_holodomor_witness",
                "Testimony: a witness of the Holodomor",
                "What I remember is the silence in the village, because the animals were gone and the houses were quiet. We searched the fields for frozen potatoes and anything the requisitions had left behind. My father was taken away when the grain was collected, and my mother fed us what she could find. I speak for the villages that could not speak for themselves.",
                "What does this witness account reveal about how the famine was experienced by those the state's policies reached?",
            ),
            new TestimonyRecord(
                "testimony_holocaust_survivor",
                "Testimony: a survivor of the Holocaust",
                "They separated us when we arrived, and I stayed with my mother as long as they let me. I remember being hungry and cold, and I remember being afraid of the selections. When the camps were liberated I was alone, and I learned later how much of my family had been killed. It matters that the world remembers both what was done and who did it.",
                "What does this testimony reveal about what was lost, and about how survival shaped the memory of the Holocaust?",
            ),
            new TestimonyRecord(
                "testimony_cambodian_survivor",
                "Testimony: a survivor of the Cambodian genocide",
                "They forced us from the city with nothing, and we walked until they told us to stop. The years that followed were hunger and fear and work, and I lost my family one by one, some to illness and some taken away. When the regime fell we walked back to Phnom Penh to look for what remained. I testify because the young should know what happened in their country.",
                "What does this testimony reveal about the terror of the Khmer Rouge years and about why documentation depends on survivors?",
            ),
            new TestimonyRecord(
                "testimony_rwandan_survivor",
                "Testimony: a survivor of the Rwandan genocide",
                "I hid in the ceiling of a neighbor's house for many days while people searched for us outside. Through the wall I could hear the radio and the crowds, and I understood that we were being hunted as a people. A Hutu friend kept me alive by bringing water when she could. When I walk by the river now, I remember those who did not survive.",
                "What does this testimony reveal about how the genocide was carried out and about the courage of those who helped?",
            ),
        ];
    }

    public override getDebriefQuestionPrompts(): string[] {
        return Rubrics.getRubricItemsForScenario(9).map((rubricItem) => rubricItem.promptText);
    }

    public override getJournalPrompts(): string[] {
        return [
            "After studying the Armenian case, what did the documents and the testimony together reveal about how a state came to destroy a people?",
            "For the Holodomor, explain what the sources establish about the responsibility of the Soviet state for the famine.",
            "For Cambodia, describe what the records of the Khmer Rouge regime and the testimony of survivors each contribute to the historical record.",
            "For Rwanda, explain how propaganda and the international response shaped the course of the genocide.",
        ];
    }

    public override supportsDiplomaticPlay(): boolean {
        return false;
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
        return "This scenario documents mass atrocities of the twentieth century, including the Armenian deportations and killings, the Holodomor, the Holocaust, the Cambodian genocide, and the Rwandan genocide. All content is presented through historical documentation and survivor testimony, without simulation or any scoring attached to the suffering of victims. Teachers may adjust the level of detail shown in the Settings menu.";
    }

    public override registerInitialState(gameState: GameState): void {
        gameState.reset();
        gameState.setScenarioIdentifier(this.getSystemName());
        gameState.setPlayerNationIdentifier("");
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        for (const playableSystem of this.playableSystems) {
            playableSystem.simulateTurn(turnNumber, gameState);
        }
    }

    public override evaluateVictory(gameState: GameState): ScenarioEvaluationResult {
        const flagStatus = this.collectFlagStatus(gameState, [
            {
                flagIdentifier: "causal_chain_s9_armenian_complete",
                flagDescription: "The Armenian causal chain is correctly ordered (three causes and three consequences)",
            },
            {
                flagIdentifier: "causal_chain_s9_ukrainian_complete",
                flagDescription:
                    "The Ukrainian causal chain is correctly ordered (three causes and three consequences)",
            },
            {
                flagIdentifier: "causal_chain_s9_cambodian_complete",
                flagDescription:
                    "The Cambodian causal chain is correctly ordered (three causes and three consequences)",
            },
            {
                flagIdentifier: "causal_chain_s9_rwandan_complete",
                flagDescription: "The Rwandan causal chain is correctly ordered (three causes and three consequences)",
            },
            {
                flagIdentifier: "relationship_s9_complete",
                flagDescription: "The relationship analysis across the four cases is completed",
            },
            {
                flagIdentifier: "sources_s9_eight_correct",
                flagDescription: "At least eight primary-source analyses are correct",
            },
        ]);
        return new ScenarioEvaluationResult(
            9,
            flagStatus.unmetCriteria.length === 0,
            flagStatus.satisfiedCount,
            6,
            flagStatus.satisfiedCriteria,
            flagStatus.unmetCriteria,
        );
    }
}
