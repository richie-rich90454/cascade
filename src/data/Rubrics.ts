export class ShortAnswerRubricItem {
    public readonly rubricItemIdentifier: string;
    public readonly scenarioNumber: number;
    public readonly promptText: string;
    public readonly maximumPointValue: number;
    public readonly scoringCriteria: string[];
    public readonly requiredConceptGroups: string[][];

    constructor(
        rubricItemIdentifier: string,
        scenarioNumber: number,
        promptText: string,
        maximumPointValue: number,
        scoringCriteria: string[],
        requiredConceptGroups: string[][],
    ) {
        this.rubricItemIdentifier = rubricItemIdentifier;
        this.scenarioNumber = scenarioNumber;
        this.promptText = promptText;
        this.maximumPointValue = maximumPointValue;
        this.scoringCriteria = scoringCriteria;
        this.requiredConceptGroups = requiredConceptGroups;
    }
}

export class ContextualizationRubric {
    public readonly rubricIdentifier: string;
    public readonly descriptionText: string;
    public readonly criteriaByPointLevel: string[];

    constructor(rubricIdentifier: string, descriptionText: string, criteriaByPointLevel: string[]) {
        this.rubricIdentifier = rubricIdentifier;
        this.descriptionText = descriptionText;
        this.criteriaByPointLevel = criteriaByPointLevel;
    }
}

export class ComparisonRubric {
    public readonly rubricIdentifier: string;
    public readonly descriptionText: string;
    public readonly similarityRequirement: string;
    public readonly differenceRequirement: string;
    public readonly significanceRequirement: string;

    constructor(
        rubricIdentifier: string,
        descriptionText: string,
        similarityRequirement: string,
        differenceRequirement: string,
        significanceRequirement: string,
    ) {
        this.rubricIdentifier = rubricIdentifier;
        this.descriptionText = descriptionText;
        this.similarityRequirement = similarityRequirement;
        this.differenceRequirement = differenceRequirement;
        this.significanceRequirement = significanceRequirement;
    }
}

export class ComplexArgumentRubric {
    public readonly rubricIdentifier: string;
    public readonly descriptionText: string;
    public readonly criteria: string[];

    constructor(rubricIdentifier: string, descriptionText: string, criteria: string[]) {
        this.rubricIdentifier = rubricIdentifier;
        this.descriptionText = descriptionText;
        this.criteria = criteria;
    }
}

export class DiscussionRubric {
    public readonly rubricIdentifier: string;
    public readonly descriptionText: string;
    public readonly guidingQuestions: string[];
    public readonly scoringCriteria: string[];

    constructor(rubricIdentifier: string, descriptionText: string, guidingQuestions: string[], scoringCriteria: string[]) {
        this.rubricIdentifier = rubricIdentifier;
        this.descriptionText = descriptionText;
        this.guidingQuestions = guidingQuestions;
        this.scoringCriteria = scoringCriteria;
    }
}

export class Rubrics {
    public static readonly SAQ_SCENARIO_ONE_A = new ShortAnswerRubricItem(
        "saq_s1_a",
        1,
        "Using the Plan of San Luis Potosí and the October Manifesto, explain ONE similarity and ONE difference in how the Mexican and Russian revolutions responded to political crisis after 1900.",
        3,
        [
            "One point for a valid similarity (for example, both movements challenged an entrenched executive and demanded legal or constitutional limits on power).",
            "One point for a valid difference (for example, Mexico's revolution sought to open a republic to excluded groups, while Russia's 1905 revolution forced an autocrat to concede a duma while retaining the crown).",
            "One point for explaining, with evidence, why the similarity or difference occurred.",
        ],
        [
            ["challenged", "entrenched", "autocrat", "dictator", "limited", "constitutional", "absolute"],
            ["duma", "parliament", "constitution", "republic", "autocracy", "manifesto"],
            ["because", "due to", "as a result", "led to", "resulted", "therefore"],
        ],
    );
    public static readonly SAQ_SCENARIO_ONE_B = new ShortAnswerRubricItem(
        "saq_s1_b",
        1,
        "Explain ONE internal factor and ONE external factor that contributed to the collapse of the Ottoman, Russian, OR Qing empire after 1900.",
        3,
        [
            "One point for a valid internal factor (for example, ethnic nationalism among subject peoples, fiscal weakness, or resistance to reform).",
            "One point for a valid external factor (for example, military defeat, great-power pressure, or the strains of the First World War).",
            "One point for showing how the internal and external factors interacted in the empire's decline.",
        ],
        [
            ["nationalism", "ethnic", "fiscal", "debt", "reform", "unrest", "rebellion", "revolt"],
            ["defeat", "war", "great power", "treaty", "imperialism", "pressure", "invasion"],
            ["interacted", "combined", "together", "accelerated", "worsened", "compounded"],
        ],
    );
    public static readonly SAQ_SCENARIO_ONE_C = new ShortAnswerRubricItem(
        "saq_s1_c",
        1,
        "Mustafa Kemal's Turkish nationalists abolished the Ottoman sultanate in 1922 and founded a republic that same year. Explain how this development exemplifies continuity and change in the period after 1900.",
        3,
        [
            "One point for identifying a change (for example, the end of a six-century dynasty and the creation of a secular republic).",
            "One point for identifying a continuity (for example, the Turkish core territory and centralized state authority survived under new forms).",
            "One point for explaining the significance of the relationship between the change and the continuity.",
        ],
        [
            ["abolished", "ended", "republic", "secular", "sultanate", "revolution", "1922"],
            ["continued", "remained", "survived", "territory", "state", "identity", "authority"],
            ["significance", "transformed", "nonetheless", "represents", "illustrates", "exemplifies"],
        ],
    );
    public static readonly SAQ_SCENARIO_ONE_D = new ShortAnswerRubricItem(
        "saq_s1_d",
        1,
        "Contextualization: Explain how ONE specific development from Topic 7.1 is situated within the broader historical context of the decline of land-based empires in the early twentieth century.",
        3,
        [
            "One point for naming a specific development (for example, the Xinhai Revolution of 1911 or the Young Turk Revolution of 1908).",
            "One point for describing relevant broader context (for example, the global pressure of Western industrial power and imperialism).",
            "One point for explaining the relationship between the development and its context.",
        ],
        [
            ["1911", "xinhai", "young turk", "1908", "madero", "revolution", "duma", "manifesto"],
            ["western", "imperial", "industrial", "colonial", "global", "great power", "modernization"],
            ["context", "shaped", "produced", "emerged", "response", "within"],
        ],
    );

