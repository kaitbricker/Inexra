import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InboxView } from '@/components/inbox/InboxView';

export default async function InboxPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Get all conversations for the user
  const conversations = await prisma.conversation.findMany({
    where: {
      messages: {
        some: {
          socialAccount: {
            userId: session.user.id,
          },
        },
      },
    },
    include: {
      messages: {
        orderBy: {
          timestamp: 'desc',
        },
        take: 1,
        include: {
          socialAccount: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Inbox</h1>
      <InboxView conversations={conversations} />
    </div>
  );
}
