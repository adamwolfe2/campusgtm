/**
 * Error State Component
 * Enterprise-grade error handling with retry functionality
 */

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { glass, animations } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  /** The error title (default: "Something went wrong") */
  title?: string;
  /** The error message */
  message?: string;
  /** Optional error object for detailed logging */
  error?: Error | unknown;
  /** Retry callback function */
  onRetry?: () => void;
  /** Optional action to go to settings */
  onGoToSettings?: () => void;
  /** Optional action to go home */
  onGoHome?: () => void;
  /** Show retry button (default: true if onRetry provided) */
  showRetry?: boolean;
  /** Show settings button (default: false) */
  showSettings?: boolean;
  /** Show home button (default: false) */
  showHome?: boolean;
  /** Custom action button */
  customAction?: React.ReactNode;
  /** Additional className for the container */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export function ErrorState({
  title = "Something went wrong",
  message,
  error,
  onRetry,
  onGoToSettings,
  onGoHome,
  showRetry = !!onRetry,
  showSettings = false,
  showHome = false,
  customAction,
  className,
  size = "md",
}: ErrorStateProps) {
  // Extract error message if Error object provided
  const errorMessage = error instanceof Error ? error.message : message;

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "max-w-md",
      icon: "h-12 w-12",
      iconInner: "h-6 w-6",
      title: "text-lg",
      description: "text-sm",
    },
    md: {
      container: "max-w-lg",
      icon: "h-16 w-16",
      iconInner: "h-8 w-8",
      title: "text-xl",
      description: "text-sm",
    },
    lg: {
      container: "max-w-2xl",
      icon: "h-20 w-20",
      iconInner: "h-10 w-10",
      title: "text-2xl",
      description: "text-base",
    },
  };

  const config = sizeConfig[size];

  return (
    <motion.div
      {...animations.fadeInUp}
      className={cn("flex w-full items-center justify-center py-12", className)}
    >
      <Card className={cn("w-full border-destructive/20", glass.card, config.container)}>
        <CardHeader className="text-center">
          <div
            className={cn(
              "mx-auto mb-4 flex items-center justify-center rounded-full bg-destructive/10",
              config.icon
            )}
          >
            <AlertCircle className={cn("text-destructive", config.iconInner)} />
          </div>
          <CardTitle className={config.title}>{title}</CardTitle>
          {errorMessage && (
            <CardDescription className={cn("mt-2", config.description)}>
              {errorMessage}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {showRetry && onRetry && (
              <Button onClick={onRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}

            {showSettings && onGoToSettings && (
              <Button onClick={onGoToSettings} variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            )}

            {showHome && onGoHome && (
              <Button onClick={onGoHome} variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            )}

            {customAction}
          </div>

          {/* Help Text */}
          {(showSettings || onGoToSettings) && !showSettings && (
            <p className="text-center text-xs text-muted-foreground">
              If this issue persists, check your AI provider settings
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Inline Error State (smaller, for embedded use)
 */
export function InlineErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-destructive">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="ghost" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

/**
 * AI-Specific Error State
 * For AI generation failures with helpful suggestions
 */
export function AIErrorState({
  onRetry,
  onGoToSettings,
  error,
}: {
  onRetry?: () => void;
  onGoToSettings?: () => void;
  error?: Error | unknown;
}) {
  const errorMessage = error instanceof Error ? error.message : "Failed to generate AI response";

  // Check for common AI errors
  const isAPIKeyError =
    errorMessage.includes("API key") ||
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("authentication");

  const isRateLimitError =
    errorMessage.includes("rate limit") || errorMessage.includes("quota");

  const isNetworkError =
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("timeout");

  let helpText = "Try again or check your AI provider settings";
  if (isAPIKeyError) {
    helpText = "Please check your API key in Settings";
  } else if (isRateLimitError) {
    helpText = "You've reached your API rate limit. Try again in a few moments.";
  } else if (isNetworkError) {
    helpText = "Check your internet connection and try again";
  }

  return (
    <ErrorState
      title="AI Generation Failed"
      message={`${errorMessage}. ${helpText}`}
      error={error}
      onRetry={onRetry}
      onGoToSettings={onGoToSettings}
      showRetry={!!onRetry}
      showSettings={isAPIKeyError}
      size="md"
    />
  );
}
