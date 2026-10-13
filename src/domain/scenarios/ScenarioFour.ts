import {
    ArgumentDefinition,
    CausalChainDefinition,
    ComparisonDefinition,
    ComparisonRow,
    ContinuityChangeDefinition,
    DecisionOption,
    DecisionRecord,
    FocusTreeDefinition,
    Scenario,
    ScenarioEvaluationResult,
    ScenarioEventRecord,
    TestimonyRecord,
} from "./Scenario";
import { BrazilianPath } from "./paths/BrazilianPath";
import { FascistCorporatistPath } from "./paths/FascistCorporatistPath";
import { MexicanPath } from "./paths/MexicanPath";
import { NewDealPath } from "./paths/NewDealPath";
import { SovietFiveYearPlanPath } from "./paths/SovietFiveYearPlanPath";
import { BrazilianPopulistSystem } from "./systems/BrazilianPopulistSystem";
import { FascistCorporatistSystem } from "./systems/FascistCorporatistSystem";
import { LaissezFaireToInterventionSystem } from "./systems/LaissezFaireToInterventionSystem";
import { MexicanPopulistSystem } from "./systems/MexicanPopulistSystem";
import { NewDealSystem } from "./systems/NewDealSystem";
import { SovietFiveYearPlanSystem } from "./systems/SovietFiveYearPlanSystem";
import { NegativeRepercussionsMechanic } from "./mechanics/NegativeRepercussionsMechanic";
import { RepressivePolicyMechanic } from "./mechanics/RepressivePolicyMechanic";
import { GameSystem } from "../../core/GameSystem";
import type { GameState } from "../../core/GameState";
import { Nation } from "../Nation";
import { Nations } from "../../data/Nations";
import { Rubrics } from "../../data/Rubrics";
import { WorldState1900 } from "../WorldState1900";
import { LearningObjective } from "../../types/LearningObjective";
import { ReasoningProcess } from "../../types/ReasoningProcess";
import { ResourceType } from "../../types/ResourceType";
import { SuggestedSkill } from "../../types/SuggestedSkill";
import { ThematicFocus } from "../../types/ThematicFocus";

export class ScenarioFour extends Scenario {
    private readonly playableSystems: GameSystem[];

    constructor() {
        super("scenario_four_the_broken_decade");
        this.playableSystems = [
            new SovietFiveYearPlanSystem(),
            new NewDealSystem(),
            new FascistCorporatistSystem(),
            new BrazilianPopulistSystem(),
            new MexicanPopulistSystem(),
            new LaissezFaireToInterventionSystem(),
            new SovietFiveYearPlanPath(),
            new NewDealPath(),
            new FascistCorporatistPath(),
            new BrazilianPath(),
            new MexicanPath(),
            new RepressivePolicyMechanic(),
            new NegativeRepercussionsMechanic(),
        ];
    }

    public override getScenarioNumber(): number {
        return 4;
    }

    public override getScenarioTitle(): string {
        return "The Broken Decade";
    }

    public override getScenarioSubtitle(): string {
        return "1919-1929";
    }

    public override getStartYear(): number {
        return 1919;
    }

    public override getEndYear(): number {
        return 1929;
    }

    public override getDurationInMinutes(): number {
        return 60;
    }

    public override getTurnCount(): number {
        return 10;
    }

    public override getThematicFocus(): ThematicFocus {
        return ThematicFocus.ECONOMIC_SYSTEMS;
    }

    public override getSuggestedSkill(): SuggestedSkill {
        return SuggestedSkill.SKILL_2_C;
    }

    public override getReasoningProcess(): ReasoningProcess {
        return ReasoningProcess.COMPARISON;
    }

    public override getLearningObjective(): LearningObjective {
        return LearningObjective.OBJECTIVE_D;
    }

    public override getPerspectiveLabels(): string[] {
        return ["Soviet Union", "United States", "Italy", "Germany", "Brazil", "Mexico"];
    }

