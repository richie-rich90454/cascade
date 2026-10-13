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
    CausalChainCause,
    CausalChainDefinition,
    ComparisonDefinition,
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
import { AllianceSystem } from "./systems/AllianceSystem";
import { ImperialistExpansionSystem } from "./systems/ImperialistExpansionSystem";
import { NationalismSystem } from "./systems/NationalismSystem";
import { ResourceCompetitionSystem } from "./systems/ResourceCompetitionSystem";
import { TerritorialConflictSystem } from "./systems/TerritorialConflictSystem";

export class ScenarioTwo extends Scenario {
    private readonly playableSystems: GameSystem[];

    constructor() {
        super("scenario_two_the_guns_of_august");
        this.playableSystems = [
            new ImperialistExpansionSystem(),
            new ResourceCompetitionSystem(),
            new TerritorialConflictSystem(),
            new AllianceSystem(),
            new NationalismSystem(),
        ];
    }

    public override getScenarioNumber(): number {
        return 2;
    }

    public override getScenarioTitle(): string {
        return "The Guns of August";
    }

    public override getScenarioSubtitle(): string {
        return "1914";
    }

    public override getStartYear(): number {
        return 1914;
    }

    public override getEndYear(): number {
        return 1914;
    }

    public override getDurationInMinutes(): number {
        return 45;
    }

    public override getTurnCount(): number {
        return 5;
    }

    public override getThematicFocus(): ThematicFocus {
        return ThematicFocus.GOVERNANCE;
    }

    public override getSuggestedSkill(): SuggestedSkill {
        return SuggestedSkill.SKILL_1_B;
    }

    public override getReasoningProcess(): ReasoningProcess {
        return ReasoningProcess.CAUSATION;
    }

    public override getLearningObjective(): LearningObjective {
        return LearningObjective.OBJECTIVE_B;
    }

    public override getPerspectiveLabels(): string[] {
        return ["Austria-Hungary", "Serbia", "Germany", "Russia", "France", "Great Britain"];
    }

    public override getBriefingParagraphs(): string[] {
        return [
            "In 1914 the great powers of Europe stood divided into two armed camps. The Triple Alliance of Germany, Austria-Hungary, and Italy faced the Triple Entente of France, Russia, and Great Britain, and each camp measured its security in dreadnoughts, conscripts, and war plans. Imperial rivalry over colonies, markets, and raw materials had poisoned relations for a generation.",
            "Nationalism sharpened every dispute. In the Balkans, Serbia's ambition and Austria-Hungary's fear collided over Bosnia and the South Slav lands. In France, the lost provinces of Alsace-Lorraine kept revanche alive; in Germany, pan-German societies demanded a place in the sun. The Ottoman retreat from Europe left a region where small wars kept becoming great-power crises.",
            "On June 28, 1914, Archduke Franz Ferdinand, heir to the Austro-Hungarian throne, was assassinated in Sarajevo by Gavrilo Princip, a Bosnian Serb nationalist. Within five weeks the blank cheque, an ultimatum to Serbia, general mobilization, and the German march through Belgium had turned a regional quarrel into a world war.",
            "Your task across six perspectives is to sort the causes of the war into internal and external factors, to order them from long-term strains to the events of July 1914, to complete the July Crisis focus tree, and to explain how the choices of one summer became the catastrophe of a generation.",
        ];
    }

    public override getObjectiveSummaries(): string[] {
        return [
            "Identify three internal and three external factors behind the outbreak of the First World War.",
            "Order the causes in each causal chain from long-term (decades) to short-term (days).",
            "Complete the July Crisis focus tree and unlock the July Crisis node.",
            "Write an SAQ explaining how the alliance system turned a Balkan crisis into a European war.",
        ];
    }

    public override getScenarioResourceCodes(): string[] {
        return [
            ResourceType.ALLIANCES.getCode(),
            ResourceType.MOBILIZATION.getCode(),
            ResourceType.TREASURY.getCode(),
            ResourceType.NATIONALISM.getCode(),
            ResourceType.IMPERIAL_PRESTIGE.getCode(),
        ];
    }

