import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

let settings = {
  fullName: "Jane Doe",
  email: "jane@brand.com",
  role: "Marketer",
  notifEmail: true,
  notifDigest: false,
  notifMentions: false,
};

export async function GET() {
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  settings = { ...settings, ...data };
  return NextResponse.json(settings);
} 