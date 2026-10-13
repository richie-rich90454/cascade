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
import { HitlerAggressiveMilitarismMechanic } from "./mechanics/HitlerAggressiveMilitarismMechanic";
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
import { ContinuedImperialismSystem } from "./systems/ContinuedImperialismSystem";
import { FascistRegimeSystem } from "./systems/FascistRegimeSystem";
import { GreatDepressionSystem } from "./systems/GreatDepressionSystem";
import { NationalismSystem } from "./systems/NationalismSystem";
import { PropagandaSystem } from "./systems/PropagandaSystem";
import { TotalitarianRegimeSystem } from "./systems/TotalitarianRegimeSystem";
import { UnsustainablePeaceSystem } from "./systems/UnsustainablePeaceSystem";

export class ScenarioSix extends Scenario {
    private readonly playableSystems: GameSystem[];

    constructor() {
        super("scenario_six_the_rise_of_extremism");
        this.playableSystems = [
            new UnsustainablePeaceSystem(),
            new GreatDepressionSystem(),
            new ContinuedImperialismSystem(),
            new FascistRegimeSystem(),
            new TotalitarianRegimeSystem(),
            new HitlerAggressiveMilitarismMechanic(),
            new NationalismSystem(),
            new PropagandaSystem(),
        ];
    }

    public override getScenarioNumber(): number {
        return 6;
    }

    public override getScenarioTitle(): string {
        return "The Rise of Extremism";
    }

    public override getScenarioSubtitle(): string {
        return "1929-1939";
    }

    public override getStartYear(): number {
        return 1929;
    }

    public override getEndYear(): number {
        return 1939;
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
        return SuggestedSkill.SKILL_2_C;
    }

    public override getReasoningProcess(): ReasoningProcess {
        return ReasoningProcess.CAUSATION;
    }

    public override getLearningObjective(): LearningObjective {
        return LearningObjective.OBJECTIVE_F;
    }

    public override getPerspectiveLabels(): string[] {
        return ["Germany", "Italy", "Japan", "Great Britain", "France", "Soviet Union"];
    }

    public override getBriefingParagraphs(): string[] {
        return [
            "The peace of 1919 satisfied no one. Germany was disarmed, stripped of territory and colonies, and charged with sole guilt for the war, and the reparations it owed hung over every government that tried to revise the settlement. Through the 1920s the League of Nations presided over the arrangement without the power to enforce it, while the United States stood apart.",
            "The crash of 1929 turned the political crisis of the interwar years into an economic catastrophe. Banks failed, world trade collapsed, and unemployment reached into the millions. Democratic governments in Germany, Italy, and Japan appeared helpless before the crisis, and movements that promised order, national greatness, and revenge gained mass followings.",
            "In one state after another, parliamentary rule gave way to dictatorship. Mussolini had marched on Rome in 1922; in 1933 Hitler was appointed chancellor, and within months the Enabling Act and the terror apparatus of the SS and Gestapo had made Germany a one-party state. Japan's army acted without waiting for Tokyo, and Stalin's Soviet Union offered a model of total party control.",
            "Across six perspectives, trace how the unsustainable peace, the Great Depression, continued imperialist ambition, and the rise of fascist and totalitarian regimes carried the world from the crash of 1929 to the invasion of Poland in 1939, and explain how these causes together produced the Second World War.",
        ];
    }

    public override getObjectiveSummaries(): string[] {
        return [
            "Order the causes of the Second World War from long-term (decades) to short-term (months) in five causal chains.",
            "Identify three internal and three external factors within each causal chain.",
            "Complete the focus tree 'The Path to War' and unlock the path to war node.",
            "Explain how the Versailles settlement and the Great Depression interacted to bring extremist regimes to power.",
        ];
    }

    public override getScenarioResourceCodes(): string[] {
        return [
            ResourceType.SUPPORT.getCode(),
            ResourceType.MILITARY.getCode(),
            ResourceType.DIPLOMACY.getCode(),
            ResourceType.ECONOMY.getCode(),
        ];
    }

    public override getPlayableSystems(): GameSystem[] {
        return this.playableSystems;
    }