    public static readonly SAQ_SCENARIO_TWO_A = new ShortAnswerRubricItem(
        "saq_s2_a",
        2,
        "Using the Blank Cheque and the Serbian reply, explain ONE way in which the alliance system made a local crisis a European war.",
        3,
        [
            "One point for describing the relevant alliance commitments (for example, Germany's pledge to Austria-Hungary and Russia's support of Serbia).",
            "One point for showing how those commitments removed incentives to compromise.",
            "One point for using specific evidence from the sources.",
        ],
        [
            ["alliance", "pledge", "backing", "support", "commitment", "entente", "triple"],
            ["encouraged", "escalated", "prevented compromise", "hardened", "no restraint", "widened"],
            ["blank cheque", "telegram", "ultimatum", "reply", "austria", "germany", "serbia", "russia"],
        ],
    );
    public static readonly SAQ_SCENARIO_TWO_B = new ShortAnswerRubricItem(
        "saq_s2_b",
        2,
        "Explain how imperialist expansion and competition for resources contributed to the outbreak of the First World War.",
        3,
        [
            "One point for identifying the pattern of imperial rivalry (for example, Anglo-German naval and colonial competition, or Morocco and the Balkans as flashpoints).",
            "One point for connecting rivalry to mutual suspicion and arms racing.",
            "One point for explaining how the rivalry became part of the July Crisis itself.",
        ],
        [
            ["imperial", "colonial", "naval", "morocco", "balkan", "rivalry", "resources", "markets"],
            ["suspicion", "arms", "dreadnought", "tension", "mistrust", "competition"],
            ["july crisis", "1914", "sarajevo", "mobilization", "war plans", "escalation"],
        ],
    );
    public static readonly SAQ_SCENARIO_TWO_C = new ShortAnswerRubricItem(
        "saq_s2_c",
        2,
        "Evaluate the role of intense nationalism as a cause of the First World War.",
        3,
        [
            "One point describing nationalism among the powers and in the Balkans (for example, Serbian nationalism, revanche over Alsace-Lorraine, pan-German aims).",
            "One point for explaining how nationalist feeling constrained leaders' willingness to compromise.",
            "One point for evaluating whether nationalism was a primary or contributing cause, using evidence.",
        ],
        [
            ["nationalism", "patriotism", "revenge", "alsace", "pan-german", "slavic", "serbian"],
            ["public opinion", "pressure", "press", "crowds", "could not", "constrained"],
            ["most important", "contributing", "however", "combined", "primary", "weigh"],
        ],
    );
    public static readonly SAQ_SCENARIO_TWO_D = new ShortAnswerRubricItem(
        "saq_s2_d",
        2,
        "Explain TWO consequences of the First World War for the global balance of power.",
        3,
        [
            "One point for a valid consequence (for example, the collapse of four empires or the rise of the United States as a creditor power).",
            "One point for a second, distinct consequence (for example, the Russian Revolution or the creation of the mandate system).",
            "One point for linking at least one consequence to changes in the world order after 1918.",
        ],
        [
            ["empire", "collapse", "ottoman", "austria", "russian", "qing", "revolution"],
            ["united states", "creditor", "debtor", "loans", "league", "mandate", "self-determination"],
            ["after 1918", "world order", "global", "balance of power", "hegemony", "vacuum"],
        ],
    );

