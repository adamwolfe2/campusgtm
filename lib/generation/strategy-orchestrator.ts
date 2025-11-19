/**
 * Strategy Generation Orchestrator
 * Connects onboarding data → AI service → workspace creation
 * The core "loop closer" that makes everything work end-to-end
 */

import type { OnboardingData } from "@/types/onboarding";
import type { GTMStrategy, GTMStrategyRequest, AIProviderConfig } from "@/types/ai";
import type { StrategyModule, Block } from "@/types";
import { getAnswerValue } from "@/types/onboarding";
import { StrategyModuleType, BlockType } from "@/types";
import { generateGTMStrategy } from "@/lib/ai/service";
import { getPreferredAIConfig } from "@/lib/ai/config";
import {
  createWorkspace,
  addStrategyModule,
  updateWorkspace,
  type WorkspaceWithModules,
} from "@/lib/storage/workspace-storage";
import {
  extractInsightsFromScrapedData,
  generateInsightExtractionPrompt,
} from "@/lib/scraper/web-scraper";
import { generateDocumentSummaryPrompt } from "@/lib/parser/file-parser";

export interface StrategyGenerationResult {
  workspace: WorkspaceWithModules;
  strategy: GTMStrategy;
  error?: string;
}

/**
 * Main orchestrator - generates complete GTM strategy from onboarding data
 */
export async function generateCompleteStrategy(
  onboardingData: OnboardingData
): Promise<StrategyGenerationResult> {
  // Get AI provider config
  const aiConfig = getPreferredAIConfig();
  if (!aiConfig) {
    throw new Error(
      "No AI provider configured. Please add an API key in Settings."
    );
  }

  // Extract onboarding answers
  const companyName = getAnswerValue(onboardingData, "company_name") as string;
  const companyUrl = getAnswerValue(onboardingData, "company_website") as string | undefined;
  const industry = getAnswerValue(onboardingData, "industry") as string;
  const targetAudience = getAnswerValue(onboardingData, "target_audience") as string;
  const goals = getAnswerValue(onboardingData, "goals") as string[];
  const competitorsRaw = getAnswerValue(onboardingData, "competitors") as string | undefined;
  const budget = getAnswerValue(onboardingData, "budget") as string | undefined;
  const uniqueValue = getAnswerValue(onboardingData, "unique_value") as string;

  // Parse competitors (one per line)
  const competitors = competitorsRaw
    ? competitorsRaw.split("\n").filter((c) => c.trim())
    : [];

  // Build context from scraped website
  let websiteContext = "";
  if (onboardingData.scrapedWebsite) {
    websiteContext = extractInsightsFromScrapedData(
      onboardingData.scrapedWebsite
    );
  }

  // Build context from uploaded documents
  let documentContext = "";
  if (onboardingData.uploadedDocuments && onboardingData.uploadedDocuments.length > 0) {
    documentContext = generateDocumentSummaryPrompt(
      onboardingData.uploadedDocuments
    );
  }

  // Combine all context
  const additionalContext = [websiteContext, documentContext, uniqueValue]
    .filter(Boolean)
    .join("\n\n");

  // Build GTM strategy request
  const request: GTMStrategyRequest = {
    companyName,
    companyUrl,
    industry,
    targetAudience,
    goals: goals || [],
    competitors,
    budget,
    uploadedDocs: onboardingData.uploadedDocuments?.map((d) => d.fileName),
  };

  // Generate strategy using AI
  const strategy = await generateGTMStrategy(request, aiConfig);

  // Create workspace
  const workspace = createWorkspace(
    `${companyName} GTM Strategy`,
    companyName,
    companyUrl
  );

  // Store onboarding data and strategy in workspace
  updateWorkspace(workspace.id, {
    onboardingData,
    generatedStrategy: strategy,
  });

  // Convert strategy to modules and blocks
  await createStrategyModules(workspace.id, strategy);

  // Get updated workspace with modules
  const { getWorkspace } = await import("@/lib/storage/workspace-storage");
  const updatedWorkspace = getWorkspace(workspace.id);

  if (!updatedWorkspace) {
    throw new Error("Failed to retrieve created workspace");
  }

  return {
    workspace: updatedWorkspace,
    strategy,
  };
}

/**
 * Creates strategy modules from AI-generated strategy
 */
