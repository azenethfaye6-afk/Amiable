import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole, ApplicationStatus } from '../types';
import { mockDB } from '../lib/mockBackend';

interface AuthContextType {
  user: { uid: string; email: string; displayName: string; photoURL: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isMember: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  updateEmailAddress: (newEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isModerator: false,
  isMember: false,
  login: async () => {},
  logout: () => {},
  updateEmailAddress: async () => {},
  setProfile: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('mock_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        try {
          const userProfile = await mockDB.getUser(parsedUser.uid);
          
          if (userProfile?.isBanned) {
            alert('Your account has been banned for violating community guidelines.');
            logout();
            return;
          }
          
          setProfile(userProfile);
        } catch (e) {
          console.error('Failed to load profile', e);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string) => {
    const uid = 'user_' + btoa(email).substring(0, 8);
    const mockUser = {
      uid,
      email,
      displayName: email.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`
    };
    
    try {
      let existingProfile = await mockDB.getUser(uid);
      
      if (existingProfile?.isBanned) {
        throw new Error('This account is banned.');
      }

      if (!existingProfile) {
        const isInitialAdmin = email === 'azenethfayejaum6@gmail.com' || email === 'yournameadmin@gmail.com' || email.includes('admin');
        const isInitialMod = email.includes('mod') || email === 'moderator@amiable.com';
        
        existingProfile = {
          uid,
          email,
          displayName: mockUser.displayName,
          photoURL: mockUser.photoURL,
          role: isInitialAdmin ? UserRole.ADMIN : (isInitialMod ? UserRole.MODERATOR : UserRole.APPLICANT),
          applicationStatus: (isInitialAdmin || isInitialMod) ? ApplicationStatus.APPROVED : ApplicationStatus.NONE,
          joinedAt: new Date().toISOString()
        };
        await mockDB.saveUser(existingProfile);
      }
      
      setUser(mockUser);
      setProfile(existingProfile);
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
    } catch (e: any) {
      alert(e.message || 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('mock_user');
  };

  const updateEmailAddress = async (newEmail: string) => {
    if (!profile) return;
    const updated = { ...profile, email: newEmail };
    await mockDB.saveUser(updated);
    setProfile(updated);
    if (user) {
      const updatedUser = { ...user, email: newEmail };
      setUser(updatedUser);
      localStorage.setItem('mock_user', JSON.stringify(updatedUser));
    }
  };

  const isAdmin = profile?.role === UserRole.ADMIN;
  const isModerator = profile?.role === UserRole.MODERATOR || isAdmin;
  const isMember = profile?.role === UserRole.MEMBER || isModerator;

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin, 
      isMember, 
      isModerator, 
      login, 
      logout,
      updateEmailAddress,
      setProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

