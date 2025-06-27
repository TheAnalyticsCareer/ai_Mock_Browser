import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { isAdminEmail } from './adminUtils';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (user && user.email) {
      const admin = await isAdminEmail(user.email);
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        attemptsLeft: admin ? 100 : 3,
        totalInterviews: 0,
        completed: 0,
        averageScore: 0
      }, { merge: true });
      // Optionally, add to admins collection if admin
      if (admin) {
        await setDoc(doc(db, 'admins', user.email), { email: user.email }, { merge: true });
      }
    }
    return user;
  } catch (error) {
    throw error;
  }
};
