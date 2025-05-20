export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// Debug logging
console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 20) + '...');
console.log('DIRECT_URL:', process.env.DIRECT_URL?.substring(0, 20) + '...');

type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

interface ConversationData {
  id: string;
  status: string;
  leadScore: number | null;
  priority: string | null;
  createdAt: Date;
  messages: Array<{
    id: string;
    metadata: any;
  }>;
}

export default async function DashboardPage() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('No session or user ID found');
      redirect('/auth/signin');
    }

    // Fetch initial data for the dashboard
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        conversations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) {
      console.error('User not found in database');
      redirect('/auth/signin');
    }

    // Transform the data to match the expected format
    const initialData = {
      conversations: user.conversations.map(conv => {
        // Ensure priority is one of the valid values
        const priority = (conv as any).priority?.toUpperCase() as Priority;
        const validPriority = priority && ['HIGH', 'MEDIUM', 'LOW'].includes(priority) 
          ? priority 
          : 'LOW';

        // Get the latest message for sentiment and engagement
        const latestMessage = conv.messages[0];
        const metadata = (latestMessage as any)?.metadata as { sentimentScore?: number; engagementScore?: number; keywords?: string[] } | null;
        const sentimentScore = metadata?.sentimentScore ?? 0;
        const engagementScore = metadata?.engagementScore ?? 0;
        const keywords = metadata?.keywords ?? [];

        return {
          id: conv.id,
          status: conv.status || 'active',
          sentimentSummary: sentimentScore,
          engagementScore: engagementScore,
          leadScore: (conv as any).leadScore ?? 0,
          priority: validPriority,
          createdAt: conv.createdAt.toISOString(),
          keywords,
        };
      }),
    };

    return (
      <Layout>
        <Dashboard initialData={initialData} />
      </Layout>
    );
  } catch (error) {
    console.error('Error in dashboard page:', error);
    // Return a more user-friendly error page
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600">Please try refreshing the page or contact support if the problem persists.</p>
          </div>
        </div>
      </Layout>
    );
  }
} 