    public static readonly SAQ_SCENARIO_THREE_A = new ShortAnswerRubricItem(
        "saq_s3_a",
        3,
        "Using the Kitchener and \"Women of Britain Say GO\" posters, explain ONE way governments mobilized populations for total war.",
        3,
        [
            "One point for identifying the method (for example, official propaganda appealing to duty, shame, and family honor).",
            "One point for describing how the method worked on its audience.",
            "One point for explaining the significance of such mobilization for the conduct of the war.",
        ],
        [
            ["propaganda", "poster", "appeal", "recruit", "duty", "shame", "honor"],
            ["audience", "men", "women", "public", "pressure", "persuade", "enlist"],
            ["total war", "mobilized", "home front", "manpower", "voluntary", "conscription"],
        ],
    );
    public static readonly SAQ_SCENARIO_THREE_B = new ShortAnswerRubricItem(
        "saq_s3_b",
        3,
        "Using Owen's poem as evidence, explain the human cost of new military technologies in the First World War.",
        3,
        [
            "One point for identifying the technology (for example, poison gas).",
            "One point for describing its effect on soldiers as evidenced in the poem.",
            "One point for explaining why such evidence matters for understanding total war.",
        ],
        [
            ["gas", "chlorine", "mustard", "machine gun", "artillery", "technology"],
            ["suffering", "death", "drowning", "wagons", "dreams", "horror", "casualties"],
            ["total war", "industrial", "mass", "millions", "not measured", "human cost"],
        ],
    );
    public static readonly SAQ_SCENARIO_THREE_C = new ShortAnswerRubricItem(
        "saq_s3_c",
        3,
        "Explain how the Hindenburg Programme illustrates the mobilization of industry and labor for total war.",
        3,
        [
            "One point for describing the program's aims (for example, doubling munitions output and compulsory labor service).",
            "One point for explaining the state's role in directing the economy.",
            "One point for noting a consequence for civilians or workers.",
        ],
        [
            ["munitions", "weapons", "output", "production", "factories", "targets"],
            ["state", "government", "directed", "compulsory", "auxiliary service", "control"],
            ["workers", "labor", "civilians", "hardship", "resistance", "forced"],
        ],
    );
    public static readonly SAQ_SCENARIO_THREE_D = new ShortAnswerRubricItem(
        "saq_s3_d",
        3,
        "Continuity and change: Explain ONE continuity and ONE change in the conduct of war between 1900 and 1918.",
        3,
        [
            "One point for a valid continuity (for example, the decisive role of mass conscript armies and defensive firepower).",
            "One point for a valid change (for example, the introduction of gas, tanks, and aircraft on a mass scale, or government direction of the economy).",
            "One point for explaining the significance of the relationship.",
        ],
        [
            ["continuity", "remained", "trenches", "conscript", "artillery", "defensive"],
            ["change", "new", "gas", "tank", "aircraft", "blockade", "economic"],
            ["significance", "revolutionized", "transformed", "nonetheless", "for the first time"],
        ],
    );

    public static readonly SAQ_SCENARIO_FOUR_A = new ShortAnswerRubricItem(
        "saq_s4_a",
        4,
        "Using both sources from the shared inquiry, explain ONE similarity and ONE difference between the Soviet and Mexican responses to economic crisis.",
        3,
        [
            "One point for a valid similarity (for example, both expanded state power over the economy).",
            "One point for a valid difference (for example, Stalin's plans collectivized agriculture under coercion, while Cárdenas's measures built popular support through land and oil reform).",
            "One point for explaining the significance of the similarity or difference.",
        ],
        [
            ["state", "nationaliz", "control", "plan", "reform", "economy", "government"],
            ["coercion", "repression", "support", "land", "oil", "collectivization", "populist", "differences"],
            ["significance", "therefore", "shows", "ideology", "democracy", "compare"],
        ],
    );
    public static readonly SAQ_SCENARIO_FOUR_B = new ShortAnswerRubricItem(
        "saq_s4_b",
        4,
        "Explain how the Great Depression led governments to take a more active role in economic life. Use ONE example from outside the Soviet Union.",
        3,
        [
            "One point for describing the effects of the Depression (for example, unemployment, collapsed trade, and bank failures).",
            "One point for describing a governmental response (for example, the New Deal's public works and regulation, or fascist corporatism).",
            "One point for explaining how the response represented a break with laissez-faire assumptions.",
        ],
        [
            ["depression", "unemployment", "trade", "banks", "crisis", "1929"],
            ["new deal", "public works", "welfare", "regulation", "corporatist", "five-year"],
            ["laissez", "intervention", "active role", "break", "departed", "abandoned"],
        ],
    );
    public static readonly SAQ_SCENARIO_FOUR_C = new ShortAnswerRubricItem(
        "saq_s4_c",
        4,
        "Explain how ONE government's response to economic crisis after 1900 both addressed and created problems for its people.",
        3,
        [
            "One point for describing the response and its claimed benefit.",
            "One point for describing a cost or problem the response created.",
            "One point for explaining the trade-off with evidence.",
        ],
        [
            ["benefit", "growth", "jobs", "industry", "recovery", "land", "welfare"],
            ["cost", "repression", "famine", "inequality", "debt", "unrest", "censorship"],
            ["trade-off", "however", "at the cost", "nevertheless", "while", "although"],
        ],
    );
    public static readonly SAQ_SCENARIO_FOUR_D = new ShortAnswerRubricItem(
        "saq_s4_d",
        4,
        "Comparison: Explain ONE similarity and ONE difference between the fascist corporatist economies and the Soviet planned economy.",
        3,
        [
            "One point for a valid similarity (for example, state direction of industry and suppression of independent unions).",
            "One point for a valid difference (for example, private property persisted under fascism while the Soviet state owned the means of production).",
            "One point for explaining why the difference matters for understanding the era's politics.",
        ],
        [
            ["state", "direction", "unions", "industry", "mobilization", "control"],
            ["private", "ownership", "collectiv", "property", "profit", "class"],
            ["ideology", "matters", "explains", "communism", "fascism", "totalitarian"],
        ],
    );

