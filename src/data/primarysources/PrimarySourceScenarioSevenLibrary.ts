import { PrimarySource } from "../PrimarySource";

export class PrimarySourceScenarioSevenLibrary {
    public static readonly CHURCHILL_BLOOD_TOIL_TEARS_AND_SWEAT = new PrimarySource(
        "churchill_blood_toil_tears_and_sweat",
        '"Blood, Toil, Tears and Sweat" - First Speech as Prime Minister',
        "Winston Churchill",
        "May 13, 1940",
        "british_empire",
        "Parliamentary speech",
        "I would say to the House, as I said to those who have joined this government: I have nothing to offer but blood, toil, tears and sweat... You ask, what is our policy? I will say: It is to wage war, by sea, land and air, with all our might and with all the strength that God can give us; to wage war against a monstrous tyranny, never surpassed in the dark, lamentable catalogue of human crime. That is our policy.",
        "The newly appointed British prime minister, speaking three days after taking office.",
        "To commit Britain to total war, to define the war's moral stakes, and to rally Parliament behind the new government.",
        "May 1940: Germany had just invaded France and the Low Countries, and Britain faced the prospect of invasion.",
        "The House of Commons and, through it, the British nation, whose confidence the new leader had to win at once.",
        "Churchill speaks as a leader defining his own government's resolve; the speech says nothing about Britain's pre-war appeasement, the doubts of his colleagues, or the conditions of its empire.",
        "Churchill's speech best illustrates which method governments used to conduct World War II?",
        [
            "Political leadership and rhetoric mobilizing a nation for total war.",
            "The conscription of colonial troops for the defense of the metropole.",
            "The establishment of a corporatist economy under state direction.",
            "The negotiation of a separate peace with Germany.",
        ],
        0,
        "event_battle_britain",
    );

    public static readonly ROOSEVELT_ARSENAL_OF_DEMOCRACY = new PrimarySource(
        "roosevelt_arsenal_of_democracy_1940",
        '"Arsenal of Democracy" Fireside Chat',
        "President Franklin D. Roosevelt",
        "December 29, 1940",
        "united_states",
        "Radio address",
        "We must be the great arsenal of democracy. For us this is an emergency as serious as war itself... There is no demand for sending an American expeditionary force outside our own borders... Our national policy is not directed toward war. Its sole purpose is to keep war away from our country and our people... I ask this Congress to authorize the production of millions of dollars of additional munitions and supplies to be turned over to the nations now fighting aggression.",
        "The president of the still-neutral United States speaking to the nation by radio.",
        "To persuade Americans that giving massive material aid to Britain was necessary self-defense and to prepare them for Lend-Lease.",
        "December 1940: Britain stood alone in Western Europe, and American opinion remained divided between isolation and intervention.",
        "The American public and Congress, whose consent Roosevelt needed for aid short of war.",
        "Roosevelt frames aid as a means of staying out of the war; the speech is persuasion, not a promise, and understates the drift toward actual American belligerency.",
        "Roosevelt's fireside chat most directly reflects which aspect of how the United States conducted the early war?",
        [
            'American industrial mobilization as the "arsenal of democracy" supplying the Allies before formal entry.',
            "The immediate dispatch of American ground divisions to France.",
            "The abandonment of free trade in favor of autarky.",
            "The refusal of all aid to Britain under neutrality law.",
        ],
        0,
        "event_operation_barbarossa",
    );

    public static readonly GOEBBELS_TOTAL_WAR_SPORTPALAST = new PrimarySource(
        "goebbels_total_war_sportpalast_1943",
        '"Total War" Sportpalast Speech',
        "Joseph Goebbels, Reich Minister of Propaganda",
        "February 18, 1943",
        "german_empire",
        "Propaganda speech",
        "The German people, in the midst of an existential struggle, must now devote the whole of their strength to the war effort... Do you want total war? Do you want it, if necessary, more total and more radical than we can imagine today?... The goal of our struggle has not changed: it is the security of the German people and the future of Europe. The harder the war becomes, the more we must steel our hearts.",
        "The Nazi minister of propaganda, addressing a staged rally after the defeat at Stalingrad.",
        "To intensify German mobilization, silence dissent, and discipline civilians under a regime losing the war.",
        "February 1943: Stalingrad had fallen, and the regime sought both total mobilization and a demonstration of public loyalty.",
        "The staged audience of party members and the German public listening on radio, invited to acclaim total war on command.",
        "The speech is orchestrated propaganda in a controlled setting; the shouts of assent were arranged, and the regime's claims about hardship and unity hide the terror and repression behind them.",
        "The Sportpalast speech is best understood as evidence of which method of conducting total war?",
        [
            "Totalitarian propaganda and repression used to subordinate every aspect of daily life to the war effort.",
            "The corporate negotiation of production quotas with independent unions.",
            "The use of colonial troops and formerly colonized peoples in the German army.",
            "The reliance on free elections to legitimate wage and ration policies.",
        ],
        0,
        "event_stalingrad",
    );

    public static readonly STALIN_RADIO_ADDRESS_1941 = new PrimarySource(
        "stalin_radio_address_1941",
        "Radio Address to the Soviet People",
        "Joseph Stalin",
        "July 3, 1941",
        "soviet_union",
        "Radio address",
        "Comrades! Citizens! Brothers and sisters! Men of our army and navy! I am speaking to you, my friends... A grave danger hangs over our country... The enemy is cruel and implacable... In our war against the fascist enslavers all the strength of the peoples of our country must be thrown... The issue is one of life or death for the Soviet state... We must organize comprehensive aid for the Red Army and unite our whole people.",
        "The Soviet leader speaking twelve days after the German invasion, having initially remained silent.",
        "To rally the Soviet peoples for a war of national survival and to organize the entire economy for military defense.",
        "July 1941: the Red Army was collapsing along the western frontier under Operation Barbarossa.",
        "The Soviet people, soldiers and civilians alike, shocked by invasion and needing both direction and reassurance.",
        "Stalin speaks as an absolute ruler whose own policies and miscalculations had left the country unprepared; the address appeals to Russian tradition and Orthodoxy while the commune remains terrorized by the NKVD.",
        "Stalin's address shows which aspect of the Soviet conduct of World War II?",
        [
            "The mobilization of the entire population and economy around national survival under a repressive totalitarian state.",
            "The refusal of the Soviet Union to fight a war beyond its borders.",
            "The reliance on private enterprise to supply the Red Army.",
            "The use of free debate to determine wartime strategy.",
        ],
        0,
        "event_operation_barbarossa",
    );

    public static getSources(): PrimarySource[] {
        return [
            PrimarySourceScenarioSevenLibrary.CHURCHILL_BLOOD_TOIL_TEARS_AND_SWEAT,
            PrimarySourceScenarioSevenLibrary.ROOSEVELT_ARSENAL_OF_DEMOCRACY,
            PrimarySourceScenarioSevenLibrary.GOEBBELS_TOTAL_WAR_SPORTPALAST,
            PrimarySourceScenarioSevenLibrary.STALIN_RADIO_ADDRESS_1941,
        ];
    }
}
