import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { queryDocs } from '../services/firestore';

type UserRole = 'customer' | 'staff' | 'admin';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  role: UserRole | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setRole(null);
    } catch (e) {
      console.error('Failed to logout', e);
      throw e;
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const users = await queryDocs('users', 'uid', '==', user.uid);
          const userDoc: any | undefined = users[0];
          const docRole = userDoc?.role as UserRole | undefined;
          setRole(docRole || 'customer');
        } catch (e) {
          console.error('Failed to load user role', e);
          setRole('customer');
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, role, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
