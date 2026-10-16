/**
 * Maintained crosswalk between the AP World History: Modern Fall 2026 Unit 7
 * framework and the scenario/practice content shipped in Cascade.
 */
export interface CedUnitSevenTopicRecord {
    readonly topicCode: string;
    readonly topicTitle: string;
    readonly learningObjectiveCode: string;
    readonly suggestedSkillCode: string;
    readonly scenarioNumbers: readonly number[];
}

export const CED_UNIT_SEVEN_TOPICS: readonly CedUnitSevenTopicRecord[] = [
    {
        topicCode: "7.1",
        topicTitle: "Shifting Power After 1900",
        learningObjectiveCode: "A",
        suggestedSkillCode: "4.B",
        scenarioNumbers: [1],
    },
    {
        topicCode: "7.2",
        topicTitle: "Causes of World War I",
        learningObjectiveCode: "B",
        suggestedSkillCode: "1.B",
        scenarioNumbers: [2],
    },
    {
        topicCode: "7.3",
        topicTitle: "Conducting World War I",
        learningObjectiveCode: "C",
        suggestedSkillCode: "3.B",
        scenarioNumbers: [3],
    },
    {
        topicCode: "7.4",
        topicTitle: "Economy in the Interwar Period",
        learningObjectiveCode: "D",
        suggestedSkillCode: "2.C",
        scenarioNumbers: [4],
    },
    {
        topicCode: "7.5",
        topicTitle: "Unresolved Tensions After World War I",
        learningObjectiveCode: "E",
        suggestedSkillCode: "2.C",
        scenarioNumbers: [5],
    },
    {
        topicCode: "7.6",
        topicTitle: "Causes of World War II",
        learningObjectiveCode: "F",
        suggestedSkillCode: "2.C",
        scenarioNumbers: [6],
    },
    {
        topicCode: "7.7",
        topicTitle: "Conducting World War II",
        learningObjectiveCode: "G",
        suggestedSkillCode: "3.D",
        scenarioNumbers: [7, 8],
    },
    {
        topicCode: "7.8",
        topicTitle: "Mass Atrocities After 1900",
        learningObjectiveCode: "H",
        suggestedSkillCode: "5.B",
        scenarioNumbers: [9],
    },
    {
        topicCode: "7.9",
        topicTitle: "Causation in Global Conflict",
        learningObjectiveCode: "I",
        suggestedSkillCode: "6.D",
        scenarioNumbers: [10],
    },
];

export function getCedUnitSevenCoverageIssues(): string[] {
    const issues: string[] = [];
    const topicCodes = new Set<string>();
    for (const topic of CED_UNIT_SEVEN_TOPICS) {
        if (topicCodes.has(topic.topicCode)) {
            issues.push(`Duplicate CED topic mapping: ${topic.topicCode}`);
        }
        topicCodes.add(topic.topicCode);
        if (topic.scenarioNumbers.length === 0) {
            issues.push(`CED topic has no linked scenario: ${topic.topicCode}`);
        }
        for (const scenarioNumber of topic.scenarioNumbers) {
            if (!Number.isInteger(scenarioNumber) || scenarioNumber < 1 || scenarioNumber > 10) {
                issues.push(`CED topic maps to an unknown scenario ${scenarioNumber}: ${topic.topicCode}`);
            }
        }
    }
    for (let topicIndex = 1; topicIndex <= 9; topicIndex += 1) {
        const expectedTopicCode = `7.${topicIndex}`;
        if (!topicCodes.has(expectedTopicCode)) {
            issues.push(`CED topic is missing from the crosswalk: ${expectedTopicCode}`);
        }
    }
    return issues;
}
