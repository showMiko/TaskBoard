import { db } from '../util/firebase';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';

export class User {
    id: string;
    email: string; // Add email field
    role: string;
    project: { projectId: string; projectRole: string }[] = [];

    constructor(id: string, email: string, role: string) {
        this.id = id;
        this.email = email; // Initialize email
        this.role = role;
    }

    // Method to convert the User instance to a plain object
    toPlainObject() {
        return {
            email: this.email,
            role: this.role,
            project: this.project,
        };
    }
}

export async function getUsers(): Promise<User[]> {
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
}

export async function getUserById(id: string): Promise<User | undefined> {
    const userDoc = await getDoc(doc(db, 'users', id));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : undefined;
}

export async function addUser(userId: string, email: string, role: string): Promise<User> {
    const newUser = new User(userId, email, role); // Initialize with userId and email
    await addDoc(collection(db, 'users'), newUser.toPlainObject()); // Use the toPlainObject method
    return newUser;
}

export async function updateUserRole(userId: string, newRole: string, projectId: string) {
    const userRef = doc(db, 'users', userId);
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    await updateDoc(userRef, {
        // role: newRole,
        project: [...user.project, { projectId, projectRole: newRole }]
    });
}
