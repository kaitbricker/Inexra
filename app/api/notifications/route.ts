import { NextRequest, NextResponse } from "next/server";

let notifications = [
  { id: 1, type: "insight", message: "Pricing inquiries increased 32% this week.", read: false },
  { id: 2, type: "warning", message: "3 new complaints flagged as urgent.", read: false },
];

export async function GET() {
  return NextResponse.json(notifications);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  notifications = notifications.map(n => n.id === data.id ? { ...n, ...data } : n);
  return NextResponse.json({ success: true });
} 