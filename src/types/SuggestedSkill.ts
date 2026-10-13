export class SuggestedSkill {
    public static readonly SKILL_1_B = new SuggestedSkill(
        "1.B",
        "Skill 1.B",
        "Explain a historical concept, development, or process.",
        "ui_badge_skill_1b",
    );
    public static readonly SKILL_2_C = new SuggestedSkill(
        "2.C",
        "Skill 2.C",
        "Explain the significance of a source's point of view, purpose, historical situation, and/or audience, including how these might limit the use(s) of a source.",
        "ui_badge_skill_2c",
    );
    public static readonly SKILL_3_B = new SuggestedSkill(
        "3.B",
        "Skill 3.B",
        "Identify the evidence used in a source to support an argument.",
        "ui_badge_skill_3b",
    );
    public static readonly SKILL_3_D = new SuggestedSkill(
        "3.D",
        "Skill 3.D",
        "Explain how claims or evidence support, modify, or refute a source's argument.",
        "ui_badge_skill_3d",
    );
    public static readonly SKILL_4_B = new SuggestedSkill(
        "4.B",
        "Skill 4.B",
        "Explain how a specific historical development or process is situated within a broader historical context.",
        "ui_badge_skill_4b",
    );
    public static readonly SKILL_5_B = new SuggestedSkill(
        "5.B",
        "Skill 5.B",
        "Explain how a historical development or process relates to another historical development or process.",
        "ui_badge_skill_5b",
    );
    public static readonly SKILL_6_D = new SuggestedSkill(
        "6.D",
        "Skill 6.D",
        "Corroborate, qualify, or modify an argument using diverse and alternative evidence in order to develop a complex argument. This argument might: explain nuance of an issue by analyzing multiple variables; explain relevant and insightful connections within and across periods; explain the relative historical significance of a source's credibility and limitations; explain how or why a historical claim or argument is or is not effective.",
        "ui_badge_skill_6d",
    );

    private readonly suggestedSkillCode: string;
    private readonly suggestedSkillDisplayName: string;
    private readonly suggestedSkillDescription: string;
    private readonly badgeAssetIdentifier: string;

    private constructor(
        suggestedSkillCode: string,
        suggestedSkillDisplayName: string,
        suggestedSkillDescription: string,
        badgeAssetIdentifier: string,
    ) {
        this.suggestedSkillCode = suggestedSkillCode;
        this.suggestedSkillDisplayName = suggestedSkillDisplayName;
        this.suggestedSkillDescription = suggestedSkillDescription;
        this.badgeAssetIdentifier = badgeAssetIdentifier;
    }

    public getCode(): string {
        return this.suggestedSkillCode;
    }

    public getDisplayName(): string {
        return this.suggestedSkillDisplayName;
    }

    public getDescription(): string {
        return this.suggestedSkillDescription;
    }

    public getBadgeAssetId(): string {
        return this.badgeAssetIdentifier;
    }

    public static getAllSuggestedSkills(): SuggestedSkill[] {
        return [
            SuggestedSkill.SKILL_1_B,
            SuggestedSkill.SKILL_2_C,
            SuggestedSkill.SKILL_3_B,
            SuggestedSkill.SKILL_3_D,
            SuggestedSkill.SKILL_4_B,
            SuggestedSkill.SKILL_5_B,
            SuggestedSkill.SKILL_6_D,
        ];
    }

    public static findBySuggestedSkillCode(suggestedSkillCode: string): SuggestedSkill | null {
        for (const suggestedSkill of SuggestedSkill.getAllSuggestedSkills()) {
            if (suggestedSkill.getCode() === suggestedSkillCode) {
                return suggestedSkill;
            }
        }
        return null;
    }
}
