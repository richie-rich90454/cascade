import { PrimarySource } from "../PrimarySource";

export class PrimarySourceScenarioFiveLibrary {
    public static readonly CLEMENCEAU_LETTER_TO_GERMAN_DELEGATION = new PrimarySource(
        "clemenceau_letter_may_1919",
        "Letter of Reply to the Objections of the German Peace Delegation",
        "Georges Clemenceau, President of the Paris Peace Conference",
        "May 1919",
        "french_republic",
        "Diplomatic letter",
        "The German delegation contends that the terms imposed upon it are too severe... The war was begun by Germany in violation of the most solemn treaties. The French people are not responsible for the destruction in the occupied provinces; the German armies left only ruins... Germany denies that she was responsible for the war. The answer is written in the history of the last forty years, during which her policy of armaments and her threats darkened every horizon of Europe.",
        "The French premier writing on behalf of the victorious Allies to the defeated enemy.",
        "To justify the harsh terms of the Versailles treaty and to fix war responsibility upon Germany.",
        "Paris, 1919: the victors were dictating peace while revolution and hunger unsettled Germany and Eastern Europe.",
        "The German delegation, the Allied governments, and the public opinion of both sides.",
        "Clemenceau argues as prosecutor and statesman for France; he stresses German guilt and omits the role of alliance systems, rival imperialisms, and the escalation of July 1914 that many historians emphasize.",
        "The CED quickwrite prompt: Based on what you learned about the causes of World War I, what are the weaknesses in Clemenceau's argument? The strongest critique is that Clemenceau, in this letter,",
        [
            "attributes sole responsibility to Germany while ignoring the shared pressures of alliance systems, imperial rivalry, and the escalation of the July Crisis.",
            "demands reparations but fails to mention the military defeat of Germany.",
            "argues that the war was caused by the League of Nations.",
            "claims that France began the war and Germany merely defended itself.",
        ],
        0,
        "event_treaty_versailles",
    );

    public static getSources(): PrimarySource[] {
        return [PrimarySourceScenarioFiveLibrary.CLEMENCEAU_LETTER_TO_GERMAN_DELEGATION];
    }
}
