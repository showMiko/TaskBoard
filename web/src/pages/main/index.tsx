import React, { useState, useEffect } from 'react';
import { Tabs, Input, Button, Card, Modal, Form, message, AutoComplete, Progress, Avatar, Divider, Typography } from 'antd';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Project } from '../../models/Project';
import { User } from '../../models/User';
import Navbar from '@/components/Navbar';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/util/firebase';
import { Task } from '@/models/Tasks';

const { TabPane } = Tabs;

const MainPage: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [tasks, setTasks] = useState();
    const [form] = Form.useForm();
    const router = useRouter();
    const { role, userId, email } = router.query;

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    const handleDeleteButtonClick = (projectId: string) => {
        setSelectedProjectId(projectId);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteConfirmation = async () => {
        if (!selectedProjectId) return;

        try {
            // Delete project document
            await deleteDoc(doc(db, 'projects', selectedProjectId));

            // Delete tasks associated with the project
            const tasksCollection = collection(db, 'tasks');
            const tasksQuery = await getDocs(tasksCollection);
            const tasksToDelete = tasksQuery.docs.filter(doc => doc.data().projectId === selectedProjectId);
            tasksToDelete.forEach(async task => {
                await deleteDoc(doc(db, 'tasks', task.id));
            });

            // Update user documents (remove project from project array)
            const users = await getDocs(collection(db, 'users'));
            const userDocs = users.docs;
            await Promise.all(
                userDocs.map(async userDoc => {
                    const userData = userDoc.data();
                    const updatedProjects = userData.projects?.filter(project => project.projectId !== selectedProjectId);
                    if (updatedProjects?.length !== userData.projects?.length) {
                        await updateDoc(doc(db, 'users', userDoc.id), { projects: updatedProjects });
                    }
                })
            );

            message.success('Project deleted successfully!');
            setIsDeleteModalVisible(false);
            setSelectedProjectId(null);

            // Update projects state after deletion (optional)
            const projectsResponse = await axios.get('/api/projects');
            setProjects(projectsResponse.data.projects);
        } catch (error) {
            console.error('Error deleting project:', error);
            message.error('Failed to delete project');
        }
    };


    const handleCancelDelete = () => {
        setIsDeleteModalVisible(false);
        setSelectedProjectId(null);
    };

    useEffect(() => {
        console.log("In the Main Api")
        const isLoggedIn = async () => {
            const email = localStorage.getItem('email');
            const role = localStorage.getItem('role');
            const userId = localStorage.getItem('userId');

            if (!email || !role || !userId) {
                router.push("/login");
                return;
            }

            const fetchProjects = async () => {
                console.log("Fetching Projects")
                try {
                    const response = await axios.get('/api/projects');
                    setProjects(response.data.projects);
                    console.log(projects);
                } catch (error) {
                    console.error('Error fetching projects:', error);
                    message.error('Failed to fetch projects');
                }
            };

            const fetchUsers = async () => {
                console.log("Fetching Users")
                try {
                    const response = await axios.get('/api/users');
                    setUsers(response.data.users);
                    console.log(users)
                } catch (error) {
                    console.error('Error fetching users:', error);
                    message.error('Failed to fetch users');
                }
            };

            const fetchTasks = async () => {
                console.log("Fetching Tasks")
                try {
                    const tasksCollection = collection(db, 'tasks');
                    const querySnapshot = await getDocs(tasksCollection);
                    const tasks = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
                    setTasks(tasks);
                    // return tasks;
                    console.log(tasks)
                }
                catch (error) {
                    console.error("Error fetching tasks:", error);
                }
            }
            fetchProjects();
            fetchUsers();
            fetchTasks();
        }
        isLoggedIn();

    }, []);

    const showModal = () => {
        setIsModalVisible(true);
        form.resetFields();
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSearch = (value: string, field: string) => {
        const filtered = users.filter(user => user.email.toLowerCase().includes(value.toLowerCase()));
        setFilteredUsers(filtered);
        form.setFieldsValue({ [field]: value });
    };

    const handleSelectUser = (value: string, field: string) => {
        const selectedUser = users.find(user => user.email === value);
        if (selectedUser) {
            // form.setFieldsValue({ [field]: selectedUser.id }); // Set the user ID instead of email
            form.setFieldsValue({ [field]: selectedUser.email }); // Set the user ID instead of email
        }
        setFilteredUsers([]);
    };

    const handleCreate = async (values: { projectName: string; contributor: string; reviewer: string; approver: string }) => {
        try {

            const contributor = users.find(user => user.email === values.contributor);
            const reviewer = users.find(user => user.email === values.reviewer);
            const approver = users.find(user => user.email === values.approver);

            if (!contributor || !reviewer || !approver) {
                message.error('One or more users not found');
                return;
            }


            const response = await axios.post('/api/projects', {
                userId,
                name: values.projectName,
                contributorId: contributor.id,
                reviewerId: reviewer.id,
                approverId: approver.id,
            });


            await Promise.all([
                axios.put(`/api/users`, { userId: contributor.id, newRole: 'contributor', projectId: response.data.project.id }),
                axios.put(`/api/users`, { userId: reviewer.id, newRole: 'reviewer', projectId: response.data.project.id }),
                axios.put(`/api/users`, { userId: approver.id, newRole: 'approver', projectId: response.data.project.id }),
            ]);

            message.success('Project created successfully!');
            setIsModalVisible(false);
            const projectResponse = await axios.get('/api/projects');
            setProjects(projectResponse.data.projects);
        } catch (error) {
            console.error('Error creating project:', error);
            message.error('Failed to create project');
        }
    };


    const handleCardClick = (project: Project) => {
        const user = users.find(user => user.id === userId);
        const userProject = user?.project.find(projectInfo => projectInfo.projectId === project.id);
        const projectRole = userProject?.projectRole;
        router.push({
            pathname: '/tasks',
            query: {
                userId: userId,
                // role:role,
                role: projectRole,
                name: project.name,
                projectId: project.id,
                adminId: project.members.adminId,
                contributorId: project.members.contributorId,
                reviewerId: project.members.reviewerId,
                approverId: project.members.approverId,
            }
        });
    };

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isAssignedToUser = (project: Project) => {
        const { members } = project;
        return [members.adminId, members.contributorId, members.reviewerId, members.approverId].includes(userId);
    };

    const assignedToMeProjects = projects.filter(isAssignedToUser);
    const [activeKey, setActiveKey] = useState('1');
    const handleTabChange = (key: string) => {
        setActiveKey(key);
    };
    const { Title } = Typography;

    return (
        <>

            <Navbar email={email} />
            <div style={{ padding: '50px' }}>
                <Title level={2}>Projects</Title>
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between',  }}>
                    
                    <Tabs defaultActiveKey="1" activeKey={activeKey} onChange={handleTabChange} >
                        <TabPane tab="All" key="1" >
                            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap' }}>
                                {filteredProjects.map((project) => {
                                    const contributorEmail = users.find(user => user.id === project.members.contributorId)?.email || 'N/A';
                                    const reviewerEmail = users.find(user => user.id === project.members.reviewerId)?.email || 'N/A';
                                    const approverEmail = users.find(user => user.id === project.members.approverId)?.email || 'N/A';


                                    return (

                                        <Card key={project.id} title={project.name} style={{ width: 340, margin: '10px', cursor: "pointer" }} >
                                            <div onClick={() => handleCardClick(project)}>

                                            <Title level={5}>Contributor: {contributorEmail}</Title>
                                                <Title level={5}>Reviewer: {reviewerEmail}</Title>
                                                <Title level={5}>Approver: {approverEmail}</Title>

                                                <Avatar.Group maxCount={4}>
                                                    <Avatar size="large" style={{ backgroundColor: '#f56a00' }}>{email[0]}</Avatar>
                                                    <Avatar size="large" style={{ backgroundColor: '#66ff66' }}>{contributorEmail[0]}</Avatar>
                                                    <Avatar size="large" style={{ backgroundColor: '#4da6ff' }}>{reviewerEmail[0]}</Avatar>
                                                    <Avatar size="large" style={{ backgroundColor: '#333300' }}>{approverEmail[0]}</Avatar>
                                                </Avatar.Group>
                                                <br></br>
                                            </div>
                                            {role === "admin" ? <Button type="primary" style={{ marginTop: "20px" }} danger onClick={() => handleDeleteButtonClick(project.id)}>
                                                Delete
                                            </Button> : <></>}

                                        </Card>
                                    )
                                })}
                            </div>
                        </TabPane>

                        <TabPane tab="Assigned to Me" key="2" >
                            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap' }}>
                                {assignedToMeProjects.map((project) => {
                                    const contributorEmail = users.find(user => user.id === project.members.contributorId)?.email || 'N/A';
                                    const reviewerEmail = users.find(user => user.id === project.members.reviewerId)?.email || 'N/A';
                                    const approverEmail = users.find(user => user.id === project.members.approverId)?.email || 'N/A';


                                    return (

                                        <Card key={project.id} title={project.name} style={{ width: 340, margin: '10px', cursor: "pointer" }} >
                                            <div onClick={() => handleCardClick(project)}>

                                                <Title level={5}>Contributor: {contributorEmail}</Title>
                                                <Title level={5}>Reviewer: {reviewerEmail}</Title>
                                                <Title level={5}>Approver: {approverEmail}</Title>

                                                <Avatar.Group maxCount={4}>
                                                    <Avatar size="large" style={{ backgroundColor: '#f56a00' }}>{email[0]}</Avatar>
                                                    <Avatar size="large" style={{ backgroundColor: '#66ff66' }}>{contributorEmail[0]}</Avatar>
                                                    <Avatar size="large" style={{ backgroundColor: '#4da6ff' }}>{reviewerEmail[0]}</Avatar>
                                                    <Avatar size="large" style={{ backgroundColor: '#333300' }}>{approverEmail[0]}</Avatar>
                                                </Avatar.Group>
                                                <br></br>
                                            </div>
                                            {role === "admin" ? <Button type="primary" style={{ marginTop: "20px" }} danger onClick={() => handleDeleteButtonClick(project.id)}>
                                                Delete
                                            </Button> : <></>}

                                        </Card>
                                    )
                                })}
                            </div>
                        </TabPane>
                        {/* <TabPane tab="Bookmarked" key="3" /> */}
                    </Tabs>
                    <div>
                        <Input.Search placeholder="Search projects"
                            onChange={handleSearchChange}
                            value={searchQuery}
                            style={{ width: 200, marginRight: '10px' }} />
                        {role === 'admin' && <Button type="primary" onClick={showModal}>Add New</Button>}
                    </div>
                </div>

                <Modal
                    title="Create New Project"
                    visible={isModalVisible}
                    onCancel={handleCancel}
                    footer={null}
                >
                    <Form form={form} onFinish={handleCreate}>
                        <Form.Item
                            name="projectName"
                            rules={[{ required: true, message: 'Please enter a project name!' }]}
                        >
                            <Input placeholder="Enter a name for the Project" />
                        </Form.Item>

                        <div style={{ marginBottom: '16px' }}>
                            <span>{email}</span> <span style={{ fontWeight: 'bold' }}>Admin</span>
                        </div>

                        <Form.Item label="Contributor" name="contributor" required>
                            <AutoComplete
                                placeholder="Contributor"
                                options={filteredUsers.map(user => ({ value: user.email }))}
                                onSearch={(value) => handleSearch(value, 'contributor')}
                                onSelect={(value) => handleSelectUser(value, 'contributor')}
                            >
                                <Input />
                            </AutoComplete>
                        </Form.Item>
                        <Form.Item label="Reviewer" name="reviewer" required>
                            <AutoComplete
                                placeholder="Reviewer"
                                options={filteredUsers.map(user => ({ value: user.email }))}
                                onSearch={(value) => handleSearch(value, 'reviewer')}
                                onSelect={(value) => handleSelectUser(value, 'reviewer')}
                            >
                                <Input />
                            </AutoComplete>
                        </Form.Item>
                        <Form.Item label="Approver" name="approver" required>
                            <AutoComplete
                                placeholder="Approver"
                                options={filteredUsers.map(user => ({ value: user.email }))}
                                onSearch={(value) => handleSearch(value, 'approver')}
                                onSelect={(value) => handleSelectUser(value, 'approver')}
                            >
                                <Input />
                            </AutoComplete>
                        </Form.Item>

                        <Form.Item>
                            <Button onClick={handleCancel} style={{ marginRight: '10px' }}>Cancel</Button>
                            <Button type="primary" htmlType="submit" disabled={
                                !form.getFieldValue('projectName') ||
                                !form.getFieldValue('contributor') ||
                                !form.getFieldValue('reviewer') ||
                                !form.getFieldValue('approver')
                            }>
                                Create
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal
                    title="Confirm Delete"
                    visible={isDeleteModalVisible}
                    onOk={handleDeleteConfirmation}
                    onCancel={handleCancelDelete}
                >
                    <p>Are you sure you want to delete this project?</p>
                </Modal>

            </div>
        </>
    );
};

export default MainPage;