    public override getFocusTreeDefinition(): FocusTreeDefinition | null {
        return new FocusTreeDefinition("The Path to War", [
            new FocusNodeDefinition(
                "focus_s6_versailles_repudiated",
                "The Repudiation of Versailles",
                "Germany openly repudiated the military and territorial clauses of the Treaty of Versailles after 1933, withdrew from the League of Nations, and announced rearmament in 1935. The settlement of 1919 was challenged in the open for the first time.",
                "Unlocks the repudiation decisions and marks the treaty settlement as the first target of revision.",
                [],
                "causal_chain_s6_unsustainable_peace",
                0,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s6_rhineland",
                "The Rhineland Remilitarized",
                "German troops marched into the demilitarized Rhineland in March 1936, violating both the Treaty of Versailles and the Locarno agreements. Britain and France protested but took no action, and each later demand was measured against that silence.",
                "Unlocks the Rhineland decision and shows that the first armed violation of the settlement met no resistance.",
                [],
                "causal_chain_s6_fascist_regime",
                1,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s6_anschluss",
                "The Anschluss",
                "Germany annexed Austria in March 1938 after pressuring the government in Vienna, uniting the two German states in open violation of the Treaty of Versailles. The powers of Europe answered with protests alone.",
                "Unlocks the Anschluss decision and adds Austrian territory and resources to the German state.",
                ["focus_s6_rhineland"],
                "",
                2,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s6_munich",
                "The Munich Agreement",
                "At Munich in September 1938 Britain and France conceded the Sudetenland to Germany in exchange for Hitler's promise that it was his last territorial demand. German troops occupied the rest of Czechoslovakia within six months.",
                "Unlocks the Munich decision and records appeasement's failure as a guarantee of peace.",
                ["focus_s6_anschluss"],
                "",
                3,
                0,
            ),
            new FocusNodeDefinition(
                "focus_s6_path_to_war",
                "The Path to War",
                "The successive violations of the Versailles settlement, from rearmament to the Rhineland, Austria, and Czechoslovakia, showed that territorial revision would not stop at the negotiating table. The path ended in war when Germany invaded Poland on September 1, 1939.",
                "Completes the focus tree once the fascist regime causal chain is honored and awards the path to war completion flag.",
                [],
                "causal_chain_s6_fascist_regime",
                3,
                1,
            ),
            new FocusNodeDefinition(
                "focus_s6_molotov_ribbentrop",
                "The Molotov-Ribbentrop Pact",
                "Germany and the Soviet Union signed a nonaggression pact in August 1939, with a secret protocol dividing eastern Europe into spheres of influence. The pact freed Germany from a two-front war and cleared the way for the invasion of Poland.",
                "Unlocks the pact decision and buys the German state time before the invasion of Poland.",
                ["focus_s6_path_to_war"],
                "",
                3,
                2,
            ),
        ]);
    }

    public override getPrimarySourceIdentifiers(): string[] {
        return [
            "hitler_lebensraum_mein_kampf",
            "chamberlain_peace_for_our_time_1938",
            "lytton_report_on_manchukuo_1932",
        ];
    }

