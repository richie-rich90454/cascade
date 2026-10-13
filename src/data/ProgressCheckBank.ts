export class MultipleChoiceQuestion {
    public readonly questionIdentifier: string;
    public readonly cedTopicCode: string;
    public readonly questionText: string;
    public readonly answerOptions: string[];
    public readonly correctAnswerIndex: number;
    public readonly rationaleText: string;

    constructor(
        questionIdentifier: string,
        cedTopicCode: string,
        questionText: string,
        answerOptions: string[],
        correctAnswerIndex: number,
        rationaleText: string,
    ) {
        this.questionIdentifier = questionIdentifier;
        this.cedTopicCode = cedTopicCode;
        this.questionText = questionText;
        this.answerOptions = answerOptions;
        this.correctAnswerIndex = correctAnswerIndex;
        this.rationaleText = rationaleText;
    }

    public isAnswerCorrect(selectedAnswerIndex: number): boolean {
        return selectedAnswerIndex === this.correctAnswerIndex;
    }
}

export class ProgressCheckShortAnswer {
    public readonly questionIdentifier: string;
    public readonly questionVariant: string;
    public readonly questionText: string;
    public readonly stimulusText: string;
    public readonly scoringNotes: string;

    constructor(
        questionIdentifier: string,
        questionVariant: string,
        questionText: string,
        stimulusText: string,
        scoringNotes: string,
    ) {
        this.questionIdentifier = questionIdentifier;
        this.questionVariant = questionVariant;
        this.questionText = questionText;
        this.stimulusText = stimulusText;
        this.scoringNotes = scoringNotes;
    }
}

export class DocumentBasedQuestion {
    public readonly questionIdentifier: string;
    public readonly promptText: string;
    public readonly documentSourceIdentifiers: string[];
    public readonly scoringNotes: string;

    constructor(
        questionIdentifier: string,
        promptText: string,
        documentSourceIdentifiers: string[],
        scoringNotes: string,
    ) {
        this.questionIdentifier = questionIdentifier;
        this.promptText = promptText;
        this.documentSourceIdentifiers = documentSourceIdentifiers;
        this.scoringNotes = scoringNotes;
    }
}