    public override getBriefingParagraphs(): string[] {
        return [
            "The First World War left the world economy in ruins and the peace of 1919 unstable. Europe was in debt, currencies were shaken, and a new communist state in Russia claimed to have escaped the crisis of capitalism altogether. The decade that followed was no golden age: it was a broken decade of inflation, occupation, fragile recovery, and finally the crash of 1929.",
            "Governments answered economic crisis in sharply different ways. In the Soviet Union, Stalin's five-year plans forced rapid industrialization through state ownership of industry and the collectivization of agriculture, at enormous human cost. In Italy, Mussolini's fascists built a corporate state that preserved private property while subordinating labor and employers to the party. In the United States, the crash of 1929 discredited laissez-faire and brought the New Deal.",
            "In Latin America, leaders such as Getúlio Vargas in Brazil and Lázaro Cárdenas in Mexico built popular support through labor protections, land reform, and the assertion of national control over resources. Each response claimed to serve the people; each also created new problems of coercion, exclusion, or dependence.",
            "Across six perspectives, compare these responses to economic crisis. Identify what the Soviet, American, Italian, Brazilian, and Mexican governments shared and where they diverged, explain why the Great Depression pushed states toward intervention, and judge the trade-offs each path imposed on its people.",
        ];
    }

    public override getObjectiveSummaries(): string[] {
        return [
            "Compare at least two responses to economic crisis after 1919, identifying one similarity and one difference with evidence.",
            "Explain how the Great Depression discredited laissez-faire and expanded the economic role of governments.",
            "Complete the comparison chart 'Five Responses to Economic Crisis' and explain the significance of one row.",
            "Play at least three of the five economic paths and weigh each path's benefits against its costs.",
        ];
    }

    public override getScenarioResourceCodes(): string[] {
        return [
            ResourceType.PRODUCTION.getCode(),
            ResourceType.TREASURY.getCode(),
            ResourceType.SUPPORT.getCode(),
            ResourceType.REPRESSION.getCode(),
            ResourceType.GROWTH.getCode(),
        ];
    }

    public override getPlayableSystems(): GameSystem[] {
        return this.playableSystems;
    }

    public override getFocusTreeDefinition(): FocusTreeDefinition | null {
        return null;
    }

    public override getPrimarySourceIdentifiers(): string[] {
        return ["cardenas_speech_to_the_nation_1938", "stalin_industrialization_1928"];
    }