    public override getPlayableSystems(): GameSystem[] {
        return this.playableSystems;
    }

    public override getFocusTreeDefinition(): FocusTreeDefinition | null {
        return new FocusTreeDefinition("The July Crisis", [
            new FocusNodeDefinition(
                "focus_s2_blank_cheque",
                "The Blank Cheque",
                "On July 5 and 6, 1914, Germany promised Austria-Hungary unconditional support against Serbia. The promise emboldened Vienna to write an ultimatum it expected Belgrade to reject.",
                "Unlocks the decision to issue or restrain the blank cheque and marks the alliance system as the mechanism that widened the crisis.",
                [],
                "",
                0,
                1,
            ),
            new FocusNodeDefinition(
                "focus_s2_russian_mobilization",
                "Russian Mobilization",
                "Russia ordered partial mobilization on July 29, 1914, and general mobilization on July 30 to protect its standing in the Balkans. Germany demanded that the mobilization stop.",
                "Unlocks the mobilization decision and records how military timetables narrowed the choices of civilian leaders.",
                ["focus_s2_blank_cheque"],
                "",
                1,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s2_belgian_neutrality",
                "The Violation of Belgium",
                "The Schlieffen Plan required the German armies to march through Belgium, whose neutrality the Treaty of London of 1839 had guaranteed. The invasion began on August 4, 1914.",
                "Unlocks the decision to defend or violate Belgian neutrality and shows how a war plan became a treaty violation.",
                ["focus_s2_blank_cheque"],
                "",
                1,
                2,
            ),
            new FocusNodeDefinition(
                "focus_s2_britain_declares_war",
                "Britain Declares War",
                "Britain declared war on Germany on August 4, 1914, after the invasion of Belgium. Grey's speech to the Commons framed the decision as a defense of treaties and the balance of power.",
                "Unlocks the British entry decision and brings the naval power and its empire into the war.",
                ["focus_s2_belgian_neutrality"],
                "",
                2,
                1,
            ),
            new FocusNodeDefinition(
                "focus_s2_july_crisis",
                "The July Crisis",
                "Between June 28 and August 4, 1914, the decisions of a single month carried Europe from an assassination to a general war. Each capital believed it was reacting to the moves of the others.",
                "Completes the focus tree once all four immediate causes are unlocked and awards the July Crisis completion flag.",
                [
                    "focus_s2_blank_cheque",
                    "focus_s2_russian_mobilization",
                    "focus_s2_belgian_neutrality",
                    "focus_s2_britain_declares_war",
                ],
                "causal_chain_s2_alliances",
                3,
                1,
            ),
        ]);
    }

    public override getPrimarySourceIdentifiers(): string[] {
        return ["blank_cheque_telegram", "serbian_reply_to_ultimatum", "grey_speech_three_august"];
    }

