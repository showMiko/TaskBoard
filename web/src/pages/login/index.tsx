import React, { useEffect } from 'react';
import { Form, Input, Button, message, Typography, Divider } from 'antd';
import { useRouter } from 'next/navigation';
import { db } from '../../util/firebase'; // Adjust the path as necessary
import { collection, getDocs, query, where } from 'firebase/firestore';
import { loginUser } from '@/auth/auth';

const Login = () => {
    const router = useRouter();
    useEffect(()=>{
        console.log("In the Login Api")
        const email=localStorage.getItem("email");
        const role=localStorage.getItem("role");
        const userId=localStorage.getItem("userId");

        if(email && role && userId)
        {
            router.push(`/main?role=${role}&email=${encodeURIComponent(email)}&userId=${encodeURIComponent(userId)}`);
            return;
        }
    })

    const onFinish = async (values: { email: string; password: string }) => {
        try {
            // First, log in the user
            await loginUser(values.email, values.password);

            // Now query Firestore to find the user by email
            const usersCollection = collection(db, 'users');
            const q = query(usersCollection, where('email', '==', values.email));
            const userSnapshot = await getDocs(q);

            if (userSnapshot.empty) {
                message.error('User not found in Firestore');
                return;
            }

            // Assuming only one user with a unique email
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            const userId = userDoc.id; // Get the user ID

            // Redirect based on user role and include user ID in the URL
            localStorage.setItem("email",values.email);
            localStorage.setItem("role",userData.role);
            localStorage.setItem("userId",userId);
            if (userData.role === 'admin') {
                router.push(`/main?role=admin&email=${encodeURIComponent(values.email)}&userId=${encodeURIComponent(userId)}`);
            }
             else {
                // message.error('Invalid user role');
                router.push(`/main?role=${userData.role}&email=${encodeURIComponent(values.email)}&userId=${encodeURIComponent(userId)}`);
            }
        } catch (error) {
            console.error('Error during login:', error);
            message.error('An error occurred while logging in');
        }
    };
    const {Title}=Typography;

    return (
        <div style={{ maxWidth: 300, margin: 'auto', padding: '50px',marginTop:"12rem" }} className='cards'>
            <Title level={2}>Login</Title>
            <Divider/>
            <Form onFinish={onFinish}>
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Please input your email!' }]}
                >
                    <Input placeholder="Email" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Login</Button>
                </Form.Item>
                <Typography>Dont Have an Account?</Typography>
                    <Button type="dashed"  onClick={()=>router.push("/signup")}>
                        SignUp
                    </Button>
            </Form>
        </div>
    );
}

export default Login;