export class ProgressCheckBank {
    public static readonly MC_QUESTIONS: MultipleChoiceQuestion[] = [
        new MultipleChoiceQuestion(
            "pc_mc_01",
            "7.1",
            "Which development most directly illustrates the collapse of a land-based empire due to the combination of internal and external factors after 1900?",
            [
                "The fall of the Qing dynasty after the 1911 revolution amid foreign pressure and internal revolt.",
                "The expansion of the British Empire after the First World War.",
                "The unification of Germany in 1871 under Prussian leadership.",
                "The establishment of the League of Nations in 1920.",
            ],
            0,
            "The Qing collapse combined internal crisis (revolts, reform failures) with external pressure (imperialism, the railway issue), making it the best fit.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_02",
            "7.1",
            "The Mexican Revolution most directly arose from",
            [
                "the political crisis created by the fraudulent election of 1910 and the long dictatorship of Porfirio Díaz.",
                "a foreign invasion of Mexico by Spain.",
                "the collapse of the Ottoman Empire.",
                "the end of the First World War.",
            ],
            0,
            "The revolution began with contested politics around the 1910 election and broad resentment of the Díaz regime.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_03",
            "7.1",
            "Which of the following best explains the global dominance of the West at the beginning of the twentieth century?",
            [
                "Industrialization, military power, and maritime empires carried Western influence across the world.",
                "The United Nations coordinated Western expansion.",
                "The League of Nations mandated Western rule over Europe.",
                "Russia and Japan divided the world between them.",
            ],
            0,
            "Western dominance rested on industrial and military superiority and expansive maritime empires.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_04",
            "7.2",
            "The alliance system contributed to the outbreak of the First World War most directly by",
            [
                "drawing great powers into conflict through binding commitments and mobilization schedules.",
                "reducing the size of European armies.",
                "creating a permanent European parliament.",
                "preventing all colonial competition after 1900.",
            ],
            0,
            "Binding commitments turned the Sarajevo crisis into continental mobilization within weeks.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_05",
            "7.2",
            "The Bosnian crisis and the Balkan Wars of 1912-1913 illustrate which cause of the First World War?",
            [
                "Territorial and regional conflict in a contested imperial borderland.",
                "The rise of the United States as a world power.",
                "The decline of nationalism in Europe.",
                "The success of collective security.",
            ],
            0,
            "The Balkan contests over territory and influence fed great-power tensions before 1914.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_06",
            "7.2",
            "Which consequence of the First World War most directly reshaped the map of Europe?",
            [
                "The dissolution of the Austro-Hungarian and Ottoman empires into successor states and mandates.",
                "The expansion of the German Empire westward.",
                "The unification of Italy.",
                "The annexation of Britain by France.",
            ],
            0,
            "Postwar settlements dissolved old empires and created new states and mandates across Europe and the Middle East.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_07",
            "7.3",
            'The label "total war" best applies to the First World War because',
            [
                "governments mobilized entire populations and economies, and civilians became targets and producers for the war effort.",
                "every country in the world participated in the fighting.",
                "the war lasted for more than four years without pause.",
                "only professional soldiers fought on every front.",
            ],
            0,
            "Total war describes the mobilization of whole societies, including the home front and colonial resources.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_08",
            "7.3",
            "Governments used propaganda during the First World War primarily to",
            [
                "mobilize populations and sustain support for the war effort, including in the colonies.",
                "provide citizens with accurate battlefield reporting.",
                "replace conscription entirely.",
                "negotiate peace terms with the enemy.",
            ],
            0,
            "Propaganda shaped popular opinion and recruitment, including efforts aimed at colonial populations.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_09",
            "7.3",
            "The use of poison gas, tanks, and aircraft in the First World War most directly supports which claim?",
            [
                "New military technology contributed to increased wartime casualties.",
                "Technology made wars shorter and less deadly.",
                "Industrial nations avoided producing new weapons.",
                "Trench warfare ended immediately in 1915.",
            ],
            0,
            "New industrial technologies added to the destructiveness of the war without quickly breaking the stalemate.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_10",
            "7.4",
            "In the Soviet Union, the Five-Year Plans were marked by",
            [
                "state control of the economy and repressive policies with severe consequences for the population.",
                "the rapid expansion of private enterprise.",
                "complete reliance on foreign investment.",
                "the abolition of heavy industry.",
            ],
            0,
            "The plans collectivized agriculture and industrialized under coercion, with devastating human costs.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_11",
            "7.4",
            "The New Deal is best described as",
            [
                "an expansion of government intervention in the American economy in response to the Great Depression.",
                "a Soviet program of collectivization.",
                "a fascist corporatist system.",
                "a return to unrestricted laissez-faire.",
            ],
            0,
            "The New Deal expanded federal regulation, relief, and public works in response to the Depression.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_12",
            "7.4",
            "Fascist corporatist economies in Italy and Germany most directly did what?",
            [
                "Organized labor and industry into state-supervised corporations and suppressed independent unions.",
                "Abolished all state involvement in the economy.",
                "Collectivized all farms and factories.",
                "Established free trade unions protected by law.",
            ],
            0,
            "Corporatism subordinated labor and capital to state goals while preserving private ownership.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_13",
            "7.5",
            "Between the two world wars, Western and Japanese imperial states generally",
            [
                "maintained control over colonial holdings, sometimes adding territory while facing anti-imperial resistance.",
                "granted immediate independence to all colonies.",
                "ended all imperial competition through the League of Nations.",
                "transferred their colonies to the United States.",
            ],
            0,
            "Imperial states held or expanded holdings, including through mandates and conquest, while facing rising resistance.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_14",
            "7.5",
            "The League of Nations mandate system",
            [
                "transferred former German and Ottoman territories to victorious powers under the League's nominal oversight.",
                "created fully independent governments in the former German colonies.",
                "returned all German colonies to Germany.",
                "placed all mandate territories under Japanese control.",
            ],
            0,
            "Mandates passed to Britain, France, Japan, and others as legalized imperial administration after 1919.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_15",
            "7.5",
            "The Indian National Congress and West African congresses and strikes are evidence of",
            [
                "growing organized anti-imperial resistance in the interwar period.",
                "the end of British imperial rule before 1939.",
                "the spread of Russian communism to Europe only.",
                "support for continued colonial rule among colonial elites.",
            ],
            0,
            "Organized nationalism and labor resistance grew across imperial territories between the wars.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_16",
            "7.6",
            "The peace settlement after the First World War contributed to the Second World War most directly by",
            [
                "leaving grievances and an unstable balance of power that revisionist states exploited.",
                "creating a world government that eliminated conflict.",
                "abolishing all national armies in Europe.",
                "satisfying all German demands.",
            ],
            0,
            "Versailles grievances, reparations, and instability fed later revisionism.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_17",
            "7.6",
            "The global economic crisis of the 1930s contributed to war by",
            [
                "discrediting democratic governments and empowering extremist movements that promised national revival.",
                "immediately solving unemployment across Europe.",
                "ending imperial competition for markets.",
                "strengthening collective security institutions.",
            ],
            0,
            "The Depression weakened confidence in democracy and boosted fascist and militarist movements.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_18",
            "7.6",
            "The aggressive militarism of Nazi Germany under Hitler most directly reflected which cause of the Second World War?",
            [
                "The rise to power of fascist and totalitarian regimes pursuing expansionist aims.",
                "The spread of collective security agreements.",
                "The decline of nationalism worldwide.",
                "The strengthening of the League of Nations' enforcement powers.",
            ],
            0,
            "Nazi ideology and rearmament are central to explanations of the war's onset.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_19",
            "7.7",
            "Which statement best compares the conduct of the two world wars?",
            [
                "Both were total wars, but the Second World War mobilized economies, ideologies, and civilian populations on a still larger scale.",
                "The First World War was fought entirely by professional armies, unlike the Second.",
                "Propaganda was used only in the Second World War.",
                "Colonial populations fought only in the Second World War.",
            ],
            0,
            "Both wars mobilized entire societies; the second extended and intensified that mobilization.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_20",
            "7.7",
            'The atomic bomb, firebombing, and waging of "total war" in the Second World War most directly resulted in',
            [
                "unprecedented casualties among civilians as well as soldiers.",
                "a rapid decline in military technology spending.",
                "the elimination of propaganda from warfare.",
                "the end of conscription in all countries.",
            ],
            0,
            "New technologies and strategies produced mass civilian casualties.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_21",
            "7.7",
            'Which of the following best explains why the Second World War was a "total war" in a different manner from the First World War?',
            [
                "Totalitarian ideologies directed entire societies and the state repressed basic liberties while fighting.",
                "Only democracies fought the second war.",
                "The second war avoided any use of propaganda.",
                "The second war was confined to a single continent.",
            ],
            0,
            "Fascist and communist regimes mobilized societies through ideology and terror, extending the war's reach into daily life.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_22",
            "7.8",
            "The Holocaust and other mass atrocities of the twentieth century were generally a consequence of",
            [
                "extremist regimes using state power to target specific populations according to ideological categories.",
                "natural disasters beyond human control.",
                "the collapse of the United Nations.",
                "the voluntary migration of affected peoples.",
            ],
            0,
            "Extremist regimes' ideology and state apparatus produced systematic destruction of targeted populations.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_23",
            "7.8",
            "Which best describes a significant difference among twentieth-century mass atrocities?",
            [
                "Perpetrators and circumstances varied between communist, fascist, imperial, and post-colonial settings while victims were targeted by category.",
                "All atrocities occurred during the Second World War.",
                "Each atrocity used identical methods in identical settings.",
                "None were connected to earlier conflicts.",
            ],
            0,
            "Atrocities occurred across different regimes and periods, targeting populations by ethnicity, class, or politics.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_24",
            "7.9",
            "When historians evaluate the relative significance of causes of global conflict between 1900 and 1945, they most usefully",
            [
                "weigh multiple causes against one another and explain why some mattered more in specific contexts.",
                "identify a single cause and ignore alternatives.",
                "rely on one source per conflict.",
                "assume causes from one conflict apply identically to another.",
            ],
            0,
            "Relative significance requires weighing multiple causal factors and qualifying claims by context.",
        ),
        new MultipleChoiceQuestion(
            "pc_mc_25",
            "7.9",
            "Rapid advances in science and technology between 1900 and 1945 are best characterized as",
            [
                "transformative for communication, transportation, industry, medicine, and war, with both intended and unintended consequences.",
                "limited to entertainment and consumer goods.",
                "unrelated to the conduct of wars.",
                "preventing the rise of totalitarian states.",
            ],
            0,
            "Science and technology reshaped every field, including the means of warfare, with consequences beyond their designers' intentions.",
        ),
    ];

