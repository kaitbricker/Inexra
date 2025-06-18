import { NextRequest, NextResponse } from "next/server";
import { getTagsFromClaude } from "@/lib/ai/claudeTagger";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const tags = await getTagsFromClaude(message);
    
    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error testing Claude:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
} 