    public static readonly SAQ_SCENARIO_FIVE_A = new ShortAnswerRubricItem(
        "saq_s5_a",
        5,
        "Using the Clemenceau letter, explain the point of view of the source and how it shaped the argument.",
        3,
        [
            "One point for identifying the point of view (for example, the French premier holding Germany responsible for the war).",
            "One point for describing the argument the point of view produced (for example, the justice of harsh terms).",
            "One point for explaining how the point of view limits the source's usefulness.",
        ],
        [
            ["point of view", "french", "premier", "clemenceau", "victor", "prosecutor"],
            ["german guilt", "responsibility", "harsh", "reparations", "justice", "blame"],
            ["limits", "one-sided", "omits", "does not", "cannot", "biased"],
        ],
    );
    public static readonly SAQ_SCENARIO_FIVE_B = new ShortAnswerRubricItem(
        "saq_s5_b",
        5,
        "Explain how the mandate system represented both continuity and change in imperial rule after the First World War.",
        3,
        [
            "One point for describing the mandate system.",
            "One point for identifying the continuity (for example, control by victorious empires persisted).",
            "One point for identifying the change (for example, League oversight and the language of tutelage and eventual self-rule).",
        ],
        [
            ["mandate", "league", "article 22", "tutelage", "trusteeship"],
            ["control", "continued", "empire", "britain", "france", "administr"],
            ["oversight", "self-rule", "eventual", "new language", "legitimacy", "wilson"],
        ],
    );
    public static readonly SAQ_SCENARIO_FIVE_C = new ShortAnswerRubricItem(
        "saq_s5_c",
        5,
        "Explain ONE example of anti-imperial resistance in the interwar period and ONE way imperial states responded to it.",
        3,
        [
            "One point for a valid example (for example, the Indian National Congress, West African strikes and congresses, or the Rif War).",
            "One point for describing the imperial response (for example, repression, limited reforms, or co-optation of elites).",
            "One point for explaining how the interaction changed the relationship between ruler and ruled.",
        ],
        [
            ["congress", "gandhi", "strike", "resistance", "nationalist", "revolt", "rif"],
            ["repress", "arrest", "reform", "concession", "co-opt", "force", "partition"],
            ["relationship", "consciousness", "organization", "next", "shaped", "national"],
        ],
    );
    public static readonly SAQ_SCENARIO_FIVE_D = new ShortAnswerRubricItem(
        "saq_s5_d",
        5,
        "Explain how territorial holdings changed between 1900 and the interwar period in ONE region of Asia or Africa.",
        3,
        [
            "One point for describing the holdings in 1900.",
            "One point for describing their status by the mid-1920s.",
            "One point for explaining the process that produced the change, such as mandates, conquest, or resistance.",
        ],
        [
            ["1900", "empire", "colony", "ottoman", "german", "british", "french"],
            ["1920", "after the war", "mandate", "manchukuo", "co-prosperity", "raj"],
            ["process", "conquest", "treaty", "mandate", "league", "resistance"],
        ],
    );

    public static readonly SAQ_SCENARIO_SIX_A = new ShortAnswerRubricItem(
        "saq_s6_a",
        6,
        "Using the Munich Agreement sources, explain how appeasement reflected the causes of the Second World War.",
        3,
        [
            "One point for describing appeasement and its assumptions.",
            "One point for connecting it to causes (the unsustainable Versailles settlement, economic crisis, or fear of war).",
            "One point for explaining how its failure contributed to the war.",
        ],
        [
            ["appeasement", "munich", "chamberlain", "concession", "negotiat"],
            ["versailles", "depression", "fear", "isolation", "preparedness", "weakness"],
            ["failure", "encouraged", "aggression", "1939", "emboldened", "war came"],
        ],
    );
    public static readonly SAQ_SCENARIO_SIX_B = new ShortAnswerRubricItem(
        "saq_s6_b",
        6,
        "Explain how the global economic crisis contributed to the rise of fascist and totalitarian regimes.",
        3,
        [
            "One point for describing the Depression's effects on the politics of a specific state.",
            "One point for explaining how the crisis discredited democratic institutions or a specific government.",
            "One point for linking the rise of an extremist movement to the crisis with evidence.",
        ],
        [
            ["depression", "unemployment", "collapse", "1932", "crisis", "hyperinflation"],
            ["discredited", "weimar", "democratic", "republic", "failure", "confidence"],
            ["nazi", "hitler", "fascist", "communist", "extremist", "party grew"],
        ],
    );
    public static readonly SAQ_SCENARIO_SIX_C = new ShortAnswerRubricItem(
        "saq_s6_c",
        6,
        "Explain how the Lytton Report's fate illustrates the failure of collective security before 1939.",
        3,
        [
            "One point for describing the League's response to Manchuria.",
            "One point for explaining why the response failed (no enforcement, great-power disunity).",
            "One point for linking the failure to later aggression.",
        ],
        [
            ["league", "manchuria", "japan", "commission", "report", "condemn"],
            ["no enforcement", "withdrew", "sanctions", "disunity", "powerless", "unanim"],
            ["encouraged", "ethiopia", "hitler", "aggression", "later", "precedent"],
        ],
    );
    public static readonly SAQ_SCENARIO_SIX_D = new ShortAnswerRubricItem(
        "saq_s6_d",
        6,
        "Causation: Explain the relative significance of the Treaty of Versailles settlement compared with the Depression as a cause of the Second World War.",
        3,
        [
            "One point for explaining the case for the Versailles settlement as a cause.",
            "One point for explaining the case for the Depression as a cause.",
            "One point for making a reasoned judgment about their relative significance.",
        ],
        [
            ["versailles", "reparations", "war guilt", "resentment", "territory", "disarmament"],
            ["depression", "1930", "collapse", "unemployment", "extremism", "trade"],
            ["more significant", "relative", "weigh", "together", "interacted", "judgment"],
        ],
    );

