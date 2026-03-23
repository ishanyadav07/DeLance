import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  isAdmin: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  role: null,
  isAdmin: false,
});

export const useFirebase = () => useContext(FirebaseContext);

interface Props {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user profile exists in Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            const defaultRole = 'client';
            // Create user profile
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Anonymous',
              photoURL: firebaseUser.photoURL || '',
              role: defaultRole, // Default role
              reputation: 0,
              completedProjects: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setRole(defaultRole);
            setIsAdmin(false);
          } else {
            const userData = userSnap.data();
            setRole(userData.role);
            setIsAdmin(userData.role === 'admin' || firebaseUser.email === 'ishany79@gmail.com');
          }
        } catch (error) {
          console.error("Error checking/creating user profile:", error);
        }
      } else {
        setRole(null);
        setIsAdmin(false);
      }
      
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, loading, role, isAdmin }}>
      {children}
    </FirebaseContext.Provider>
  );
};
