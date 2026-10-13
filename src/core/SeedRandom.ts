export class SeedRandom {
    private readonly seedValue: number;
    private currentState: number;

    constructor(seed: number | string) {
        this.seedValue = typeof seed === "number" ? Math.floor(seed) : SeedRandom.hashString(seed);
        this.currentState = this.seedValue;
    }

    public getSeedValue(): number {
        return this.seedValue;
    }

    public nextFloat(): number {
        this.currentState = (this.currentState + 0x6d2b79f5) | 0;
        let scrambledValue = this.currentState;
        scrambledValue = Math.imul(scrambledValue ^ (scrambledValue >>> 15), scrambledValue | 1);
        scrambledValue ^= scrambledValue + Math.imul(scrambledValue ^ (scrambledValue >>> 7), scrambledValue | 61);
        return ((scrambledValue ^ (scrambledValue >>> 14)) >>> 0) / 4294967296;
    }

    public nextFloatInRange(minimumValue: number, maximumValue: number): number {
        return minimumValue + this.nextFloat() * (maximumValue - minimumValue);
    }

    public nextInt(minimumValue: number, maximumValue: number): number {
        if (maximumValue <= minimumValue) {
            return minimumValue;
        }
        return minimumValue + Math.floor(this.nextFloat() * (maximumValue - minimumValue + 1));
    }

    public nextBoolean(trueProbability: number = 0.5): boolean {
        return this.nextFloat() < trueProbability;
    }

    public pick<T>(candidateValues: T[]): T {
        if (candidateValues.length === 0) {
            throw new Error("SeedRandom.pick requires a non-empty array of candidate values.");
        }
        return candidateValues[this.nextInt(0, candidateValues.length - 1)];
    }

    public shuffle<T>(candidateValues: T[]): T[] {
        const shuffledValues = [...candidateValues];
        for (let currentIndex = shuffledValues.length - 1; currentIndex > 0; currentIndex--) {
            const swapIndex = this.nextInt(0, currentIndex);
            const temporaryValue = shuffledValues[currentIndex];
            shuffledValues[currentIndex] = shuffledValues[swapIndex];
            shuffledValues[swapIndex] = temporaryValue;
        }
        return shuffledValues;
    }

    public static hashString(text: string): number {
        let hashValue = 2166136261;
        for (let characterIndex = 0; characterIndex < text.length; characterIndex++) {
            hashValue ^= text.charCodeAt(characterIndex);
            hashValue = Math.imul(hashValue, 16777619);
        }
        return hashValue >>> 0;
    }
}
