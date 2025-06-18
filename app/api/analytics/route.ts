import { NextResponse } from "next/server";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET() {
  // Mock analytics data
  const data = {
    totalMessages: 64,
    leads: 18,
    complaints: 7,
    insights: 5,
    sentiment: [
      { label: "Positive", value: 65 },
      { label: "Neutral", value: 22 },
      { label: "Negative", value: 13 },
    ],
  };
  return NextResponse.json(data);
} 