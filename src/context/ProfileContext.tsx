import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchWithAuth } from '../api';
import { useAuth } from './AuthContext';

interface Profile {
  full_name: string;
  professional_title: string;
  avatar_url: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const data = await fetchWithAuth('/manager/profile');
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          professional_title: data.professional_title || '',
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [user]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