    public static readonly SAQ_SCENARIO_SEVEN_A = new ShortAnswerRubricItem(
        "saq_s7_a",
        7,
        "Using the Churchill and Roosevelt sources, explain ONE similarity and ONE difference in how democratic leaders mobilized their nations for war in 1940.",
        3,
        [
            "One point for a valid similarity (for example, appeals to moral purpose and the defense of freedom).",
            "One point for a valid difference (for example, Britain already at war and rallying resolve versus America still neutral and arguing for material aid).",
            "One point for explaining the significance of the difference in the two nations' situations.",
        ],
        [
            ["moral", "freedom", "tyranny", "democracy", "purpose", "rhetoric"],
            ["neutral", "aid", "already at war", "isolation", "lend-lease", "arsenal"],
            ["significance", "position", "geography", "ocean", "empire", "unprepared"],
        ],
    );
    public static readonly SAQ_SCENARIO_SEVEN_B = new ShortAnswerRubricItem(
        "saq_s7_b",
        7,
        "Using the Goebbels and Stalin sources, explain how totalitarian states mobilized and repressed their populations during the Second World War.",
        3,
        [
            "One point for describing mobilization methods (for example, mass propaganda and terror).",
            "One point for explaining how repression was justified (for example, as necessity in an existential struggle).",
            "One point for evaluating what the sources reveal about the totalitarian control of daily life.",
        ],
        [
            ["propaganda", "terror", "mobiliz", "rally", "order", "penal", "repress"],
            ["necessity", "existence", "survival", "traitor", "coward", "reasons"],
            ["daily life", "control", "silence", "fear", "conformity", "totality"],
        ],
    );
    public static readonly SAQ_SCENARIO_SEVEN_C = new ShortAnswerRubricItem(
        "saq_s7_c",
        7,
        "Explain how claims that the Second World War was conducted differently by each major power support, modify, or refute the argument that it was a single \"total war.\"",
        3,
        [
            "One point for claims supporting the total-war thesis (for example, economic direction and mass conscription everywhere).",
            "One point for evidence modifying the thesis (for example, variations in repression, colonial mobilization, and ideology).",
            "One point for a reasoned conclusion about the usefulness of the term.",
        ],
        [
            ["total war", "conscription", "economy", "rationing", "casualties", "civilians"],
            ["varied", "different", "colonies", "ideology", "differed", "methods"],
            ["conclusion", "useful", "qualified", "nonetheless", "although", "term"],
        ],
    );
    public static readonly SAQ_SCENARIO_SEVEN_D = new ShortAnswerRubricItem(
        "saq_s7_d",
        7,
        "Comparison: Explain how Germany's and the USSR's conduct of the war reflected their competing ideologies.",
        3,
        [
            "One point for describing a fascist feature of German conduct.",
            "One point for describing a communist feature of Soviet conduct.",
            "One point for explaining how the two systems both mobilized total war while opposing each other's visions.",
        ],
        [
            ["fascist", "nazi", "race", "lebensraum", "fuhrer", "aryan"],
            ["communist", "soviet", "party", "collectiv", "stalin", "class"],
            ["opposed", "rivals", "both", "mobilized", "ideolog", "mirror"],
        ],
    );

    public static readonly SAQ_SCENARIO_EIGHT_A = new ShortAnswerRubricItem(
        "saq_s8_a",
        8,
        "Using the Day of Infamy address, explain how the United States entered the Second World War and why the language of the speech mattered.",
        3,
        [
            "One point for describing the context of Pearl Harbor and the declaration of war.",
            "One point for identifying the rhetorical framing (for example, \"infamy\" and unprovoked attack).",
            "One point for explaining the effect of that framing on American unity and purpose.",
        ],
        [
            ["pearl harbor", "1941", "declaration", "japan", "congress", "pacif"],
            ["infamy", "unprovoked", "deliberately", "dastardly", "rhetoric"],
            ["unity", "resolve", "mobiliz", "public opinion", "effort", "belligerent"],
        ],
    );
    public static readonly SAQ_SCENARIO_EIGHT_B = new ShortAnswerRubricItem(
        "saq_s8_b",
        8,
        "Using the \"Careless Talk\" poster and Order No. 227, explain ONE similarity and ONE difference in how Britain and the USSR disciplined their wartime populations.",
        3,
        [
            "One point for a valid similarity (for example, both used official campaigns to police speech or behavior).",
            "One point for a valid difference (for example, British posters avoided coercion, while Soviet orders threatened execution).",
            "One point for explaining what the difference reveals about the two states.",
        ],
        [
            ["police", "secrecy", "speech", "orders", "campaign", "discipline"],
            ["coercion", "execution", "persuasion", "humor", "terror", "voluntary"],
            ["reveals", "democracy", "totalitarian", "liberties", "fear", "consent"],
        ],
    );
    public static readonly SAQ_SCENARIO_EIGHT_C = new ShortAnswerRubricItem(
        "saq_s8_c",
        8,
        "Explain how the Greater East Asia Co-Prosperity Sphere declaration masked the realities of Japanese rule. Support your answer with the source.",
        3,
        [
            "One point for describing the declaration's claims (liberation, co-prosperity).",
            "One point for describing the realities of Japanese occupation (forced labor, requisition, brutality).",
            "One point for explaining the gap between claim and reality as propaganda.",
        ],
        [
            ["liberation", "co-prosperity", "asia for asians", "independence", "sphere"],
            ["forced labor", "requisition", "brutality", "occupation", "comfort women", "famine"],
            ["propaganda", "mask", "contradiction", "reality", "ideology", "claimed"],
        ],
    );
    public static readonly SAQ_SCENARIO_EIGHT_D = new ShortAnswerRubricItem(
        "saq_s8_d",
        8,
        "Explain TWO ways the Second World War was a total war for civilian populations.",
        3,
        [
            "One point for a valid way (for example, aerial bombing of cities or economic mobilization and rationing).",
            "One point for a second way (for example, occupation, forced labor, or genocide).",
            "One point for explaining how these developments differed from the First World War.",
        ],
        [
            ["bombing", "cities", "rationing", "mobiliz", "civilian", "home front"],
            ["occupation", "forced labor", "genocide", "atrocity", "displacement", "famine"],
            ["more than 1914", "far greater", "new scale", "differed", "expanded", "unlike"],
        ],
    );

