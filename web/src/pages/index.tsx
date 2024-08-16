import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Login from './login';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    console.log("In the Main File")
    router.push('/login');
  }, []);

  return <Login />;
}