    public override getDecisionRecords(): DecisionRecord[] {
        return [
            new DecisionRecord(
                "s6_decision_versailles",
                "The Repudiation of Versailles",
                "The Treaty of Versailles had disarmed Germany, taken away territory and colonies, and fixed reparations for a war the victors blamed on German aggression. Through the 1920s successive German governments worked within the system for revision; after 1930 the world depression and the collapse of parliamentary coalition government made open repudiation a mass political demand. The powers that had written the treaty now weighed how far to defend it.",
                "The immediate spur was the collapse of the German economy and political order after 1929, while the longer-term cause was a treaty settlement that no German government accepted and no Allied power was prepared to enforce.",
                "German demands after 1929 can be compared with the claims of Italy and Japan, whose diplomacy also joined territorial grievance to imperial ambition as the Depression closed markets and hardened national feeling.",
                "What continued was the great-power practice of settling wars at the expense of the defeated; what changed between 1919 and 1935 was that the defeated state began to challenge the whole settlement in the open.",
                "Treaty texts and diplomatic memoranda record the formal obligations, while the speeches of the 1930s record the political use of the grievance, and each source must be read for its purpose.",
                [
                    new DecisionOption(
                        "s6_versailles_option_reparations",
                        "Seek revision of reparations and the war-guilt clause through negotiation.",
                        "Negotiation wins piecemeal concessions abroad but satisfies none of the domestic demand for repudiation.",
                        "factor_s6_versailles_reparations",
                        ResourceType.DIPLOMACY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s6_versailles_option_disarmament",
                        "Demand equality of armaments among all powers.",
                        "The disarmament clauses are contested on the principle of equality, and rearmament proceeds as a claim of rights.",
                        "factor_s6_versailles_disarmament",
                        ResourceType.MILITARY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s6_versailles_option_repudiation",
                        "Repudiate the military and territorial clauses outright.",
                        "Open defiance rallies national feeling and invites the first tests of Allied will.",
                        "factor_s6_versailles_repudiation",
                        ResourceType.SUPPORT.getCode(),
                        5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s6_decision_depression",
                "The Depression's Harvest",
                "The Wall Street crash of October 1929 ended the fragile recovery of the 1920s. American loans were called in, banks failed, and world trade contracted as tariffs rose. Unemployment in Germany passed six million by 1932, and the parties that promised to destroy the Weimar Republic grew fastest at the ballot box.",
                "The crash was the immediate cause, but the deeper causes were the war debts and reparations that tied the world economy to American credit and the refusal of governments to abandon orthodox finance as the crisis deepened.",
                "The Depression struck all industrial economies, yet its political harvest differed: the United States kept its democracy through the New Deal, while Germany's republic collapsed into dictatorship, a difference that comparison must explain.",
                "What changed after 1929 was the scale of state intervention in economic life and the political fortunes of extremist movements; what continued was the postwar burden of debt and resentment that the crisis intensified.",
                "Unemployment statistics and election returns document the crisis mechanically, while party propaganda and newspaper accounts show how the suffering was explained to voters, and each must be weighed accordingly.",
                [
                    new DecisionOption(
                        "s6_depression_option_unemployment",
                        "Answer mass unemployment with public works and emergency relief.",
                        "Public works relieve the worst suffering but divide the cabinet over spending and debt.",
                        "factor_s6_depression_unemployment",
                        ResourceType.ECONOMY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s6_depression_option_extremism",
                        "Let the extremist movements harvest the crisis.",
                        "The Nazi vote rises with every month of unemployment until the largest party of a broken republic demands power.",
                        "factor_s6_depression_extremism",
                        ResourceType.SUPPORT.getCode(),
                        -5,
                    ),
                    new DecisionOption(
                        "s6_depression_option_trade",
                        "Raise tariffs and retreat behind national trade barriers.",
                        "Each state protects its own market and deepens the contraction of world trade for all.",
                        "factor_s6_depression_trade_collapse",
                        ResourceType.DIPLOMACY.getCode(),
                        -5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s6_decision_league",
                "The League Stands Aside",
                "When Japan's Kwantung Army seized Manchuria in 1931, China appealed to the League of Nations, which sent the Lytton Commission and received in 1932 a report condemning the conquest; Japan withdrew from the League and kept Manchuria. In 1935 Italy invaded Ethiopia, and economic sanctions were applied half-heartedly and soon abandoned. The League had condemned two aggressions and stopped neither.",
                "Collective security failed because the great powers would not risk war for Manchuria or Ethiopia; the short-term acts of aggression are explained by the longer-term refusal of the victors of 1919 to enforce their own settlement.",
                "Comparing the responses to Manchuria and Ethiopia exposes the same pattern: condemnation, commission reports, and limited sanctions never matched the resolution of the aggressor.",
                "What continued was the freedom of strong states to take what they could; what changed was the new League machinery of collective security, whose failure left aggression cheaper than before.",
                "The Lytton Report speaks in the careful language of an investigating commission hoping to preserve peace, and that purpose limits how strongly it condemns the aggression it documented.",
                [
                    new DecisionOption(
                        "s6_league_option_manchuria",
                        "Condemn Japan's seizure of Manchuria and offer mediation.",
                        "Japan ignores the report, withdraws from the League, and keeps its conquest.",
                        "factor_s6_league_manchuria",
                        ResourceType.DIPLOMACY.getCode(),
                        -5,
                    ),
                    new DecisionOption(
                        "s6_league_option_ethiopia",
                        "Apply economic sanctions against Italy's invasion of Ethiopia.",
                        "Sanctions that exempt oil and the Suez route fail to stop the campaign, and the League's credibility suffers.",
                        "factor_s6_league_ethiopia",
                        ResourceType.DIPLOMACY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s6_league_option_inaction",
                        "Accept that the League cannot enforce the peace.",
                        "Each aggression teaches that treaties without force are paper, and the next challenger moves sooner.",
                        "factor_s6_league_inaction",
                        ResourceType.DIPLOMACY.getCode(),
                        -5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s6_decision_enabling_act",
                "Terror and the Enabling Act",
                "On the night of February 27, 1933, the Reichstag burned. The next day President Hindenburg signed emergency decrees suspending freedom of speech, press, assembly, and the protection of the person. In March the new Reichstag passed the Enabling Act, transferring lawmaking power to Hitler's cabinet, and the parties, unions, and press that remained independent were destroyed within months. The first camps were built for political opponents, and the persecution of Germany's Jews began with the boycotts of 1933 and the Nuremberg Laws of 1935.",
                "The immediate instrument of dictatorship was the emergency decree after the Reichstag Fire and the Enabling Act that followed it; the deeper causes were the weakness of Weimar institutions and the willingness of conservatives to arm a movement they thought themselves able to control.",
                "Hitler's consolidation can be compared with Stalin's party rule and Mussolini's single-party state: all three destroyed parliamentary opposition, though the German dictatorship made race, as well as party, the organizing principle of exclusion.",
                "What changed within months was the legal order itself, as a republic with rights became a one-party state ruling through terror; what continued was the bureaucratic state, which served the new masters as it had served the old.",
                "Emergency decrees and laws document the legal form of the dictatorship, while the testimony of the persecuted records its human meaning, and the official record alone would never show the fear.",
                [
                    new DecisionOption(
                        "s6_enabling_act_option_emergency",
                        "Use the Reichstag Fire to suspend civil liberties by emergency decree.",
                        "Emergency rule becomes permanent, and the legal safeguards of the republic are never restored.",
                        "factor_s6_reichstag_fire_emergency",
                        ResourceType.SUPPORT.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s6_enabling_act_option_enabling",
                        "Pass the Enabling Act and govern without the Reichstag.",
                        "The government legislates by decree, and the remaining parties vote themselves out of existence.",
                        "factor_s6_enabling_act_passed",
                        ResourceType.DIPLOMACY.getCode(),
                        -5,
                    ),
                    new DecisionOption(
                        "s6_enabling_act_option_terror",
                        "Build the SS and Gestapo into an apparatus of terror.",
                        "The camps and the secret police silence organized dissent, and fear becomes a tool of government.",
                        "factor_s6_terror_consolidation",
                        ResourceType.MILITARY.getCode(),
                        5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s6_decision_total_war",
                "The Continent at War",
                "On September 1, 1939, German armies invaded Poland, and two days later Britain and France declared war. By 1940 the war had spread across Europe with the occupation of Denmark, Norway, the Low Countries, and France, and in 1941 it became worldwide with the German invasion of the Soviet Union and the Japanese attack on Pearl Harbor. Mechanized warfare and mass conscription destroyed the distinction between soldiers and civilians.",
                "The invasion of Poland was the immediate trigger of the general war, but the conflict became continental and then global because the powers that had failed to enforce the peace of 1919 could not contain the revisionist states without a total mobilization of their own societies.",
                "The Second World War can be compared with the First in its origins in great-power rivalry, but its scale was greater because industry and ideology made the mobilization of whole populations and economies the condition of survival.",
                "What continued from 1914 were mass armies, industrial slaughter, and the ambition of states; what changed was the reach of the war into every continent, every economy, and the home of every civilian.",
                "War correspondence and official statements of 1939 record the declarations and campaigns, while later histories that count the casualties remind us how much the contemporary reporting could not know.",
                [
                    new DecisionOption(
                        "s6_total_war_option_expanded",
                        "Accept that the war will expand into a total war of whole societies.",
                        "Factories, farms, and populations everywhere are conscripted into the war effort, and the bombing war reaches civilians directly.",
                        "consequence_s6_total_war_expanded",
                        ResourceType.MILITARY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s6_total_war_option_holocaust",
                        "Accept the persecution of the regime's victims as a consequence of its total claims.",
                        "Behind the front, the racial policy of the regime advances from exclusion to deportation and murder.",
                        "consequence_s6_holocaust",
                        ResourceType.SUPPORT.getCode(),
                        -5,
                    ),
                    new DecisionOption(
                        "s6_total_war_option_superpower",
                        "Accept that the war will leave new superpowers in command of the world.",
                        "The old European great powers exhaust themselves, and the United States and the Soviet Union emerge as the arbiters of the peace.",
                        "consequence_s6_superpower_world",
                        ResourceType.DIPLOMACY.getCode(),
                        5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s6_decision_holocaust",
                "The Industrial Killing",
                "The persecution that began with the boycott of 1933 and the Nuremberg Laws of 1935 became mass murder in the war. Einsatzgruppen shot Jews and others behind the eastern front in 1941, and the Wannsee Conference of January 1942 organized the deportation of European Jewry to killing centers built for the purpose. By 1945 six million Jews and millions of Roma, Slavs, disabled people, and others had been murdered in the Holocaust.",
                "The Holocaust grew out of the regime's racial ideology and its total claim over society, and the war supplied the cover, the organization, and the technology of destruction; its causes must be traced from doctrine and propaganda to the bureaucratic machinery of killing.",
                "The Holocaust can be compared with the Armenian genocide of 1915 and the Holodomor as a case of state-directed mass atrocity, though its industrialized organization and its targeting of a people defined by race mark its distinctive character.",
                "What continued from earlier history was anti-Semitism, scapegoating, and state violence against minorities; what changed in the twentieth century was the capacity of a modern state to organize the murder of millions as a matter of policy.",
                "The killers left orders, plans, and statistics, while the victims left diaries, letters, and the scarce testimony of survivors, and the historian must read both against each other.",
                [
                    new DecisionOption(
                        "s6_holocaust_option_holocaust",
                        "Record the Holocaust as a consequence of totalitarian ideology and war.",
                        "The murder of Europe's Jews stands as the defining crime of the era and as evidence of what the total state can do.",
                        "consequence_s6_holocaust",
                        ResourceType.SUPPORT.getCode(),
                        -5,
                    ),
                    new DecisionOption(
                        "s6_holocaust_option_total_war",
                        "Record the killing as part of a war that consumed entire societies.",
                        "The war became total precisely because it reached into the lives of every occupied population.",
                        "consequence_s6_total_war_expanded",
                        ResourceType.MILITARY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s6_holocaust_option_superpower",
                        "Record the killing as a challenge that the postwar powers promised to answer.",
                        "The revelation of the camps shapes the promises of the United Nations and the language of international justice.",
                        "consequence_s6_superpower_world",
                        ResourceType.DIPLOMACY.getCode(),
                        5,
                    ),
                ],
            ),
            new DecisionRecord(
                "s6_decision_superpower_world",
                "The World Remade",
                "When the war ended in 1945, Europe's great powers were bankrupt and occupied, the United Nations had been founded at San Francisco, and the atomic bomb had ended the war in the Pacific. The United States and the Soviet Union stood as superpowers, the European empires began to dissolve, and the wartime alliance itself was already turning into the Cold War.",
                "The war destroyed the old balance of power and created the conditions in which two continental states rose above all others; the institutions of 1945 were answers to the failure of the League and to the memory of the Depression.",
                "The peace of 1945 can be compared with the peace of 1919: both settlements were made by the victors, but 1945 created institutions and alliances designed to avoid the mistakes of Versailles.",
                "What continued across both wars were great-power rivalry, national sovereignty, and the arms of great alliances; what changed by 1945 was the end of Europe's primacy and the arrival of a world organized around superpowers and international institutions.",
                "The charter, the surrender documents, and the speeches of 1945 record the intentions of the victors, while the ruins of Europe and the statistics of the dead reveal what those documents could not capture.",
                [
                    new DecisionOption(
                        "s6_superpower_option_superpower",
                        "Accept the new order of superpowers and international institutions.",
                        "The United Nations and the two superpowers replace the old European concert as the frame of world politics.",
                        "consequence_s6_superpower_world",
                        ResourceType.DIPLOMACY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s6_superpower_option_total_war",
                        "Accept that the next war would be total from its first day.",
                        "The bomb and the memory of 1945 make every future conflict a potential catastrophe for all civilian life.",
                        "consequence_s6_total_war_expanded",
                        ResourceType.MILITARY.getCode(),
                        5,
                    ),
                    new DecisionOption(
                        "s6_superpower_option_holocaust",
                        "Accept the Holocaust as the judgment on racial nationalism.",
                        "The crimes of the regime reshape the moral vocabulary of the postwar world and the law of nations.",
                        "consequence_s6_holocaust",
                        ResourceType.SUPPORT.getCode(),
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
                "wall_street_crash",
                "WALL STREET CRASH: PANIC SELLING DESTROYS THE BOOM OF THE TWENTIES",
                "newspaper_masthead_usa",
                "USA",
                "event_great_depression",
            ),
            new ScenarioEventRecord(
                2,
                "manchurian_invasion",
                "JAPANESE ARMY SEIZES MUKDEN AND INVADES MANCHURIA",
                "newspaper_masthead_japan",
                "JAP",
                "event_munich_conference",
            ),
            new ScenarioEventRecord(
                3,
                "hitler_appointed_chancellor",
                "HITLER APPOINTED CHANCELLOR OF GERMANY",
                "newspaper_masthead_germany",
                "GER",
                "event_march_on_rome",
            ),
            new ScenarioEventRecord(
                4,
                "reichstag_fire",
                "REICHSTAG FIRE: EMERGENCY DECREES SUSPEND CIVIL LIBERTIES",
                "newspaper_masthead_germany",
                "GER",
                "event_reichstag_fire",
            ),
            new ScenarioEventRecord(
                5,
                "ethiopian_invasion",
                "ITALY INVADES ETHIOPIA AS THE LEAGUE DEBATES SANCTIONS",
                "newspaper_masthead_default",
                "ITA",
                "event_march_on_rome",
            ),
            new ScenarioEventRecord(
                6,
                "rhineland_remilitarized",
                "GERMAN TROOPS REMILITARIZE THE RHINELAND",
                "newspaper_masthead_germany",
                "GER",
                "event_march_on_rome",
            ),
            new ScenarioEventRecord(
                7,
                "spanish_civil_war",
                "SPANISH CIVIL WAR BEGINS; FOREIGN POWERS INTERVENE",
                "newspaper_masthead_default",
                "GER",
                "event_march_on_rome",
            ),
            new ScenarioEventRecord(
                8,
                "anschluss",
                "GERMANY ANNEXES AUSTRIA IN THE ANSCHLUSS",
                "newspaper_masthead_germany",
                "GER",
                "event_munich_conference",
            ),
            new ScenarioEventRecord(
                9,
                "munich_conference",
                "MUNICH AGREEMENT CEDES THE SUDETENLAND TO GERMANY",
                "newspaper_masthead_britain",
                "GER",
                "event_munich_conference",
            ),
            new ScenarioEventRecord(
                10,
                "molotov_ribbentrop",
                "GERMANY AND SOVIET UNION SIGN MOLOTOV-RIBBENTROP PACT",
                "newspaper_masthead_ussr",
                "SOV",
                "event_molotov_ribbentrop",
            ),
            new ScenarioEventRecord(
                11,
                "invasion_of_poland",
                "GERMANY INVADES POLAND; WAR IN EUROPE BEGINS",
                "newspaper_masthead_germany",
                "GER",
                "event_invasion_poland",
            ),
            new ScenarioEventRecord(
                12,
                "war_declared",
                "BRITAIN AND FRANCE DECLARE WAR ON GERMANY",
                "newspaper_masthead_britain",
                "ENG",
                "event_invasion_poland",
            ),
        ];
    }

    public override getCausalChainDefinitions(): CausalChainDefinition[] {
        return [
            new CausalChainDefinition(
                "causal_chain_s6_unsustainable_peace",
                "The Unsustainable Peace",
                "Order the causes from the treaty settlement of 1919 to the crisis of the 1930s.",
                [
                    new CausalChainCause(
                        "s6_unsustainable_peace_cause_reparations",
                        "The reparations imposed in 1919 weighed on the German economy and poisoned every attempt at political stability in the 1920s.",
                        "long_term",
                        true,
                    ),
                    new CausalChainCause(
                        "s6_unsustainable_peace_cause_disarmament",
                        "The disarmament clauses of the treaty humiliated Germany and left a disarmed state among armed neighbors.",
                        "long_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s6_unsustainable_peace_cause_war_guilt",
                        "The war-guilt clause of Article 231 made every German government a debtor and every German a defendant before the world.",
                        "intermediate",
                        true,
                    ),
                    new CausalChainCause(
                        "s6_unsustainable_peace_cause_territorial_losses",
                        "The loss of territory and colonies severed populations and resources from the German state and its economy.",
                        "intermediate",
                        false,
                    ),
                    new CausalChainCause(
                        "s6_unsustainable_peace_cause_weimar_weakness",
                        "Weak coalition governments and presidential emergency cabinets after 1930 showed that the republic could not revise the settlement.",
                        "short_term",
                        true,
                    ),
                    new CausalChainCause(
                        "s6_unsustainable_peace_cause_league_failure",
                        "The League's inability to enforce the peace made revision of the treaty a matter of daring rather than of law.",
                        "short_term",
                        false,
                    ),
                ],
            ),
            new CausalChainDefinition(
                "causal_chain_s6_great_depression",
                "The Great Depression",
                "Order the causes from the collapse of American credit to the electoral harvest of the crisis.",
                [
                    new CausalChainCause(
                        "s6_great_depression_cause_credit",
                        "The world economy of the 1920s rested on American loans and war debts that could be recalled at the first panic.",
                        "long_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s6_great_depression_cause_unemployment",
                        "Mass unemployment after 1929 destroyed the confidence of millions of workers in democratic government.",
                        "long_term",
                        true,
                    ),
                    new CausalChainCause(
                        "s6_great_depression_cause_democracies",
                        "Coalition governments in Germany and France fell over orthodox budgets while the queues at the labor exchanges grew.",
                        "intermediate",
                        true,
                    ),
                    new CausalChainCause(
                        "s6_great_depression_cause_trade",
                        "Tariff wars and the collapse of world trade turned a financial panic into a depression of every exporting economy.",
                        "intermediate",
                        false,
                    ),
                    new CausalChainCause(
                        "s6_great_depression_cause_extremism",
                        "The Nazi and Communist parties harvested the unemployment of the early 1930s and grew with every failing government.",
                        "short_term",
                        true,
                    ),
                    new CausalChainCause(
                        "s6_great_depression_cause_reparations",
                        "The reparation regime, suspended in 1931 and buried at Lausanne in 1932, left behind only resentment and default.",
                        "short_term",
                        false,
                    ),
                ],
            ),
            new CausalChainDefinition(
                "causal_chain_s6_imperialism",
                "Continued Imperialism",
                "Order the causes from the Depression's pressure on markets to the aggression in Manchuria and Ethiopia.",
                [
                    new CausalChainCause(
                        "s6_imperialism_cause_japanese_army",
                        "Japan's army and industry saw Manchuria as the answer to the island empire's dependence on imported resources.",
                        "long_term",
                        true,
                    ),
                    new CausalChainCause(
                        "s6_imperialism_cause_depression_markets",
                        "The collapse of world markets after 1929 made closed imperial trading blocs look like the only security.",
                        "long_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s6_imperialism_cause_italian_prestige",
                        "Italian ambitions after the disappointment of the 1919 peace demanded a place in Africa for the young kingdom.",
                        "intermediate",
                        true,
                    ),
                    new CausalChainCause(
                        "s6_imperialism_cause_manchuria",
                        "The invasion of Manchuria in 1931 showed that conquest could be committed and kept under the League's eyes.",
                        "intermediate",
                        false,
                    ),
                    new CausalChainCause(
                        "s6_imperialism_cause_autarky",
                        "Economic self-sufficiency became a goal of policy, and every resource-rich territory an object of temptation.",
                        "short_term",
                        true,
                    ),
                    new CausalChainCause(
                        "s6_imperialism_cause_ethiopia",
                        "The invasion of Ethiopia in 1935, and the sanctions the League failed to enforce, dissolved what remained of collective security.",
                        "short_term",
                        false,
                    ),
                ],
            ),
            new CausalChainDefinition(
                "causal_chain_s6_fascist_regime",
                "The Fascist Regime",
                "Order the causes from the weakness of the republic to the appointment of the dictator.",
                [
                    new CausalChainCause(
                        "s6_fascist_regime_cause_weimar_failure",
                        "The republic's proportional representation and divided parties produced cabinets that could not command stable majorities.",
                        "long_term",
                        true,
                    ),
                    new CausalChainCause(
                        "s6_fascist_regime_cause_versailles_grievance",
                        "The humiliation of the settlement abroad was the recruiting ground on which every nationalist movement drew.",
                        "long_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s6_fascist_regime_cause_italy_model",
                        "Mussolini's fascist state after 1922 offered a working model of single-party rule for admirers beyond Italy.",
                        "intermediate",
                        false,
                    ),
                    new CausalChainCause(
                        "s6_fascist_regime_cause_rearmament",
                        "Rearmament after 1933 gave the regime a purpose that absorbed the unemployed and the officer class alike.",
                        "intermediate",
                        true,
                    ),
                    new CausalChainCause(
                        "s6_fascist_regime_cause_hitler_appointment",
                        "Conservative elites around President Hindenburg appointed Hitler chancellor on January 30, 1933, believing they could control him.",
                        "short_term",
                        true,
                    ),
                    new CausalChainCause(
                        "s6_fascist_regime_cause_appeasement",
                        "Britain and France answered each violation of the treaty with protest and negotiation, and each protest encouraged the next demand.",
                        "short_term",
                        false,
                    ),
                ],
            ),
            new CausalChainDefinition(
                "causal_chain_s6_totalitarian_regime",
                "The Totalitarian Regime",
                "Order the causes from the fears of revolution to the legal dictatorship of 1933.",
                [
                    new CausalChainCause(
                        "s6_totalitarian_cause_communist_fear",
                        "The fear of communist revolution after 1917 convinced elites and middle classes across Europe to trade liberty for order.",
                        "long_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s6_totalitarian_cause_league_weakness",
                        "The League's failure to protect its members from aggression made armed force appear the only guarantee of security.",
                        "long_term",
                        false,
                    ),
                    new CausalChainCause(
                        "s6_totalitarian_cause_soviet_model",
                        "The Soviet one-party state appealed to militants as a model of total party control over state and society.",
                        "intermediate",
                        false,
                    ),
                    new CausalChainCause(
                        "s6_totalitarian_cause_terror_apparatus",
                        "The SS, the Gestapo, and the first camps made terror the standing instrument of government.",
                        "intermediate",
                        true,
                    ),
                    new CausalChainCause(
                        "s6_totalitarian_cause_reichstag_fire",
                        "The Reichstag Fire of February 27, 1933, gave the new government the pretext to suspend civil liberties by emergency decree.",
                        "short_term",
                        true,
                    ),
                    new CausalChainCause(
                        "s6_totalitarian_cause_enabling_act",
                        "The Enabling Act of March 1933 transferred lawmaking power to the cabinet and made the dictatorship legal in form.",
                        "short_term",
                        true,
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
        return Rubrics.getRubricItemsForScenario(6).map((rubricItem) => rubricItem.promptText);
    }

    public override getJournalPrompts(): string[] {
        return [
            "Which long-term cause of the Second World War — the Versailles settlement, the Great Depression, or the imperial ambitions of the Axis states — was most significant? Defend your choice with evidence from at least two causal chains.",
            "How did the Great Depression turn the political grievances of the 1920s into the mass movements that brought dictators to power? Trace the steps from the crash of 1929 to the appointment of Hitler in 1933.",
            "Explain how the weakness of the League of Nations and the policy of appeasement allowed aggression to expand from Manchuria in 1931 to Poland in 1939.",
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
        return "This scenario presents the rise of dictatorship, the persecution of minority groups, and the road to war, including the Holocaust, in a factual and educational manner.";
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
        gameState.setPlayerNationIdentifier("german_empire");
        gameState.setResourceQuantity(ResourceType.SUPPORT, 35);
        gameState.setResourceQuantity(ResourceType.MILITARY, 40);
        gameState.setResourceQuantity(ResourceType.DIPLOMACY, 30);
        gameState.setResourceQuantity(ResourceType.ECONOMY, 25);
    }

    protected override onSimulateTurn(turnNumber: number, gameState: GameState): void {
        for (const playableSystem of this.playableSystems) {
            playableSystem.simulateTurn(turnNumber, gameState);
        }
    }

    public override evaluateVictory(gameState: GameState): ScenarioEvaluationResult {
        const flagStatus = this.collectFlagStatus(gameState, [
            {
                flagIdentifier: "causal_chain_s6_unsustainable_peace_complete",
                flagDescription:
                    "Unsustainable peace causal chain correctly ordered (three internal and three external factors)",
            },
            {
                flagIdentifier: "causal_chain_s6_great_depression_complete",
                flagDescription:
                    "Great Depression causal chain correctly ordered (three internal and three external factors)",
            },
            {
                flagIdentifier: "causal_chain_s6_imperialism_complete",
                flagDescription:
                    "Continued imperialism causal chain correctly ordered (three internal and three external factors)",
            },
            {
                flagIdentifier: "causal_chain_s6_fascist_regime_complete",
                flagDescription:
                    "Fascist regime causal chain correctly ordered (three internal and three external factors)",
            },
            {
                flagIdentifier: "causal_chain_s6_totalitarian_regime_complete",
                flagDescription:
                    "Totalitarian regime causal chain correctly ordered (three internal and three external factors)",
            },
            {
                flagIdentifier: "consequence_s6_total_war_expanded",
                flagDescription: "Consequence recorded: the Second World War became a total war",
            },
            { flagIdentifier: "consequence_s6_holocaust", flagDescription: "Consequence recorded: the Holocaust" },
            {
                flagIdentifier: "consequence_s6_superpower_world",
                flagDescription: "Consequence recorded: a world remade by superpowers",
            },
            {
                flagIdentifier: "focus_node_s6_path_to_war_complete",
                flagDescription: "Path to war focus node completed",
            },
        ]);
        return this.buildEvaluationResult(6, flagStatus.satisfiedCriteria, flagStatus.unmetCriteria, 9, 0);
    }
}
