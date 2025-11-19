'use server';

import { generateCompleteStrategy } from '@/lib/generation/strategy-orchestrator';
import type { OnboardingData } from '@/types/onboarding';
import type { StrategyGenerationResult } from '@/lib/generation/strategy-orchestrator';

/**
 * Server Action to generate GTM strategy
 * This runs on the server, so it has access to environment variables
 */
export async function generateStrategyAction(
  onboardingData: OnboardingData,
  userId?: string
): Promise<StrategyGenerationResult> {
  console.log('[generateStrategyAction] Server action called with userId:', userId);

  try {
    const result = await generateCompleteStrategy(onboardingData, userId);
    console.log('[generateStrategyAction] Strategy generated successfully');
    return result;
  } catch (error) {
    console.error('[generateStrategyAction] Error:', error);
    throw error;
  }
}