    public static readonly SAQ_SCENARIO_NINE_A = new ShortAnswerRubricItem(
        "saq_s9_a",
        9,
        "Using the Morgenthau dispatch and the Talat directive, explain ONE cause and ONE consequence of the Armenian deportations and killings.",
        3,
        [
            "One point for a valid cause (for example, wartime scapegoating of a minority or central-government radicalization).",
            "One point for a valid consequence (for example, the destruction of Armenian communities or the precedent of state-directed extermination).",
            "One point for corroborating the claim across the two sources.",
        ],
        [
            ["scapegoat", "nationalism", "radical", "war", "suspicion", "committee", "collaborate"],
            ["destroyed", "communities", "diaspora", "displacement", "hundreds of thousands", "precedent"],
            ["corroborat", "both sources", "together", "confirm", "support", "consistent"],
        ],
    );
    public static readonly SAQ_SCENARIO_NINE_B = new ShortAnswerRubricItem(
        "saq_s9_b",
        9,
        "Using the Gareth Jones dispatches and the Law of Three Spikelets, explain how the Holodomor was caused by state policy as well as environmental factors.",
        3,
        [
            "One point for describing the policy of collectivization and grain requisitioning.",
            "One point for describing its effects on rural populations.",
            "One point for evaluating how the sources together establish the state's role.",
        ],
        [
            ["collectivization", "requisition", "quota", "grain", "dekulakization", "production"],
            ["famine", "starving", "death", "peasants", "starvation", "mortality"],
            ["state policy", "man-made", "evidence", "together", "denied", "weapon"],
        ],
    );
    public static readonly SAQ_SCENARIO_NINE_C = new ShortAnswerRubricItem(
        "saq_s9_c",
        9,
        "Using the Khmer Rouge sources, explain how the regime's ideology produced terror. Reference specific claims from the sources.",
        3,
        [
            "One point for describing the ideological program (purification, Year Zero, enemies of the revolution).",
            "One point for describing the terror (evacuation, S-21, killing).",
            "One point for explaining the causal link between ideology and terror using the sources.",
        ],
        [
            ["purif", "year zero", "enemy", "revolution", "agrarian", "ideology"],
            ["evacuat", "torture", "s-21", "killing", "purge", "confession"],
            ["causal", "because", "produced", "justified", "therefore", "linked"],
        ],
    );
    public static readonly SAQ_SCENARIO_NINE_D = new ShortAnswerRubricItem(
        "saq_s9_d",
        9,
        "Using the Kangura excerpt and the RTLM broadcast, explain how media prepared and directed the Rwandan genocide.",
        3,
        [
            "One point for describing the propaganda content (dehumanization, conspiracy, command).",
            "One point for explaining how radio and newspapers reached ordinary people.",
            "One point for assessing media's role in the organization of killing.",
        ],
        [
            ["cockroach", "dehuman", "commandments", "conspiracy", "enemy", "propaganda"],
            ["radio", "broadcast", "newspaper", "reach", "illiterac", "popular"],
            ["organized", "coordinated", "directed", "role", "incited", "enabled"],
        ],
    );
    public static readonly SAQ_SCENARIO_NINE_E = new ShortAnswerRubricItem(
        "saq_s9_e",
        9,
        "Explain ONE similarity and ONE difference between the causes of the Armenian Genocide and the Rwandan Genocide.",
        3,
        [
            "One point for a valid similarity (for example, both involved dehumanizing propaganda and state or elite organization).",
            "One point for a valid difference (for example, wartime minority scapegoating under an empire versus post-colonial political incitement and civil conflict).",
            "One point for explaining what the comparison reveals about causes of mass atrocities.",
        ],
        [
            ["dehuman", "propaganda", "organiz", "inaction", "minority", "state"],
            ["war", "empire", "post-colonial", "civil war", "radio", "differ"],
            ["reveals", "pattern", "common", "conditions", "prevent", "comparison"],
        ],
    );
    public static readonly SAQ_SCENARIO_NINE_F = new ShortAnswerRubricItem(
        "saq_s9_f",
        9,
        "Explain how the Holodomor and the Holocaust relate to each other as historical developments. Reference at least one shared or differing feature.",
        3,
        [
            "One point for a valid shared feature (for example, destruction driven by state ideology and central organization).",
            "One point for a valid differing feature (for example, famine by decree targeting a social category versus industrialized killing targeting a defined people).",
            "One point for explaining the relationship between the two events without equating them.",
        ],
        [
            ["state", "ideology", "central", "organization", "destruction", "victims"],
            ["famine", "ghetto", "camps", "category", "people", "distinct", "differ"],
            ["relate", "connected", "without equating", "comparison", "severity", "pattern"],
        ],
    );
    public static readonly SAQ_SCENARIO_NINE_G = new ShortAnswerRubricItem(
        "saq_s9_g",
        9,
        "Explain how the international response to the Rwandan genocide reflected lessons and limits of international action after 1945.",
        3,
        [
            "One point for describing the international response (for example, UN peacekeeping limits and delayed action).",
            "One point for connecting it to the promised lessons of 1945 and the Genocide Convention.",
            "One point for evaluating the gap between promise and action.",
        ],
        [
            ["united nations", "peacekeep", "withdraw", "delay", "inaction", "security council"],
            ["1945", "genocide convention", "never again", "charter", "obligation", "human rights"],
            ["gap", "failed", "promise", "evaluate", "sovereignty", "veto"],
        ],
    );
    public static readonly SAQ_SCENARIO_NINE_H = new ShortAnswerRubricItem(
        "saq_s9_h",
        9,
        "Explain how testimony and documentation each contribute differently to the historical record of mass atrocities in the period after 1900.",
        3,
        [
            "One point for describing the contribution of testimony.",
            "One point for describing the contribution of documentation.",
            "One point for explaining how the two kinds of evidence corroborate or qualify each other.",
        ],
        [
            ["testimony", "survivor", "witness", "memory", "human", "experience"],
            ["document", "order", "telegram", "record", "policy", "archive"],
            ["corroborat", "qualify", "together", "both", "cross-check", "balance"],
        ],
    );

