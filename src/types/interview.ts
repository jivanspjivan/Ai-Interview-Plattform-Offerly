export const interviewTypes = [
  {
    value: "behavioral",
    label: "Behavioral",
    description: "Experience, collaboration, and leadership",
  },
  {
    value: "technical",
    label: "Technical",
    description: "Concepts, decisions, and problem solving",
  },
  {
    value: "mixed",
    label: "Mixed",
    description: "A balanced, full-round simulation",
  },
] as const;

export const experienceLevels = [
  "Entry level",
  "Mid level",
  "Senior",
  "Leadership",
] as const;

export const durations = [15, 30, 45] as const;

export type InterviewType = (typeof interviewTypes)[number]["value"];
export type ExperienceLevel = (typeof experienceLevels)[number];
export type InterviewDuration = (typeof durations)[number];

export type InterviewSetup = {
  role: string;
  interviewType: InterviewType;
  experience: ExperienceLevel;
  duration: InterviewDuration;
};

export const initialInterviewSetup: InterviewSetup = {
  role: "",
  interviewType: "behavioral",
  experience: "Mid level",
  duration: 30,
};

export function isInterviewType(value: string): value is InterviewType {
  return interviewTypes.some((type) => type.value === value);
}

export function isExperienceLevel(value: string): value is ExperienceLevel {
  return experienceLevels.some((level) => level === value);
}

export function isInterviewDuration(
  value: number,
): value is InterviewDuration {
  return durations.some((duration) => duration === value);
}