    public override getDecisionRecords(): DecisionRecord[] {
        return [
            new DecisionRecord(
                "s2_decision_blank_cheque",
                "The Blank Cheque",
                "On July 5 and 6, 1914, Austria-Hungary asked for German support against Serbia. Kaiser Wilhelm II and Chancellor Bethmann Hollweg promised that Germany would stand by its ally whatever Vienna decided. Vienna read the promise as a free hand, and the crisis began to move faster than any capital could control.",
                "The assassination at Sarajevo was the occasion; the deeper cause was the alliance system, whose unconditional promises removed any incentive for Vienna to negotiate.",
                "Compare the blank cheque with Russia's promise of support to Serbia: both allies offered unconditional backing and both encouraged their client to stand firm.",
                "What continues is great-power rivalry in the Balkans; what changes is the speed, as a diplomatic crisis becomes a military timetable within a single month.",
                "The telegram is secret and informal, recording German intent at one moment; its consequences must be read in the ultimatum Vienna sent three weeks later.",
                [
                    new DecisionOption(
                        "s2_blank_cheque_option_issue",
                        "Issue the blank cheque and promise Germany's full support.",
                        "Vienna gains a free hand and writes an ultimatum designed to be rejected; Berlin has made itself responsible for the consequences.",
                        "factor_s2_blank_cheque_issued",
                        ResourceType.ALLIANCES.getCode(),
                        10,
                    ),
                    new DecisionOption(
                        "s2_blank_cheque_option_restrain",
                        "Urge Vienna to seek mediation and wait.",
                        "Restraint cools the crisis for a week, but Vienna reads hesitation as weakness and acts alone if it can.",
                        "factor_s2_blank_cheque_restrained",
                        ResourceType.NATIONALISM.getCode(),
                        -5,
                    ),
                    new DecisionOption(
                        "s2_blank_cheque_option_internationalize",
                        "Refer the crisis to the other powers before any action.",
                        "The concert of Europe is given one more chance to hold, though every capital suspects its neighbors' motives.",
                        "factor_s2_blank_cheque_internationalized",
                        ResourceType.ALLIANCES.getCode(),
                        5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s2_decision_ultimatum",
                "The Ultimatum to Serbia",
                "On July 23, 1914, Austria-Hungary delivered a ten-point ultimatum to Serbia, demanding among other things a joint inquiry on Serbian soil. Serbia's reply of July 25 accepted most points but refused the demand that would violate its constitution. Vienna declared the reply unsatisfactory and declared war on July 28.",
                "The ultimatum converted an assassination into a program of demands; because the terms were written to be refused, diplomacy was given almost no room.",
                "Compare Serbia's reply with the ultimatum: a small state conceded as much as its constitution allowed, while the empire treated any reservation as rejection.",
                "The rivalries of the Balkan Wars continue; what changes is that after July 28, 1914, Austria-Hungary and Serbia are formally at war.",
                "Serbia's reply was drafted in one week for European opinion as much as for Vienna; it records what Belgrade would say publicly, not the support it expected from Russia.",
                [
                    new DecisionOption(
                        "s2_ultimatum_option_reject",
                        "Reject the ultimatum outright and mobilize.",
                        "Nationalist feeling hardens on both sides, and the last space for a negotiated settlement closes.",
                        "factor_s2_ultimatum_rejected",
                        ResourceType.NATIONALISM.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s2_ultimatum_option_partial",
                        "Accept most demands and appeal to the great powers.",
                        "Serbia wins the sympathy of European opinion, while Vienna declares the reply evasive and prepares for war.",
                        "factor_s2_ultimatum_partial_reply",
                        ResourceType.ALLIANCES.getCode(),
                        -10,
                    ),
                    new DecisionOption(
                        "s2_ultimatum_option_accept",
                        "Accept every demand, including Austrian participation in the inquiry.",
                        "War is postponed at the price of sovereignty; the government's standing at home is badly damaged.",
                        "factor_s2_ultimatum_accepted",
                        ResourceType.LEGITIMACY.getCode(),
                        -10,
                    ),
                ],
            ),
            new DecisionRecord(
                "s2_decision_mobilization",
                "Mobilization and the Schlieffen Plan",
                "Russia's general mobilization on July 30 set the German war plan in motion, and Germany declared war on Russia on August 1 and on France on August 3. The Schlieffen Plan called for a rapid attack on France through Belgium before Russia could fully mobilize, so the timetables of the general staffs now commanded the crisis.",
                "Once the timetables began, each capital believed that a day's delay would cost it the war; the military schedule became a cause in its own right.",
                "Compare the Russian decision for general mobilization with the German execution of the Schlieffen Plan: both governments claimed they were merely reacting to the other's moves.",
                "Decades of war planning persist in the very shape of the fighting; what changes is that by August 1 the choice between war and peace has passed from civilians to general staffs.",
                "The mobilization orders survive in the archives, but the intentions behind them are known mainly through the memoirs of the men who issued them, written after the war.",
                [
                    new DecisionOption(
                        "s2_mobilization_option_general",
                        "Order general mobilization and execute the Schlieffen Plan.",
                        "The armies move on schedule, and the violation of Belgium becomes certain rather than accidental.",
                        "factor_s2_schlieffen_plan_executed",
                        ResourceType.MOBILIZATION.getCode(),
                        15,
                    ),
                    new DecisionOption(
                        "s2_mobilization_option_partial",
                        "Mobilize only in the south against Austria-Hungary.",
                        "A partial mobilization preserves the chance of negotiation but leaves the armies half prepared for a wider war.",
                        "factor_s2_partial_mobilization",
                        ResourceType.MOBILIZATION.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s2_mobilization_option_hold",
                        "Hold mobilization and keep the chancelleries negotiating.",
                        "Diplomacy gains days but loses the initiative; rivals mobilize while the government waits.",
                        "factor_s2_mobilization_held",
                        ResourceType.MOBILIZATION.getCode(),
                        -10,
                    ),
                ],
            ),
            new DecisionRecord(
                "s2_decision_belgium",
                "The Violation of Belgium",
                "German armies crossed into Belgium on August 4, 1914, in execution of the Schlieffen Plan. Belgian neutrality had been guaranteed by the Treaty of London of 1839, and Britain declared war the same day. The defense of Liège delayed the German timetable long enough for France to prepare.",
                "The invasion of Belgium gave Britain the legal and moral grounds for war; the Schlieffen Plan had made the violation of neutrality a certainty, not an accident.",
                "Compare the German treatment of Belgian neutrality with Britain's insistence on the treaty: both powers invoked treaty law when it served their plans and treated it as a formality when it did not.",
                "Guarantees of small-state neutrality persist on paper; what changes is that they are no longer a barrier once great-power war plans are set in motion.",
                "Grey's speech of August 3, 1914 frames the war as a defense of treaties and the balance of power while passing lightly over Britain's prior colonial rivalry with Germany.",
                [
                    new DecisionOption(
                        "s2_belgium_option_honor_treaty",
                        "Honor the treaty of 1839 and demand the German withdrawal.",
                        "Britain enters the war with a united cabinet and the language of international law on its side.",
                        "factor_s2_belgium_neutrality_defended",
                        ResourceType.ALLIANCES.getCode(),
                        10,
                    ),
                    new DecisionOption(
                        "s2_belgium_option_march_through",
                        "March through Belgium as the war plan requires.",
                        "The armies gain speed and lose the world's opinion; Britain and its empire join the enemy camp.",
                        "factor_s2_belgium_neutrality_violated",
                        ResourceType.IMPERIAL_PRESTIGE.getCode(),
                        -15,
                    ),
                    new DecisionOption(
                        "s2_belgium_option_protest",
                        "Protest the violation but take no action.",
                        "The government preserves its freedom of action while the guarantee it signed loses its force in Europe's eyes.",
                        "factor_s2_belgium_protested",
                        ResourceType.ALLIANCES.getCode(),
                        -5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s2_decision_consequences",
                "The Consequences of the Great War",
                "By 1918 the war had become total. Industry poured out shells and poison gas, governments rationed food and conscripted labor, and the old dynasties of Austria-Hungary, Russia, and the Ottoman Empire collapsed. The United States emerged as the creditor of Europe and the arbiter of the peace.",
                "The length and scale of the war produced these outcomes: total mobilization for the front made states total, and defeat broke the dynasties that had ruled central and eastern Europe.",
                "Compare the fate of the empires that entered the war with that of the United States, which entered late and grew stronger; the same conflict destroyed some states and elevated others.",
                "Great-power competition continues after 1918, but the map of Europe and the global balance of power are remade.",
                "The consequences reach beyond the battlefield: the peace treaties, the war debts, and the memory of the dead shaped the politics of the next generation.",
                [
                    new DecisionOption(
                        "s2_consequences_option_total_war",
                        "Accept that the war has become total, absorbing whole societies.",
                        "The state directs industry, science, and labor, and civilians become targets and participants alike.",
                        "consequence_s2_total_war",
                        ResourceType.MANPOWER.getCode(),
                        -15,
                    ),
                    new DecisionOption(
                        "s2_consequences_option_empires_collapsed",
                        "Accept the collapse of the old empires as the war's verdict.",
                        "The Habsburg, Romanov, and Ottoman dynasties do not survive the peace.",
                        "consequence_s2_empires_collapsed",
                        ResourceType.LEGITIMACY.getCode(),
                        -15,
                    ),
                    new DecisionOption(
                        "s2_consequences_option_us_ascendant",
                        "Accept the United States as the decisive new power.",
                        "American money and manpower end the war and shape the settlement.",
                        "consequence_s2_united_states_ascendant",
                        ResourceType.TREASURY.getCode(),
                        10,
                    ),
                ],
            ),
            new DecisionRecord(
                "s2_decision_war_of_attrition",
                "The War of Attrition",
                "By 1916 the front has settled into trenches from the North Sea to Switzerland. At Verdun and on the Somme the armies grind against each other, and the blockade squeezes the Central Powers. The strategy now is to wear the enemy down.",
                "Stalemate produced attrition: because neither side could turn a flank, the war became a contest of reserves, industry, and will.",
                "Compare the Eastern Front, where armies still maneuver, with the Western Front, where the trench line barely moves.",
                "The scale of the fighting changes, but the aim of each coalition remains the same: to break the other's capacity to continue.",
                "Soldiers' letters and official communiqués tell different stories of the same battles, one of endurance and one of victory.",
                [
                    new DecisionOption(
                        "s2_attrition_option_total_war",
                        "Sustain total war until the enemy's armies break.",
                        "Every factory, farm, and family is made part of the war effort.",
                        "consequence_s2_total_war",
                        ResourceType.MOBILIZATION.getCode(),
                        15,
                    ),
                    new DecisionOption(
                        "s2_attrition_option_empires_collapsed",
                        "Aim the attrition at the enemy empires, whose weakness it exposes.",
                        "The fighting hastens the internal collapse of the dynastic states.",
                        "consequence_s2_empires_collapsed",
                        ResourceType.LEGITIMACY.getCode(),
                        -15,
                    ),
                ],
            ),
            new DecisionRecord(
                "s2_decision_new_world_power",
                "The New World Power",
                "In 1917 the United States entered the war, lending the Allies money, shipping, and two million soldiers. American power, not European, will decide the terms of the peace and the shape of the new world order.",
                "The stalemate and the submarine campaign brought the United States in: a war begun over European alliances was decided by a power outside them.",
                "Compare America's position in 1914 with its position in 1917: from debtor and neutral trader to creditor and belligerent.",
                "Europe's empires weaken through the war, while a non-European power rises to preeminence in the world economy.",
                "Wilson's war message frames American entry as a crusade for democracy, a framing that shapes how the peace is later judged.",
                [
                    new DecisionOption(
                        "s2_new_world_option_us_ascendant",
                        "Welcome the United States as the arbiter of the peace.",
                        "American loans and ideals set the agenda at Paris.",
                        "consequence_s2_united_states_ascendant",
                        ResourceType.TREASURY.getCode(),
                        15,
                    ),
                    new DecisionOption(
                        "s2_new_world_option_empires_collapsed",
                        "Trust that the old empires will survive the settlement.",
                        "The dynasties fall and successor states inherit their quarrels.",
                        "consequence_s2_empires_collapsed",
                        ResourceType.IMPERIAL_PRESTIGE.getCode(),
                        -15,
                    ),
                ],
            ),
        ];
    }

    public override getScenarioEventSchedule(): ScenarioEventRecord[] {
        return [
            new ScenarioEventRecord(
                1,
                "assassination_at_sarajevo",
                "ARCHDUKE FRANZ FERDINAND SLAIN IN SARAJEVO",
                "newspaper_masthead_default",
                "AUH",
                "event_assassination_sarajevo",
            ),
            new ScenarioEventRecord(
                2,
                "july_ultimatum",
                "AUSTRIA-HUNGARY DELIVERS ULTIMATUM TO SERBIA; EUROPE AWAITS REPLY",
                "newspaper_masthead_default",
                "SER",
                "event_assassination_sarajevo",
            ),
            new ScenarioEventRecord(
                3,
                "schlieffen_plan_executed",
                "GERMANY MOBILIZES AGAINST RUSSIA AND FRANCE; SCHLIEFFEN PLAN BEGINS",
                "newspaper_masthead_germany",
                "GER",
                "event_schlieffen_plan",
            ),
            new ScenarioEventRecord(
                4,
                "belgium_invaded",
                "GERMANY STRIKES THROUGH BELGIUM; BRITAIN DECLARES WAR",
                "newspaper_masthead_britain",
                "ENG",
                "event_assassination_sarajevo",
            ),
            new ScenarioEventRecord(
                5,
                "trench_warfare_begins",
                "LINES SETTLE INTO MUD FROM THE CHANNEL TO THE SWISS BORDER",
                "newspaper_masthead_france",
                "FRA",
                "event_trench_warfare",
            ),
        ];
    }

    public override getCausalChainDefinitions(): CausalChainDefinition[] {
        return [
            new CausalChainDefinition(
                "causal_chain_s2_imperialism",
                "Imperialist Expansion and Rivalry",
                "Order the causes from decades of colonial and market rivalry to the pressure groups of the final crisis.",
                [
                    new CausalChainCause(
                        "s2_imperialism_cause_markets",
                        "European industry's search for overseas markets and raw materials drove the scramble for colonies among the great powers.",
                        "long_term",
                        true,
                    ),
                    new CausalChainCause(
                        "s2_imperialism_cause_naval_race",
                        "The Anglo-German naval race and the dreadnought building programs set the two greatest industrial powers against each other.",
                        "long_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s2_imperialism_cause_morocco",
                        "The Moroccan crises of 1905 and 1911 repeatedly brought the great powers to the brink over colonial claims.",
                        "intermediate",
                        false,
                    ),
                    new CausalChainCause(
                        "s2_imperialism_cause_elite_politics",
                        "Ruling elites used imperial expansion and military budgets to shore up domestic support at home.",
                        "intermediate",
                        true,
                    ),
                    new CausalChainCause(
                        "s2_imperialism_cause_balkan_vacuum",
                        "The Balkan Wars of 1912 and 1913 opened a contested space that imperial rivals rushed to control.",
                        "short_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s2_imperialism_cause_pressure_groups",
                        "Naval and colonial pressure groups in Berlin and London pressed their governments into hardening positions during the July Crisis.",
                        "short_term",
                        true,
                    ),
                ],
            ),
            new CausalChainDefinition(
                "causal_chain_s2_resources",
                "Competition for Resources",
                "Order the causes from the industrial demand for materials to the war economies of 1914.",
                [
                    new CausalChainCause(
                        "s2_resources_cause_industrialization",
                        "Industrialization made coal, iron, and oil the sinews of great-power strength and set states searching for secure supplies.",
                        "long_term",
                        true,
                    ),
                    new CausalChainCause(
                        "s2_resources_cause_markets",
                        "Access to colonial raw materials and protected markets was treated as a test of national survival.",
                        "long_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s2_resources_cause_armament_budgets",
                        "Armament budgets grew every year as steel, shipyards, and guns consumed the output of the new industries.",
                        "intermediate",
                        true,
                    ),
                    new CausalChainCause(
                        "s2_resources_cause_oil_and_railways",
                        "Rival concessions for oil and railways in the Ottoman lands turned economic projects into strategic claims.",
                        "intermediate",
                        false,
                    ),
                    new CausalChainCause(
                        "s2_resources_cause_blockade_planning",
                        "British plans to blockade Germany and German plans to seize French and Russian resources made trade itself a weapon in 1914.",
                        "short_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s2_resources_cause_war_industry",
                        "War industry began converting factories to munitions before the first shots were fired.",
                        "short_term",
                        true,
                    ),
                ],
            ),
            new CausalChainDefinition(
                "causal_chain_s2_territory",
                "Territorial and Regional Conflict",
                "Order the causes from the Ottoman retreat in the Balkans to the assassination at Sarajevo.",
                [
                    new CausalChainCause(
                        "s2_territory_cause_ottoman_retreat",
                        "The long retreat of Ottoman power from the Balkans left a contested region where Austria-Hungary and Russia competed for influence.",
                        "long_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s2_territory_cause_alsace_lorraine",
                        "France never accepted the loss of Alsace-Lorraine after 1871, and revanche remained at the center of its politics.",
                        "long_term",
                        true,
                    ),
                    new CausalChainCause(
                        "s2_territory_cause_morocco_crises",
                        "The Moroccan crises humiliated Germany and hardened its leaders against the Entente.",
                        "intermediate",
                        false,
                    ),
                    new CausalChainCause(
                        "s2_territory_cause_bosnia_annexation",
                        "Austria-Hungary's annexation of Bosnia in 1908 inflamed Serbian nationalism and left a grievance Vienna feared would grow.",
                        "intermediate",
                        true,
                    ),
                    new CausalChainCause(
                        "s2_territory_cause_balkan_wars",
                        "The Balkan Wars left Serbia doubled in size and Vienna determined to cut its rival down before it grew stronger.",
                        "short_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s2_territory_cause_sarajevo",
                        "The assassination at Sarajevo turned the Habsburg leadership's territorial fears into a decision for war.",
                        "short_term",
                        true,
                    ),
                ],
            ),
            new CausalChainDefinition(
                "causal_chain_s2_alliances",
                "The Flawed Alliance System",
                "Order the causes from the treaty web of the 1870s to the blank cheque and the timetables of 1914.",
                [
                    new CausalChainCause(
                        "s2_alliances_cause_schlieffen",
                        "Germany's war plan committed the empire to attack France through Belgium the moment Russia mobilized.",
                        "intermediate",
                        true,
                    ),
                    new CausalChainCause(
                        "s2_alliances_cause_bismarck_system",
                        "Bismarck's alliances after 1871 kept France isolated but also tied Germany to Austria-Hungary's quarrels in the Balkans.",
                        "long_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s2_alliances_cause_franco_russian",
                        "The Franco-Russian Alliance of 1894 promised Russia support against Austria-Hungary and encouraged Belgrade to defy Vienna.",
                        "long_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s2_alliances_cause_mobilization_timetables",
                        "Rigid mobilization timetables drawn up by the general staffs left civilian leaders only days in which to choose between war and surrender.",
                        "intermediate",
                        true,
                    ),
                    new CausalChainCause(
                        "s2_alliances_cause_blank_cheque",
                        "The blank cheque of July 5 and 6 emboldened Vienna to write an ultimatum it expected Serbia to reject.",
                        "short_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s2_alliances_cause_court_politics",
                        "Court and military elites in Vienna and Berlin, insulated from elected assemblies, made the final decisions for war.",
                        "short_term",
                        true,
                    ),
                ],
            ),
            new CausalChainDefinition(
                "causal_chain_s2_nationalism",
                "Intense Nationalism",
                "Order the causes from nineteenth-century national projects to the crowds and press of July 1914.",
                [
                    new CausalChainCause(
                        "s2_nationalism_cause_greater_serbia",
                        "Serbian nationalism, nourished by the memory of Kosovo and the dream of a Greater Serbia, fixed on Habsburg Bosnia.",
                        "long_term",
                        true,
                    ),
                    new CausalChainCause(
                        "s2_nationalism_cause_revanchism",
                        "France's revanche over Alsace-Lorraine kept a generation's grievance against Germany alive.",
                        "long_term",
                        true,
                    ),
                    new CausalChainCause(
                        "s2_nationalism_cause_pan_movements",
                        "Pan-German and Pan-Slav societies pressed for expansion and for leadership of their peoples.",
                        "intermediate",
                        true,
                    ),
                    new CausalChainCause(
                        "s2_nationalism_cause_bosnia_grievance",
                        "Austria-Hungary's annexation of Bosnia in 1908 turned nationalist ambition into a standing grievance between Vienna and Belgrade.",
                        "intermediate",
                        false,
                    ),
                    new CausalChainCause(
                        "s2_nationalism_cause_balkan_wars",
                        "The Balkan Wars were fought by nationalist states with the blessing and rivalry of the great powers.",
                        "short_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s2_nationalism_cause_great_power_sponsorship",
                        "Each great power sponsored its favorite among the Balkan states, turning nationalist rivalry into a contest between Vienna and St. Petersburg.",
                        "short_term",
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
        return [];
    }

    public override getTestimonyRecords(): TestimonyRecord[] {
        return [];
    }

    public override getDebriefQuestionPrompts(): string[] {
        return Rubrics.getRubricItemsForScenario(2).map((rubricItem) => rubricItem.promptText);
    }

    public override getJournalPrompts(): string[] {
        return [
            "Which long-term cause — imperialist competition, the alliance system, territorial rivalry, or nationalism — was most responsible for the outbreak of war in 1914? Defend your choice with evidence from at least two causal chains.",
            "How did the assassination at Sarajevo become a European war within five weeks? Trace the steps and explain where the crisis could have been stopped.",
            "Choose one internal factor and one external factor from the July Crisis and explain how they interacted to produce the decision for war.",
        ];
    }

    public override supportsDiplomaticPlay(): boolean {
        return true;
    }

    public override supportsTimelineScrubber(): boolean {
        return false;
    }

    public override supportsProductionQueue(): boolean {
        return false;
    }

    public override supportsDivisionDesigner(): boolean {
        return false;
    }

    public override getContentAdvisoryNote(): string {
        return "This scenario presents the causes and the human cost of the First World War, including combat deaths and civilian suffering, in a historical and educational manner.";
    }

    public override registerInitialState(gameState: GameState): void {
        WorldState1900.registerInitialWorldIntoGameState(gameState);
        gameState.setScenarioIdentifier(this.getSystemName());
        gameState.setPlayerNationIdentifier("austro_hungarian_empire");
        gameState.setResourceQuantity(ResourceType.ALLIANCES, 40);
        gameState.setResourceQuantity(ResourceType.MOBILIZATION, 30);
        gameState.setResourceQuantity(ResourceType.TREASURY, 260);
        gameState.setResourceQuantity(ResourceType.NATIONALISM, 60);
        gameState.setResourceQuantity(ResourceType.IMPERIAL_PRESTIGE, 50);
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        for (const playableSystem of this.playableSystems) {
            playableSystem.simulateTurn(turnNumber, gameState);
        }
    }

    public override evaluateVictory(gameState: GameState): ScenarioEvaluationResult {
        const flagStatus = this.collectFlagStatus(gameState, [
            {
                flagIdentifier: "causal_chain_s2_imperialism_complete",
                flagDescription:
                    "Imperialism causal chain correctly ordered (three internal and three external factors)",
            },
            {
                flagIdentifier: "causal_chain_s2_resources_complete",
                flagDescription: "Resources causal chain correctly ordered (three internal and three external factors)",
            },
            {
                flagIdentifier: "causal_chain_s2_territory_complete",
                flagDescription: "Territory causal chain correctly ordered (three internal and three external factors)",
            },
            {
                flagIdentifier: "causal_chain_s2_alliances_complete",
                flagDescription: "Alliances causal chain correctly ordered (three internal and three external factors)",
            },
            {
                flagIdentifier: "causal_chain_s2_nationalism_complete",
                flagDescription:
                    "Nationalism causal chain correctly ordered (three internal and three external factors)",
            },
            {
                flagIdentifier: "consequence_s2_total_war",
                flagDescription: "Consequence recorded: the Great War became a total war",
            },
            {
                flagIdentifier: "consequence_s2_empires_collapsed",
                flagDescription: "Consequence recorded: the old empires collapsed",
            },
            {
                flagIdentifier: "consequence_s2_united_states_ascendant",
                flagDescription: "Consequence recorded: the United States emerged as the ascendant power",
            },
            {
                flagIdentifier: "focus_node_s2_july_crisis_complete",
                flagDescription: "July Crisis focus node completed",
            },
        ]);
        return this.buildEvaluationResult(2, flagStatus.satisfiedCriteria, flagStatus.unmetCriteria, 9, 0);
    }
}
