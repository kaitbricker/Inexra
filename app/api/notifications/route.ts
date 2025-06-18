import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

let notifications = [
  { id: 1, type: "insight", message: "Pricing inquiries increased 32% this week.", read: false },
  { id: 2, type: "warning", message: "3 new complaints flagged as urgent.", read: false },
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // In a real implementation, you would:
    // 1. Fetch notifications from your database
    // 2. Filter notifications based on user preferences
    // 3. Sort by timestamp
    // 4. Apply pagination if needed

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  notifications = notifications.map(n => n.id === data.id ? { ...n, ...data } : n);
  return NextResponse.json({ success: true });
} 