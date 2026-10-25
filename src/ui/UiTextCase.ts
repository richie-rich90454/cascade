import type Phaser from "phaser";

const DISPLAY_TERM_EXPANSIONS = new Map<string, string>([
    ["AP", "Advanced Placement"],
    ["CED", "Course and Exam Description"],
    ["DBQ", "Document-Based Question"],
    ["NATO", "North Atlantic Treaty Organization"],
    ["PRC", "People's Republic of China"],
    ["UN", "United Nations"],
    ["US", "United States"],
    ["USA", "United States"],
    ["USSR", "Soviet Union"],
    ["WWI", "First World War"],
    ["WWII", "Second World War"],
    ["CSV", "Comma-Separated Values"],
    ["LOA", "Learning Objective A"],
    ["LOB", "Learning Objective B"],
    ["LOC", "Learning Objective C"],
    ["LOD", "Learning Objective D"],
    ["LOE", "Learning Objective E"],
    ["LOF", "Learning Objective F"],
    ["LOG", "Learning Objective G"],
    ["LOH", "Learning Objective H"],
    ["LOI", "Learning Objective I"],
    ["GER", "Germany"],
    ["AUH", "Austria-Hungary"],
    ["OTT", "Ottoman Empire"],
    ["TUR", "Turkey"],
    ["RUS", "Russia"],
    ["SOV", "Soviet Union"],
    ["FRA", "France"],
    ["ENG", "England"],
    ["ITA", "Italy"],
    ["JAP", "Japan"],
    ["QNG", "Qing China"],
    ["CHN", "China"],
    ["RAJ", "British Raj"],
    ["MEX", "Mexico"],
    ["KHM", "Khmer Empire"],
    ["BRZ", "Brazil"],
    ["RWA", "Rwanda"],
    ["SER", "Serbia"],
    ["BEL", "Belgium"],
    ["WAF", "West African Federation"],
    ["INF", "Infantry"],
    ["ARM", "Armor"],
    ["ART", "Artillery"],
    ["CAV", "Cavalry"],
    ["AIR", "Air Force"],
    ["NAV", "Navy"],
    ["SUB", "Submarine"],
    ["CAR", "Carrier"],
    ["GAR", "Garrison"],
    ["HQ", "Headquarters"],
    ["MIL", "Militia"],
    ["MEC", "Mechanized Infantry"],
    ["PAR", "Paratroopers"],
    ["MAR", "Marines"],
    ["UNK", "Unknown"],
    ["GOV", "Governance"],
    ["ECON", "Economy"],
    ["ON", "On"],
    ["OFF", "Off"],
]);

const LOWERCASE_TITLE_WORDS = new Set([
    "a",
    "an",
    "and",
    "as",
    "at",
    "by",
    "for",
    "from",
    "in",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
]);

let hasInstalledDisplayCasePatch = false;

function titleCaseDisplayWord(word: string, isFirstWord: boolean): string {
    const uppercaseWord = word.toLocaleUpperCase("en");
    const expandedTerm = DISPLAY_TERM_EXPANSIONS.get(uppercaseWord);
    if (expandedTerm !== undefined) {
        return expandedTerm;
    }

    const lowercaseWord = word.toLocaleLowerCase("en");
    if (!isFirstWord && LOWERCASE_TITLE_WORDS.has(lowercaseWord)) {
        return lowercaseWord;
    }
    return `${lowercaseWord.charAt(0).toLocaleUpperCase("en")}${lowercaseWord.slice(1)}`;
}

/** Convert shouting interface copy to readable title case and expand common student-facing shorthand. */
export function formatUiDisplayCase(text: string): string;
export function formatUiDisplayCase(text: string[]): string[];
export function formatUiDisplayCase(text: string | string[]): string | string[];
export function formatUiDisplayCase(text: string | string[]): string | string[] {
    const formatLine = (line: string): string => {
        if (!/[A-Z]/.test(line)) {
            return line;
        }

        let isFirstWord = true;
        return line.replace(/\b[A-Z][A-Z0-9]*(?:[’'][A-Z0-9]+)*\b/g, (word) => {
            const formattedWord = titleCaseDisplayWord(word, isFirstWord);
            isFirstWord = false;
            return formattedWord;
        });
    };

    return Array.isArray(text)
        ? text.map(formatLine)
        : text
              .split(/(\r?\n)/)
              .map(formatLine)
              .join("");
}

/** Apply display casing to every Phaser text object, including labels created outside shared panel helpers. */
export function installUiTextCasePatch(phaserRuntime: typeof Phaser): void {
    if (hasInstalledDisplayCasePatch) {
        return;
    }
    hasInstalledDisplayCasePatch = true;

    const originalSetText = phaserRuntime.GameObjects.Text.prototype.setText;
    phaserRuntime.GameObjects.Text.prototype.setText = function (value: string | string[]): Phaser.GameObjects.Text {
        return originalSetText.call(this, formatUiDisplayCase(value));
    };
}
