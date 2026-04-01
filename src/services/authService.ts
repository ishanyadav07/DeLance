import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Create or update user profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    let userSnap;
    try {
      userSnap = await getDoc(userRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    }

    if (!userSnap?.exists()) {
      try {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: 'freelancer', // Default role
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          reputation: 0,
          completedProjects: 0,
          bio: '',
          skills: [],
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
      }
    } else {
      try {
        await setDoc(userRef, {
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }

    return user;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      throw error;
    }
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
