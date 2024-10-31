import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  user_id: string;
  email: string;
}

const AdminApproval: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/pending-approval');
        setPendingUsers(response.data);
      } catch (error) {
        console.error('Error fetching pending users:', error);
      }
    };

    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/users/approve/${userId}`);
      setPendingUsers(pendingUsers.filter(user => user.user_id !== userId));
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleDeny = async (userId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/deny/${userId}`);
      setPendingUsers(pendingUsers.filter(user => user.user_id !== userId));
    } catch (error) {
      console.error('Error denying user:', error);
    }
  };

  return (
    <div className="admin-approval-widget bg-white p-6 shadow-lg rounded-lg w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Pending User Approvals</h2>
      {pendingUsers.length > 0 ? (
        <ul className="user-list space-y-4">
          {pendingUsers.map(user => (
            <li key={user.user_id} className="user-request flex justify-between items-center">
              <div className="email">
                <span className="text-gray-700">{user.email}</span>
              </div>
              <div className="actions space-x-4">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded"
                  onClick={() => handleApprove(user.user_id)}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                  onClick={() => handleDeny(user.user_id)}
                >
                  Deny
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No users pending approval.</p>
      )}
    </div>
  );
};

export default AdminApproval;
