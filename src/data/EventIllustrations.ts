export class EventIllustrationRecord {
    public readonly eventIdentifier: string;
    public readonly eventDisplayName: string;
    public readonly illustrationAssetIdentifier: string;
    public readonly illustrationCaption: string;

    constructor(
        eventIdentifier: string,
        eventDisplayName: string,
        illustrationAssetIdentifier: string,
        illustrationCaption: string,
    ) {
        this.eventIdentifier = eventIdentifier;
        this.eventDisplayName = eventDisplayName;
        this.illustrationAssetIdentifier = illustrationAssetIdentifier;
        this.illustrationCaption = illustrationCaption;
    }
}

export class EventIllustrations {
    public static readonly ASSASSINATION_AT_SARAJEVO = new EventIllustrationRecord(
        "assassination_at_sarajevo",
        "Assassination at Sarajevo",
        "event_assassination_sarajevo",
        "Two shots fired on a bridge in Sarajevo echo across the alliance system.",
    );
    public static readonly SCHLIEFFEN_PLAN_EXECUTED = new EventIllustrationRecord(
        "schlieffen_plan_executed",
        "The Schlieffen Plan Executed",
        "event_schlieffen_plan",
        "The great wheel of the German armies turns through Belgium toward Paris.",
    );
    public static readonly TRENCH_WARFARE_BEGINS = new EventIllustrationRecord(
        "trench_warfare_begins",
        "The Lines Settle Into the Mud",
        "event_trench_warfare",
        "From the Channel to the Swiss border, the war dig in.",
    );
    public static readonly TANK_FIRST_USE = new EventIllustrationRecord(
        "tank_first_use",
        "The First Tanks",
        "event_tank_first_use",
        "Armored caterpillars crawl over the wire at Flers-Courcelette.",
    );
    public static readonly POISON_GAS_USED = new EventIllustrationRecord(
        "poison_gas_used",
        "Poison Gas at Ypres",
        "event_poison_gas",
        "A yellow-green cloud drifts across the Flanders fields.",
    );
    public static readonly LUSITANIA_SUNK = new EventIllustrationRecord(
        "lusitania_sunk",
        "The Lusitania Sunk",
        "event_lusitania",
        "A passenger liner goes down off the Irish coast, inflaming opinion.",
    );
    public static readonly ZIMMERMANN_TELEGRAM = new EventIllustrationRecord(
        "zimmermann_telegram",
        "The Zimmermann Telegram",
        "event_zimmermann_telegram",
        "A decoded message offers Mexico its lost provinces.",
    );
    public static readonly RUSSIAN_REVOLUTION = new EventIllustrationRecord(
        "russian_revolution",
        "The Russian Revolution",
        "event_russian_revolution",
        "Two revolutions in a year topple three centuries of Romanov rule.",
    );
    public static readonly TREATY_OF_VERSAILLES = new EventIllustrationRecord(
        "treaty_of_versailles",
        "The Treaty of Versailles",
        "event_treaty_versailles",
        "The victors dictate peace in the Hall of Mirrors.",
    );
    public static readonly LEAGUE_OF_NATIONS_FOUNDED = new EventIllustrationRecord(
        "league_of_nations_founded",
        "The League of Nations",
        "event_league_of_nations",
        "A new experiment in collective security takes its first breath.",
    );
    public static readonly GREAT_DEPRESSION = new EventIllustrationRecord(
        "great_depression",
        "The Great Depression",
        "event_great_depression",
        "Bread lines and crashing tickers spread from Wall Street.",
    );
    public static readonly NEW_DEAL_LAUNCHED = new EventIllustrationRecord(
        "new_deal_launched",
        "The New Deal",
        "event_new_deal",
        "The government reaches into economic life on an unprecedented scale.",
    );
    public static readonly FIVE_YEAR_PLAN = new EventIllustrationRecord(
        "five_year_plan",
        "The First Five-Year Plan",
        "event_five_year_plan",
        "Factories, gears, and wheat sheaves symbolize forced industrialization.",
    );
    public static readonly MARCH_ON_ROME = new EventIllustrationRecord(
        "march_on_rome",
        "The March on Rome",
        "event_march_on_rome",
        "Blackshirt columns converge on the Italian capital.",
    );
    public static readonly REICHSTAG_FIRE = new EventIllustrationRecord(
        "reichstag_fire",
        "The Reichstag Fire",
        "event_reichstag_fire",
        "A burning parliament building clears the way for dictatorship.",
    );
    public static readonly MUNICH_CONFERENCE = new EventIllustrationRecord(
        "munich_conference",
        "The Munich Conference",
        "event_munich_conference",
        "Four men at a table decide the fate of Czechoslovakia.",
    );
    public static readonly MOLOTOV_RIBBENTROP_PACT = new EventIllustrationRecord(
        "molotov_ribbentrop_pact",
        "The Molotov-Ribbentrop Pact",
        "event_molotov_ribbentrop",
        "Ideological enemies shake hands and carve up Eastern Europe.",
    );
    public static readonly INVASION_OF_POLAND = new EventIllustrationRecord(
        "invasion_of_poland",
        "The Invasion of Poland",
        "event_invasion_poland",
        "Arrows and armor cross the Polish frontier on September 1, 1939.",
    );
    public static readonly DUNKIRK_EVACUATION = new EventIllustrationRecord(
        "dunkirk_evacuation",
        "The Miracle of Dunkirk",
        "event_dunkirk",
        "Little ships ferry an army off the beaches of France.",
    );
    public static readonly BATTLE_OF_BRITAIN = new EventIllustrationRecord(
        "battle_of_britain",
        "The Battle of Britain",
        "event_battle_britain",
        "Contrails wheel over the English Channel.",
    );
    public static readonly OPERATION_BARBAROSSA = new EventIllustrationRecord(
        "operation_barbarossa",
        "Operation Barbarossa",
        "event_operation_barbarossa",
        "The largest invasion in history drives eastward.",
    );
    public static readonly PEARL_HARBOR = new EventIllustrationRecord(
        "pearl_harbor",
        "Pearl Harbor",
        "event_pearl_harbor",
        "Smoke rises over the Pacific Fleet on a Sunday morning.",
    );
    public static readonly STALINGRAD = new EventIllustrationRecord(
        "stalingrad",
        "The Battle of Stalingrad",
        "event_stalingrad",
        "A ruined city on the Volga turns the tide.",
    );
    public static readonly D_DAY = new EventIllustrationRecord(
        "d_day",
        "D-Day",
        "event_d_day",
        "Landing craft discharge their cargoes onto the Normandy beaches.",
    );
    public static readonly HIROSHIMA = new EventIllustrationRecord(
        "hiroshima",
        "The Atomic Bombing of Hiroshima",
        "event_hiroshima",
        "A mushroom cloud opens the nuclear age.",
    );
    public static readonly HOLOCAUST_REMEMBERED = new EventIllustrationRecord(
        "holocaust_remembered",
        "The Holocaust Remembered",
        "event_holocaust",
        "A memorial flame stands before the barbed wire.",
    );
    public static readonly ARMENIAN_GENOCIDE_REMEMBERED = new EventIllustrationRecord(
        "armenian_genocide_remembered",
        "The Armenian Genocide Remembered",
        "event_armenian_genocide",
        "A memorial flame and a cross mark the loss of a nation.",
    );
    public static readonly CAMBODIAN_GENOCIDE_REMEMBERED = new EventIllustrationRecord(
        "cambodian_genocide_remembered",
        "The Cambodian Genocide Remembered",
        "event_cambodian_genocide",
        "A memorial flame and spectacles remember the emptied cities.",
    );
    public static readonly RWANDAN_GENOCIDE_REMEMBERED = new EventIllustrationRecord(
        "rwandan_genocide_remembered",
        "The Rwandan Genocide Remembered",
        "event_rwandan_genocide",
        "A memorial flame and a machete remember one hundred days.",
    );
    public static readonly HOLODOMOR_REMEMBERED = new EventIllustrationRecord(
        "holodomor_remembered",
        "The Holodomor Remembered",
        "event_holodomor",
        "A memorial flame and wheat remember the famine by decree.",
    );
    public static readonly UNITED_NATIONS_FOUNDED = new EventIllustrationRecord(
        "united_nations_founded",
        "The United Nations",
        "event_united_nations",
        "A globe wreathed in laurel carries the hope of a new order.",
    );

