// pages/signup.tsx
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message,Typography } from 'antd';
import { registerUser } from "../../auth/auth"

import { useRouter } from 'next/router';

const { Option } = Select;

const SignUp: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const router=useRouter();
    useEffect(()=>{
        console.log("In the SignUp Api")
        const email=localStorage.getItem("email");
        const role=localStorage.getItem("role");
        const userId=localStorage.getItem("userId");

        if(email && role && userId)
        {
            router.push(`/main?role=${role}&email=${encodeURIComponent(email)}&userId=${encodeURIComponent(userId)}`);
            return;
        }
    })

    const onFinish = async (values: { email: string; password: string; role: string }) => {
        setLoading(true);
        const { email, password, role } = values;
        try {
            await registerUser(email, password, role);
            message.success('Registration successful!');
        } catch (error: any) {
            message.error('Registration failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    const {Title}=Typography;

    return (
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '20px',marginTop:"12rem"  }} className='cards'>
            <Title level={2}>Sign Up</Title>
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

                <Form.Item
                    name="role"
                    rules={[{ required: true, message: 'Please select your role!' }]}
                >
                    <Select placeholder="Select Role">
                        <Option value="admin">Admin</Option>
                        <Option value="staff">Staff</Option>
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Sign Up
                    </Button>
                </Form.Item>
                <Form.Item>
                    <Typography>Already Have an Account?</Typography>
                    <Button type="dashed"  onClick={()=>router.push("/login")}>
                        Login
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default SignUp;
