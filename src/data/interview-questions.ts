import type { InterviewType } from "@/types/interview";

export type InterviewQuestion = {
  id: string;
  type: Exclude<InterviewType, "mixed">;
  prompt: string;
  guidance: string;
};

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: "behavioral-ownership",
    type: "behavioral",
    prompt: "Tell me about a time you took ownership of a difficult problem.",
    guidance: "Explain the situation, your specific actions, and the outcome.",
  },
  {
    id: "behavioral-feedback",
    type: "behavioral",
    prompt: "Describe a piece of difficult feedback and how you responded.",
    guidance: "Show self-awareness and what changed in your work afterward.",
  },
  {
    id: "behavioral-conflict",
    type: "behavioral",
    prompt: "Tell me about a disagreement you had with a teammate.",
    guidance: "Focus on how you listened, aligned, and moved the work forward.",
  },
  {
    id: "behavioral-priority",
    type: "behavioral",
    prompt: "Describe a time priorities changed unexpectedly.",
    guidance: "Clarify your trade-offs and how you communicated them.",
  },
  {
    id: "technical-decision",
    type: "technical",
    prompt: "Walk me through an important technical decision you made recently.",
    guidance: "Compare alternatives, constraints, and the result of your choice.",
  },
  {
    id: "technical-debugging",
    type: "technical",
    prompt: "How would you investigate a production issue with an unclear cause?",
    guidance: "Use a structured process and explain how you reduce uncertainty.",
  },
  {
    id: "technical-quality",
    type: "technical",
    prompt: "How do you balance delivery speed with technical quality?",
    guidance: "Discuss risk, scope, testing, and how you make trade-offs visible.",
  },
  {
    id: "technical-scale",
    type: "technical",
    prompt: "Describe how you would prepare a system for rapid growth.",
    guidance: "Start with measurement, then prioritize the likely bottlenecks.",
  },
];

export function getQuestions(type: InterviewType) {
  if (type === "mixed") {
    return interviewQuestions;
  }

  return interviewQuestions.filter((question) => question.type === type);
}
