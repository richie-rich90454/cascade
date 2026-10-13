import { PrimarySource } from "../PrimarySource";

export class PrimarySourceScenarioEightLibrary {
    public static readonly ROOSEVELT_DAY_OF_INFAMY = new PrimarySource(
        "roosevelt_day_of_infamy_1941",
        "\"Day of Infamy\" Address to Congress",
        "President Franklin D. Roosevelt",
        "December 8, 1941",
        "united_states",
        "Congressional address",
        "Yesterday, December 7, 1941 - a date which will live in infamy - the United States of America was suddenly and deliberately attacked by naval and air forces of the Empire of Japan... Hostilities exist. There is no blinking at the fact that our people, our territory and our interests are in grave danger... I ask that the Congress declare that since the unprovoked and dastardly attack by Japan on Sunday, December 7, 1941, a state of war has existed between the United States and the Japanese Empire.",
        "The president of the United States addressing a joint session of Congress the day after Pearl Harbor.",
        "To secure a declaration of war and unify a divided country in the wake of surprise attack.",
        "December 1941: the attack had destroyed much of the Pacific Fleet and ended the great American debate over intervention.",
        "Congress, which had to declare war, and the American public listening live on radio.",
        "The address is a war message designed to produce unanimity; it tells nothing of American intelligence failures, the earlier embargos that provoked Japan, or the global strategy the declaration would require.",
        "Roosevelt's address marks which turning point in the conduct of World War II?",
        [
            "The entry of the United States as a full belligerent, converting the conflict into a truly global war.",
            "The surrender of Japan after the atomic bombings.",
            "The opening of the North African campaign by Axis forces.",
            "The signing of the Molotov-Ribbentrop Pact.",
        ],
        0,
        "event_pearl_harbor",
    );

    public static readonly CARELESS_TALK_POSTER = new PrimarySource(
        "careless_talk_costs_lives_poster",
        "\"Careless Talk Costs Lives\" Security Poster",
        "British Ministry of Information (design by Fougasse)",
        "1940",
        "british_empire",
        "Security poster series",
        "Careless Talk Costs Lives. In this series of wartime posters, ordinary people - in a bus, in a queue, in a telephone box - are shown overheard by enemy agents drawn with mocking smiles. The message in each panel is the same: loose words about ships, factories, or troop movements reach the enemy as surely as if broadcast.",
        "A British ministry of information using humor to teach civilian discipline against espionage.",
        "To suppress dangerous public discussion of military matters and normalize wartime secrecy.",
        "1940: Britain faced invasion and actual German spy networks while the Home Front's morale and habits were a target of policy.",
        "British civilians, whose ordinary conversation the campaign invites them to police themselves - and their neighbors.",
        "The poster is official security propaganda; its implied claims about how military secrets leaked are simplified, and it says nothing about the government's own censorship machinery or actual espionage cases.",
        "The \"Careless Talk\" series is best understood as evidence of which method of conducting total war?",
        [
            "The use of propaganda and censorship to discipline home-front populations and defend military intelligence.",
            "The mechanization of agriculture to feed industrial workers.",
            "The negotiation of neutrality agreements with non-belligerent states.",
            "The integration of women into combat infantry roles.",
        ],
        0,
        "event_battle_britain",
    );

    public static readonly JAPAN_GREATER_EAST_ASIA_STATEMENT = new PrimarySource(
        "japan_greater_east_asia_statement_1943",
        "Declaration on the Greater East Asia Co-Prosperity Sphere",
        "Government of the Empire of Japan (as announced at the Greater East Asia Conference)",
        "November 6, 1943",
        "empire_of_japan",
        "Official declaration",
        "The nations of Greater East Asia, bound in mutual respect and cooperation, shall construct an order of co-prosperity in which each people finds its own place... Japan, as the stabilizing power of the region, dedicates itself to the liberation of Asia from the tyranny of the Anglo-American powers and to the establishment of a new order of lasting peace.",
        "The imperial government of Japan addressing occupied and allied Asian governments at a staged conference in Tokyo.",
        "To legitimize Japanese domination of East and Southeast Asia as Asian liberation against Western imperialism.",
        "November 1943: Japan controlled much of Southeast Asia, and American counteroffensive had begun; the conference sought to consolidate wartime gains.",
        "Asian publics under Japanese control, and world opinion, invited to accept Japanese leadership as liberation.",
        "The declaration is aim and propaganda from the occupier's perspective; the realities of forced labor, requisitions, and harsh administration in occupied territories contradict its claims.",
        "The Greater East Asia declaration best illustrates which aspect of how Japan conducted World War II?",
        [
            "Imperialist expansion presented through the ideology of liberation, masking resource extraction and coercion of subject peoples.",
            "Japan's abandonment of territorial conquest in favor of collective security.",
            "The voluntary federation of independent Asian states under a constitution.",
            "The integration of Japan into a defensive alliance with the United States.",
        ],
        0,
        "event_operation_barbarossa",
    );

    public static readonly SOVIET_ORDER_227 = new PrimarySource(
        "soviet_order_227_1942",
        "Order of the People's Commissar of Defence No. 227",
        "Joseph Stalin",
        "July 28, 1942",
        "soviet_union",
        "Military order",
        "The enemy throws new forces at the front, penetrating deep into the country, seizing new regions... Not a step back! That must be the watchword of the Red Army in this hour... Panic-mongers and cowards must be destroyed on the spot... The Supreme Command orders the formation of penal battalions for those who, through cowardice, violated their oath, and barrier detachments to shoot traitors and cowards at the front.",
        "The Soviet supreme commander issuing a draconian order after the disasters of 1942.",
        "To halt the retreat by terror as well as resolve, and to mobilize the army to fight to the death.",
        "July 1942: German forces drove toward Stalingrad and the Caucasus, and Soviet leadership feared collapse.",
        "The Red Army and its commanders, who were threatened with penal units and blocking detachments for failure.",
        "The order was secret and intended for the army, not the public; it shows the regime's terror apparatus and does not measure the soldiers' actual motives, which included patriotism as well as fear.",
        "Order No. 227 is best understood as evidence of which aspect of conducting World War II?",
        [
            "The totalitarian state's repression of its own soldiers alongside mobilization for total war.",
            "The granting of democratic rights to soldiers at the front.",
            "The reliance on voluntary enlistment without coercion.",
            "The delegation of military command to elected soldiers' councils.",
        ],
        0,
        "event_stalingrad",
    );

    public static getSources(): PrimarySource[] {
        return [
            PrimarySourceScenarioEightLibrary.ROOSEVELT_DAY_OF_INFAMY,
            PrimarySourceScenarioEightLibrary.CARELESS_TALK_POSTER,
            PrimarySourceScenarioEightLibrary.JAPAN_GREATER_EAST_ASIA_STATEMENT,
            PrimarySourceScenarioEightLibrary.SOVIET_ORDER_227,
        ];
    }
}