    public static readonly SAQ_SCENARIO_TEN_A = new ShortAnswerRubricItem(
        "saq_s10_a",
        10,
        "Using at least three sources from the period 1919-1945, explain the relative significance of ideological conflict compared with economic crisis as a cause of global conflict.",
        3,
        [
            "One point for using at least three sources appropriately.",
            "One point for explaining the case for ideology.",
            "One point for explaining the case for economic crisis and weighing the two.",
        ],
        [
            ["source", "treaty", "charter", "speech", "article", "document"],
            ["ideology", "fascism", "communism", "democracy", "nationalism", "totalitarian"],
            ["economic", "depression", "crisis", "relative", "worse", "combined", "interacted"],
        ],
    );
    public static readonly SAQ_SCENARIO_TEN_B = new ShortAnswerRubricItem(
        "saq_s10_b",
        10,
        "Explain how the outcomes of 1945 changed the international system that had existed in 1919. Use at least two sources.",
        3,
        [
            "One point for describing a continuity or change in the international system.",
            "One point for a second, distinct change, such as the United Nations or the nuclear age.",
            "One point for explaining the significance of the change using sources.",
        ],
        [
            ["league", "united nations", "collective security", "veto", "mandate", "trusteeship"],
            ["nuclear", "atomic", "superpower", "cold war", "decoloniz", "self-determination"],
            ["significance", "more powerful", "unlike", "replaced", "therefore", "new order"],
        ],
    );
    public static readonly SAQ_SCENARIO_TEN_C = new ShortAnswerRubricItem(
        "saq_s10_c",
        10,
        "Explain how the Second World War accelerated the end of European empires. Reference at least two sources.",
        3,
        [
            "One point for describing the wartime weakening of imperial powers.",
            "One point for describing the role of charter and chartering principles in the postwar demand for self-rule.",
            "One point for explaining why decolonization followed so rapidly.",
        ],
        [
            ["weakened", "bankrupt", "occupied", "japan", "colonies lost", "prestige"],
            ["atlantic charter", "united nations", "self-determination", "rights", "trusteeship"],
            ["accelerated", "rapidly", "independence", "after 1945", "nationalism", "could no longer"],
        ],
    );
    public static readonly SAQ_SCENARIO_TEN_D = new ShortAnswerRubricItem(
        "saq_s10_d",
        10,
        "Complex argument: Explain the most significant cause of global conflict between 1900 and 1945, addressing at least one counterargument.",
        3,
        [
            "One point for a clear thesis identifying the most significant cause.",
            "One point for evidence supporting the thesis across the period.",
            "One point for addressing a counterargument or alternative cause and qualifying the thesis.",
        ],
        [
            ["most significant", "primary", "thesis", "because", "argue", "greatest"],
            ["evidence", "for example", "1914", "1939", "pattern", "throughout"],
            ["counterargument", "however", "others argue", "although", "qualified", "alternative"],
        ],
    );

    public static readonly CONTEXTUALIZATION_RUBRIC = new ContextualizationRubric(
        "contextualization_rubric",
        "Explain how a specific historical development or process is situated within a broader historical context (Skill 4.B).",
        [
            "0 points: The paragraph describes the event without reference to a broader context.",
            "1 point: The paragraph describes a broader context but does not connect it to the specific development.",
            "2 points: The paragraph connects the specific development to the broader context but treats the connection as incidental.",
            "3 points: The paragraph explains how the specific development fits within the broader context and why the context shaped it.",
        ],
    );

    public static readonly COMPARISON_RUBRIC = new ComparisonRubric(
        "comparison_rubric",
        "Compare historical developments and explain the significance of their similarities and differences.",
        "Describe at least one relevant similarity with evidence.",
        "Describe at least one relevant difference with evidence.",
        "Explain the significance of the similarity or difference for understanding the period.",
    );

    public static readonly COMPLEX_ARGUMENT_RUBRIC = new ComplexArgumentRubric(
        "complex_argument_rubric",
        "Corroborate, qualify, or modify an argument using diverse and alternative evidence in order to develop a complex argument (Skill 6.D).",
        [
            "Explains nuance of an issue by analyzing multiple variables.",
            "Explains relevant and insightful connections within and across periods.",
            "Explains the relative historical significance of a source's credibility and limitations.",
            "Explains how or why a historical claim or argument is or is not effective.",
        ],
    );

