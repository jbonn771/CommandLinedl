import React, { useState } from 'react';
import axios from 'axios';

const InboxManager: React.FC = () => {
  const [activityFeed, setActivityFeed] = useState<string[]>([]);
  const [buttonText, setButtonText] = useState<string>('Activate');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const callBackend = async () => {
    if (buttonText === 'Activate') {
      setButtonText('Cancel');
      setActivityFeed((prevFeed) => [...prevFeed, 'Chats are being reassigned...']);

      try {
        await axios.post('http://localhost:5000/api/intercom/start');
        setActivityFeed((prevFeed) => [...prevFeed, 'Started chat reassignment successfully.']);

        // Poll logs every 5 seconds
        setInterval(async () => {
          const response = await axios.get('http://localhost:5000/api/intercom/logs');
          setActivityFeed((prevFeed) => [...prevFeed, ...response.data.logs]);
        }, 5000);
      } catch (error) {
        setActivityFeed((prevFeed) => [...prevFeed, 'Error starting chat reassignment.']);
        setButtonText('Activate');
      }

    } else {
      setButtonText('Activate');
      try {
        await axios.post('http://localhost:5000/api/intercom/stop');
        setActivityFeed((prevFeed) => [...prevFeed, 'Reassign Chats stopped']);
      } catch (error) {
        setActivityFeed((prevFeed) => [...prevFeed, 'Error stopping chat reassignment.']);
      }
    }
  };

  return (
    <div className="widget bg-white shadow-lg rounded-xl p-6 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Inbox Manager</h2>
        <button
          className={`text-white font-medium py-2 px-4 rounded-lg transition-all duration-150 ml-6 ${
            buttonText === 'Cancel' ? 'bg-[#FF4998] hover:bg-[#ff3b8a]' : 'bg-[#FF4998] hover:bg-[#ff3b8a]'
          }`}
          onClick={callBackend}
        >
          {buttonText}
        </button>
      </div>

      <div className="activity-feed-container h-40 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-inner space-y-2">
        <ul className="activity-feed list-disc ml-4 space-y-2">
          {activityFeed.map((activity, index) => (
            <li
              key={index}
              className={`activity-item cursor-pointer text-gray-700 ${
                expandedIndex === index ? 'font-semibold' : ''
              }`}
              onClick={() => toggleExpand(index)}
            >
              {expandedIndex === index
                ? activity
                : activity.substring(0, 50) + (activity.length > 50 ? '...' : '')}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InboxManager;




