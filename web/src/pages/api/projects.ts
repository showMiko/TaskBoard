import { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '../../models/User';
import { createProject, deleteProject, getProjects } from '../../models/Project';
// import { initializeProjectTasks } from '../../models/Tasks';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST':
            const { userId, name, contributorId, approverId, reviewerId } = req.body;

            // Ensure you await the user fetching
            const user = await getUserById(userId)
            console.log(userId,"from the params")

            if (!user || user.role !== 'admin') {
                return res.status(403).json({ message: 'Forbidden: Only admins can manage projects' });
            }

            const project =await createProject(name, contributorId, approverId, reviewerId, userId);
            // initializeProjectTasks(project.id);
            return res.status(201).json({ message: 'Project created', project });

        case 'DELETE':
            const { projectId } = req.body;

            // Fetch the user again for delete operation
            const deleteUser = await getUserById(req.body.userId);

            if (!deleteUser || deleteUser.role !== 'admin') {
                return res.status(403).json({ message: 'Forbidden: Only admins can manage projects' });
            }

            const result =await deleteProject(projectId);
            if (result) {
                return res.status(200).json({ message: 'Project deleted' });
            } else {
                return res.status(404).json({ message: 'Project not found' });
            }

        case 'GET':
            const projects =await getProjects();
            return res.status(200).json({ message: 'Projects fetched', projects });

        default:
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
