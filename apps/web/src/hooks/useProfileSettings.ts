import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../services/api';
import useWebSocket from './useWebSocket';

interface Profile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
    };
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  apiKeys: Array<{
    id: string;
    name: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface UseProfileSettingsReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (id: string) => Promise<void>;
  updateProfile: (id: string, data: Partial<Profile>) => Promise<Profile>;
  updateSettings: (id: string, settings: Partial<Profile['settings']>) => Promise<Profile>;
  createApiKey: (id: string) => Promise<{ id: string; key: string }>;
  deleteApiKey: (id: string, keyId: string) => Promise<void>;
}

const useProfileSettings = (): UseProfileSettingsReturn => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscribe } = useWebSocket();

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe('profile:update', data => {
      setProfile(currentProfile =>
        currentProfile && currentProfile.id === data.id
          ? { ...currentProfile, ...data }
          : currentProfile
      );
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  const fetchProfile = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getUser(id);
      setProfile(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (id: string, data: Partial<Profile>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.updateUser(id, data);
      setProfile(currentProfile =>
        currentProfile && currentProfile.id === id
          ? { ...currentProfile, ...response.data }
          : currentProfile
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (id: string, settings: Partial<Profile['settings']>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.updateUserSettings(id, { settings });
      setProfile(currentProfile =>
        currentProfile && currentProfile.id === id
          ? { ...currentProfile, settings: { ...currentProfile.settings, ...settings } }
          : currentProfile
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createApiKey = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.createApiKey(id);
      setProfile(currentProfile =>
        currentProfile && currentProfile.id === id
          ? {
              ...currentProfile,
              apiKeys: [...currentProfile.apiKeys, response.data],
            }
          : currentProfile
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteApiKey = useCallback(async (id: string, keyId: string) => {
    try {
      setLoading(true);
      setError(null);
      await userApi.deleteApiKey(id, keyId);
      setProfile(currentProfile =>
        currentProfile && currentProfile.id === id
          ? {
              ...currentProfile,
              apiKeys: currentProfile.apiKeys.filter(key => key.id !== keyId),
            }
          : currentProfile
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateSettings,
    createApiKey,
    deleteApiKey,
  };
};

export default useProfileSettings;
