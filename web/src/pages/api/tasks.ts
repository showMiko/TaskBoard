import { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '../../models/User';
import { getTasks, updateTask, deleteTask, createTask } from "../../models/Tasks";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            const { projectId: queryProjectId } = req.query;
            const tasks = await getTasks(queryProjectId as string); // Fetch tasks for the specific project
            console.log(tasks," from the world of task handler")
            console.log(queryProjectId)
            return res.status(200).json({ message: 'Tasks fetched', tasks });

        case 'POST':
            const { userId, title, description, group, assignedTo, projectId: bodyProjectId } = req.body;
            const creator = await getUserById(userId); // Fetch user by ID
            const userProject = creator?.project.find(p => p.projectId === bodyProjectId);

            // if (!creator || creator.role !== 'approver') {
            //     return res.status(403).json({ message: 'Forbidden: Only approvers can create tasks' });
            // }
            if (!userProject||  userProject.projectRole !== 'approver') {
                return res.status(403).json({ message: 'Forbidden: Only approvers can create tasks' });
            }

            try {
                const newTask = await createTask(bodyProjectId, title, description, group, assignedTo);
                return res.status(201).json({ message: 'Task created', task: newTask });
            } catch (error) {
                console.error('Error creating task:', error);
                return res.status(500).json({ message: 'Failed to create task' });
            }

        case 'PUT':
            const { taskId, updates, projectId: updateProjectId } = req.body;
            const user = await getUserById(req.body.userId);
            const currProject = user?.project.find(projectInfo => projectInfo.projectId === updateProjectId);
            const projectRole=currProject?.projectRole;
            console.log(user)

            if (updates.status === 'completed') {
                if (!user || !user.project.some(p => p.projectId === updateProjectId)) {
                    return res.status(403).json({ message: 'Forbidden: Only assigned user can mark the task as complete' });
                }
            } else {
                if (!user || projectRole !== 'approver') {
                    return res.status(403).json({ message: 'Forbidden: Only approvers can update tasks' });
                }
            }

            const updatedTask = await updateTask(taskId, updates);
            if (updatedTask) {
                return res.status(200).json({ message: updates.status === 'completed' ? 'Task marked as complete' : 'Task updated', task: updatedTask });
            } else {
                return res.status(500).json({ message: 'Failed to update task' });
            }

        case 'DELETE':
            const { taskId: taskIdToDelete } = req.body;
            const deleteUserForTask = await getUserById(req.body.userId);

            if (!deleteUserForTask || deleteUserForTask.role !== 'approver') {
                return res.status(403).json({ message: 'Forbidden: Only approvers can delete tasks' });
            }

            const deleteSuccess = await deleteTask(taskIdToDelete);
            if (deleteSuccess) {
                return res.status(200).json({ message: 'Task deleted' });
            } else {
                return res.status(500).json({ message: 'Failed to delete task' });
            }

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
