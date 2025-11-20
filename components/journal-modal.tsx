"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { glass, animations } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface JournalQuestion {
  id: string;
  question: string;
  context: string;
  answered: boolean;
}

const DEFAULT_QUESTIONS: JournalQuestion[] = [
  {
    id: "1",
    question: "What's your current MRR (Monthly Recurring Revenue)?",
    context: "This helps me understand your current traction and recommend appropriate growth tactics",
    answered: false,
  },
  {
    id: "2",
    question: "Who are your top 3 ideal customer personas?",
    context: "Detailed personas help me create more targeted outreach and content strategies",
    answered: false,
  },
  {
    id: "3",
    question: "What distribution channels have you tried so far?",
    context: "Understanding what hasn't worked is as important as what has",
    answered: false,
  },
  {
    id: "4",
    question: "What's your biggest GTM challenge right now?",
    context: "This helps me prioritize which playbooks and tactics to recommend first",
    answered: false,
  },
];

export function JournalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState<JournalQuestion[]>(DEFAULT_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = questions[currentIndex];
  const unansweredCount = questions.filter((q) => !q.answered).length;

  const handleSaveAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer");
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Save to database and update AI context
      await new Promise((resolve) => setTimeout(resolve, 500));

      setQuestions((prev) =>
        prev.map((q, i) =>
          i === currentIndex ? { ...q, answered: true } : q
        )
      );

      toast.success("Answer saved! Your strategy will be updated.");

      // Move to next unanswered question
      const nextUnanswered = questions.findIndex(
        (q, i) => i > currentIndex && !q.answered
      );

      if (nextUnanswered !== -1) {
        setCurrentIndex(nextUnanswered);
      } else {
        // All questions answered
        setIsOpen(false);
        toast.success("All questions answered! Great job.");
      }

      setAnswer("");
    } catch (error) {
      toast.error("Failed to save answer");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    const nextUnanswered = questions.findIndex(
      (q, i) => i > currentIndex && !q.answered
    );

    if (nextUnanswered !== -1) {
      setCurrentIndex(nextUnanswered);
    } else {
      setCurrentIndex(0);
    }

    setAnswer("");
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          // Floating Button (Closed State)
          <motion.div
            key="button"
            {...animations.scaleIn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button
              size="icon"
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-2xl bg-white shadow-lg hover:shadow-xl dark:bg-gray-900"
            >
              <BookOpen className="h-6 w-6 text-gray-900 dark:text-gray-100" />
            </Button>

            {/* Badge for unanswered questions */}
            {unansweredCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-lg"
              >
                {unansweredCount}
              </motion.div>
            )}
          </motion.div>
        ) : (
          // Journal Modal (Open State)
          <motion.div
            key="modal"
            {...animations.slideInLeft}
            className={cn("flex h-[500px] w-[400px] flex-col rounded-2xl shadow-2xl", glass.strong)}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-500">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Journal</h3>
                  <p className="text-xs text-muted-foreground">
                    {unansweredCount} questions remaining
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress */}
            <div className="px-4 pt-4">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span>
                  {questions.filter((q) => q.answered).length} answered
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>

            {/* Question Content */}
            <ScrollArea className="flex-1 p-4">
              <motion.div
                key={currentQuestion.id}
                {...animations.fadeInUp}
                className="space-y-4"
              >
                <div>
                  <h4 className="mb-2 text-lg font-semibold">
                    {currentQuestion.question}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.context}
                  </p>
                </div>

                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Share your thoughts..."
                  className={cn(
                    "min-h-[150px] resize-none",
                    glass.input
                  )}
                  disabled={isSaving}
                />

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveAnswer}
                    disabled={isSaving || !answer.trim()}
                    className="flex-1 gap-2"
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        Save & Continue
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    disabled={isSaving}
                  >
                    Skip
                  </Button>
                </div>
              </motion.div>
            </ScrollArea>

            {/* Info Footer */}
            <div className="border-t border-white/10 p-3">
              <p className="text-xs text-muted-foreground">
                💡 Your answers help AI personalize your GTM strategy
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
