import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";

const settingsUrl = process.env.NEXT_PUBLIC_APP_URL + "/settings";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { priceId } = await req.json();

        if (!priceId) {
            return new NextResponse("Price ID is required", { status: 400 });
        }

        // Check if user already has a stripe customer id
        // In a real app, we would store this in our DB. 
        // For now, we'll search Stripe or create a new one.
        // Optimization: Store stripeCustomerId in publicMetadata of Clerk user
        let stripeCustomerId = user.publicMetadata.stripeCustomerId as string | undefined;

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.emailAddresses[0].emailAddress,
                metadata: {
                    userId,
                },
            });
            stripeCustomerId = customer.id;

            // Update Clerk user metadata (this requires Clerk Backend API key)
            // For this MVP, we might skip updating Clerk if we don't have the key set up, 
            // but ideally we should.
        }

        const stripeSession = await stripe.checkout.sessions.create({
            success_url: settingsUrl,
            cancel_url: settingsUrl,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer: stripeCustomerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: {
                userId,
            },
        });

        return NextResponse.json({ url: stripeSession.url });
    } catch (error) {
        console.error("[STRIPE_CHECKOUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