    public override getDecisionRecords(): DecisionRecord[] {
        return [
            new DecisionRecord(
                "s4_decision_soviet_five_year_plan",
                "The First Five-Year Plan",
                "By 1928 the Soviet Union had survived civil war, foreign intervention, and the New Economic Policy, but it remained a largely agrarian state surrounded by hostile powers. Stalin argued that the country had to close a fifty- to hundred-year gap with the industrial West within a decade, and the party weighed whether to force industrialization through state plans and the collectivization of agriculture or to continue the market elements of the NEP.",
                "The five-year plans grew out of the Bolsheviks' fear of encirclement, the failure of the market to industrialize quickly, and the leadership's determination to control the grain-producing countryside.",
                "The Soviet answer to economic crisis can be compared with fascist corporatism and the New Deal: all three expanded state direction of economic life after 1919, though they disagreed about property, democracy, and coercion.",
                "What continued was the old tradition of the state driving modernization from above; what changed was that a communist party, not a dynasty, now commanded the effort.",
                "Stalin's 1928 speech presents the plan as a matter of national survival, a point of view that justifies extraordinary sacrifice and conceals the human cost of collectivization.",
                [
                    new DecisionOption(
                        "s4_soviet_option_plan",
                        "Launch the first five-year plan and collectivize agriculture.",
                        "Heavy industry and state power grow quickly, but the countryside is squeezed, support drains away, and repression becomes an instrument of the plan.",
                        "path_s4_soviet",
                        ResourceType.PRODUCTION.getCode(),
                        10,
                    ),
                    new DecisionOption(
                        "s4_soviet_option_nep",
                        "Keep the New Economic Policy and its market elements.",
                        "The peasantry and small traders breathe more easily, but the leadership's demand for rapid industrialization goes unmet.",
                        "path_s4_soviet_deferred",
                        ResourceType.SUPPORT.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s4_soviet_option_concessions",
                        "Seek foreign concessions and trade with capitalist powers.",
                        "Foreign machinery and expertise arrive slowly, and the state remains dependent on the powers it fears.",
                        "path_s4_soviet_deferred",
                        ResourceType.TREASURY.getCode(),
                        10,
                    ),
                ],
            ),
            new DecisionRecord(
                "s4_decision_new_deal",
                "The First Hundred Days",
                "The Wall Street Crash of October 1929 shattered the confidence of the 1920s. By 1933 banks had failed by the thousands, a quarter of the workforce was unemployed, and Americans debated whether recovery demanded federal intervention or the old faith in balanced budgets and voluntary cooperation.",
                "The Depression was caused by a speculative bubble, weak banking structures, and a collapse of demand, and it discredited the laissez-faire assumptions that had governed the decade.",
                "The American response invites comparison with Soviet planning, fascist corporatism, and Latin American populism, each of which gave the state a larger role in the economy.",
                "Laissez-faire persisted as a rhetorical commitment while, in practice, the federal government changed into a permanent manager of the economy.",
                "Newspapers and radio carried Roosevelt's reassurance into every home, and the sources of the New Deal era speak in the voice of a government selling its own program.",
                [
                    new DecisionOption(
                        "s4_new_deal_option_relief",
                        "Enact the New Deal: relief, recovery, and reform.",
                        "Federal agencies restore confidence, growth returns slowly, and the state takes a lasting place in American economic life.",
                        "path_s4_new_deal",
                        ResourceType.GROWTH.getCode(),
                        10,
                    ),
                    new DecisionOption(
                        "s4_new_deal_option_voluntary",
                        "Rely on voluntary cooperation and balanced budgets.",
                        "The treasury is preserved, but unemployment persists and the crisis deepens.",
                        "path_s4_new_deal_deferred",
                        ResourceType.TREASURY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s4_new_deal_option_states",
                        "Leave relief to the states and private charities.",
                        "Local effort proves unequal to a national collapse, and public confidence falls.",
                        "path_s4_new_deal_deferred",
                        ResourceType.SUPPORT.getCode(),
                        -5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s4_decision_fascist_corporatist",
                "The Corporate State",
                "Postwar Italy suffered inflation, strikes, and fear of revolution. Mussolini's fascists promised order, national greatness, and a third way between socialism and liberal capitalism, organizing employers and workers into state-supervised corporations and suppressing independent unions.",
                "The corporate state was a response to labor unrest, the weakness of liberal governments, and the fascist movement's need to control both workers and owners.",
                "Italian corporatism shared with the Soviet planned economy a state-directed economy and the suppression of independent unions, but it preserved private property and the profit motive.",
                "The Italian state had long intervened in industry; what changed was the total claim of a single party over organized economic life.",
                "Fascist propaganda presented corporatism as harmony between classes, a point of view that concealed the coercion behind the syndicates.",
                [
                    new DecisionOption(
                        "s4_fascist_option_corporate",
                        "Build the corporate state under fascist authority.",
                        "Stability and production rise as syndicates bind labor to the regime, but repression becomes the price of order.",
                        "path_s4_fascist_corporatist",
                        ResourceType.PRODUCTION.getCode(),
                        10,
                    ),
                    new DecisionOption(
                        "s4_fascist_option_liberal",
                        "Preserve parliamentary government and free markets.",
                        "Liberal institutions survive, but they struggle to master the strikes and inflation that feed the fascist movement.",
                        "path_s4_fascist_corporatist_deferred",
                        ResourceType.SUPPORT.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s4_fascist_option_socialist",
                        "Turn toward revolutionary socialism instead.",
                        "The left gains the initiative, and the propertied classes begin to look to the fascists for protection.",
                        "path_s4_fascist_corporatist_deferred",
                        ResourceType.SUPPORT.getCode(),
                        -5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s4_decision_brazil",
                "The Estado Novo",
                "The coffee republic of São Paulo and Minas Gerais was shaken by the crash of 1929, which destroyed the value of Brazil's chief export. Getúlio Vargas centralized the state, courted the urban working class with labor and welfare laws, and built a new politics that pushed the old oligarchies aside.",
                "The crisis of the coffee economy, the revolt of the tenentes, and the collapse of oligarchic politics produced a more centralized state.",
                "Vargas's Brazil can be compared with fascist Italy and Cárdenas's Mexico: each promised workers protection while binding labor organization to the state.",
                "What persisted was the power of the state over regional oligarchies; what changed was the inclusion of urban workers as a political base of the regime.",
                "Brazilian labor law and official propaganda present Vargas as the workers' protector, a point of view that hides the suppression of independent unions.",
                [
                    new DecisionOption(
                        "s4_brazil_option_estado_novo",
                        "Centralize the state under Getúlio Vargas and court the urban workers.",
                        "The state grows stronger and urban support rises, while regional oligarchs and independent unions lose ground.",
                        "path_s4_brazil",
                        ResourceType.SUPPORT.getCode(),
                        10,
                    ),
                    new DecisionOption(
                        "s4_brazil_option_coffee",
                        "Preserve the coffee and milk politics of São Paulo and Minas Gerais.",
                        "The old export economy is defended, but the crash and the tenentes expose the limits of oligarchic rule.",
                        "path_s4_brazil_deferred",
                        ResourceType.TREASURY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s4_brazil_option_revolt",
                        "Back a liberal constitutionalist revolt.",
                        "The revolt fails against the centralized state, and its backers are absorbed or silenced.",
                        "path_s4_brazil_deferred",
                        ResourceType.SUPPORT.getCode(),
                        -5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s4_decision_mexico",
                "The Revolution's Harvest",
                "Mexico's revolution had promised land and social justice, but the 1920s brought the assassination of presidents, the Cristero conflict, and the consolidation of power under the revolutionary generals. Lázaro Cárdenas carried the revolution further, distributing land, organizing peasants and workers, and expropriating foreign oil companies.",
                "Decades of land hunger, foreign ownership of oil, and the revolution's unfinished promises drove the turn toward reform.",
                "Cárdenas's Mexico can be compared with Vargas's Brazil and the Soviet Union: all three built state power on the support of workers and peasants, though Mexico preserved private property and contested politics.",
                "The constitution of 1917 and the ideal of the revolutionary state persisted; what changed was the depth of land reform and the assertion of national control over oil.",
                "Cárdenas's radio speech frames expropriation as national dignity, a point of view that says little about the compensation terms or the workers' dispute that began it.",
                [
                    new DecisionOption(
                        "s4_mexico_option_reform",
                        "Carry the revolution into the Cárdenas reforms of land, labor, and oil.",
                        "Peasant and worker support grows, and the state asserts control over its resources at the cost of foreign capital.",
                        "path_s4_mexico",
                        ResourceType.SUPPORT.getCode(),
                        10,
                    ),
                    new DecisionOption(
                        "s4_mexico_option_generals",
                        "Consolidate a conservative order under the revolutionary generals.",
                        "The regime stabilizes and foreign investors are reassured, but the revolution's land promises go unmet.",
                        "path_s4_mexico_deferred",
                        ResourceType.TREASURY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s4_mexico_option_foreign",
                        "Open the economy further to foreign capital.",
                        "Oil and industry stay in foreign hands, and nationalist feeling turns against the government.",
                        "path_s4_mexico_deferred",
                        ResourceType.TREASURY.getCode(),
                        10,
                    ),
                ],
            ),
            new DecisionRecord(
                "s4_decision_laissez_faire",
                "From Laissez-Faire to Intervention",
                "The First World War had already drawn governments into managing production, exchange, and consumption on an unprecedented scale. When the crash of 1929 exposed the fragility of unregulated markets, states everywhere weighed the old doctrine of laissez-faire against a more active role in economic life.",
                "Total war and then the Depression discredited the belief that markets would correct themselves and pushed governments toward intervention.",
                "Soviet planning, fascist corporatism, the New Deal, and Latin American populism were different answers to the same question: how far should the state direct the economy?",
                "Markets and private property persisted in most of the world; what changed was the assumption that governments must manage growth, employment, and welfare.",
                "The sources of the era, from plans to speeches to laws, speak in the voice of governments justifying a larger economic role.",
                [
                    new DecisionOption(
                        "s4_factor_option_intervention",
                        "Accept that governments must manage production, exchange, and consumption.",
                        "The state takes a permanent role in economic life across much of the world.",
                        "factor_s4_intervention_accepted",
                        ResourceType.SUPPORT.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s4_factor_option_orthodoxy",
                        "Defend the gold standard and balanced budgets.",
                        "Orthodoxy preserves the treasury but prolongs the Depression and discredits the old policy.",
                        "factor_s4_orthodoxy_defended",
                        ResourceType.TREASURY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s4_factor_option_market",
                        "Insist that markets, not governments, must lead recovery.",
                        "Private initiative is trusted, but unemployment and unrest test that faith.",
                        "factor_s4_market_recovery_trusted",
                        ResourceType.GROWTH.getCode(),
                        5,
                    ),
                ],
            ),
        ];
    }

    public override getScenarioEventSchedule(): ScenarioEventRecord[] {
        return [
            new ScenarioEventRecord(
                1,
                "treaty_of_versailles",
                "TREATY OF VERSAILLES SIGNED AS THE POWERS REDRAW EUROPE AND IMPOSE REPARATIONS",
                "newspaper_masthead_france",
                "FRA",
                "event_treaty_versailles",
            ),
            new ScenarioEventRecord(
                2,
                "league_of_nations_founded",
                "LEAGUE OF NATIONS FOUNDED TO KEEP THE PEACE",
                "newspaper_masthead_britain",
                "ENG",
                "event_league_of_nations",
            ),
            new ScenarioEventRecord(
                3,
                "german_hyperinflation",
                "GERMAN MARK COLLAPSES AS HYPERINFLATION WIPES OUT SAVINGS",
                "newspaper_masthead_germany",
                "GER",
                "event_great_depression",
            ),
            new ScenarioEventRecord(
                4,
                "ruhr_occupation",
                "FRENCH TROOPS OCCUPY THE RUHR AS GERMANY DEFAULTS ON REPARATIONS",
                "newspaper_masthead_germany",
                "GER",
                "event_great_depression",
            ),
            new ScenarioEventRecord(
                5,
                "five_year_plan",
                "MOSCOW LAUNCHES THE FIRST FIVE-YEAR PLAN FOR RAPID INDUSTRIALIZATION",
                "newspaper_masthead_ussr",
                "SOV",
                "event_five_year_plan",
            ),
            new ScenarioEventRecord(
                6,
                "locarno_treaties",
                "LOCARNO TREATIES SIGNED AS GERMANY REJOINS THE EUROPEAN ORDER",
                "newspaper_masthead_germany",
                "GER",
                "event_league_of_nations",
            ),
            new ScenarioEventRecord(
                7,
                "mexican_oil_expropriation",
                "CÁRDENAS EXPROPRIATES FOREIGN OIL COMPANIES FOR THE MEXICAN NATION",
                "newspaper_masthead_default",
                "MEX",
                "event_five_year_plan",
            ),
            new ScenarioEventRecord(
                8,
                "wall_street_crash",
                "WALL STREET CRASH: PANIC SELLING DESTROYS THE BOOM OF THE TWENTIES",
                "newspaper_masthead_usa",
                "USA",
                "event_great_depression",
            ),
            new ScenarioEventRecord(
                9,
                "new_deal_launched",
                "ROOSEVELT LAUNCHES THE NEW DEAL TO FIGHT THE DEPRESSION",
                "newspaper_masthead_usa",
                "USA",
                "event_new_deal",
            ),
            new ScenarioEventRecord(
                10,
                "great_depression",
                "DEPRESSION SPREADS ACROSS EUROPE AS FACTORIES AND BANKS FAIL",
                "newspaper_masthead_germany",
                "GER",
                "event_great_depression",
            ),
        ];
    }

    public override getCausalChainDefinitions(): CausalChainDefinition[] {
        return [];
    }

    public override getComparisonDefinition(): ComparisonDefinition | null {
        return new ComparisonDefinition("Five Responses to Economic Crisis", "State-Directed Responses", "Market and Populist Responses", [
            new ComparisonRow(
                "s4_comparison_row_state_industry",
                "The state's role in industry: Soviet five-year plans compared with the American New Deal",
                "The Soviet state owned the means of production and set output targets for heavy industry through central plans.",
                "The New Deal preserved private ownership but used federal agencies and public works to regulate industry and create jobs.",
                true,
            ),
            new ComparisonRow(
                "s4_comparison_row_ownership",
                "Ownership of industry: the Soviet planned economy compared with Italian fascist corporatism",
                "Soviet planners abolished private ownership of factories and farms and directed all output through the state.",
                "Fascist Italy kept private property and profit while binding employers and workers into state-supervised corporations.",
                false,
            ),
            new ComparisonRow(
                "s4_comparison_row_agriculture",
                "Agricultural policy: Soviet collectivization compared with Mexican land reform under Cárdenas",
                "Collectivization forced peasants into state farms through requisitioning, deportation, and terror.",
                "Cárdenas distributed estates to peasant communities as ejidos and won rural support for the revolutionary state.",
                false,
            ),
            new ComparisonRow(
                "s4_comparison_row_dissent",
                "Politics and dissent: the Soviet one-party state compared with the democratic New Deal",
                "The Soviet Union suppressed rival parties and independent unions through the secret police and the gulag.",
                "The New Deal operated within elections, courts, and contested politics despite fierce opposition from its enemies.",
                false,
            ),
            new ComparisonRow(
                "s4_comparison_row_labor_organization",
                "Labor organization: Italian corporatism compared with the Brazilian Estado Novo under Vargas",
                "Fascist Italy replaced independent unions with corporations in which employers and workers served under state authority.",
                "Vargas's Brazil created state-controlled unions that offered workers welfare benefits while banning strikes and rivals.",
                true,
            ),
            new ComparisonRow(
                "s4_comparison_row_popular_appeal",
                "Appeals to workers and peasants: Brazil under Vargas compared with Mexico under Lázaro Cárdenas",
                "Vargas courted the urban working class with labor laws and social insurance tied to the state.",
                "Cárdenas organized peasants and workers into mass organizations that made the revolution a popular cause.",
                true,
            ),
            new ComparisonRow(
                "s4_comparison_row_industrialization_above",
                "Industrialization from above: the Soviet five-year plans compared with state-led development in Brazil and Mexico",
                "The Soviet Union concentrated investment in heavy industry and forced the pace of growth at enormous human cost.",
                "Brazil and Mexico used tariffs, state enterprises, and infrastructure to promote industry while private landowners kept much of their power.",
                true,
            ),
            new ComparisonRow(
                "s4_comparison_row_laissez_faire",
                "The fate of laissez-faire: the American New Deal compared with the Italian corporate state",
                "The New Deal regulated markets but left competition, private property, and consumer choice largely intact.",
                "The corporate state replaced free competition with compulsory syndicates bound to the party's plans.",
                false,
            ),
            new ComparisonRow(
                "s4_comparison_row_natural_resources",
                "Control of natural resources: Mexican oil under Cárdenas compared with Soviet industry",
                "Cárdenas expropriated foreign oil companies in 1938, compensating them while asserting national sovereignty over resources.",
                "The Soviet state seized industry outright, without compensation, and folded it into the planned economy.",
                false,
            ),
            new ComparisonRow(
                "s4_comparison_row_recovery",
                "Recovery from depression: the Soviet claim of planned growth compared with market recovery in the United States",
                "Soviet propaganda presented uninterrupted planned growth as proof that socialism had escaped the capitalist crisis.",
                "American recovery after 1933 depended on restored confidence, bank reform, and private investment as much as on federal spending.",
                false,
            ),
        ]);
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
        return Rubrics.getRubricItemsForScenario(4).map((rubricItem) => rubricItem.promptText);
    }

    public override getJournalPrompts(): string[] {
        return [
            "Compare the state-directed response of the Soviet Union with the market and populist responses of the United States, Italy, Brazil, and Mexico: which similarity and which difference best explain the variety of answers to economic crisis after 1919?",
            "Shared inquiry: What is each author's purpose and audience in Stalin's 1928 speech and Cárdenas's 1938 radio address, and how are the two sources similar and different?",
            "How did the responses to economic crisis between 1919 and 1929 both address and create problems for the peoples of the Soviet Union, the United States, Italy, Brazil, and Mexico?",
        ];
    }

    public override supportsDiplomaticPlay(): boolean {
        return false;
    }

    public override supportsTimelineScrubber(): boolean {
        return true;
    }

    public override supportsProductionQueue(): boolean {
        return true;
    }

    public override supportsDivisionDesigner(): boolean {
        return false;
    }

    public override getContentAdvisoryNote(): string {
        return "This scenario presents the human cost of forced collectivization, famine, and political repression in factual, educational terms.";
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
        gameState.setPlayerNationIdentifier("soviet_union");
        gameState.setResourceQuantity(ResourceType.PRODUCTION, 40);
        gameState.setResourceQuantity(ResourceType.TREASURY, 150);
        gameState.setResourceQuantity(ResourceType.SUPPORT, 40);
        gameState.setResourceQuantity(ResourceType.REPRESSION, 30);
        gameState.setResourceQuantity(ResourceType.GROWTH, 20);
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        for (const playableSystem of this.playableSystems) {
            playableSystem.simulateTurn(turnNumber, gameState);
        }
    }

    public override evaluateVictory(gameState: GameState): ScenarioEvaluationResult {
        const flagStatus = this.collectFlagStatus(gameState, [
            { flagIdentifier: "path_s4_soviet", flagDescription: "Path played: The First Five-Year Plan" },
            { flagIdentifier: "path_s4_new_deal", flagDescription: "Path played: The First Hundred Days" },
            { flagIdentifier: "path_s4_fascist_corporatist", flagDescription: "Path played: The Corporate State" },
            { flagIdentifier: "path_s4_brazil", flagDescription: "Path played: The Estado Novo" },
            { flagIdentifier: "path_s4_mexico", flagDescription: "Path played: The Revolution's Harvest" },
            { flagIdentifier: "comparison_s4_complete", flagDescription: "Comparison completed: Five Responses to Economic Crisis" },
            { flagIdentifier: "shared_inquiry_s4_saved", flagDescription: "Shared inquiry saved" },
        ]);
        const pathFlagIdentifiers = [
            "path_s4_soviet",
            "path_s4_new_deal",
            "path_s4_fascist_corporatist",
            "path_s4_brazil",
            "path_s4_mexico",
        ];
        let satisfiedPathCount = 0;
        for (const pathFlagIdentifier of pathFlagIdentifiers) {
            if (gameState.isScenarioFlagSet(pathFlagIdentifier)) {
                satisfiedPathCount += 1;
            }
        }
        const isVictory =
            satisfiedPathCount >= 3 &&
            gameState.isScenarioFlagSet("comparison_s4_complete") &&
            gameState.isScenarioFlagSet("shared_inquiry_s4_saved");
        return new ScenarioEvaluationResult(
            4,
            isVictory,
            flagStatus.satisfiedCount,
            7,
            flagStatus.satisfiedCriteria,
            flagStatus.unmetCriteria,
        );
    }
}