async function createStrategyModules(
  workspaceId: string,
  strategy: GTMStrategy
): Promise<void> {
  // 1. Summary Module
  const summaryModule: StrategyModule = {
    id: generateId(),
    workspaceId,
    type: StrategyModuleType.ICP_DEFINITION,
    title: "Strategy Overview",
    blocks: [
      createTextBlock(strategy.summary),
      createHeadingBlock("Ideal Customer Profile", 2),
      createTextBlock(strategy.icpDefinition.demographics),
      createTextBlock(strategy.icpDefinition.psychographics),
      createHeadingBlock("Pain Points", 3),
      ...strategy.icpDefinition.painPoints.map((p) =>
        createBulletBlock(p)
      ),
      createHeadingBlock("Channels", 3),
      ...strategy.icpDefinition.channels.map((c) => createBulletBlock(c)),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  addStrategyModule(workspaceId, summaryModule);

  // 2. Ambassador Program Module
  const ambassadorModule: StrategyModule = {
    id: generateId(),
    workspaceId,
    type: StrategyModuleType.AMBASSADOR_PROGRAM,
    title: "Student Ambassador Program",
    blocks: [
      createHeadingBlock("Ambassador Roles", 2),
      ...strategy.ambassadorProgram.roles.flatMap((role) => [
        createHeadingBlock(role.name, 3),
        createTextBlock(role.description),
        createTextBlock(
          `Compensation: ${role.compensation.type} - ${role.compensation.details}`
        ),
        createHeadingBlock("Responsibilities", 4),
        ...role.responsibilities.map((r) => createChecklistBlock(r, false)),
      ]),
      createHeadingBlock("Launch Tasks", 2),
      ...strategy.ambassadorProgram.launchTasks.map((task) =>
        createChecklistBlock(task, false)
      ),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  addStrategyModule(workspaceId, ambassadorModule);

  // 3. Content Calendar Module
  const contentModule: StrategyModule = {
    id: generateId(),
    workspaceId,
    type: StrategyModuleType.CONTENT_CALENDAR,
    title: "4-Week Content Calendar",
    blocks: strategy.contentCalendar.weeks.flatMap((week) => [
      createHeadingBlock(`Week ${week.week}: ${week.theme}`, 2),
      ...week.posts.map((post) =>
        createTextBlock(
          `Day ${post.day} - ${post.platform} (${post.contentType}): ${post.description}`
        )
      ),
    ]),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  addStrategyModule(workspaceId, contentModule);

  // 4. Outreach Scripts Module
  const outreachModule: StrategyModule = {
    id: generateId(),
    workspaceId,
    type: StrategyModuleType.OUTREACH_SCRIPTS,
    title: "Outreach Scripts",
    blocks: strategy.outreachScripts.flatMap((script) => [
      createHeadingBlock(script.channel, 3),
      createQuoteBlock(script.script),
      createTextBlock(`CTA: ${script.cta}`),
    ]),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  addStrategyModule(workspaceId, outreachModule);

  // 5. Virality Tactics Module
  const viralityModule: StrategyModule = {
    id: generateId(),
    workspaceId,
    type: StrategyModuleType.VIRALITY_ENGINE,
    title: "Campus Virality Tactics",
    blocks: strategy.viralityTactics.flatMap((tactic) => [
      createHeadingBlock(tactic.tactic, 3),
      createTextBlock(tactic.description),
      createHeadingBlock("Implementation", 4),
      createTextBlock(tactic.implementation),
    ]),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  addStrategyModule(workspaceId, viralityModule);
}

/**
 * Helper functions to create blocks
 */
function createTextBlock(content: string): Block {
  return {
    id: generateId(),
    type: BlockType.TEXT,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createHeadingBlock(content: string, level: 1 | 2 | 3): Block {
  const typeMap = {
    1: BlockType.HEADING_1,
    2: BlockType.HEADING_2,
    3: BlockType.HEADING_3,
  };

  return {
    id: generateId(),
    type: typeMap[level],
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createBulletBlock(content: string): Block {
  return {
    id: generateId(),
    type: BlockType.BULLET_LIST,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createChecklistBlock(content: string, checked: boolean): Block {
  return {
    id: generateId(),
    type: BlockType.CHECKLIST,
    content,
    metadata: { checked },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createQuoteBlock(content: string): Block {
  return {
    id: generateId(),
    type: BlockType.QUOTE,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
