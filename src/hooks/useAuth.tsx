import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isAdminEmail } from './adminUtils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    const user = auth.currentUser;
    if (user) {
      // Check if user is admin by email in admins collection
      const admin = await isAdminEmail(email);
      if (admin) {
        await setDoc(doc(db, "users", user.uid), {
          email,
          attemptsLeft: 100,
          totalInterviews: 0,
          completed: 0,
          averageScore: 0
        }, { merge: true });
      } else {
        await setDoc(doc(db, "users", user.uid), {
          email,
          attemptsLeft: 3,
          totalInterviews: 0,
          completed: 0,
          averageScore: 0
        }, { merge: true });
      }
    }
  };

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const admin = await isAdminEmail(email);
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      attemptsLeft: admin ? 100 : 3,
      totalInterviews: 0,
      completed: 0,
      averageScore: 0
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
