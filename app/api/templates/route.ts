import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

let templates = [
  { id: 1, title: "Welcome Reply", body: "Hi there! Thanks for reaching out.", tags: ["Welcome"] },
  { id: 2, title: "Pricing Info", body: "Our pricing starts at $99/mo. Let me know if you have questions!", tags: ["Pricing"] },
];

export async function GET() {
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newTemplate = { ...data, id: Date.now() };
  templates.push(newTemplate);
  return NextResponse.json(newTemplate, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  templates = templates.filter(t => t.id !== id);
  return NextResponse.json({ success: true });
} 