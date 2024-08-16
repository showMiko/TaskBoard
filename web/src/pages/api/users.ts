import { NextApiRequest, NextApiResponse } from 'next';
import { getUsers, addUser, updateUserRole, getUserById } from '../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            const users =await getUsers();
            return res.status(200).json({ message: 'Users fetched', users });

        case 'POST':
            const { id,email,role } = req.body;
            const user =await addUser(email,id, role?role:'staff'); // Default role can be set here
            return res.status(201).json({ message: 'User added', user });

        case 'PUT':
            const { userId, newRole, projectId } = req.body;
            const existingUser = await getUserById(userId); // Await user fetching

            if (!existingUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            try {
                await updateUserRole(userId, newRole, projectId);
                return res.status(200).json({ message: 'Role updated' });
            } catch (error) {
                return res.status(500).json({ message: 'Failed to update role' });
            }

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
