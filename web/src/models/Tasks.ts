// models/Tasks.ts
import { db } from "../util/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export class Task {
    id: string;
    title: string;
    description: string;
    group: number;
    assignedTo: string;
    status: 'active' | 'pending' | 'completed';

    constructor(title: string, description: string, group: number, assignedTo: string) {
        this.id = ''; // Firestore will generate the ID
        this.title = title;
        this.description = description;
        this.group = group;
        this.assignedTo = assignedTo;
        this.status = 'pending'; // Default status
    }
}

export async function getTasks(projectId: string): Promise<Task[]> {
    const tasksCollection = collection(db, 'tasks');
    const taskSnapshot = await getDocs(tasksCollection);
    return taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
}
export async function createTask(projectId: string,title: string, description: string, group: number, assignedTo: string): Promise<Task> {
    const task = new Task(title, description, group, assignedTo);
    const docRef = await addDoc(collection(db, 'tasks'), {projectId,title,description,group,assignedTo,status:"pending"});
    task.id = docRef.id; // Assign the generated ID
    return task;
}

export async function deleteTask(taskId: string): Promise<boolean> {
    try {
        await deleteDoc(doc(db, 'tasks', taskId));
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        return false;
    }
}

// New updateTask function
export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    try {
        const taskDoc = doc(db, 'tasks', taskId);
        await updateDoc(taskDoc, updates);
        
        // Fetch the updated task to return it
        const updatedTaskSnapshot = await getDocs(collection(db, 'tasks'));
        const updatedTask = updatedTaskSnapshot.docs.find(doc => doc.id === taskId);
        
        return updatedTask ? { id: updatedTask.id, ...updatedTask.data() } as Task : null;
    } catch (error) {
        console.error('Error updating task:', error);
        return null;
    }
}
