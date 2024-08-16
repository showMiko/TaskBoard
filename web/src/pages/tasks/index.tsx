import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Input, Modal, message, Row, Col, Select,Typography, Divider } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Task } from '../../models/Tasks';
import { User } from '../../models/User';
import Navbar from '@/components/Navbar';

const { Option } = Select;

const Tasks: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const router = useRouter();
    const [form] = Form.useForm();
    const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
    const { projectId, contributorId, reviewerId, approverId, userId, role, name }=router.query;

    useEffect(() => {
        console.log("In the Tasks Api")
        const fetchTasks = async () => {
            try {
                const response = await axios.get(`/api/tasks?projectId=${projectId}`);
                const filteredTasks = response.data.tasks.filter((task: { projectId: string | string[] | undefined; }) => task.projectId === projectId);
                setTasks(filteredTasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                message.error('Failed to fetch tasks');
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/users');
                setUsers(response.data.users);
                const allUsers: User[] = response.data.users;
                const filteredUsers = allUsers.filter(user => [contributorId, reviewerId].includes(user.id));
                setAssignableUsers(filteredUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
                message.error('Failed to fetch users');
            }
        };

        fetchTasks();
        fetchUsers();
        setUserRole(role as string);
    }, [projectId, role]);

    const showModal = () => {
        setIsModalVisible(true);
        form.resetFields();
    };

    const showEditModal = (task: Task) => {
        setCurrentTask(task);
        setIsEditModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsEditModalVisible(false);
    };

    const handleCreate = async (values: { title: string; description: string; group: number; assignedTo: string }) => {
        try {
            await axios.post('/api/tasks', {
                projectId,
                title: values.title,
                description: values.description,
                group: values.group,
                assignedTo: values.assignedTo,
                userId
            });
            message.success('Task created successfully!');
            setIsModalVisible(false);
            const response = await axios.get(`/api/tasks?projectId=${projectId}`);
            const filteredTasks = response.data.tasks.filter((task: { projectId: string | string[] | undefined; }) => task.projectId === projectId);
            setTasks(filteredTasks);
        } catch (error) {
            console.error('Error creating task:', error);
            message.error('Failed to create task');
        }
    };

    const handleUpdate = async (values: { title: string; description: string; status: string }) => {
        if (!currentTask) return;

        try {
            await axios.put('/api/tasks', {
                taskId: currentTask.id,
                updates: {
                    ...values
                },
                projectId,
                userId
            });
            message.success('Task updated successfully!');
            setIsEditModalVisible(false);
            const response = await axios.get(`/api/tasks?projectId=${projectId}`);
            setTasks(response.data.tasks.filter((task: { projectId: string | string[] | undefined; }) => task.projectId === projectId));
        } catch (error) {
            console.error('Error updating task:', error);
            message.error('Failed to update task');
        }
    };

    const handleDone = async (task: Task) => {
        try {
            await axios.put('/api/tasks', {
                taskId: task.id,
                updates: { status: 'completed' },
                projectId,
                userId
            });
            message.success('Task marked as completed!');
            const response = await axios.get(`/api/tasks?projectId=${projectId}`);
            setTasks(response.data.tasks.filter((task: { projectId: string | string[] | undefined; }) => task.projectId === projectId));
        } catch (error) {
            console.error('Error marking task as completed:', error);
            message.error('Failed to complete task');
        }
    };
    const assignedToOptions = () => {
        return assignableUsers.map(user => ({ value: user.id, label: user.email }));
    };

    const taskStatus = (status: string) => tasks.filter(task => task.status === status);
    const {Title} = Typography;
    return (
        <>
        <Navbar/>
        <div style={{ padding: '20px' }}>
            <Title>{name}</Title>
            <Divider/>
            {userRole === 'approver' && userId === approverId && (
                <div style={{ marginBottom: '20px' }}>
                    <Button type="primary" onClick={showModal}>Create New Task</Button>
                </div>
            )}
            <Row gutter={16}>
                <Col span={8}>
                    <Title level={3}>Pending</Title>
                    {taskStatus('pending').map(task => (
                        <Card key={task.id} title={task.title} style={{ marginBottom: '10px' }}>
                            <p>{task.description}</p>
                            {(userRole === 'approver' && userId === approverId) && (
                                <Button onClick={() => showEditModal(task)}>Edit</Button>
                            )}
                        </Card>
                    ))}
                </Col>
                <Col span={8}>
                    <Title level={3}>Active</Title>
                    {taskStatus('active').map(task => (
                        <Card key={task.id} title={task.title} style={{ marginBottom: '10px' }}>
                            <p>{task.description}</p>
                            {(userRole === 'approver' && userId === approverId) && (
                                <Button onClick={() => showEditModal(task)} style={{ marginRight: '10px' }}>Edit</Button>
                            )}
                            {(task.assignedTo === userId) && (
                                <Button onClick={() => handleDone(task)}>Done</Button>
                            )}
                        </Card>
                    ))}
                </Col>
                <Col span={8}>
                    <Title level={3}>Completed</Title>
                    {taskStatus('completed').map(task => (
                        <Card key={task.id} title={task.title} style={{ marginBottom: '10px' }}>
                            <p>{task.description}</p>
                        </Card>
                    ))}
                </Col>
            </Row>
            <Modal
                title="Create New Task"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} onFinish={handleCreate}>
                    <Form.Item name="title" rules={[{ required: true, message: 'Please enter a task title!' }]}>
                        <Input placeholder="Task Title" />
                    </Form.Item>
                    <Form.Item name="description" rules={[{ required: true, message: 'Please enter a task description!' }]}>
                        <Input.TextArea rows={4} placeholder="Task Description" />
                    </Form.Item>
                    <Form.Item name="group" rules={[{ required: true, message: 'Please enter a group number!' }]}>
                        <Input type="number" placeholder="Group Number" />
                    </Form.Item>
                    <Form.Item name="assignedTo" rules={[{ required: true, message: 'Please select an assignee!' }]}>
                        <Select placeholder="Assign To">
                           {assignedToOptions().map(option => (
                                <Option key={option.value} value={option.value}>{option.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={handleCancel} style={{ marginRight: '10px' }}>Cancel</Button>
                        <Button type="primary" htmlType="submit">Create</Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Edit Task"
                visible={isEditModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} onFinish={handleUpdate} initialValues={currentTask || {}}>
                    <Form.Item name="title" rules={[{ required: true, message: 'Please enter a task title!' }]}>
                        <Input placeholder="Task Title" />
                    </Form.Item>
                    <Form.Item name="description" rules={[{ required: true, message: 'Please enter a task description!' }]}>
                        <Input.TextArea rows={4} placeholder="Task Description" />
                    </Form.Item>
                    <Form.Item name="status" rules={[{ required: true, message: 'Please select a task status!' }]}>
                        <Select placeholder="Select Status">
                            <Option value="pending">Pending</Option>
                            <Option value="active">Active</Option>
                            <Option value="completed">Completed</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={handleCancel} style={{ marginRight: '10px' }}>Cancel</Button>
                        <Button type="primary" htmlType="submit">Update</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
        </>
    );
};

export default Tasks;
