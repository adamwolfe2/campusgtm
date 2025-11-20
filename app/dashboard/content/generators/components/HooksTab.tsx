"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Copy,
  Check,
  RotateCw,
  Download,
  Star,
  Zap,
  TrendingUp,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  generateHooks,
  analyzeHook,
  ContentType,
  type HookVariation,
  type HookAnalysis,
} from "@/app/actions/generate-hooks";

export function HooksTab() {
  const [mode, setMode] = useState<"generate" | "analyze">("generate");

  // Generate mode state
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState<ContentType>(ContentType.SOCIAL_POST);
  const [targetAudience, setTargetAudience] = useState("");
  const [hooks, setHooks] = useState<HookVariation[]>([]);

  // Analyze mode state
  const [hookToAnalyze, setHookToAnalyze] = useState("");
  const [analysis, setAnalysis] = useState<HookAnalysis | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!topic.trim() || !targetAudience.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateHooks(topic, contentType, targetAudience);
      setHooks(result.hooks);
      toast({
        title: "Hooks generated",
        description: `Created ${result.hooks.length} variations`,
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!hookToAnalyze.trim()) {
      toast({
        title: "Missing hook",
        description: "Please enter a hook to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await analyzeHook(hookToAnalyze);
      setAnalysis(result);
      toast({
        title: "Analysis complete",
        description: "Hook analysis ready",
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Hook copied successfully",
    });
  };

  const toggleFavorite = (index: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(index)) {
      newFavorites.delete(index);
    } else {
      newFavorites.add(index);
    }
    setFavorites(newFavorites);
  };

  const exportHooks = () => {
    if (hooks.length === 0) return;

    const csv = [
      ["Hook", "Category", "Emotional Trigger", "Strength Score", "Explanation"],
      ...hooks.map((h) => [
        h.hook,
        h.category,
        h.emotionalTrigger,
        h.strengthScore.toString(),
        h.explanation,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hooks-${contentType}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported successfully",
      description: "Hooks exported to CSV",
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "question":
        return "bg-blue-500/10 text-blue-500";
      case "statement":
        return "bg-purple-500/10 text-purple-500";
      case "story":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      curiosity: "bg-yellow-500/10 text-yellow-500",
      fear: "bg-red-500/10 text-red-500",
      desire: "bg-pink-500/10 text-pink-500",
      surprise: "bg-orange-500/10 text-orange-500",
      urgency: "bg-red-500/10 text-red-500",
      belonging: "bg-green-500/10 text-green-500",
      validation: "bg-blue-500/10 text-blue-500",
    };
    return colors[emotion] || "bg-gray-500/10 text-gray-500";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as "generate" | "analyze")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Hooks
          </TabsTrigger>
          <TabsTrigger value="analyze">
            <Search className="h-4 w-4 mr-2" />
            Analyze Hook
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="mt-6 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="content-type">Content Type</Label>
                <Select
                  value={contentType}
                  onValueChange={(value) => setContentType(value as ContentType)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ContentType.SOCIAL_POST}>Social Post</SelectItem>
                    <SelectItem value={ContentType.BLOG}>Blog Article</SelectItem>
                    <SelectItem value={ContentType.VIDEO}>Video Content</SelectItem>
                    <SelectItem value={ContentType.EMAIL}>Email</SelectItem>
                    <SelectItem value={ContentType.PRESENTATION}>
                      Presentation
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Why student ambassadors outperform paid ads"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g., SaaS founders, college students, marketing professionals"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full gap-2"
                size="lg"
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate 15 Hooks"}
              </Button>
            </div>
          </Card>

          {/* Results */}
          {isGenerating && mode === "generate" && (
            <div className="space-y-3">
              {[...Array(15)].map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </Card>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {hooks.length > 0 && !isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {hooks.length} hooks generated
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportHooks}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGenerate}>
                      <RotateCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </div>

                {hooks.map((hook, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(hook.category)}>
                            {hook.category}
                          </Badge>
                          <Badge className={getEmotionColor(hook.emotionalTrigger)}>
                            {hook.emotionalTrigger}
                          </Badge>
                        </div>

                        <div className="flex gap-1">
                          <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
                            <TrendingUp
                              className={`h-4 w-4 ${getScoreColor(hook.strengthScore)}`}
                            />
                            <span
                              className={`text-sm font-semibold ${getScoreColor(
                                hook.strengthScore
                              )}`}
                            >
                              {hook.strengthScore}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(index)}
                            className="h-8 w-8"
                          >
                            <Star
                              className={`h-4 w-4 ${
                                favorites.has(index)
                                  ? "fill-yellow-500 text-yellow-500"
                                  : ""
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(hook.hook, index)}
                            className="h-8 w-8"
                          >
                            {copiedIndex === index ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-lg font-medium leading-tight">{hook.hook}</p>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">💡 Why this works:</p>
                        <p className="text-sm">{hook.explanation}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {hooks.length === 0 && !isGenerating && (
            <Card className="p-12 text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Generate Your First Hooks</h3>
              <p className="text-muted-foreground mb-4">
                Create 15 powerful hooks optimized for your content type and audience
              </p>
              <div className="text-sm text-muted-foreground text-left max-w-md mx-auto">
                <p className="font-medium mb-2">Example:</p>
                <ul className="space-y-1">
                  <li>
                    • <strong>Content Type:</strong> Social Post
                  </li>
                  <li>
                    • <strong>Topic:</strong> Student ambassadors drive 10x ROI
                  </li>
                  <li>
                    • <strong>Audience:</strong> B2B SaaS founders
                  </li>
                </ul>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Analyze Tab */}
        <TabsContent value="analyze" className="mt-6 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="hook-analyze">Hook to Analyze</Label>
                <Textarea
                  id="hook-analyze"
                  placeholder="Paste your hook here to get detailed analysis and improvement suggestions"
                  value={hookToAnalyze}
                  onChange={(e) => setHookToAnalyze(e.target.value)}
                  className="mt-1.5 min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isGenerating}
                className="w-full gap-2"
                size="lg"
              >
                <Search className="h-4 w-4" />
                {isGenerating ? "Analyzing..." : "Analyze Hook"}
              </Button>
            </div>
          </Card>

          {isGenerating && mode === "analyze" && (
            <Card className="p-6">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          )}

          {analysis && !isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Analysis Results</h3>
                  <div className="flex items-center gap-2">
                    <TrendingUp
                      className={`h-6 w-6 ${getScoreColor(analysis.strengthScore)}`}
                    />
                    <span
                      className={`text-2xl font-bold ${getScoreColor(
                        analysis.strengthScore
                      )}`}
                    >
                      {analysis.strengthScore}/100
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Primary Emotional Trigger:</p>
                    <Badge className={getEmotionColor(analysis.emotionalTrigger)}>
                      {analysis.emotionalTrigger}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Analysis:</p>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm">{analysis.reasoning}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Improvement Suggestions:</p>
                    <ul className="space-y-2">
                      {analysis.improvementSuggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {analysis.improvedVersion && (
                    <div>
                      <p className="text-sm font-medium mb-2">Improved Version:</p>
                      <div className="bg-primary/10 rounded-lg p-4 border-l-4 border-primary">
                        <p className="text-sm font-medium">{analysis.improvedVersion}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {!analysis && !isGenerating && (
            <Card className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Analyze Your Hook</h3>
              <p className="text-muted-foreground">
                Get detailed feedback on hook strength, emotional triggers, and improvement
                suggestions
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