    public static readonly SHORT_ANSWER_QUESTIONS: ProgressCheckShortAnswer[] = [
        new ProgressCheckShortAnswer(
            "pc_saq_01",
            "Secondary source",
            "Use the excerpt from William Henry Chamberlin's 1934 report on the Soviet famine to explain ONE cause and ONE effect of the collectivization of agriculture.",
            "William Henry Chamberlin, Russia's Iron Age (1934): The famine of 1932-33 was the most terrible and the most artificial catastrophe of its kind in Russian history... The grain which was exacted from the Ukrainian and Kuban villages left the countryside without food for the spring of 1933. The explanation lies in the forced pace of collectivization and in the belief of the rulers that the population must be broken to submission.",
            "One point for a cause drawn from the source (forced collectivization, grain requisition); one point for an effect (mass starvation, destruction of the countryside); one point for explaining the connection with evidence.",
        ),
        new ProgressCheckShortAnswer(
            "pc_saq_02",
            "No source",
            "Explain ONE way in which the causes of the Second World War were a continuation of the causes of the First World War, and ONE way in which they differed.",
            "No stimulus is provided for this question, as in the Personal Progress Check format.",
            "One point for a shared or continued cause (imperialism, nationalism, alliance blocs, unstable settlements); one point for a difference (the role of fascist and totalitarian regimes, or the global economic crisis); one point for explaining the significance of the comparison.",
        ),
    ];

