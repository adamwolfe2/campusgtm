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
  Mail,
  MessageCircle,
  Reply,
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
  generateColdEmail,
  generateDMScript,
  generateCommentReply,
  OutreachPlatform,
  OutreachTone,
  type ColdEmailVariation,
  type DMScript,
  type CommentReply,
} from "@/app/actions/generate-outreach";

type OutreachType = "email" | "dm" | "comment";

export function OutreachScriptsTab() {
  const [outreachType, setOutreachType] = useState<OutreachType>("email");
  const [tone, setTone] = useState<OutreachTone>(OutreachTone.FRIENDLY);

  // Email state
  const [recipientInfo, setRecipientInfo] = useState("");
  const [goal, setGoal] = useState("");
  const [companyContext, setCompanyContext] = useState("");
  const [emailResults, setEmailResults] = useState<ColdEmailVariation[]>([]);

  // DM state
  const [dmPlatform, setDmPlatform] = useState<OutreachPlatform>(OutreachPlatform.LINKEDIN);
  const [dmContext, setDmContext] = useState("");
  const [dmResult, setDmResult] = useState<DMScript | null>(null);

  // Comment state
  const [originalComment, setOriginalComment] = useState("");
  const [commentGoal, setCommentGoal] = useState("");
  const [commentResult, setCommentResult] = useState<CommentReply | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const handleGenerateEmail = async () => {
    if (!recipientInfo.trim() || !goal.trim() || !companyContext.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateColdEmail(recipientInfo, goal, companyContext, tone);
      setEmailResults(result.variations);
      toast({
        title: "Emails generated",
        description: `Created ${result.variations.length} variations`,
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

  const handleGenerateDM = async () => {
    if (!dmContext.trim()) {
      toast({
        title: "Missing context",
        description: "Please provide context for the DM",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateDMScript(dmPlatform, dmContext, tone);
      setDmResult(result);
      toast({
        title: "DM script generated",
        description: "Your personalized DM is ready",
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

  const handleGenerateComment = async () => {
    if (!originalComment.trim() || !commentGoal.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateCommentReply(originalComment, commentGoal, tone);
      setCommentResult(result);
      toast({
        title: "Reply generated",
        description: "Your comment reply is ready",
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

  const copyToClipboard = (text: string, index: number = 0) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Text copied successfully",
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

  const exportEmailResults = () => {
    if (emailResults.length === 0) return;

    const text = emailResults
      .map((email, i) => {
        let output = `\n=== Email ${i + 1}: ${email.variation} ===\n`;
        output += `Subject: ${email.subject}\n\n`;
        output += `${email.body}\n\n`;
        output += `Personalization Tokens: ${email.personalizationTokens.join(", ")}\n`;
        output += `Word Count: ${email.wordCount}\n`;
        return output;
      })
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cold-emails-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported successfully",
      description: "Emails exported to text file",
    });
  };

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <Tabs value={outreachType} onValueChange={(v) => setOutreachType(v as OutreachType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Cold Email
          </TabsTrigger>
          <TabsTrigger value="dm">
            <MessageCircle className="h-4 w-4 mr-2" />
            DM Script
          </TabsTrigger>
          <TabsTrigger value="comment">
            <Reply className="h-4 w-4 mr-2" />
            Comment Reply
          </TabsTrigger>
        </TabsList>

        {/* Cold Email Tab */}
        <TabsContent value="email" className="mt-6 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select
                  value={tone}
                  onValueChange={(value) => setTone(value as OutreachTone)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OutreachTone.FRIENDLY}>Friendly</SelectItem>
                    <SelectItem value={OutreachTone.PROFESSIONAL}>Professional</SelectItem>
                    <SelectItem value={OutreachTone.CASUAL}>Casual</SelectItem>
                    <SelectItem value={OutreachTone.AUTHORITATIVE}>Authoritative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="recipient">Recipient Information</Label>
                <Textarea
                  id="recipient"
                  placeholder="e.g., Sarah Chen, Marketing Director at TechCorp, recently posted about student marketing"
                  value={recipientInfo}
                  onChange={(e) => setRecipientInfo(e.target.value)}
                  className="mt-1.5 min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="goal">Outreach Goal</Label>
                <Input
                  id="goal"
                  placeholder="e.g., Book a 15-min demo call, get feedback on our product"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="company">Your Company Context</Label>
                <Textarea
                  id="company"
                  placeholder="e.g., Campus GTM - AI-powered student ambassador platform, helping B2B SaaS scale on campus"
                  value={companyContext}
                  onChange={(e) => setCompanyContext(e.target.value)}
                  className="mt-1.5 min-h-[80px]"
                />
              </div>

              <Button
                onClick={handleGenerateEmail}
                disabled={isGenerating}
                className="w-full gap-2"
                size="lg"
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Cold Emails"}
              </Button>
            </div>
          </Card>

          {/* Email Results */}
          {isGenerating && outreachType === "email" && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-6 w-1/2 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {emailResults.length > 0 && !isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {emailResults.length} variations generated
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportEmailResults}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGenerateEmail}>
                      <RotateCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </div>

                {emailResults.map((email, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className="capitalize">{email.variation}</Badge>
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
                            onClick={() =>
                              copyToClipboard(`${email.subject}\n\n${email.body}`, index)
                            }
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
                        <p className="text-xs text-muted-foreground mb-1">Subject Line:</p>
                        <p className="text-sm font-medium">{email.subject}</p>
                      </div>

                      <div className="bg-muted/30 rounded-lg p-4 mb-3">
                        <p className="text-sm whitespace-pre-wrap">{email.body}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                        <span>{email.wordCount} words</span>
                        <span>•</span>
                        <span>
                          Tokens: {email.personalizationTokens.join(", ")}
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {emailResults.length === 0 && !isGenerating && (
            <Card className="p-12 text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Generate Cold Emails</h3>
              <p className="text-muted-foreground">
                Create 3 personalized variations: direct, story-based, and question-based
              </p>
            </Card>
          )}
        </TabsContent>

        {/* DM Script Tab */}
        <TabsContent value="dm" className="mt-6 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dm-platform">Platform</Label>
                  <Select
                    value={dmPlatform}
                    onValueChange={(value) => setDmPlatform(value as OutreachPlatform)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OutreachPlatform.LINKEDIN}>LinkedIn</SelectItem>
                      <SelectItem value={OutreachPlatform.INSTAGRAM}>Instagram</SelectItem>
                      <SelectItem value={OutreachPlatform.TWITTER}>Twitter/X</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dm-tone">Tone</Label>
                  <Select
                    value={tone}
                    onValueChange={(value) => setTone(value as OutreachTone)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OutreachTone.FRIENDLY}>Friendly</SelectItem>
                      <SelectItem value={OutreachTone.PROFESSIONAL}>Professional</SelectItem>
                      <SelectItem value={OutreachTone.CASUAL}>Casual</SelectItem>
                      <SelectItem value={OutreachTone.AUTHORITATIVE}>
                        Authoritative
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="dm-context">Context / Reason for Reaching Out</Label>
                <Textarea
                  id="dm-context"
                  placeholder="e.g., Saw their post about student marketing challenges, want to share insights from our student ambassador network"
                  value={dmContext}
                  onChange={(e) => setDmContext(e.target.value)}
                  className="mt-1.5 min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleGenerateDM}
                disabled={isGenerating}
                className="w-full gap-2"
                size="lg"
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate DM Script"}
              </Button>
            </div>
          </Card>

          {isGenerating && outreachType === "dm" && (
            <Card className="p-4">
              <Skeleton className="h-6 w-1/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          )}

          {dmResult && !isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <Badge>{dmResult.platform.toUpperCase()}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(dmResult.script, 0)}
                    className="h-8 w-8"
                  >
                    {copiedIndex === 0 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">Initial DM:</p>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{dmResult.script}</p>
                  </div>
                </div>

                {dmResult.followUpMessage && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Follow-up (if no response):
                    </p>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm whitespace-pre-wrap">{dmResult.followUpMessage}</p>
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-3 border-t">
                  {dmResult.characterCount} characters • {dmResult.tone} tone
                </div>
              </Card>
            </motion.div>
          )}

          {!dmResult && !isGenerating && (
            <Card className="p-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Generate DM Script</h3>
              <p className="text-muted-foreground">
                Platform-specific DMs that feel authentic and get responses
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Comment Reply Tab */}
        <TabsContent value="comment" className="mt-6 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="comment-tone">Tone</Label>
                <Select
                  value={tone}
                  onValueChange={(value) => setTone(value as OutreachTone)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OutreachTone.FRIENDLY}>Friendly</SelectItem>
                    <SelectItem value={OutreachTone.PROFESSIONAL}>Professional</SelectItem>
                    <SelectItem value={OutreachTone.CASUAL}>Casual</SelectItem>
                    <SelectItem value={OutreachTone.AUTHORITATIVE}>Authoritative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="original-comment">Original Comment</Label>
                <Textarea
                  id="original-comment"
                  placeholder="Paste the comment you want to reply to..."
                  value={originalComment}
                  onChange={(e) => setOriginalComment(e.target.value)}
                  className="mt-1.5 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="comment-goal">Reply Goal</Label>
                <Input
                  id="comment-goal"
                  placeholder="e.g., Build relationship, drive to blog post, offer help"
                  value={commentGoal}
                  onChange={(e) => setCommentGoal(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <Button
                onClick={handleGenerateComment}
                disabled={isGenerating}
                className="w-full gap-2"
                size="lg"
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Reply"}
              </Button>
            </div>
          </Card>

          {isGenerating && outreachType === "comment" && (
            <Card className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          )}

          {commentResult && !isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold">Your Reply:</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(commentResult.reply, 0)}
                    className="h-8 w-8"
                  >
                    {copiedIndex === 0 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <p className="text-sm whitespace-pre-wrap">{commentResult.reply}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">✅ Acknowledgment:</p>
                    <p>{commentResult.acknowledgment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">💡 Value Added:</p>
                    <p>{commentResult.value}</p>
                  </div>
                  {commentResult.cta && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">📢 CTA:</p>
                      <p>{commentResult.cta}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {!commentResult && !isGenerating && (
            <Card className="p-12 text-center">
              <Reply className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Generate Comment Reply</h3>
              <p className="text-muted-foreground">
                Smart replies that add value and build relationships
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
