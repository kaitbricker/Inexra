'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Moon, Sun } from 'lucide-react';

interface UserPreferencesProps {
  onSave: (preferences: UserPreferences) => Promise<void>;
  initialPreferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  automation: {
    enabled: boolean;
    sensitivity: number;
  };
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    desktop: true,
  },
  automation: {
    enabled: true,
    sensitivity: 50,
  },
};

export function UserPreferences({
  onSave,
  initialPreferences = defaultPreferences,
}: UserPreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(preferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Theme</h3>
        <div className="flex items-center space-x-4">
          <Button
            variant={preferences.theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreferences({ ...preferences, theme: 'light' })}
          >
            <Sun className="h-4 w-4 mr-2" />
            Light
          </Button>
          <Button
            variant={preferences.theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
          >
            <Moon className="h-4 w-4 mr-2" />
            Dark
          </Button>
          <Button
            variant={preferences.theme === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreferences({ ...preferences, theme: 'system' })}
          >
            System
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={preferences.notifications.email}
              onCheckedChange={checked =>
                setPreferences({
                  ...preferences,
                  notifications: { ...preferences.notifications, email: checked },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Switch
              id="push-notifications"
              checked={preferences.notifications.push}
              onCheckedChange={checked =>
                setPreferences({
                  ...preferences,
                  notifications: { ...preferences.notifications, push: checked },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
            <Switch
              id="desktop-notifications"
              checked={preferences.notifications.desktop}
              onCheckedChange={checked =>
                setPreferences({
                  ...preferences,
                  notifications: { ...preferences.notifications, desktop: checked },
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Automation</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="automation-enabled">Enable Automation</Label>
            <Switch
              id="automation-enabled"
              checked={preferences.automation.enabled}
              onCheckedChange={checked =>
                setPreferences({
                  ...preferences,
                  automation: { ...preferences.automation, enabled: checked },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="automation-sensitivity">Automation Sensitivity</Label>
            <Slider
              id="automation-sensitivity"
              value={[preferences.automation.sensitivity]}
              onValueChange={([value]) =>
                setPreferences({
                  ...preferences,
                  automation: { ...preferences.automation, sensitivity: value },
                })
              }
              min={0}
              max={100}
              step={1}
              disabled={!preferences.automation.enabled}
            />
            <p className="text-sm text-muted-foreground">
              Adjust how sensitive the automation system is to triggers
            </p>
          </div>
        </div>
      </div>

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}
