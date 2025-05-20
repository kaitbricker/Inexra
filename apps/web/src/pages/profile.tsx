import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ProfileSettings from '../components/Profile/ProfileSettings';
import useProfileSettings from '@/hooks/useProfileSettings';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

const ProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { profile, loading, error, updateProfile } = useProfileSettings();

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profile) {
    return <div>No profile data available</div>;
  }

  // Transform Profile to UserProfile format
  const userProfile = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
    preferences: {
      emailNotifications: profile.settings.notifications.email,
      pushNotifications: profile.settings.notifications.push,
      darkMode: profile.settings.theme === 'dark',
      language: profile.settings.language,
    },
  };

  const handleSave = async (updates: Partial<typeof userProfile>) => {
    if (!profile.id) return;
    
    const transformedUpdates: Partial<typeof profile> = {
      name: updates.name,
      email: updates.email,
      settings: {
        notifications: {
          email: updates.preferences?.emailNotifications ?? profile.settings.notifications.email,
          push: updates.preferences?.pushNotifications ?? profile.settings.notifications.push,
        },
        theme: updates.preferences?.darkMode ? 'dark' : 'light',
        language: updates.preferences?.language ?? profile.settings.language,
      },
    };

    await updateProfile(profile.id, transformedUpdates);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      <ProfileSettings profile={userProfile} onSave={handleSave} />
    </div>
  );
};

export default ProfilePage;
