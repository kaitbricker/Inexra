import { NextResponse } from "next/server";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET() {
  // Mocked dashboard stats data
  const data = {
    totalMessages: 64,
    totalLeads: 18,
    totalComplaints: 7,
    totalInsights: 5,
    sentimentBreakdown: {
      positive: 65,
      neutral: 22,
      negative: 13,
    },
    aiInsight: "You've seen a spike in positive sentiment this week. Most messages are related to new pricing inquiries.",
    platformHealth: {
      avgResponseTime: "2h 14m",
      messagesResolved: 82,
      slaBreaches: 3,
      customerSatisfaction: 92,
    },
  };
  return NextResponse.json(data);
} 