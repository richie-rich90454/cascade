import { PrimarySource } from "../PrimarySource";

export class PrimarySourceScenarioFourLibrary {
    public static readonly CARDENAS_SPEECH_TO_THE_NATION = new PrimarySource(
        "cardenas_speech_to_the_nation_1938",
        "Speech to the Nation on the Expropriation of the Oil Companies",
        "President Lázaro Cárdenas of Mexico",
        "March 18, 1938",
        "mexico",
        "Radio address",
        "In this critical hour of our national life, we declare the petroleum companies that have failed to obey the laws of the Republic must hand over their properties to the nation... The wealth of the subsoil belongs to the Mexicans. The revolution did not create a privileged class, and it will not permit the working people to be exploited... The nation will compensate the companies, but it will not surrender its sovereignty.",
        "The president of Mexico, addressing the country by radio in the middle of the revolution's institutional phase.",
        "To justify the expropriation of foreign oil companies and to rally national support for economic sovereignty.",
        "Mexico in 1938, after decades of revolution, was asserting state control over oil and land in a world of rival great powers.",
        "The Mexican people, foreign investors, and other governments, all listening to a defining act of nationalization.",
        "The speech is a president's self-defense; it presents expropriation as pure national dignity and says less about the compensation terms, the origins of the workers' dispute, or the views of the companies.",
        "President Cárdenas's speech most directly represents which response to economic and social crisis after 1900?",
        [
            "A state using nationalization of foreign-owned resources to assert popular sovereignty and win working-class support.",
            "A government raising tariffs to protect domestic factories from foreign imports.",
            "A regime organizing corporatist labor syndicates subordinate to the party-state.",
            "A government adopting the gold standard to stabilize its currency.",
        ],
        0,
        "event_five_year_plan",
    );

    public static readonly STALIN_INDUSTRIALIZATION_1928 = new PrimarySource(
        "stalin_industrialization_1928",
        "Industrialization of the Country and the Right Deviation in the C.P.S.U.(B.)",
        "Joseph Stalin",
        "November 1928",
        "soviet_union",
        "Political speech",
        "Russia was beaten by all the more developed countries by fifty or a hundred years. We must make good this distance in ten years, or we shall be crushed... The grain-collecting difficulties are nothing but a reflection of the fact that we have not yet established an alliance between the peasants and the working class on new, Soviet lines... We must push forward the collectivization of agriculture and the building of heavy industry with all the means at our command.",
        "The general secretary of the Communist Party, speaking at the moment of the First Five-Year Plan.",
        "To compel rapid industrialization, collectivization, and the removal of opponents within the party.",
        "The Soviet Union in 1928 was a largely agrarian state surrounded by hostile powers and desperate for industrial strength.",
        "The party apparatus and the wider Soviet public, called on to accept harsh discipline for a coming industrial transformation.",
        "Stalin frames extraordinary sacrifice from a position of total power; the speech obscures the human cost of collectivization and does not acknowledge the forced requisitioning behind the grain crisis.",
        "Stalin's argument most directly reflects which feature of the Soviet response to economic backwardness?",
        [
            "State-directed five-year plans funded by the coercion of agriculture and repressive control.",
            "Reliance on foreign loans and private enterprise to build factories.",
            "A retreat from socialism toward free markets and private trade.",
            "A program of economic growth achieved primarily through consumer good exports.",
        ],
        0,
        "event_five_year_plan",
    );

    public static getSources(): PrimarySource[] {
        return [PrimarySourceScenarioFourLibrary.CARDENAS_SPEECH_TO_THE_NATION, PrimarySourceScenarioFourLibrary.STALIN_INDUSTRIALIZATION_1928];
    }
}
