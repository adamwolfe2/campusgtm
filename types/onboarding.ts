/**
 * Onboarding Flow Types
 * Typeform-style conversational onboarding with dynamic questions
 */

import type { ParsedDocument } from "@/lib/parser/file-parser";
import type { ScrapedWebsiteData } from "@/lib/scraper/web-scraper";

export const QuestionType = {
  TEXT: "text",
  TEXTAREA: "textarea",
  SELECT: "select",
  MULTISELECT: "multiselect",
  URL: "url",
  FILE_UPLOAD: "file_upload",
  NUMBER: "number",
} as const;

export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

export interface OnboardingQuestion {
  id: string;
  type: QuestionType;
  question: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: (value: string | string[]) => boolean;
  errorMessage?: string;
}

export interface OnboardingAnswer {
  questionId: string;
  value: string | string[];
  answeredAt: Date;
}

export interface OnboardingData {
  userId?: string;
  answers: OnboardingAnswer[];
  uploadedDocuments?: ParsedDocument[];
  scrapedWebsite?: ScrapedWebsiteData;
  websiteInsights?: string;
  currentStep: number;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export const DEFAULT_ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "company_name",
    type: QuestionType.TEXT,
    question: "Let's start with the basics. What's your company name?",
    description: "The official name of your company or product",
    placeholder: "e.g., Acme Inc.",
    required: true,
  },
  {
    id: "company_website",
    type: QuestionType.URL,
    question: "What's your company website?",
    description:
      "We'll analyze your website to understand your product and audience",
    placeholder: "e.g., https://acme.com",
    required: false,
  },
  {
    id: "file_uploads",
    type: QuestionType.FILE_UPLOAD,
    question: "Have any pitch decks or brand guidelines to share?",
    description: "Upload any documents that help us understand your company",
    required: false,
  },
  {
    id: "industry",
    type: QuestionType.SELECT,
    question: "Which industry best describes your company?",
    description: "This helps us tailor your GTM strategy",
    required: true,
    options: [
      "EdTech",
      "FinTech",
      "HealthTech",
      "E-commerce",
      "SaaS",
      "Marketplace",
      "Social Platform",
      "Other",
    ],
  },
  {
    id: "target_audience",
    type: QuestionType.TEXTAREA,
    question: "Who is your dream user?",
    description:
      "Be specific! Think demographics, behaviors, pain points. (e.g., 'College students majoring in CS who struggle with interview prep')",
    placeholder: "Describe your ideal customer...",
    required: true,
  },
  {
    id: "goals",
    type: QuestionType.MULTISELECT,
    question: "What are your top goals for the next 6 months?",
    description: "Select all that apply",
    required: true,
    options: [
      "Acquire first 1,000 users",
      "Launch student ambassador program",
      "Increase brand awareness on campus",
      "Drive revenue/MRR",
      "Build community",
      "Get product-market fit",
    ],
  },
  {
    id: "competitors",
    type: QuestionType.TEXTAREA,
    question: "Who are your top 3 competitors?",
    description:
      "This helps us understand your positioning and differentiation",
    placeholder: "List your main competitors, one per line",
    required: false,
  },
  {
    id: "budget",
    type: QuestionType.SELECT,
    question: "What's your marketing budget range?",
    description: "We'll tailor tactics to your budget",
    required: false,
    options: [
      "Bootstrap ($0 - $1K)",
      "Scrappy ($1K - $5K)",
      "Small ($5K - $20K)",
      "Medium ($20K - $100K)",
      "Large ($100K+)",
    ],
  },
  {
    id: "unique_value",
    type: QuestionType.TEXTAREA,
    question: "What makes you different from competitors?",
    description: "Your unique value proposition in one sentence",
    placeholder: "We're the only...",
    required: true,
  },
];

/**
 * Gets answer value by question ID
 */
export function getAnswerValue(
  data: OnboardingData,
  questionId: string
): string | string[] | undefined {
  const answer = data.answers.find((a) => a.questionId === questionId);
  return answer?.value;
}

/**
 * Calculates onboarding progress percentage
 */
export function calculateProgress(
  data: OnboardingData,
  totalQuestions: number
): number {
  return Math.round((data.currentStep / totalQuestions) * 100);
}

/**
 * Checks if current question is answered
 */
export function isQuestionAnswered(
  data: OnboardingData,
  questionId: string
): boolean {
  return data.answers.some((a) => a.questionId === questionId);
}

/**
 * Validates answer for a question
 */
export function validateAnswer(
  question: OnboardingQuestion,
  value: string | string[]
): { valid: boolean; error?: string } {
  // Check required
  if (question.required) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return {
          valid: false,
          error: question.errorMessage || "This question is required",
        };
      }
    } else if (!value || value.trim() === "") {
      return {
        valid: false,
        error: question.errorMessage || "This question is required",
      };
    }
  }

  // Custom validation
  if (question.validation && !question.validation(value)) {
    return {
      valid: false,
      error: question.errorMessage || "Invalid answer",
    };
  }

  // URL validation
  if (question.type === QuestionType.URL && value && typeof value === "string") {
    try {
      new URL(value.startsWith("http") ? value : `https://${value}`);
    } catch {
      return { valid: false, error: "Please enter a valid URL" };
    }
  }

  return { valid: true };
}
