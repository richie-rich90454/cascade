import type { Nation } from "../domain/Nation";

export class InterestGroup {
    public readonly groupIdentifier: string;
    public readonly groupDisplayName: string;
    public readonly portraitAssetIdentifier: string;

    private politicalPowerLevel: number;

    constructor(
        groupIdentifier: string,
        groupDisplayName: string,
        portraitAssetIdentifier: string,
        initialPoliticalPower: number,
    ) {
        this.groupIdentifier = groupIdentifier;
        this.groupDisplayName = groupDisplayName;
        this.portraitAssetIdentifier = portraitAssetIdentifier;
        this.politicalPowerLevel = initialPoliticalPower;
    }

    public getPoliticalPower(): number {
        return this.politicalPowerLevel;
    }

    public adjustPoliticalPower(deltaPower: number): number {
        this.politicalPowerLevel = Math.max(0, Math.min(100, this.politicalPowerLevel + deltaPower));
        return this.politicalPowerLevel;
    }
}

export class DomesticManager {
    private readonly interestGroupsByNationIdentifier: Map<string, InterestGroup[]>;
    private readonly governmentInterventionByNationIdentifier: Map<string, number>;

    constructor() {
        this.interestGroupsByNationIdentifier = new Map<string, InterestGroup[]>();
        this.governmentInterventionByNationIdentifier = new Map<string, number>();
    }

    public getInterestGroupsForNation(nationIdentifier: string): InterestGroup[] {
        const existingInterestGroups = this.interestGroupsByNationIdentifier.get(nationIdentifier);
        if (existingInterestGroups !== undefined) {
            return existingInterestGroups;
        }
        const createdInterestGroups = [
            new InterestGroup("aristocracy", "Aristocracy", "ig_aristocracy", 45),
            new InterestGroup("bourgeoisie", "Bourgeoisie", "ig_bourgeoisie", 50),
            new InterestGroup("workers", "Workers", "ig_workers", 40),
            new InterestGroup("clergy", "Clergy", "ig_clergy", 30),
            new InterestGroup("military", "Military", "ig_military", 55),
            new InterestGroup("intelligentsia", "Intelligentsia", "ig_intelligentsia", 35),
            new InterestGroup("peasants", "Peasants", "ig_peasants", 50),
            new InterestGroup("merchants", "Merchants", "ig_merchants", 40),
        ];
        this.interestGroupsByNationIdentifier.set(nationIdentifier, createdInterestGroups);
        return createdInterestGroups;
    }

    public adjustGroupPower(nationIdentifier: string, groupIdentifier: string, deltaPower: number): void {
        for (const interestGroup of this.getInterestGroupsForNation(nationIdentifier)) {
            if (interestGroup.groupIdentifier === groupIdentifier) {
                interestGroup.adjustPoliticalPower(deltaPower);
                return;
            }
        }
    }

    public computePoliticalStability(nation: Nation): number {
        const interestGroups = this.getInterestGroupsForNation(nation.getIdentifier());
        let totalPoliticalPower = 0;
        let weightedSatisfactionBonus = 0;
        for (const interestGroup of interestGroups) {
            totalPoliticalPower += interestGroup.getPoliticalPower();
            weightedSatisfactionBonus += interestGroup.getPoliticalPower() * (nation.getLegitimacy() / 100);
        }
        if (totalPoliticalPower === 0) {
            return nation.getStability();
        }
        return Math.round(Math.max(0, Math.min(100, (weightedSatisfactionBonus / totalPoliticalPower) * 100)));
    }

    public getGovernmentInterventionLevel(nationIdentifier: string): number {
        return this.governmentInterventionByNationIdentifier.get(nationIdentifier) ?? 20;
    }

    public setGovernmentInterventionLevel(nationIdentifier: string, interventionLevel: number): void {
        this.governmentInterventionByNationIdentifier.set(
            nationIdentifier,
            Math.max(0, Math.min(100, interventionLevel)),
        );
    }

    public adjustGovernmentInterventionLevel(nationIdentifier: string, deltaIntervention: number): number {
        const updatedInterventionLevel = this.getGovernmentInterventionLevel(nationIdentifier) + deltaIntervention;
        this.setGovernmentInterventionLevel(nationIdentifier, updatedInterventionLevel);
        return this.getGovernmentInterventionLevel(nationIdentifier);
    }

    public getPublicOpinionLevel(nation: Nation): number {
        const stabilityContribution = nation.getStability() * 0.6;
        const legitimacyContribution = nation.getLegitimacy() * 0.4;
        return Math.round(stabilityContribution + legitimacyContribution);
    }

    public getDomesticSummaryLines(nation: Nation): string[] {
        const interestGroups = this.getInterestGroupsForNation(nation.getIdentifier());
        const summaryLines: string[] = [];
        for (const interestGroup of interestGroups) {
            summaryLines.push(
                `${interestGroup.groupDisplayName}: political power ${interestGroup.getPoliticalPower()}`,
            );
        }
        summaryLines.push(
            `Government intervention: ${this.getGovernmentInterventionLevel(nation.getIdentifier())} of 100`,
        );
        summaryLines.push(`Public opinion: ${this.getPublicOpinionLevel(nation)} of 100`);
        return summaryLines;
    }
}
