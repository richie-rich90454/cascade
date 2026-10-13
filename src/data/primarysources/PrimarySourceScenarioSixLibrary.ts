import { PrimarySource } from "../PrimarySource";

export class PrimarySourceScenarioSixLibrary {
    public static readonly HITLER_LEBENSRAUM_MEIN_KAMPF = new PrimarySource(
        "hitler_lebensraum_mein_kampf",
        "Mein Kampf, Chapter on \"Eastern Orientation\"",
        "Adolf Hitler",
        "1925-1926",
        "german_empire",
        "Political memoir and program",
        "The foreign policy of the national state must first of all take account of the fact that we have neither the right nor the mission to speak of a Germanization of subjects of foreign nations... The national state's foreign policy must secure for the German people the land and soil to which they are entitled on this earth... We must turn our gaze eastward: only by the conquest of new living space in the East can Germany become a world power once more.",
        "A political leader of the German far right writing a manifesto while imprisoned after the failed Beer Hall Putsch.",
        "To set out the doctrine of Lebensraum and the promise of eastern conquest as the core of a future National Socialist foreign policy.",
        "The Weimar Republic in the mid-1920s, humiliated by Versailles and resentful of its eastern borders.",
        "Followers of the National Socialist movement, whose program the book was written to define and spread.",
        "The text states intentions before the author held power; it is a program rather than a record of policy, and historians must weigh it against decision-making once Hitler took office in 1933.",
        "Hitler's text most directly supports which cause of World War II?",
        [
            "The imperialist and expansionist aims of fascist regimes, especially Nazi Germany's drive for eastern land.",
            "The collapse of the Austro-Hungarian Empire into successor states.",
            "The economic depression's effect on international trade after 1929.",
            "The provisions of the Treaty of Versailles limiting the German armed forces.",
        ],
        0,
        "event_munich_conference",
    );

    public static readonly CHAMBERLAIN_PEACE_FOR_OUR_TIME = new PrimarySource(
        "chamberlain_peace_for_our_time_1938",
        "Address from 10 Downing Street After Munich",
        "Neville Chamberlain, British Prime Minister",
        "September 30, 1938",
        "british_empire",
        "Radio broadcast",
        "The settlement of the Czechoslovakian problem, which has now been achieved, is only the prelude to a larger settlement in which all Europe may find peace... This morning I had another talk with the German Chancellor, Herr Hitler, and here is the paper which bears his name upon it as well as mine... I believe it is peace for our time. Go home and sleep quietly in your beds.",
        "The British prime minister on the steps of Downing Street, addressing the nation after returning from Munich.",
        "To reassure the British public that the Munich Agreement had secured peace through negotiation and concessions.",
        "September 1938: Germany had demanded the Sudetenland, and the powers of Europe met without Czechoslovakia to transfer it.",
        "The British people, anxious about a second war and asked to accept appeasement's promises.",
        "Chamberlain speaks from the government's perspective and was quickly contradicted by events; the broadcast does not represent the contrary advice of Churchill, the views of Czechoslovakia, or the military realities of 1938.",
        "Which causes of World War II does Chamberlain's broadcast most directly illustrate?",
        [
            "The unsustainable peace settlement had failed to create security, and appeasement could not satisfy expansionist demands.",
            "The Great Depression had led the German public to support collective security.",
            "The League of Nations had successfully prevented German expansion.",
            "Fascists and totalitarian regimes were no longer interested in the imperialist expansion of the decade.",
        ],
        0,
        "event_munich_conference",
    );

    public static readonly LYTTON_REPORT_ON_MANCHUKUO = new PrimarySource(
        "lytton_report_manchukuo_1932",
        "Report of the Commission of Enquiry on the Sino-Japanese Dispute",
        "League of Nations Commission (Lord Lytton, chairman)",
        "October 1, 1932",
        "british_empire",
        "International commission report",
        "The commission finds that the military operations of the Japanese forces after September 18, 1931 cannot be regarded as measures of legitimate self-defense... The present government of Manchuria, created by Japanese action, cannot be regarded as the spontaneous expression of the will of the Chinese people... A solution must be sought in a new regime based on cooperation between Chinese and Japanese in Manchuria, under Chinese sovereignty.",
        "An international commission of the League of Nations, appointed after Japan seized Manchuria.",
        "To find the facts of the Manchurian crisis and to recommend a settlement preserving Chinese sovereignty.",
        "Japan had invaded Manchuria in 1931 and proclaimed the puppet state of Manchukuo; the League of Nations was testing its authority.",
        "The League of Nations and world opinion, which had to decide whether to impose consequences on a great power.",
        "The report was produced by a commission without enforcement power; Japan rejected it and withdrew from the League rather than change course, showing the limits of the institution.",
        "The fate of the Lytton Report most directly demonstrated which cause of World War II?",
        [
            "Continued imperialist aggression went unchecked where international institutions lacked the will or power to stop it.",
            "The economic crisis prevented Japan from industrializing its empire.",
            "Nazi Germany's rise was the sole cause of aggression in the 1930s.",
            "The League of Nations unified China and Japan in a durable settlement.",
        ],
        0,
        "event_munich_conference",
    );

    public static getSources(): PrimarySource[] {
        return [
            PrimarySourceScenarioSixLibrary.HITLER_LEBENSRAUM_MEIN_KAMPF,
            PrimarySourceScenarioSixLibrary.CHAMBERLAIN_PEACE_FOR_OUR_TIME,
            PrimarySourceScenarioSixLibrary.LYTTON_REPORT_ON_MANCHUKUO,
        ];
    }
}
