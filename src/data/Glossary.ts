export class GlossaryEntry {
    public readonly termIdentifier: string;
    public readonly foreignTerm: string;
    public readonly languageOfOrigin: string;
    public readonly americanEnglishGloss: string;
    public readonly usageSentence: string;

    constructor(
        termIdentifier: string,
        foreignTerm: string,
        languageOfOrigin: string,
        americanEnglishGloss: string,
        usageSentence: string,
    ) {
        this.termIdentifier = termIdentifier;
        this.foreignTerm = foreignTerm;
        this.languageOfOrigin = languageOfOrigin;
        this.americanEnglishGloss = americanEnglishGloss;
        this.usageSentence = usageSentence;
    }
}

export class Glossary {
    public static readonly KAISER = new GlossaryEntry(
        "kaiser",
        "Kaiser",
        "German",
        "Emperor",
        "The Kaiser ruled Germany until 1918.",
    );
    public static readonly REICHSTAG = new GlossaryEntry(
        "reichstag",
        "Reichstag",
        "German",
        "Imperial parliament",
        "The Reichstag voted war credits in August 1914.",
    );
    public static readonly WEHRMACHT = new GlossaryEntry(
        "wehrmacht",
        "Wehrmacht",
        "German",
        "Armed forces",
        "The Wehrmacht invaded Poland in September 1939.",
    );
    public static readonly BLITZKRIEG = new GlossaryEntry(
        "blitzkrieg",
        "Blitzkrieg",
        "German",
        "Lightning war",
        "Blitzkrieg combined armor, air power, and speed.",
    );
    public static readonly SCHLIEFFEN_PLAN = new GlossaryEntry(
        "schlieffen_plan",
        "Schlieffen Plan",
        "German",
        "War plan for a two-front war",
        "The Schlieffen Plan aimed to defeat France before Russia mobilized.",
    );
    public static readonly LEBENSRAUM = new GlossaryEntry(
        "lebensraum",
        "Lebensraum",
        "German",
        "Living space",
        "Hitler demanded Lebensraum in Eastern Europe.",
    );
    public static readonly REICHSMARK = new GlossaryEntry(
        "reichsmark",
        "Reichsmark",
        "German",
        "German currency",
        "Prices were quoted in Reichsmark throughout the 1930s.",
    );
    public static readonly STURMABTEILUNG = new GlossaryEntry(
        "sturmabteilung",
        "Sturmabteilung",
        "German",
        "Storm detachment (brownshirts)",
        "The Sturmabteilung protected Nazi rallies and intimidated opponents.",
    );
    public static readonly SCHUTZSTAFFEL = new GlossaryEntry(
        "schutzstaffel",
        "Schutzstaffel",
        "German",
        "Protection squadron (blackshirts)",
        "The Schutzstaffel became the instrument of terror.",
    );
    public static readonly ENTENTE = new GlossaryEntry(
        "entente",
        "entente",
        "French",
        "Friendly understanding",
        "The entente between Britain and France relaxed old colonial rivalries.",
    );
    public static readonly LEVEE_EN_MASSE = new GlossaryEntry(
        "levee_en_masse",
        "levée en masse",
        "French",
        "Mass conscription",
        "The levée en masse sent whole nations to the front.",
    );
    public static readonly POILU = new GlossaryEntry(
        "poilu",
        "Poilu",
        "French",
        "The hairy one, a French soldier",
        "The Poilu endured four years of trench warfare.",
    );
    public static readonly ROMANOV = new GlossaryEntry(
        "romanov",
        "Romanov",
        "Russian",
        "The ruling dynasty of Russia",
        "The Romanovs had ruled Russia for three centuries.",
    );
    public static readonly BOLSHEVIK = new GlossaryEntry(
        "bolshevik",
        "Bolshevik",
        "Russian",
        "Member of the majority faction",
        "The Bolsheviks seized power in October 1917.",
    );
    public static readonly SOVIET = new GlossaryEntry(
        "soviet",
        "Soviet",
        "Russian",
        "Council of workers",
        "The Soviet became the basic unit of government.",
    );
    public static readonly DUMA = new GlossaryEntry(
        "duma",
        "Duma",
        "Russian",
        "Elected parliament",
        "Nicholas II dissolved the Duma when it challenged him.",
    );
    public static readonly OKHRANA = new GlossaryEntry(
        "okhrana",
        "Okhrana",
        "Russian",
        "Secret police",
        "The Okhrana hunted revolutionaries across the empire.",
    );
    public static readonly RISORGIMENTO = new GlossaryEntry(
        "risorgimento",
        "Risorgimento",
        "Italian",
        "Resurgence, the unification of Italy",
        "The Risorgimento created the Italian kingdom in 1861.",
    );
    public static readonly DUCE = new GlossaryEntry(
        "duce",
        "Duce",
        "Italian",
        "Leader",
        "The Duce marched on Rome in 1922.",
    );
    public static readonly FASCISMO = new GlossaryEntry(
        "fascismo",
        "Fascismo",
        "Italian",
        "Fascism",
        "Fascismo exalted the nation above the individual.",
    );
    public static readonly MEIJI = new GlossaryEntry(
        "meiji",
        "Meiji",
        "Japanese",
        "Enlightened rule, the era of modernization",
        "The Meiji restoration transformed Japan after 1868.",
    );
    public static readonly SHOWA = new GlossaryEntry(
        "showa",
        "Shōwa",
        "Japanese",
        "Radiant peace, the era of Hirohito",
        "The Shōwa era witnessed both expansion and defeat.",
    );
    public static readonly ZAIBATSU = new GlossaryEntry(
        "zaibatsu",
        "zaibatsu",
        "Japanese",
        "Financial clique",
        "The zaibatsu dominated Japanese industry.",
    );
    public static readonly SUBLIME_PORTE = new GlossaryEntry(
        "sublime_porte",
        "Sublime Porte",
        "Ottoman Turkish",
        "The Ottoman government",
        "The Sublime Porte answered for the empire's debts.",
    );
    public static readonly YOUNG_TURKS = new GlossaryEntry(
        "young_turks",
        "Young Turks",
        "Ottoman Turkish",
        "The Committee of Union and Progress",
        "The Young Turks seized power in 1908.",
    );
    public static readonly MILLET = new GlossaryEntry(
        "millet",
        "Millet",
        "Ottoman Turkish",
        "Religious community",
        "Each millet governed its own affairs.",
    );
    public static readonly KUOMINTANG = new GlossaryEntry(
        "kuomintang",
        "Kuomintang",
        "Chinese",
        "Nationalist party, the Guomindang",
        "The Kuomintang led the Republic of China.",
    );
    public static readonly MAY_FOURTH_MOVEMENT = new GlossaryEntry(
        "may_fourth_movement",
        "May Fourth Movement",
        "Chinese",
        "The 1919 patriotic and cultural movement",
        "The May Fourth Movement protested the Versailles settlement.",
    );

