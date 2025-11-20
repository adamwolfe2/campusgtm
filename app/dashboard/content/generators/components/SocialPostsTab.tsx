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
  Clock,
  Hash,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  generateSocialPost,
  generateThreadCarousel,
  SocialPlatform,
  ToneType,
  type SocialPostVariation,
} from "@/app/actions/generate-social-posts";

export function SocialPostsTab() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<SocialPlatform>(SocialPlatform.TWITTER);
  const [tone, setTone] = useState<ToneType>(ToneType.CASUAL);
  const [contentType, setContentType] = useState<"single" | "multi">("single");
  const [slideCount, setSlideCount] = useState(5);
  const [results, setResults] = useState<SocialPostVariation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing topic",
        description: "Please enter a topic",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      if (contentType === "single") {
        const result = await generateSocialPost(topic, platform, tone);
        setResults(result.variations);
        toast({
          title: "Posts generated",
          description: `Created ${result.variations.length} variations`,
        });
      } else {
        const result = await generateThreadCarousel(topic, platform, slideCount);
        setResults(result.posts);
        toast({
          title: "Thread/Carousel generated",
          description: `Created ${result.posts.length} posts`,
        });
      }
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
      description: "Post copied successfully",
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

    const text = results
      .map((r, i) => {
        let output = `\n--- Post ${i + 1} ---\n`;
        output += `Hook: ${r.hook}\n`;
        output += `\n${r.content}\n`;
        output += `\nCTA: ${r.cta}\n`;
        if (r.hashtags && r.hashtags.length > 0) {
          output += `Hashtags: ${r.hashtags.join(" ")}\n`;
        }
        output += `Best Time: ${r.optimalPostingTime}\n`;
        return output;
      })
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `social-posts-${platform}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported successfully",
      description: "Posts exported to text file",
    });
  };

  const getPlatformIcon = (platformName: string) => {
    const icons: Record<string, string> = {
      twitter: "𝕏",
      linkedin: "in",
      instagram: "📷",
      tiktok: "🎵",
    };
    return icons[platformName] || "📱";
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={platform}
                onValueChange={(value) => setPlatform(value as SocialPlatform)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SocialPlatform.TWITTER}>
                    Twitter/X (280 chars)
                  </SelectItem>
                  <SelectItem value={SocialPlatform.LINKEDIN}>
                    LinkedIn (1300 chars)
                  </SelectItem>
                  <SelectItem value={SocialPlatform.INSTAGRAM}>
                    Instagram (2200 chars)
                  </SelectItem>
                  <SelectItem value={SocialPlatform.TIKTOK}>
                    TikTok (2200 chars)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={(value) => setTone(value as ToneType)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ToneType.PROFESSIONAL}>Professional</SelectItem>
                  <SelectItem value={ToneType.CASUAL}>Casual</SelectItem>
                  <SelectItem value={ToneType.PLAYFUL}>Playful</SelectItem>
                  <SelectItem value={ToneType.INSPIRATIONAL}>Inspirational</SelectItem>
                  <SelectItem value={ToneType.EDUCATIONAL}>Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="content-type">Content Type</Label>
            <Select
              value={contentType}
              onValueChange={(value) => setContentType(value as "single" | "multi")}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Post</SelectItem>
                <SelectItem value="multi">Thread/Carousel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {contentType === "multi" && (
            <div>
              <Label htmlFor="slides">Number of Posts/Slides (2-10)</Label>
              <Input
                id="slides"
                type="number"
                min={2}
                max={10}
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value) || 5)}
                className="mt-1.5"
              />
            </div>
          )}

          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., The power of student ambassadors, AI in marketing, campus GTM strategies"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
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
            {isGenerating ? "Generating..." : `Generate ${contentType === "single" ? "Posts" : "Thread/Carousel"}`}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {isGenerating && (
        <div className="space-y-3">
          {[...Array(contentType === "single" ? 3 : slideCount)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-1/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
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
                {results.length} {contentType === "single" ? "variations" : "posts"} generated
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={handleGenerate}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Post Cards */}
            {results.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-5 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getPlatformIcon(platform)}</span>
                      <div>
                        <Badge variant="secondary">
                          {contentType === "multi" ? `Post ${index + 1}` : post.variation || "Variation"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {post.characterCount} characters
                        </p>
                      </div>
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
                        onClick={() => copyToClipboard(post.content, index)}
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

                  {/* Hook */}
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">🪝 Hook:</p>
                    <p className="text-sm font-medium">{post.hook}</p>
                  </div>

                  {/* Content */}
                  <div className="bg-muted/30 rounded-lg p-4 mb-3">
                    <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* CTA */}
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">📢 CTA:</p>
                    <p className="text-sm font-medium">{post.cta}</p>
                  </div>

                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Hashtags:</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Best time: {post.optimalPostingTime}</span>
                    </div>
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
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Generate Your First Social Post</h3>
          <p className="text-muted-foreground mb-4">
            Create platform-optimized content with hooks, CTAs, and hashtags
          </p>
          <div className="text-sm text-muted-foreground text-left max-w-md mx-auto">
            <p className="font-medium mb-2">Example:</p>
            <ul className="space-y-1">
              <li>• <strong>Platform:</strong> Twitter/X</li>
              <li>• <strong>Tone:</strong> Casual</li>
              <li>• <strong>Topic:</strong> Why student ambassadors drive 10x ROI</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
