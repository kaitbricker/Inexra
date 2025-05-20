'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

interface ProfileSettingsProps {
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => Promise<void>;
}

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  },
  error: {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  },
} as const;

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
] as const;

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onSave }) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [preferences, setPreferences] = useState(profile.preferences);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSave({
        name: name.trim(),
        email: email.trim(),
        preferences,
      });
    } catch (err) {
      setError('Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  }, [name, email, preferences, onSave]);

  const handlePreferenceChange = useCallback((key: keyof UserProfile['preferences'], value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your account settings and preferences</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <motion.div
                variants={ANIMATION_VARIANTS.error}
                animate="shake"
                className="text-red-500 text-center"
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={isLoading}
              />
            </motion.div>

            <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </motion.div>

            <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-4">
              <h3 className="text-lg font-medium">Preferences</h3>

              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <Switch
                  id="emailNotifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <Switch
                  id="pushNotifications"
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="darkMode">Dark Mode</Label>
                <Switch
                  id="darkMode"
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => handlePreferenceChange('darkMode', checked)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  disabled={isLoading}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

ProfileSettings.displayName = 'ProfileSettings';

export default ProfileSettings;
