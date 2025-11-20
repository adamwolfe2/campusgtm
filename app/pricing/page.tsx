"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Mock Price IDs - In production these would be env vars or fetched from DB
const PRICE_IDS = {
    STARTER: "price_starter_mock_id",
    GROWTH: "price_1Qd...", // Replace with actual Stripe Price ID
    CAMPUS: "price_campus_mock_id",
};

export default function PricingPage() {
    const router = useRouter();

    const handleCheckout = async (priceId: string) => {
        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    priceId,
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error("Please sign in to upgrade");
                    router.push("/sign-in");
                    return;
                }
                throw new Error("Failed to start checkout");
            }

            const data = await response.json();
            window.location.href = data.url;
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="container mx-auto py-24">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h1>
                <p className="text-xl text-muted-foreground">
                    Choose the plan that's right for your campus growth strategy.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Starter Plan */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Starter</CardTitle>
                        <CardDescription>For early-stage startups testing the waters.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-3xl font-bold mb-6">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                <span>1 Workspace</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                <span>Basic Strategy Generation</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                <span>Export to Markdown</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline" onClick={() => router.push("/sign-up")}>Get Started</Button>
                    </CardFooter>
                </Card>

                {/* Growth Plan */}
                <Card className="flex flex-col border-primary relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                    </div>
                    <CardHeader>
                        <CardTitle>Growth</CardTitle>
                        <CardDescription>For scaling ambassador programs.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-3xl font-bold mb-6">$49<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                <span>5 Workspaces</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                <span>Advanced AI Models (GPT-4)</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                <span>PDF Export</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                <span>Priority Support</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => handleCheckout(PRICE_IDS.GROWTH)}>Upgrade to Growth</Button>
                    </CardFooter>
                </Card>

                {/* Campus Plan */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Campus</CardTitle>
                        <CardDescription>For large-scale university deployments.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-3xl font-bold mb-6">$199<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                <span>Unlimited Workspaces</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                <span>Custom AI Fine-tuning</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                <span>Team Collaboration</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                <span>Dedicated Success Manager</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline" onClick={() => router.push("/contact")}>Contact Sales</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