    public static readonly SHARED_INQUIRY_RUBRIC = new DiscussionRubric(
        "shared_inquiry_rubric",
        "Shared inquiry on the paired sources: What is each author's purpose and audience? How are they similar and different?",
        [
            "What is each author's purpose and audience?",
            "How are they similar and different?",
            "Discuss the changes and continuities associated with the Mexican and Russian revolutions (Topic 7.1).",
            "How does the historical situation in each country help you understand the similarities and differences?",
            "How does the economic history of Units 5 and 6 help you understand the significance of each author's point of view?",
        ],
        [
            "Responds to each guiding question with reference to the sources.",
            "Uses specific evidence from the sources and prior units.",
            "Explains the significance of the similarities and differences.",
        ],
    );

    public static readonly QUICKWRITE_RUBRIC = new DiscussionRubric(
        "quickwrite_rubric",
        "Quickwrite on Clemenceau's letter: Based on what you learned about the causes of World War I, what are the weaknesses in Clemenceau's argument?",
        ["Identify at least one weakness in Clemenceau's argument.", "Support the weakness with evidence from Topic 7.2."],
        [
            "States a weakness in the argument.",
            "Supports the weakness with evidence from the causes of World War I.",
            "Explains why the weakness matters for evaluating the source.",
        ],
    );

    public static readonly SOCRATIC_SEMINAR_RUBRIC = new DiscussionRubric(
        "socratic_seminar_rubric",
        "Socratic seminar on \"The Century of Total War\" from Richard P. Tucker's \"War and the Environment\".",
        [
            "What is the author's argument?",
            "What evidence does he use to support his argument?",
            "Is there additional evidence from before or during this time period that would support or refute the author's argument?",
            "Do you agree with the author's argument? Why or why not?",
        ],
        [
            "States the author's argument accurately.",
            "Cites the author's evidence and evaluates it.",
            "Brings additional evidence to support or refute the argument.",
            "Takes and defends a position.",
        ],
    );

    public static getRubricItemsForScenario(scenarioNumber: number): ShortAnswerRubricItem[] {
        return Rubrics.getAllRubricItems().filter((rubricItem) => rubricItem.scenarioNumber === scenarioNumber);
    }

    public static getAllRubricItems(): ShortAnswerRubricItem[] {
        return [
            Rubrics.SAQ_SCENARIO_ONE_A,
            Rubrics.SAQ_SCENARIO_ONE_B,
            Rubrics.SAQ_SCENARIO_ONE_C,
            Rubrics.SAQ_SCENARIO_ONE_D,
            Rubrics.SAQ_SCENARIO_TWO_A,
            Rubrics.SAQ_SCENARIO_TWO_B,
            Rubrics.SAQ_SCENARIO_TWO_C,
            Rubrics.SAQ_SCENARIO_TWO_D,
            Rubrics.SAQ_SCENARIO_THREE_A,
            Rubrics.SAQ_SCENARIO_THREE_B,
            Rubrics.SAQ_SCENARIO_THREE_C,
            Rubrics.SAQ_SCENARIO_THREE_D,
            Rubrics.SAQ_SCENARIO_FOUR_A,
            Rubrics.SAQ_SCENARIO_FOUR_B,
            Rubrics.SAQ_SCENARIO_FOUR_C,
            Rubrics.SAQ_SCENARIO_FOUR_D,
            Rubrics.SAQ_SCENARIO_FIVE_A,
            Rubrics.SAQ_SCENARIO_FIVE_B,
            Rubrics.SAQ_SCENARIO_FIVE_C,
            Rubrics.SAQ_SCENARIO_FIVE_D,
            Rubrics.SAQ_SCENARIO_SIX_A,
            Rubrics.SAQ_SCENARIO_SIX_B,
            Rubrics.SAQ_SCENARIO_SIX_C,
            Rubrics.SAQ_SCENARIO_SIX_D,
            Rubrics.SAQ_SCENARIO_SEVEN_A,
            Rubrics.SAQ_SCENARIO_SEVEN_B,
            Rubrics.SAQ_SCENARIO_SEVEN_C,
            Rubrics.SAQ_SCENARIO_SEVEN_D,
            Rubrics.SAQ_SCENARIO_EIGHT_A,
            Rubrics.SAQ_SCENARIO_EIGHT_B,
            Rubrics.SAQ_SCENARIO_EIGHT_C,
            Rubrics.SAQ_SCENARIO_EIGHT_D,
            Rubrics.SAQ_SCENARIO_NINE_A,
            Rubrics.SAQ_SCENARIO_NINE_B,
            Rubrics.SAQ_SCENARIO_NINE_C,
            Rubrics.SAQ_SCENARIO_NINE_D,
            Rubrics.SAQ_SCENARIO_NINE_E,
            Rubrics.SAQ_SCENARIO_NINE_F,
            Rubrics.SAQ_SCENARIO_NINE_G,
            Rubrics.SAQ_SCENARIO_NINE_H,
            Rubrics.SAQ_SCENARIO_TEN_A,
            Rubrics.SAQ_SCENARIO_TEN_B,
            Rubrics.SAQ_SCENARIO_TEN_C,
            Rubrics.SAQ_SCENARIO_TEN_D,
        ];
    }
}
