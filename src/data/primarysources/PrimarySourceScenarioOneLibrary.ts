import { PrimarySource } from "../PrimarySource";

export class PrimarySourceScenarioOneLibrary {
    public static readonly MADERO_PLAN_OF_SAN_LUIS_POTOSI = new PrimarySource(
        "madero_plan_of_san_luis_potosi",
        "Plan of San Luis Potosí",
        "Francisco I. Madero",
        "October 5, 1910 (published November 20, 1910)",
        "mexico",
        "Political program",
        "The Republic has no legitimate president, and the election of 1910 is null and void. The powers of the federal government are usurped by General Porfirio Díaz... I invite the Mexican people to arms to cast out the usurper and to reestablish the reign of law... The immense majority of Mexicans desire liberty and the reestablishment of republican institutions.",
        "An exiled opposition politician and wealthy landowner who lost the fraudulent election of 1910.",
        "To justify armed revolution and rally support for overthrowing Porfirio Díaz.",
        "Mexico in 1910 stood on the eve of revolution after thirty-four years of Porfirian dictatorship.",
        "The Mexican people, especially workers, peasants, and regional elites excluded from power.",
        "Madero speaks from exile and frames a national revolution led by a landowning moderate; it understates the land and labor grievances that radical leaders like Zapata would raise.",
        "Which limitation most affects the usefulness of the Plan of San Luis Potosí as evidence of conditions in Mexico before 1911?",
        [
            "It was written by an exiled politician after he was refused the presidency, so it reflects one faction's view of the Diaz regime.",
            "It was written by a peasant leader of the Zapatista movement rather than by Madero himself.",
            "It was published after the revolution had already succeeded, so it is retrospective.",
            "It contains no political demands, only economic statistics about land ownership.",
        ],
        0,
        "event_armenian_genocide",
    );

    public static readonly OCTOBER_MANIFESTO = new PrimarySource(
        "october_manifesto",
        "October Manifesto",
        "Emperor Nicholas II",
        "October 17, 1905",
        "russian_empire",
        "Imperial decree",
        "The disturbances and unrest in St. Petersburg, Moscow, and many other parts of Our Empire fill Our heart with great and heavy grief... We impose upon the government the duty to execute Our inflexible will: 1. To grant to the population the essential foundations of civil freedom, based on the principles of genuine inviolability of the person, freedom of conscience, speech, assembly and association... 3. To establish as an unbreakable rule that no law shall take effect without Our approval by the State Duma.",
        "The autocrat of all the Russias, forced by revolution to concede a parliament.",
        "To end the 1905 revolution by promising civil liberties and a legislative duma while preserving the crown.",
        "Russia in 1905 was defeated by Japan and shaken by Bloody Sunday, strikes, and mutinies.",
        "The Russian people and the revolutionary movement, which Nicholas addresses from a position of diminished authority.",
        "The manifesto concedes rights on paper while the Fundamental Laws of 1906 restored the emperor's veto and control of ministers; the promises were quickly narrowed in practice.",
        "The October Manifesto most directly illustrates which pattern in the decline of land-based empires after 1900?",
        [
            "An autocracy granting limited reform under revolutionary pressure while preserving royal power.",
            "A colonial administration ceding independence to a subject nation.",
            "A republic abolishing its own parliamentary system.",
            "A military junta taking power and cancelling elections.",
        ],
        0,
        "event_russian_revolution",
    );

    public static getSources(): PrimarySource[] {
        return [
            PrimarySourceScenarioOneLibrary.MADERO_PLAN_OF_SAN_LUIS_POTOSI,
            PrimarySourceScenarioOneLibrary.OCTOBER_MANIFESTO,
        ];
    }
}
