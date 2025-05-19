'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

interface NotificationSettingsProps {
  user: {
    id: string;
    email: string | null;
    notificationPreferences: NotificationPreferences | null;
  };
}

export function NotificationSettings({ user }: NotificationSettingsProps) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    user.notificationPreferences || {
      email: true,
      push: true,
      inApp: true,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="email"
            checked={preferences.email}
            onChange={() => handleToggle('email')}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="email">Email Notifications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="push"
            checked={preferences.push}
            onChange={() => handleToggle('push')}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="push">Push Notifications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="inApp"
            checked={preferences.inApp}
            onChange={() => handleToggle('inApp')}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="inApp">In-App Notifications</Label>
        </div>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
