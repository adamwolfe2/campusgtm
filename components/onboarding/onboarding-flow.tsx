"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/file-upload";
import { toast } from "sonner";
import type {
  OnboardingQuestion,
  OnboardingData,
  OnboardingAnswer,
} from "@/types/onboarding";
import {
  DEFAULT_ONBOARDING_QUESTIONS,
  QuestionType as QType,
  validateAnswer,
  calculateProgress,
} from "@/types/onboarding";
import { scrapeWebsite, isValidUrl } from "@/lib/scraper/web-scraper";
import type { ParsedDocument } from "@/lib/parser/file-parser";
import { extractWebsiteInsights, type ExtractedInsights } from "@/app/actions/extract-website-insights";
import { cn } from "@/lib/utils";

interface OnboardingFlowProps {
  questions?: OnboardingQuestion[];
  onComplete?: (data: OnboardingData) => void;
  className?: string;
}

export function OnboardingFlow({
  questions = DEFAULT_ONBOARDING_QUESTIONS,
  onComplete,
  className,
}: OnboardingFlowProps) {
  const [data, setData] = React.useState<OnboardingData>({
    answers: [],
    currentStep: 0,
    completed: false,
    startedAt: new Date(),
  });

  const [currentValue, setCurrentValue] = React.useState<string | string[]>("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [_extractedInsights, setExtractedInsights] = React.useState<ExtractedInsights | null>(null);
  const [error, setError] = React.useState<string>();

  const currentQuestion = questions[data.currentStep];
  const progress = calculateProgress(data, questions.length);
  const isLastQuestion = data.currentStep === questions.length - 1;

  // Load existing answer for current question (for auto-filled or previously answered questions)
  React.useEffect(() => {
    const existingAnswer = data.answers.find(
      (a) => a.questionId === currentQuestion?.id
    );
    if (existingAnswer && !currentValue) {
      setCurrentValue(existingAnswer.value);
    }
  }, [currentQuestion?.id, data.answers, currentValue]);

  // Handle answer submission
  const handleNext = async () => {
    if (!currentQuestion) {
      return;
    }

    // Validate answer
    const validation = validateAnswer(currentQuestion, currentValue);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(undefined);
    setIsProcessing(true);

    try {
      // Special handling for website URL - trigger scraper and AI extraction
      if (
        currentQuestion.type === QType.URL &&
        currentValue &&
        typeof currentValue === "string"
      ) {
        if (isValidUrl(currentValue)) {
          setIsExtracting(true);
          try {
            // Step 1: Scrape the website
            const scrapedData = await scrapeWebsite(currentValue);
            setData((prev) => ({
              ...prev,
              scrapedWebsite: scrapedData,
            }));

            // Step 2: Extract insights with AI
            const { success, insights, error: extractError } = await extractWebsiteInsights(scrapedData);

            if (success && insights) {
              setExtractedInsights(insights);

              // Step 3: Auto-fill answers
              const autoFilledAnswers: OnboardingAnswer[] = [
                { questionId: 'company_name', value: insights.companyName, answeredAt: new Date() },
                { questionId: 'industry', value: insights.industry, answeredAt: new Date() },
                { questionId: 'target_audience', value: insights.targetAudience, answeredAt: new Date() },
                { questionId: 'unique_value', value: insights.valueProposition, answeredAt: new Date() },
              ];

              // Add competitors if available
              if (insights.competitors && insights.competitors.length > 0) {
                autoFilledAnswers.push({
                  questionId: 'competitors',
                  value: insights.competitors.join('\n'),
                  answeredAt: new Date(),
                });
              }

              setData((prev) => ({
                ...prev,
                answers: [...prev.answers, ...autoFilledAnswers],
              }));

              toast.success('✨ Auto-filled your company info from website!');
            } else {
              toast.warning('Website scraped, but AI extraction failed. Please fill manually.');
              console.error('AI extraction error:', extractError);
            }
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to analyze website"
            );
          } finally {
            setIsExtracting(false);
          }
        }
      }

      // Save answer
      const answer: OnboardingAnswer = {
        questionId: currentQuestion.id,
        value: currentValue,
        answeredAt: new Date(),
      };

      // Update or add answer
      setData((prev) => {
        const existingIndex = prev.answers.findIndex(
          (a) => a.questionId === currentQuestion.id
        );

        const newAnswers =
          existingIndex >= 0
            ? prev.answers.map((a, i) => (i === existingIndex ? answer : a))
            : [...prev.answers, answer];

        return {
          ...prev,
          answers: newAnswers,
        };
      });

      // Move to next question or complete
      if (isLastQuestion) {
        const completedData: OnboardingData = {
          ...data,
          answers: [
            ...data.answers.filter((a) => a.questionId !== currentQuestion.id),
            answer,
          ],
          completed: true,
          completedAt: new Date(),
        };
        setData(completedData);
        onComplete?.(completedData);
      } else {
        setData((prev) => ({
          ...prev,
          currentStep: prev.currentStep + 1,
        }));
        setCurrentValue("");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (data.currentStep > 0) {
      setData((prev) => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));

      // Load previous answer
      const prevQuestion = questions[data.currentStep - 1];
      const prevAnswer = data.answers.find(
        (a) => a.questionId === prevQuestion.id
      );
      if (prevAnswer) {
        setCurrentValue(prevAnswer.value);
      } else {
        setCurrentValue("");
      }
      setError(undefined);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  if (data.completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "flex min-h-[400px] flex-col items-center justify-center gap-6 text-center",
          className
        )}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <Check className="h-10 w-10" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold">All set!</h2>
          <p className="mt-2 text-muted-foreground">
            We're generating your personalized GTM strategy...
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </motion.div>
      </motion.div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {data.currentStep + 1} of {questions.length}
          </span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex min-h-[300px] flex-col"
        >
          <div className="mb-8">
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
              {currentQuestion.question}
            </h2>
            {currentQuestion.description && (
              <p className="text-muted-foreground">
                {currentQuestion.description}
              </p>
            )}
          </div>

          {/* AI Extraction Loading State */}
          {isExtracting && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex flex-col items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-6"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium">Analyzing your website...</p>
                <p className="text-sm text-muted-foreground">
                  Extracting brand voice, target audience, and key insights
                </p>
              </div>
            </motion.div>
          )}

          {/* Input based on question type */}
          <div className="flex-1">
            <QuestionInput
              question={currentQuestion}
              value={currentValue}
              onChange={setCurrentValue}
              onKeyDown={handleKeyDown}
              onFilesProcessed={(documents) => {
                setData((prev) => ({
                  ...prev,
                  uploadedDocuments: documents,
                }));
                setCurrentValue("uploaded");
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={data.currentStep === 0 || isProcessing}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={isProcessing || !currentValue}
              size="lg"
              className="gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isLastQuestion ? (
                <>
                  Complete
                  <Sparkles className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Renders the appropriate input based on question type
 */
interface QuestionInputProps {
  question: OnboardingQuestion;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFilesProcessed?: (documents: ParsedDocument[]) => void;
}

function QuestionInput({
  question,
  value,
  onChange,
  onKeyDown,
  onFilesProcessed,
}: QuestionInputProps) {
  switch (question.type) {
    case QType.TEXT:
    case QType.URL:
      return (
        <Input
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={question.placeholder}
          autoFocus
          className="h-12 text-lg"
        />
      );

    case QType.TEXTAREA:
      return (
        <textarea
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          autoFocus
          rows={5}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      );

    case QType.SELECT:
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {question.options?.map((option) => (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={cn(
                "rounded-lg border-2 p-4 text-left transition-all hover:border-primary hover:bg-accent",
                value === option
                  ? "border-primary bg-primary/5"
                  : "border-muted"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    value === option
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  )}
                >
                  {value === option && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>
      );

    case QType.MULTISELECT:
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {question.options?.map((option) => {
            const isSelected = (value as string[]).includes(option);

            return (
              <button
                key={option}
                onClick={() => {
                  const current = (value as string[]) || [];
                  onChange(
                    isSelected
                      ? current.filter((v) => v !== option)
                      : [...current, option]
                  );
                }}
                className={cn(
                  "rounded-lg border-2 p-4 text-left transition-all hover:border-primary hover:bg-accent",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border-2",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}
                  >
                    {isSelected && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      );

    case QType.FILE_UPLOAD:
      return <FileUpload onFilesProcessed={onFilesProcessed} maxFiles={5} />;

    default:
      return null;
  }
}
