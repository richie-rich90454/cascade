import {
    ArgumentDefinition,
    CausalChainCause,
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
import { CommunistRevolutionEvent } from "./events/CommunistRevolutionEvent";
import { PoliticalCrisisEvent } from "./events/PoliticalCrisisEvent";
import { ImperialDeclineSystem } from "./systems/ImperialDeclineSystem";
import { NationalismSystem } from "./systems/NationalismSystem";
import { RevolutionaryPressureSystem } from "./systems/RevolutionaryPressureSystem";
import { MexicanRevolutionPath } from "./paths/MexicanRevolutionPath";
import { OttomanCollapsePath } from "./paths/OttomanCollapsePath";
import { QingCollapsePath } from "./paths/QingCollapsePath";
import { RussianCollapsePath } from "./paths/RussianCollapsePath";
import { GameSystem } from "../../core/GameSystem";
import type { GameState } from "../../core/GameState";
import { Rubrics } from "../../data/Rubrics";
import { WorldState1900 } from "../WorldState1900";
import { LearningObjective } from "../../types/LearningObjective";
import { ReasoningProcess } from "../../types/ReasoningProcess";
import { ResourceType } from "../../types/ResourceType";
import { SuggestedSkill } from "../../types/SuggestedSkill";
import { ThematicFocus } from "../../types/ThematicFocus";

export class ScenarioOne extends Scenario {
    private readonly playableSystems: GameSystem[];

    constructor() {
        super("scenario_one_the_powder_keg");
        this.playableSystems = [
            new ImperialDeclineSystem(),
            new NationalismSystem(),
            new RevolutionaryPressureSystem(),
            new OttomanCollapsePath(),
            new RussianCollapsePath(),
            new QingCollapsePath(),
            new MexicanRevolutionPath(),
            new PoliticalCrisisEvent(),
            new CommunistRevolutionEvent(),
        ];
    }

    public override getScenarioNumber(): number {
        return 1;
    }

    public override getScenarioTitle(): string {
        return "The Powder Keg";
    }

    public override getScenarioSubtitle(): string {
        return "1900-1914";
    }

    public override getStartYear(): number {
        return 1900;
    }

    public override getEndYear(): number {
        return 1914;
    }

    public override getDurationInMinutes(): number {
        return 45;
    }

    public override getTurnCount(): number {
        return 12;
    }

    public override getThematicFocus(): ThematicFocus {
        return ThematicFocus.GOVERNANCE;
    }

    public override getSuggestedSkill(): SuggestedSkill {
        return SuggestedSkill.SKILL_4_B;
    }

    public override getReasoningProcess(): ReasoningProcess {
        return ReasoningProcess.CONTINUITY_AND_CHANGE;
    }

    public override getLearningObjective(): LearningObjective {
        return LearningObjective.OBJECTIVE_A;
    }

    public override getPerspectiveLabels(): string[] {
        return ["Ottoman Empire", "Russian Empire", "Qing China", "Mexico"];
    }

    public override getBriefingParagraphs(): string[] {
        return [
            "In 1900 the West dominated the global political order. Land-based empires such as the Ottoman, Russian, and Qing ruled subject peoples across three continents, while maritime empires such as the British and French carried European power to every ocean. The older land-based empires already showed the strain of competition with industrial powers that could outproduce and outgun them.",
            "Internal and external factors combined to weaken these empires. Inside their borders, ethnic and religious nationalism, fiscal crisis, and resistance to reform eroded the authority of old dynasties. From outside, military defeat, unequal treaties, and the economic penetration of great-power capital stripped away sovereignty piece by piece.",
            "Across the world, states and peoples challenged the existing political and social order. In Mexico, the fraudulent election of 1910 set off a revolution that would remake the state. In Russia, the revolution of 1905 forced the tsar to promise a duma. In China, the dynasty fell in 1911. In the Balkans, new nations broke away from the Ottoman Empire.",
            "Your task across four perspectives is to identify the internal and external factors that produced these changes, to trace how short-term crises grew out of long-term strains, and to mark what changed and what persisted as the old empires gave way to new states.",
        ];
    }

    public override getObjectiveSummaries(): string[] {
        return [
            "Identify three internal and three external factors behind the decline of each of the four states you study.",
            "Order the causes of each state's transformation from long-term (decades) to short-term (months).",
            "Complete the Continuity and Change chart for 1900 to 1924.",
            "Write a contextualization paragraph scoring three or higher.",
        ];
    }

    public override getScenarioResourceCodes(): string[] {
        return [
            ResourceType.LEGITIMACY.getCode(),
            ResourceType.TREASURY.getCode(),
            ResourceType.MANPOWER.getCode(),
            ResourceType.NATIONALISM.getCode(),
            ResourceType.IMPERIAL_CONTROL.getCode(),
        ];
    }

    public override getPlayableSystems(): GameSystem[] {
        return this.playableSystems;
    }

    public override getFocusTreeDefinition(): FocusTreeDefinition | null {
        return null;
    }

    public override getPrimarySourceIdentifiers(): string[] {
        return ["madero_plan_of_san_luis_potosi", "october_manifesto"];
    }

    public override getDecisionRecords(): DecisionRecord[] {
        return [
            new DecisionRecord(
                "s1_decision_ottoman",
                "The Sick Man of Europe",
                "The Ottoman Empire entered the twentieth century bankrupt and diminished. The Public Debt Administration, imposed in 1881, handed the collection of important revenues to European creditors. Nationalist movements in the Balkans and among the Arab provinces challenged Istanbul's authority, and the Committee of Union and Progress pressed for a constitutional revolution against the sultan.",
                "The causes reach back decades: fiscal dependence on European loans, the loss of territory in the Balkans, and the rise of national feeling among subject peoples.",
                "Compare the Ottoman position with the Qing: both faced foreign claims on their revenues and both faced reform movements within.",
                "What persists is the sultan's court and the administrative machinery; what changes is who controls it and how much of the empire remains.",
                "Foreign diplomats and the Ottoman press alike reported the crisis of 1908 as a struggle to save the state by reforming it.",
                [
                    new DecisionOption(
                        "s1_ottoman_option_constitution",
                        "Support the restoration of the constitution of 1876.",
                        "The Young Turk revolution restores the constitution and the empire gains a parliament, but the sultan's court and the great powers both watch for weakness.",
                        "factor_s1_ottoman_internal_constitution",
                        ResourceType.LEGITIMACY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s1_ottoman_option_centralize",
                        "Centralize administration and press Arab and Balkan provinces more tightly.",
                        "Centralization provokes further nationalist resistance in the provinces and strains the treasury.",
                        "factor_s1_ottoman_internal_centralization",
                        ResourceType.IMPERIAL_CONTROL.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s1_ottoman_option_align_germany",
                        "Seek German support to check the other great powers.",
                        "The German military mission deepens the empire's entanglement in the European alliance system.",
                        "factor_s1_ottoman_external_germany",
                        ResourceType.NATIONALISM.getCode(),
                        -5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s1_decision_russian",
                "The Edict of October",
                "Russia's defeat by Japan in 1905 exposed the weakness of the tsarist state and set off the revolution of that year: Bloody Sunday, general strikes, and mutiny in the fleet. The October Manifesto promised civil liberties and a legislative duma. The question is whether to defend the manifesto or to restore autocratic control.",
                "The immediate cause of the crisis was the wartime defeat and the massacre of Bloody Sunday; the deeper causes were autocratic rigidity and the strains of industrialization.",
                "Compare Russia's concession of a parliament with the Ottoman restoration of 1876 and the Mexican constitutionalism of Madero.",
                "The autocracy persists through the Fundamental Laws of 1906; what changes is the existence of a duma and of organized political parties.",
                "The manifesto is a source made under pressure, promising more than the court intended to give.",
                [
                    new DecisionOption(
                        "s1_russian_option_defend_manifesto",
                        "Defend the October Manifesto and govern with the duma.",
                        "A duma government slows the drift toward revolution but the court continues to hem in the parliament.",
                        "factor_s1_russian_internal_manifesto",
                        ResourceType.LEGITIMACY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s1_russian_option_restore_autocracy",
                        "Restore autocratic control through the Fundamental Laws of 1906.",
                        "The autocracy is preserved for a decade; the duma is reduced to protest and the revolutionary parties go underground.",
                        "factor_s1_russian_internal_autocracy",
                        ResourceType.STABILITY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s1_russian_option_external_pressures",
                        "Reassure the banks and creditors of Europe.",
                        "Foreign capital stabilizes the treasury but ties Russian policy to French and British interests.",
                        "factor_s1_russian_external_finance",
                        ResourceType.TREASURY.getCode(),
                        10,
                    ),
                ],
            ),
            new DecisionRecord(
                "s1_decision_qing",
                "The Mandate of Heaven",
                "The Qing dynasty was humiliated by foreign powers through the nineteenth century: the Opium Wars, the unequal treaties, and the Boxer Protocol of 1901, which demanded vast indemnities. Reformers split between those who would preserve the dynasty while borrowing Western methods and those who saw the dynasty itself as the obstacle. Railway nationalization in 1911 lit the fuse.",
                "The long-term cause was dynastic decline under imperialist pressure; the short-term cause was the railway crisis and the Wuchang Uprising of 1911.",
                "Compare Qing reform from above with Ottoman and Russian attempts to modernize while preserving dynastic rule.",
                "The Chinese state bureaucracy and the ideal of a unified central state persist through the revolution; the dynasty changes to a republic.",
                "Foreign newspapers and reformist journals both warned of the dynasty's isolation from its own reform-minded elites.",
                [
                    new DecisionOption(
                        "s1_qing_option_reform",
                        "Support the late-Qing reforms and a constitutional monarchy.",
                        "The reform program is overtaken by the 1911 revolution; the court loses the initiative it hoped to keep.",
                        "factor_s1_qing_internal_reform",
                        ResourceType.LEGITIMACY.getCode(),
                        -5,
                    ),
                    new DecisionOption(
                        "s1_qing_option_suppress",
                        "Suppress the revolutionary societies and the railway protest.",
                        "Suppression wins a season and loses the dynasty the obedience of the army, which turns on the court.",
                        "factor_s1_qing_internal_repression",
                        ResourceType.STABILITY.getCode(),
                        -10,
                    ),
                    new DecisionOption(
                        "s1_qing_option_foreign_debt",
                        "Mortgage further revenues against foreign loans to pay the indemnities.",
                        "The indemnities are paid and sovereignty is further mortgaged to the great powers.",
                        "factor_s1_qing_external_indemnity",
                        ResourceType.TREASURY.getCode(),
                        15,
                    ),
                ],
            ),
            new DecisionRecord(
                "s1_decision_mexico",
                "The Tenth Year of the Century",
                "Mexico under Porfirio Díaz modernized its railways and ports with foreign capital, and concentrated land in great haciendas. In 1910 the aging dictator engineered another fraudulent election, and Francisco Madero, having lost the vote and then his liberty, called the nation to arms from exile in Texas through the Plan of San Luis Potosí.",
                "The immediate cause was the political crisis of 1910; the deeper causes were the land question, foreign economic domination, and thirty-four years of personal rule.",
                "Compare Mexico's revolution with Russia's: both began in political crisis and quickly opened social questions of land and labor.",
                "The goal of constitutional government persists from the Plan of San Luis Potosí; the Porfirian order and the old army do not.",
                "The Plan of San Luis Potosí speaks from exile in the language of legality and revolution at once.",
                [
                    new DecisionOption(
                        "s1_mexico_option_land_reform",
                        "Promise land reform to the peasant communities.",
                        "The revolution gains its peasant armies but the promises will strain every later government.",
                        "factor_s1_mexico_internal_land",
                        ResourceType.LEGITIMACY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s1_mexico_option_constitution",
                        "Press for a new constitution limiting presidential power.",
                        "The Constitution of 1917 becomes the enduring achievement of the revolution, including its social articles.",
                        "factor_s1_mexico_internal_constitution",
                        ResourceType.STABILITY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s1_mexico_option_us_capital",
                        "Reassure American investors and the northern Porfiristas.",
                        "The intervention of the United States becomes a constant factor in the revolution's course.",
                        "factor_s1_mexico_external_united_states",
                        ResourceType.TREASURY.getCode(),
                        10,
                    ),
                ],
            ),
            new DecisionRecord(
                "s1_decision_great_war",
                "The Guns Offstage",
                "While the old empires struggle, the great powers of Europe build dreadnoughts, compete for colonies and markets, and bind themselves into two rival alliance systems. The decline of the Ottoman lands in the Balkans has become the test of those alliances.",
                "Imperialist expansion and territorial conflict in the Balkans have combined with a flawed alliance system and intense nationalism to bring the possibility of a general war close.",
                "Every land-based empire you study must weigh its policy in a world where maritime empires can outproduce and outgun it.",
                "The great-power competition that dominates 1900 persists to 1914; what changes is the risk that a Balkan crisis becomes a world war.",
                "The archives of the powers record the maneuvering of the years before 1914 in memoranda the public never sees.",
                [
                    new DecisionOption(
                        "s1_great_war_option_balance",
                        "Keep the empire out of the great-power blocs and appeal to the concert of Europe.",
                        "Neutrality preserves the treasury a while longer, but the empire's freedom of action narrows.",
                        "factor_s1_external_balancing",
                        ResourceType.INFLUENCE.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s1_great_war_option_choose_bloc",
                        "Choose a great-power patron and take its protection.",
                        "Protection has a price: the empire becomes a junior partner in blocs forming for a war it does not control.",
                        "factor_s1_external_alliance_blocs",
                        ResourceType.ALLIANCES.getCode(),
                        10,
                    ),
                ],
            ),
        ];
    }

    public override getScenarioEventSchedule(): ScenarioEventRecord[] {
        return [
            new ScenarioEventRecord(
                6,
                "assassination_at_sarajevo",
                "TROOPS FIRE IN MEXICO CITY: MADERO'S REVOLUTION BEGINS",
                "newspaper_masthead_default",
                "MEX",
                "event_assassination_sarajevo",
            ),
            new ScenarioEventRecord(
                12,
                "russian_revolution",
                "PETROGRAD FALLS TO THE BOLSHEVIKS",
                "newspaper_masthead_ussr",
                "RUS",
                "event_russian_revolution",
            ),
        ];
    }

    public override getCausalChainDefinitions(): CausalChainDefinition[] {
        return [
            new CausalChainDefinition(
                "causal_chain_s1_ottoman",
                "The Collapse of the Ottoman Order",
                "Order the causes from the longest-term, deepest strains of the nineteenth century to the immediate events of 1908.",
                [
                    new CausalChainCause("ottoman_cause_fiscal", "The empire's fiscal bankruptcy and the external control of its revenues through the Public Debt Administration after 1881.", "long_term", true),
                    new CausalChainCause("ottoman_cause_nationalities", "The rise of national feeling among the Balkan and Arab subject peoples.", "intermediate", true),
                    new CausalChainCause("ottoman_cause_reform_movement", "The agitation of the Committee of Union and Progress for a constitution and a parliament.", "intermediate", true),
                    new CausalChainCause("ottoman_cause_imperial_pressure", "Great-power economic penetration through the capitulations and railway concessions.", "long_term", false),
                    new CausalChainCause("ottoman_cause_press", "European and Ottoman newspapers inflaming opinion over Macedonia and Crete.", "short_term", false),
                    new CausalChainCause("ottoman_cause_german_mission", "The German military mission and the empire's drifting into the rival European camps.", "short_term", false),
                ],
            ),
            new CausalChainDefinition(
                "causal_chain_s1_russian",
                "The Strain on the Autocracy",
                "Order the causes of the Russian crisis from the deepest autocratic rigidity to the events of 1905.",
                [
                    new CausalChainCause("russian_cause_autocracy", "Three centuries of autocratic rule that admitted no legal political life.", "long_term", true),
                    new CausalChainCause("russian_cause_land_question", "The land hunger of the peasantry and the poverty of the newly industrialized cities.", "intermediate", true),
                    new CausalChainCause("russian_cause_bloody_sunday", "The massacre of peaceful petitioners on Bloody Sunday in January 1905.", "short_term", true),
                    new CausalChainCause("russian_cause_foreign_defeat", "Defeat by Japan in the war of 1904-1905 and the loss of the fleet.", "short_term", false),
                    new CausalChainCause("russian_cause_great_power_competition", "Competition with Austria-Hungary over the Balkans and with Britain over Central Asia.", "long_term", false),
                    new CausalChainCause("russian_cause_foreign_capital", "Dependence on French loans that tied the empire's policy to Paris.", "intermediate", false),
                ],
            ),
            new CausalChainDefinition(
                "causal_chain_s1_qing",
                "The End of the Celestial Empire",
                "Order the causes of the Qing collapse from the humiliations of the nineteenth century to the last months of 1911.",
                [
                    new CausalChainCause("qing_cause_opium_legacy", "The legacy of the Opium Wars and the unequal treaty system that eroded Chinese sovereignty.", "long_term", false),
                    new CausalChainCause("qing_cause_dynastic_decline", "Dynastic decline and the court's resistance to far-reaching reform.", "long_term", true),
                    new CausalChainCause("qing_cause_secret_societies", "The growth of anti-Qing secret societies and revolutionary leagues schooled abroad.", "intermediate", true),
                    new CausalChainCause("qing_cause_boxer_indemnity", "The Boxer Protocol of 1901 and its crushing indemnities and foreign garrisons.", "intermediate", false),
                    new CausalChainCause("qing_cause_railway_protest", "The railway nationalization crisis that turned Sichuan's gentry into rebels.", "short_term", true),
                    new CausalChainCause("qing_cause_wuchang", "The Wuchang Uprising of October 1911 that spread to province after province.", "short_term", false),
                ],
            ),
            new CausalChainDefinition(
                "causal_chain_s1_mexican",
                "The Fall of Don Porfirio",
                "Order the causes of the Mexican Revolution from the Porfiriato's deepest structures to the call to arms of 1910.",
                [
                    new CausalChainCause("mexican_cause_porfiriato", "Thirty-four years of personal rule by Porfirio Diaz and the exclusion of rivals from political life.", "long_term", true),
                    new CausalChainCause("mexican_cause_haciendas", "The concentration of land in great estates and the fall of rural wages.", "long_term", true),
                    new CausalChainCause("mexican_cause_foreign_capital", "Foreign ownership of railways, mines, and oil that made the economy an appendage of great-power markets.", "long_term", false),
                    new CausalChainCause("mexican_cause_labor_strikes", "The strike wave of the years before 1910, from Cananea to Rio Blanco.", "intermediate", true),
                    new CausalChainCause("mexican_cause_election_1908", "The Creelman interview and the political opening that raised expectations in 1908.", "intermediate", false),
                    new CausalChainCause("mexican_cause_fraud_1910", "The fraudulent election of 1910 and Madero's appeal from exile.", "short_term", false),
                ],
            ),
        ];
    }

    public override getComparisonDefinition(): ComparisonDefinition | null {
        return null;
    }

    public override getContinuityChangeDefinition(): ContinuityChangeDefinition | null {
        return new ContinuityChangeDefinition("Continuity and Change: Empires and States, 1900-1924", 1900, 1924, [
            new ContinuityChangeMarker(
                "s1_marker_manifesto_1905",
                "The October Manifesto",
                1905,
                "change",
                "Russia concedes civil liberties and a duma, an unprecedented limit on the autocracy.",
            ),
            new ContinuityChangeMarker(
                "s1_marker_young_turks_1908",
                "The Young Turk Revolution",
                1908,
                "change",
                "The Ottoman constitution of 1876 is restored and a parliament summoned.",
            ),
            new ContinuityChangeMarker(
                "s1_marker_mexican_revolution_1910",
                "The Mexican Revolution begins",
                1910,
                "change",
                "The Plan of San Luis Potosi opens a decade of revolution and a new constitution in 1917.",
            ),
            new ContinuityChangeMarker(
                "s1_marker_xinhai_1911",
                "The Xinhai Revolution",
                1911,
                "change",
                "The Qing dynasty falls and a republic is proclaimed.",
            ),
            new ContinuityChangeMarker(
                "s1_marker_russian_revolution_1917",
                "The Bolshevik Revolution",
                1917,
                "change",
                "The Russian Empire becomes the Soviet state under communist rule.",
            ),
            new ContinuityChangeMarker(
                "s1_marker_sultanate_1922",
                "The abolition of the sultanate",
                1922,
                "change",
                "The Ottoman dynasty is abolished and a Turkish republic follows.",
            ),
            new ContinuityChangeMarker(
                "s1_marker_british_monarchy",
                "The British monarchy",
                1900,
                "continuity",
                "The constitutional monarchy continues as the frame of British politics.",
            ),
            new ContinuityChangeMarker(
                "s1_marker_bureaucracy",
                "Centralized administration",
                1900,
                "continuity",
                "The bureaucratic state survives regime changes, from Istanbul to Nanjing.",
            ),
            new ContinuityChangeMarker(
                "s1_marker_great_power_rivalry",
                "Great-power rivalry",
                1900,
                "continuity",
                "Competition among great powers continues through new forms across the period.",
            ),
        ]);
    }

    public override getArgumentDefinition(): ArgumentDefinition | null {
        return null;
    }

    public override getTestimonyRecords(): TestimonyRecord[] {
        return [];
    }

    public override getDebriefQuestionPrompts(): string[] {
        return Rubrics.getRubricItemsForScenario(1).map((rubricItem) => rubricItem.promptText);
    }

    public override getJournalPrompts(): string[] {
        return [
            "Which internal factor was most responsible for the transformation of each state you studied? Explain your reasoning with evidence.",
            "How did external forces accelerate domestic change in Mexico and Russia?",
            "In what ways did the world of 1924 still resemble the world of 1900? Name at least two continuities with evidence.",
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
        return "This scenario discusses revolution, warfare, and the human cost of imperial collapse. All presentations are historical and educational.";
    }

    public override registerInitialState(gameState: GameState): void {
        WorldState1900.registerInitialWorldIntoGameState(gameState);
        gameState.setScenarioIdentifier(this.getSystemName());
        gameState.setPlayerNationIdentifier("ottoman_empire");
        gameState.setResourceQuantity(ResourceType.LEGITIMACY, 45);
        gameState.setResourceQuantity(ResourceType.TREASURY, 180);
        gameState.setResourceQuantity(ResourceType.MANPOWER, 42000);
        gameState.setResourceQuantity(ResourceType.NATIONALISM, 45);
        gameState.setResourceQuantity(ResourceType.IMPERIAL_CONTROL, 60);
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        for (const playableSystem of this.playableSystems) {
            playableSystem.simulateTurn(turnNumber, gameState);
        }
    }

    public override evaluateVictory(gameState: GameState): ScenarioEvaluationResult {
        const flagStatus = this.collectFlagStatus(gameState, [
            { flagIdentifier: "causal_chain_s1_ottoman_complete", flagDescription: "Ottoman causal chain correctly ordered (three internal and three external factors)" },
            { flagIdentifier: "causal_chain_s1_russian_complete", flagDescription: "Russian causal chain correctly ordered (three internal and three external factors)" },
            { flagIdentifier: "causal_chain_s1_qing_complete", flagDescription: "Qing causal chain correctly ordered (three internal and three external factors)" },
            { flagIdentifier: "causal_chain_s1_mexican_complete", flagDescription: "Mexican causal chain correctly ordered (three internal and three external factors)" },
            { flagIdentifier: "continuity_chart_s1_complete", flagDescription: "Continuity and Change chart completed" },
            { flagIdentifier: "contextualization_s1_scored", flagDescription: "Contextualization paragraph awarded three points or higher" },
        ]);
        return this.buildEvaluationResult(1, flagStatus.satisfiedCriteria, flagStatus.unmetCriteria, 6, 0);
    }
}
