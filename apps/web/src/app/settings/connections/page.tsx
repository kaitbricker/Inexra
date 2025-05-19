import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { InstagramConnection } from '@/components/settings/InstagramConnection';
import { redirect } from 'next/navigation';
import { getInstagramConnection } from './actions';

export default async function ConnectionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const { isConnected, username } = await getInstagramConnection();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Social Connections</h1>
      <div className="space-y-4">
        <InstagramConnection
          isConnected={isConnected}
          username={username}
          onDisconnect={async () => {
            'use server';
            const { disconnectInstagram } = await import('./actions');
            await disconnectInstagram();
          }}
        />
      </div>
    </div>
  );
}
