import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { NotificationSettings } from '@/components/settings/NotificationSettings';

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      email: true,
      notificationPreferences: true,
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Notification Settings</h1>
      <Card className="p-6">
        <NotificationSettings user={user} />
      </Card>
    </div>
  );
}
