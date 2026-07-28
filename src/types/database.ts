export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
};

export type InterviewSessionRow = {
  id: string;
  user_id: string;
  role: string;
  interview_type: "behavioral" | "technical" | "mixed";
  experience_level: "Entry level" | "Mid level" | "Senior" | "Leadership";
  planned_duration: 15 | 30 | 45;
  elapsed_seconds: number;
  question_count: number;
  status: "in_progress" | "completed" | "abandoned";
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InterviewAnswerRow = {
  id: string;
  session_id: string;
  user_id: string;
  question_id: string;
  question_prompt: string;
  question_type: "behavioral" | "technical";
  transcript: string | null;
  created_at: string;
  updated_at: string;
};

export type InterviewFeedbackRow = {
  id: string;
  answer_id: string;
  user_id: string;
  overall_score: number;
  summary: string;
  structure_score: number;
  relevance_score: number;
  clarity_score: number;
  evidence_score: number;
  strengths: string[];
  improvements: string[];
  next_step: string;
  created_at: string;
  updated_at: string;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_tier: "basic" | "premium" | "premium_plus";
  status:
    | "inactive"
    | "created"
    | "authenticated"
    | "active"
    | "pending"
    | "halted"
    | "cancelled"
    | "completed"
    | "expired";
  razorpay_subscription_id: string | null;
  razorpay_plan_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  last_event_at: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

export type BillingEventRow = {
  event_id: string;
  event_type: string;
  payload: Json;
  processed_at: string;
};

type Insert<T, Generated extends keyof T> = Omit<T, Generated> &
  Partial<Pick<T, Generated>>;

type Update<T> = Partial<T>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Insert<ProfileRow, "created_at" | "updated_at">;
        Update: Update<ProfileRow>;
        Relationships: [];
      };
      interview_sessions: {
        Row: InterviewSessionRow;
        Insert: Insert<
          InterviewSessionRow,
          | "id"
          | "elapsed_seconds"
          | "status"
          | "started_at"
          | "completed_at"
          | "created_at"
          | "updated_at"
        >;
        Update: Update<InterviewSessionRow>;
        Relationships: [];
      };
      interview_answers: {
        Row: InterviewAnswerRow;
        Insert: Insert<
          InterviewAnswerRow,
          "id" | "transcript" | "created_at" | "updated_at"
        >;
        Update: Update<InterviewAnswerRow>;
        Relationships: [];
      };
      interview_feedback: {
        Row: InterviewFeedbackRow;
        Insert: Insert<
          InterviewFeedbackRow,
          "id" | "created_at" | "updated_at"
        >;
        Update: Update<InterviewFeedbackRow>;
        Relationships: [];
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: Insert<
          SubscriptionRow,
          | "id"
          | "plan_tier"
          | "status"
          | "razorpay_subscription_id"
          | "razorpay_plan_id"
          | "current_period_start"
          | "current_period_end"
          | "last_event_at"
          | "cancel_at_period_end"
          | "created_at"
          | "updated_at"
        >;
        Update: Update<SubscriptionRow>;
        Relationships: [];
      };
      billing_events: {
        Row: BillingEventRow;
        Insert: Insert<BillingEventRow, "processed_at">;
        Update: Update<BillingEventRow>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