    public static getAllGlossaryEntries(): GlossaryEntry[] {
        return [
            Glossary.KAISER,
            Glossary.REICHSTAG,
            Glossary.WEHRMACHT,
            Glossary.BLITZKRIEG,
            Glossary.SCHLIEFFEN_PLAN,
            Glossary.LEBENSRAUM,
            Glossary.REICHSMARK,
            Glossary.STURMABTEILUNG,
            Glossary.SCHUTZSTAFFEL,
            Glossary.ENTENTE,
            Glossary.LEVEE_EN_MASSE,
            Glossary.POILU,
            Glossary.ROMANOV,
            Glossary.BOLSHEVIK,
            Glossary.SOVIET,
            Glossary.DUMA,
            Glossary.OKHRANA,
            Glossary.RISORGIMENTO,
            Glossary.DUCE,
            Glossary.FASCISMO,
            Glossary.MEIJI,
            Glossary.SHOWA,
            Glossary.ZAIBATSU,
            Glossary.SUBLIME_PORTE,
            Glossary.YOUNG_TURKS,
            Glossary.MILLET,
            Glossary.KUOMINTANG,
            Glossary.MAY_FOURTH_MOVEMENT,
        ];
    }

    public static findGlossaryEntryByTerm(foreignTerm: string): GlossaryEntry | null {
        for (const glossaryEntry of Glossary.getAllGlossaryEntries()) {
            if (glossaryEntry.foreignTerm.toLowerCase() === foreignTerm.toLowerCase()) {
                return glossaryEntry;
            }
        }
        return null;
    }
}
