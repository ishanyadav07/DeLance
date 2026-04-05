import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  isAdmin: boolean;
  profileData: any | null;
  refreshProfile: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  role: null,
  isAdmin: false,
  profileData: null,
  refreshProfile: async () => {},
});

export const useFirebase = () => useContext(FirebaseContext);

interface Props {
  children: ReactNode;
}

export const FirebaseProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileData, setProfileData] = useState<any | null>(null);

  const fetchProfile = async (uid: string, firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const defaultRole = 'client';
        // Create user profile
        const defaultData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Anonymous',
          photoURL: firebaseUser.photoURL || '',
          role: defaultRole, // Default role
          reputation: 0,
          completedProjects: 0,
          bio: '',
          skills: [],
          title: '',
          location: '',
          website: '',
          github: '',
          twitter: '',
          linkedin: '',
          hourlyRate: 0,
          experienceLevel: 'Intermediate',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, defaultData);
        setRole(defaultRole);
        setIsAdmin(false);
        setProfileData(defaultData);
      } else {
        const userData = userSnap.data();
        setRole(userData.role);
        setIsAdmin(userData.role === 'admin' || firebaseUser.email === 'ishany79@gmail.com');
        setProfileData(userData);
      }
    } catch (error) {
      console.error("Error checking/creating user profile:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid, user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid, firebaseUser);
      } else {
        setRole(null);
        setIsAdmin(false);
        setProfileData(null);
      }
      
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, loading, role, isAdmin, profileData, refreshProfile }}>
      {children}
    </FirebaseContext.Provider>
  );
};
