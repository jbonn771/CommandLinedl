import React, { useState } from 'react';
import axios from 'axios';

interface Teammate {
  teammate: string;
  email: string;
}

interface Output {
  activeTeammates: Teammate[];
  inactiveTeammates: Teammate[];
}

const ActiveTeammates: React.FC = () => {
  const [output, setOutput] = useState<Output>({ activeTeammates: [], inactiveTeammates: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<Record<string, boolean>>({});
  const [activityLog, setActivityLog] = useState<string[]>([]);

  const callBackend = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/intercom/status');
      const activeTeammates: Teammate[] = response.data.activeTeammates || [];
      const inactiveTeammates: Teammate[] = response.data.inactiveTeammates || [];
      setOutput({ activeTeammates, inactiveTeammates });
      setActivityLog((prevLog) => [`Fetched teammate status`, ...prevLog]);
    } catch (error) {
      console.error('Error calling backend', error);
    }
    setLoading(false);
  };

  const sendMessage = async (email: string) => {
    setLoadingMessages((prevLoading) => ({
      ...prevLoading,
      [email]: true,
    }));

    setTimeout(async () => {
      try {
        await axios.post('http://localhost:5000/api/slack/send-message', { email });
        console.log(`Message sent for ${email}`);
        setActivityLog((prevLog) => [`Message sent to ${email}`, ...prevLog]);
      } catch (error) {
        console.error('Error sending message', error);
      }

      setLoadingMessages((prevLoading) => ({
        ...prevLoading,
        [email]: false,
      }));
    }, 3000);
  };

  return (
    <div className="teammates-widget p-6 bg-white shadow-lg rounded-xl max-w-3xl mx-auto space-y-4">
      <div className="widget-header flex justify-between items-center mb-4 border-b pb-2 border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">Teammates</h1>
        <button
          className={`refresh-button bg-[#FF4998] hover:bg-[#ff3b8a] text-white font-medium py-2 px-4 rounded-lg transition-all duration-150 ${
            loading ? 'cursor-not-allowed opacity-50' : ''
          }`}
          onClick={callBackend}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      
      <div className="flex space-x-4">
        {/* Active Teammates */}
        <div className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-inner">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Active Teammates</h2>
          <ul className="h-48 overflow-y-auto space-y-2">
            {output.activeTeammates.length > 0 ? (
              output.activeTeammates.map((teammate, index) => (
                <li key={index} className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg shadow-sm">
                  <span className="text-gray-900 w-2/3 truncate">{teammate.teammate}</span>
                  <span className="text-gray-500 text-sm w-1/3 truncate">{teammate.email}</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No active teammates found</p>
            )}
          </ul>
        </div>

        {/* Inactive Teammates */}
        <div className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-inner">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Inactive Teammates</h2>
          <ul className="h-48 overflow-y-auto space-y-2">
            {output.inactiveTeammates.length > 0 ? (
              output.inactiveTeammates.map((teammate, index) => (
                <li key={index} className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg shadow-sm">
                  <span className="text-gray-900 w-2/3 truncate">{teammate.teammate}</span>
                  <button
                    className={`bg-[#00b364] hover:bg-[#009b58] text-white font-medium text-sm py-1 px-3 rounded-md transition-all duration-150 ${
                      loadingMessages[teammate.email] ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    onClick={() => sendMessage(teammate.email)}
                    disabled={loadingMessages[teammate.email]}
                    style={{ whiteSpace: 'nowrap' }} 
                  >
                    {loadingMessages[teammate.email] ? 'Sending...' : 'Send Message'}
                  </button>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No inactive teammates found</p>
            )}
          </ul>
        </div>
      </div>

      {/* Activity Log */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Activity Log</h2>
        <div className="h-32 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-inner space-y-2">
          {activityLog.length > 0 ? (
            activityLog.map((log, index) => (
              <p key={index} className="text-gray-600 text-sm">
                {log}
              </p>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No activity logged yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveTeammates;

