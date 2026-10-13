import { PrimarySource } from "../PrimarySource";

export class PrimarySourceScenarioThreeLibrary {
    public static readonly KITCHENER_RECRUITMENT_POSTER = new PrimarySource(
        "kitchener_recruitment_poster",
        "\"Your Country Needs You\" Recruitment Poster",
        "Parliamentary Recruiting Committee (design by Alfred Leete)",
        "1914",
        "british_empire",
        "Recruitment poster",
        "Your Country Needs YOU. A call to arms addressed to every man between the ages of nineteen and thirty. Enlist now; the war will not wait, and neither will the enemy. Lord Kitchener, Secretary of State for War, directs every eligible man to present himself at the nearest recruiting office without delay.",
        "A government recruiting committee producing official press and poster material.",
        "To persuade young men to enlist in the volunteer army in the first months of the war.",
        "Britain entered World War I in August 1914 with a small professional army in need of rapid expansion.",
        "Young British men, whom the poster addresses as citizens with a direct personal duty.",
        "The poster is official propaganda: it presents enlistment as a simple patriotic duty and omits the realities of trench warfare, casualty rates, and the later conscription laws.",
        "The Kitchener poster is best understood as evidence of which method governments used to conduct total war?",
        [
            "Political propaganda aimed at mobilizing the home population for war.",
            "The imposition of colonial conscription in the dominions.",
            "The conversion of civilian factories to shell production.",
            "The use of censorship to suppress battlefield news.",
        ],
        0,
        "event_poison_gas",
    );

    public static readonly WOMEN_OF_BRITAIN_SAY_GO_POSTER = new PrimarySource(
        "women_of_britain_say_go_poster",
        "\"Women of Britain Say GO\" Recruitment Poster",
        "Parliamentary Recruiting Committee",
        "1915",
        "british_empire",
        "Recruitment poster",
        "WOMEN OF BRITAIN SAY - GO! A woman and her children stand at a window, watching a column of soldiers march past, while the words address the men who have not yet enlisted. The image invites the viewer to imagine the shame of staying behind while others answer the call.",
        "A government recruiting committee addressing the home front through gendered appeals.",
        "To shame and persuade the remaining eligible men into enlisting by invoking the judgment of women and children.",
        "By 1915 voluntary enlistment had begun to fall short of the army's needs, months before conscription was introduced in 1916.",
        "British men who had not yet enlisted, addressed through the imagined voice of the women in their families.",
        "The poster manipulates gender roles and family feeling; it says nothing about actual women's wartime labor, dissent, or the costs of the war.",
        "What does the \"Women of Britain Say GO\" poster most directly reveal about how governments mobilized populations during World War I?",
        [
            "Governments used emotional and gendered appeals in propaganda to sustain voluntary enlistment.",
            "Women were granted the vote in exchange for their war work before 1915.",
            "The British government had already abandoned voluntary enlistment in favor of conscription.",
            "Recruitment posters were commissioned by private newspapers rather than the state.",
        ],
        0,
        "event_poison_gas",
    );

    public static readonly OWEN_DULCE_ET_DECORUM_EST = new PrimarySource(
        "owen_dulce_et_decorum_est",
        "\"Dulce et Decorum Est\"",
        "Wilfred Owen, British officer",
        "Written 1917, published 1920",
        "british_empire",
        "Poem",
        "Bent double, like old beggars under sacks, Knock-kneed, coughing like hags, we cursed through sludge... Gas! GAS! Quick, boys! - An ecstasy of fumbling... If in some smothering dreams you too could pace Behind the wagon that we flung him in... My friend, you would not tell with such high zest To children ardent for some desperate glory, The old Lie: Dulce et decorum est Pro patria mori.",
        "A British officer who served in the trenches and wrote from direct experience of gas warfare.",
        "To expose the horror of the front and to attack the classical ideal that it is sweet and fitting to die for one's country.",
        "Written in 1917 after Owen was invalided from the Somme; published after his death in 1918.",
        "Readers at home, especially those who romanticized the war and repeated patriotic slogans to the young.",
        "The poem is a single soldier's artistic testimony; it conveys one soldier's experience of gas and death and does not measure strategic conduct, home-front opinion, or the experience of other armies.",
        "Owen's poem provides which kind of evidence for historians of World War I?",
        [
            "A soldier's testimony to the human cost of new weapons such as poison gas.",
            "Statistical evidence on total casualty rates for all belligerents.",
            "An official government account of the introduction of conscription.",
            "A diplomatic record of the armistice negotiations.",
        ],
        0,
        "event_poison_gas",
    );

    public static readonly HINDENBURG_PROGRAMME_MEMORANDUM = new PrimarySource(
        "hindenburg_programme_memorandum",
        "The Hindenburg Programme",
        "German Supreme Army Command",
        "August 31, 1916",
        "german_empire",
        "Military-economic memorandum",
        "The Field Marshal considers it necessary that the whole German war economy be concentrated on the single task of producing the greatest possible supply of ammunition and weapons... Industry must be so organized that no workshop stands idle while cannon are needed at the front. Workers not fit for the trenches must be returned to the factories; the Fatherland Auxiliary Service will enroll every man from seventeen to sixty for compulsory labor.",
        "The German high command under Hindenburg and Ludendorff, directing the war economy.",
        "To subordinate all industry and labor to munitions production and double the output of artillery and machine guns.",
        "The great battles of attrition on the Western Front in 1916 had consumed German munitions faster than they could be replaced.",
        "German industrialists, government ministries, and workers, all of whom were ordered to serve the programme.",
        "The memorandum records the ambitions of the high command rather than achievement; the programme's targets were only partly met, and forced labor policies fueled resistance and hardship.",
        "The Hindenburg Programme is best seen as an example of what World War I governments were doing by late 1916?",
        [
            "Directing industrial and labor mobilization of the home economy toward total war production.",
            "Paying for the war entirely through short-term loans from neutral countries.",
            "Returning to laissez-faire policies to increase efficiency.",
            "Transferring responsibility for munitions to the private arms industry free of state control.",
        ],
        0,
        "event_trench_warfare",
    );

    public static getSources(): PrimarySource[] {
        return [
            PrimarySourceScenarioThreeLibrary.KITCHENER_RECRUITMENT_POSTER,
            PrimarySourceScenarioThreeLibrary.WOMEN_OF_BRITAIN_SAY_GO_POSTER,
            PrimarySourceScenarioThreeLibrary.OWEN_DULCE_ET_DECORUM_EST,
            PrimarySourceScenarioThreeLibrary.HINDENBURG_PROGRAMME_MEMORANDUM,
        ];
    }
}
