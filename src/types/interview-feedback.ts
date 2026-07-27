export type InterviewFeedback = {
  overallScore: number;
  summary: string;
  scores: {
    structure: number;
    relevance: number;
    clarity: number;
    evidence: number;
  };
  strengths: string[];
  improvements: string[];
  nextStep: string;
};
