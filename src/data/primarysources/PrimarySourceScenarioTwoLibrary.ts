import { PrimarySource } from "../PrimarySource";

export class PrimarySourceScenarioTwoLibrary {
    public static readonly BLANK_CHEQUE_TELEGRAM = new PrimarySource(
        "blank_cheque_telegram",
        "The Blank Cheque",
        "Emperor Wilhelm II to Emperor Franz Joseph",
        "July 6, 1914",
        "german_empire",
        "Diplomatic telegram",
        "His Majesty the Emperor Francis Joseph may, however, rest assured that His Majesty will faithfully stand by Austria-Hungary as is required by the obligations of his alliance and of his ancient friendship... Should the relations between Austria-Hungary and Serbia become threatening, His Majesty would regret our failure to act and would consider that the moment had arrived to settle accounts with Serbia.",
        "The German emperor, writing privately to his ally at a moment of crisis.",
        "To promise unconditional German backing for Austria-Hungary against Serbia, encouraging a rapid response.",
        "The assassination of Archduke Franz Ferdinand at Sarajevo on June 28, 1914 had set off the July Crisis.",
        "The Austro-Hungarian court, which read the message as a free hand to strike Serbia.",
        "The telegram is secret and informal; it records intent at one moment of the crisis and cannot by itself prove how much the crisis escalated because of it.",
        "The Blank Cheque most directly supports which explanation of the causes of World War I?",
        [
            "The flawed alliance system and unconditional commitments allowed a regional crisis to escalate into a European war.",
            "Competition for overseas colonies and raw materials between the great powers.",
            "The spread of democratic revolutions across the Balkans after 1903.",
            "The collapse of Ottoman control over North Africa and the Mediterranean.",
        ],
        0,
        "event_assassination_sarajevo",
    );

    public static readonly SERBIAN_REPLY_TO_ULTIMATUM = new PrimarySource(
        "serbian_reply_to_ultimatum",
        "Reply to the Austro-Hungarian Ultimatum",
        "Government of the Kingdom of Serbia",
        "July 25, 1914",
        "serbia",
        "Diplomatic note",
        "The Royal Serbian Government has received the communication of the Imperial and Royal Government of the 23rd instant... and is willing to comply with all demands contained within it, and to accept with the greatest readiness the mediation and arbitration of mutual officers... As regards the participation of Austro-Hungarian officials in the inquiry on Serbian soil, the Serbian Government cannot accept a demand which would violate the Constitution of the Kingdom.",
        "A small Balkan kingdom answering a humiliating ultimatum from a great power.",
        "To appear conciliatory before European opinion while preserving sovereignty over its own courts.",
        "Austria-Hungary delivered a ten-point ultimatum after Sarajevo, intending that its terms be rejected.",
        "The governments of Europe, whose sympathy Serbia hoped to win by conceding most points.",
        "The note was drafted in a week and written for a European audience; Austria-Hungary judged it evasive regardless, and the reply does not reveal the depth of informal support Serbia believed it had from Russia.",
        "The Serbian reply most directly illustrates which cause of World War I?",
        [
            "A small state tried to appear conciliatory while defending its sovereignty against an empire seeking a pretext for war.",
            "Rivalry over trade routes to the Ottoman Empire had made the Balkans the center of European diplomacy.",
            "Industrial competition between Serbia and Austria-Hungary had grown after 1900.",
            "Alliances naturally resolved European rivalries after the Balkan Wars of 1912 and 1913.",
        ],
        0,
        "event_assassination_sarajevo",
    );

    public static readonly GREY_SPEECH_THREE_AUGUST = new PrimarySource(
        "grey_speech_three_august",
        "Speech on the Eve of War",
        "Sir Edward Grey, British Foreign Secretary",
        "August 3, 1914",
        "british_empire",
        "Parliamentary speech",
        "The present crisis has not arisen suddenly out of a small thing. The murder at Sarajevo was the occasion, not the cause... For years we have tried to keep the concert of Europe together... The present war is a test case. If Germany dominates the continent, there is a danger that the whole of the West of Europe might follow in her train... I do believe that the people at home should understand what is at stake.",
        "A British statesman explaining to Parliament how Britain reached the edge of war.",
        "To persuade Britain's parliament and public that war for the balance of power and treaty obligations was justified.",
        "Belgium's invasion and German naval ambitions had brought the naval power into the crisis.",
        "The House of Commons, which constitutionally must be convinced before the government enters a war.",
        "The speech frames the war as a defense of the balance of power and of small nations, while passing lightly over great-power rivalry and prior colonial competition.",
        "Sourcing: Grey's statement best demonstrates which feature of the July Crisis?",
        [
            "The weight of strategic calculation and alliance commitment in the decisions of July 1914.",
            "The neutrality of British public opinion, which opposed any continental engagement.",
            "The role of socialist internationalism in restraining the great powers.",
            "The refusal of France to honor its alliance with Russia.",
        ],
        0,
        "event_assassination_sarajevo",
    );

    public static getSources(): PrimarySource[] {
        return [
            PrimarySourceScenarioTwoLibrary.BLANK_CHEQUE_TELEGRAM,
            PrimarySourceScenarioTwoLibrary.SERBIAN_REPLY_TO_ULTIMATUM,
            PrimarySourceScenarioTwoLibrary.GREY_SPEECH_THREE_AUGUST,
        ];
    }
}