    public static readonly DOCUMENT_BASED_QUESTION = new DocumentBasedQuestion(
        "pc_dbq_01",
        "Evaluate the extent to which global conflicts between 1900 and 1945 were caused by the collapse of traditional empires.",
        [
            "madero_plan_of_san_luis_potosi",
            "october_manifesto",
            "blank_cheque_telegram",
            "clemenceau_letter_may_1919",
            "chamberlain_peace_for_our_time_1938",
            "hitler_lebensraum_mein_kampf",
            "roosevelt_day_of_infamy_1941",
        ],
        "A successful essay states a defensible thesis, uses at least six documents, provides outside evidence, and demonstrates complexity by connecting imperial collapse to wars, revolutions, and the mandates system.",
    );

    public static getAllMultipleChoiceQuestions(): MultipleChoiceQuestion[] {
        return ProgressCheckBank.MC_QUESTIONS;
    }

    public static getMultipleChoiceQuestionCount(): number {
        return ProgressCheckBank.MC_QUESTIONS.length;
    }

    public static scoreMultipleChoiceAnswers(selectedAnswerIndexesByQuestionIdentifier: Map<string, number>): number {
        let correctAnswerCount = 0;
        for (const multipleChoiceQuestion of ProgressCheckBank.MC_QUESTIONS) {
            const selectedAnswerIndex = selectedAnswerIndexesByQuestionIdentifier.get(
                multipleChoiceQuestion.questionIdentifier,
            );
            if (selectedAnswerIndex !== undefined && multipleChoiceQuestion.isAnswerCorrect(selectedAnswerIndex)) {
                correctAnswerCount += 1;
            }
        }
        return correctAnswerCount;
    }
}
