import React, { useEffect, useState } from 'react';
import { Layout, Menu, Dropdown, Button, Space, Typography } from 'antd';
import { HomeOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { auth, signOut } from "../util/firebase"
import Link from 'next/link';
import { useRouter } from 'next/router';
const { Header } = Layout;
import { usePathname } from 'next/navigation';

const Navbar: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname()

  useEffect(() => {
    const user = auth.currentUser;
    setUserEmail(user?.email);
    // setUserEmail(localStorage.getItem("email"));
    setRole(localStorage.getItem("role"));
    setUserId(localStorage.getItem("userId"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    signOut(auth)
      .then(() => {
        console.log('User signed out');
        router.push("/login")
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );
  return (
    <Header style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href={`/main?role=${role}&email=${encodeURIComponent(userEmail)}&userId=${encodeURIComponent(userId)}`} passHref>
          <Button type="text" icon={<HomeOutlined />} style={{ fontSize: '16px', color: '#000' }} >
          {pathname.startsWith("/task")?
          <Typography >/Tasks</Typography>
          :
          ""}
          </Button>
        </Link>
        <Dropdown overlay={userMenu} placement="bottomRight">
          <Button type="text" icon={<UserOutlined />} style={{ fontSize: '16px', color: '#000' }}>
            {userEmail}
          </Button>
        </Dropdown>
      </div>
    </Header>
  );
};

export default Navbar;
// import React, { useEffect, useState } from 'react';
// import { Layout, Menu, Dropdown, Button, Space } from 'antd';
// import { HomeOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
// import { auth, signOut } from "../util/firebase"
// import Link from 'next/link';
// import { useRouter } from 'next/router';
// const { Header } = Layout;

// interface NavbarProps {
//     email: string | null;
// }

// const Navbar: React.FC<NavbarProps> = ({ email }) => {
//   const router = useRouter();
//   const { role, userId } = router.query;

//   const handleLogout = () => {
//     signOut(auth)
//       .then(() => {
//         console.log('User signed out');
//         router.push("/login")
//       })
//       .catch((error) => {
//         console.error('Error signing out:', error);
//       });
//   };

//   const userMenu = (
//     <Menu>
//       <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
//         Logout
//       </Menu.Item>
//     </Menu>
//   );

//   return (
//     <Header style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Link href="/" passHref>
//           <Button type="text" icon={<HomeOutlined />} style={{ fontSize: '16px', color: '#000' }} />
//         </Link>
//         <Dropdown overlay={userMenu} placement="bottomRight">
//           <Button type="text" icon={<UserOutlined />} style={{ fontSize: '16px', color: '#000' }}>
//             {email}
//           </Button>
//         </Dropdown>
//       </div>
//     </Header>
//   );
// };

// export default Navbar;
