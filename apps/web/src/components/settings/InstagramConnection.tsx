'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Instagram } from 'lucide-react';
import { getInstagramAuthUrl } from '@/config/instagram';
import { useRouter } from 'next/navigation';

interface InstagramConnectionProps {
  isConnected: boolean;
  username?: string;
  onDisconnect: () => Promise<void>;
}

export function InstagramConnection({
  isConnected,
  username,
  onDisconnect,
}: InstagramConnectionProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}/api/auth/instagram/callback`;
      const authUrl = getInstagramAuthUrl(redirectUri);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting Instagram:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await onDisconnect();
      router.refresh();
    } catch (error) {
      console.error('Error disconnecting Instagram:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Instagram className="h-8 w-8 text-pink-600" />
          <div>
            <h3 className="text-lg font-semibold">Instagram</h3>
            {isConnected && username && (
              <p className="text-sm text-gray-500">Connected as @{username}</p>
            )}
          </div>
        </div>
        {isConnected ? (
          <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading}>
            {isLoading ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        ) : (
          <Button variant="default" onClick={handleConnect} disabled={isLoading}>
            {isLoading ? 'Connecting...' : 'Connect'}
          </Button>
        )}
      </div>
    </Card>
  );
}
