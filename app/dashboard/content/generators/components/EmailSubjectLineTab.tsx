"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, RotateCw, Download, Star, Clock, AlertTriangle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  optimizeSubjectLine,
  type SubjectLineVariation,
} from "@/app/actions/generate-subject-lines";

export function EmailSubjectLineTab() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [results, setResults] = useState<SubjectLineVariation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!topic.trim() || !audience.trim() || !goal.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await optimizeSubjectLine(topic, audience, goal);
      setResults(result.variations);
      toast({
        title: "Subject lines generated",
        description: `Created ${result.variations.length} variations for you`,
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

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Subject line copied successfully",
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

  const exportResults = () => {
    if (results.length === 0) return;

    const csv = [
      ["Subject Line", "Category", "Open Rate", "Spam Risk", "Emotional Appeal", "Best Time"],
      ...results.map((r) => [
        r.subjectLine,
        r.category,
        `${r.performance.estimatedOpenRate}%`,
        r.performance.spamRisk,
        `${r.performance.emotionalAppeal}/100`,
        r.performance.bestSendTime,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subject-lines-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported successfully",
      description: "Subject lines exported to CSV",
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "curiosity-driven":
        return "bg-purple-500/10 text-purple-500";
      case "value-driven":
        return "bg-blue-500/10 text-blue-500";
      case "urgency-driven":
        return "bg-red-500/10 text-red-500";
      case "personalization-driven":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getSpamRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "high":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="topic">Email Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., New product launch, webinar invitation, newsletter signup"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              placeholder="e.g., College students, SaaS founders, marketing professionals"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="goal">Campaign Goal</Label>
            <Input
              id="goal"
              placeholder="e.g., Increase webinar signups, drive product trials, boost newsletter opens"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
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
            {isGenerating ? "Generating..." : "Generate Subject Lines"}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {isGenerating && (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {results.length > 0 && !isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Export Actions */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {results.length} variations generated
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleGenerate}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Subject Line Cards */}
            {results.map((variation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-5 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(variation.category)}>
                          {variation.category.replace("-", " ")}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-medium leading-tight">
                        {variation.subjectLine}
                      </h3>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(index)}
                        className="h-8 w-8"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            favorites.has(index) ? "fill-yellow-500 text-yellow-500" : ""
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(variation.subjectLine, index)}
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

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Open Rate</p>
                        <p className="text-sm font-semibold">
                          {variation.performance.estimatedOpenRate}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`h-4 w-4 ${getSpamRiskColor(
                          variation.performance.spamRisk
                        )}`}
                      />
                      <div>
                        <p className="text-xs text-muted-foreground">Spam Risk</p>
                        <p className="text-sm font-semibold capitalize">
                          {variation.performance.spamRisk}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Appeal</p>
                        <p className="text-sm font-semibold">
                          {variation.performance.emotionalAppeal}/100
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Best Time</p>
                        <p className="text-sm font-semibold capitalize">
                          {variation.performance.bestSendTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      💡 Why this works:
                    </p>
                    <p className="text-sm">{variation.performance.reasoning}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {results.length === 0 && !isGenerating && (
        <Card className="p-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Generate Your First Subject Lines</h3>
          <p className="text-muted-foreground mb-4">
            Fill in the form above to create 10 optimized email subject lines with
            performance predictions
          </p>
          <div className="text-sm text-muted-foreground text-left max-w-md mx-auto">
            <p className="font-medium mb-2">Example:</p>
            <ul className="space-y-1">
              <li>• <strong>Topic:</strong> Free GTM strategy workshop</li>
              <li>• <strong>Audience:</strong> SaaS founders</li>
              <li>• <strong>Goal:</strong> Get 100+ signups</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
