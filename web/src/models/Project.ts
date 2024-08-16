import { db } from '../util/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export class Project {
    id: string;
    name: string;
    members: {
        contributor: string;
        approver: string;
        reviewer: string;
        admin: string;
    };

    constructor(name: string, contributorId: string, approverId: string, reviewerId: string, adminId: string) {
        this.id = ''; // Firestore will generate the ID
        this.name = name;
        this.members = {
            contributor: contributorId,
            approver: approverId,
            reviewer: reviewerId,
            admin: adminId,
        };
    }
}

export async function getProjects(): Promise<Project[]> {
    const projectsCollection = collection(db, 'projects');
    const projectSnapshot = await getDocs(projectsCollection);
    return projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
}

export async function createProject(name: string, contributorId: string, approverId: string, reviewerId: string, adminId: string): Promise<Project> {
    const project = new Project(name, contributorId, approverId, reviewerId, adminId);
    // const docRef = await addDoc(collection(db, 'projects'), project);
    const docRef = await addDoc(collection(db, 'projects'), {name,members:{contributorId,approverId,reviewerId,adminId}});
    project.id = docRef.id; // Assign the generated ID
    return project;
}

export async function deleteProject(projectId: string): Promise<boolean> {
    try {
        await deleteDoc(doc(db, 'projects', projectId));
        return true;
    } catch (error) {
        console.error('Error deleting project:', error);
        return false;
    }
}