    public static getAllEventIllustrationRecords(): EventIllustrationRecord[] {
        return [
            EventIllustrations.ASSASSINATION_AT_SARAJEVO,
            EventIllustrations.SCHLIEFFEN_PLAN_EXECUTED,
            EventIllustrations.TRENCH_WARFARE_BEGINS,
            EventIllustrations.TANK_FIRST_USE,
            EventIllustrations.POISON_GAS_USED,
            EventIllustrations.LUSITANIA_SUNK,
            EventIllustrations.ZIMMERMANN_TELEGRAM,
            EventIllustrations.RUSSIAN_REVOLUTION,
            EventIllustrations.TREATY_OF_VERSAILLES,
            EventIllustrations.LEAGUE_OF_NATIONS_FOUNDED,
            EventIllustrations.GREAT_DEPRESSION,
            EventIllustrations.NEW_DEAL_LAUNCHED,
            EventIllustrations.FIVE_YEAR_PLAN,
            EventIllustrations.MARCH_ON_ROME,
            EventIllustrations.REICHSTAG_FIRE,
            EventIllustrations.MUNICH_CONFERENCE,
            EventIllustrations.MOLOTOV_RIBBENTROP_PACT,
            EventIllustrations.INVASION_OF_POLAND,
            EventIllustrations.DUNKIRK_EVACUATION,
            EventIllustrations.BATTLE_OF_BRITAIN,
            EventIllustrations.OPERATION_BARBAROSSA,
            EventIllustrations.PEARL_HARBOR,
            EventIllustrations.STALINGRAD,
            EventIllustrations.D_DAY,
            EventIllustrations.HIROSHIMA,
            EventIllustrations.HOLOCAUST_REMEMBERED,
            EventIllustrations.ARMENIAN_GENOCIDE_REMEMBERED,
            EventIllustrations.CAMBODIAN_GENOCIDE_REMEMBERED,
            EventIllustrations.RWANDAN_GENOCIDE_REMEMBERED,
            EventIllustrations.HOLODOMOR_REMEMBERED,
            EventIllustrations.UNITED_NATIONS_FOUNDED,
        ];
    }

    public static findEventIllustrationRecordByEventIdentifier(
        eventIdentifier: string,
    ): EventIllustrationRecord | null {
        for (const eventIllustrationRecord of EventIllustrations.getAllEventIllustrationRecords()) {
            if (eventIllustrationRecord.eventIdentifier === eventIdentifier) {
                return eventIllustrationRecord;
            }
        }
        return null;
    }
}
