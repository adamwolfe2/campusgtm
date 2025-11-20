import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { email, role } = await req.json();

        if (!email || !role) {
            return new NextResponse("Email and role are required", { status: 400 });
        }

        // TODO: Check if user has permission to invite (is admin/owner)

        // TODO: Create invitation record in database

        // TODO: Send email via Resend
        console.log(`Inviting ${email} as ${role} by ${userId}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[TEAM_INVITE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
