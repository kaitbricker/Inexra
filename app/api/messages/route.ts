import { NextRequest, NextResponse } from "next/server";

// Mock messages data
let messages = [
  { id: 1, sender: "JD", content: "Interested in enterprise pricing...", tag: "Leads", time: "2m ago" },
  { id: 2, sender: "MS", content: "Service disruption reported...", tag: "Complaints", time: "15m ago" },
];

export async function GET() {
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newMessage = { ...data, id: Date.now() };
  messages.push(newMessage);
  return NextResponse.json(newMessage, { status: 201 });
} 