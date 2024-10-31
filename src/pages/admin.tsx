import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

import AdminApproval from '../components/approveUsers';
import AppNav from './../components/appNav';
import axios from 'axios';

interface AdminProps {
  onSignOut: () => void;
}

interface User {
  email: string;
  userId: string;
  [key: string]: any;  
}

const Admin: React.FC<AdminProps> = ({ onSignOut }) => {
  const [user, setUser] = useState<User | null>(null);

  const [cookies, , removeCookie] = useCookies(['UserId', 'AuthToken']);
  const navigate = useNavigate();

  const userId = cookies.UserId as string;  
  const authToken = cookies.AuthToken as string;  

  const getUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/approved', {
        params: { userId }
      });
      setUser(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="overlay min-h-screen flex flex-col">
      <AppNav authToken={authToken} minimal={false} onSignOut={onSignOut} />
      <h1 className="text-center text-4xl font-bold my-8 text-gray-800">Admin Dashboard</h1>

      {/* Admin Approval Widget */}
      <div className="widget-container flex justify-center">
        <div className="admin-approval-widget bg-white p-6 shadow-lg rounded-lg w-full max-w-xl">
          <AdminApproval />
        </div>
      </div>
    </div>
  );
};

export default Admin;
