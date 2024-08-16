// auth.ts
import { auth } from "../util/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { addUser } from "@/models/User";
export async function registerUser(email: string, password: string, role: string): Promise<void> {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid; // Get the user ID from Firebase Auth

    // Add user details to Firestore
    await addUser(userId, email, role);
}

export async function loginUser(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
}
