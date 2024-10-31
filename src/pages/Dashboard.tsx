import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import InboxManager from '../components/Inboxmanager'; 
import ActiveTeammates from './../components/ActiveTeammates'; 
import axios from 'axios';
import AppNav from './../components/appNav'; 
import WeeklyScheduler from '../components/employeeschedule'; 

interface DashboardProps {
  onSignOut: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  
}

const Dashboard: React.FC<DashboardProps> = ({ onSignOut }) => { 
  const [user, setUser] = useState<User | null>(null);
  const [cookies, setCookie, removeCookie] = useCookies(['UserId', 'AuthToken']);
  const navigate = useNavigate();

  const userId = cookies.UserId;
  const authToken = cookies.AuthToken;

  const getUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users//approved', {
        params: { userId }
      });
      setUser(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!userId || !authToken) {
      navigate('/');
    } else {
      getUser();
    }
  }, [userId, authToken, navigate]);

  
  return (
    
    <div className="min-h-screen">
  
    <AppNav 
      authToken={authToken} 
      minimal={false} 
      onSignOut={onSignOut}
    />

  
  
  <div className="main-content pt-16 p-6 flex flex-col">
    <h1 className="dashboard-heading text-2xl font-semibold my-6 text-center"></h1>
    <div className="flex flex-1 justify-center items-center">
      <div className="widget-container flex space-x-4">
        <InboxManager />
        <ActiveTeammates />
      </div>
    </div>
    <div className="widget-container mt-6">
      <WeeklyScheduler />
    </div>
  </div>
</div>
  )
  

  
}  

export default Dashboard;
