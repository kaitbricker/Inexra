import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
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
    redirect('/auth/signin');
  }

  // Transform the data to match the expected format
  const initialData = {
    conversations: user.conversations.map(conv => ({
      id: conv.id,
      status: conv.status,
      sentimentSummary: 0, // Default value since it's not in the schema
      engagementScore: 0, // Default value since it's not in the schema
      leadScore: 0, // Default value since it's not in the schema
      priority: 'LOW' as Priority, // Default value since it's not in the schema
      createdAt: conv.createdAt.toISOString(),
      keywords: [], // Default value since it's not in the schema
    })),
  };

  return (
    <Layout>
      <Dashboard initialData={initialData} />
    </Layout>
  );
} 