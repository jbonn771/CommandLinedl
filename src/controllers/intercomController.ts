import axios, { AxiosResponse } from 'axios';
import { scheduleJob, Job } from 'node-schedule';
import dotenv from 'dotenv';

dotenv.config();
const ACCESS_TOKEN = process.env.INTERCOM_ACCESS_TOKEN || '';
const INBOX_ID = 4436480;


let activeAdminIds: number[] = [];
let scheduledJob: Job | null = null;

// function to retrieve active admin IDs
export const getAdminIdsWithAwayModeOff = async (): Promise<void> => {
  const url = "https://api.intercom.io/admins";
  const headers = {
    "Intercom-Version": "2.11",
    "Authorization": `Bearer ${ACCESS_TOKEN}`
  };

  try {
    const response: AxiosResponse = await axios.get(url, { headers });
    const admins = response.data.admins || [];
    activeAdminIds = admins
      .filter((admin: any) => admin.team_ids.includes(INBOX_ID) && !admin.away_mode_enabled)
      .map((admin: any) => admin.id);
  } catch (error: any) {
    console.error(`Failed to fetch admin data: ${error.response?.status}, ${error.response?.data}`);
  }
};

// function to fetch unassigned, open conversations
export const getUnassignedOpenConversations = async (): Promise<any[]> => {
  const url = 'https://api.intercom.io/conversations/search';
  const headers = {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Intercom-Version': '2.11',
    'Content-Type': 'application/json'
  };
  const query = {
    query: {
      operator: "AND",
      value: [
        { field: "team_assignee_id", operator: "=", value: INBOX_ID },
        { field: "admin_assignee_id", operator: "=", value: "0" },
        { field: "state", operator: "=", value: "open" }
      ]
    },
    pagination: { per_page: 5 }
  };

  try {
    const response: AxiosResponse = await axios.post(url, query, { headers });
    return response.data.conversations || [];
  } catch (error: any) {
    console.error(`Failed to fetch conversations: ${error.response?.status}, ${error.response?.data}`);
    return [];
  }
};

// Function to assign a conversation to a teammate
export const assignConversation = async (conversationId: number, teammateId: number): Promise<void> => {
  const url = `https://api.intercom.io/conversations/${conversationId}/parts`;
  const headers = {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };
  const data = {
    message_type: 'assignment',
    type: 'admin',
    admin_id: '5399130',
    assignee_id: teammateId
  };

  try {
    await axios.post(url, data, { headers });
    console.log(`Assigned conversation ${conversationId} to teammate ${teammateId}.`);
  } catch (error: any) {
    console.error(`Failed to assign conversation ${conversationId}: ${error.response?.status}, ${error.response?.data}`);
  }
};

// Main function to check and assign conversations
export const checkAndAssignConversations = async (): Promise<void> => {
  await getAdminIdsWithAwayModeOff();
  const conversations = await getUnassignedOpenConversations();

  if (conversations.length > 0) {
    console.log(`Found ${conversations.length} unassigned and open conversations.`);
    for (const conversation of conversations) {
      const conversationId = conversation.id;
      if (activeAdminIds.length === 0) {
        console.log('No active teammates found.');
        scheduleJob(Date.now() + 5 * 60 * 1000, checkAndAssignConversations); // Retry in 5 minutes
        break;
      }

      const teammateId = activeAdminIds[Math.floor(Math.random() * activeAdminIds.length)];
      await assignConversation(conversationId, teammateId);
      console.log(`Assigned conversation ID: ${conversationId} to teammate ID: ${teammateId}`);
      await new Promise(resolve => setTimeout(resolve, 60 * 1000)); // Wait 1 minute before the next assignment
    }
  } else {
    console.log('No unassigned and open conversations found.');
  }
};

// Functions to control the scheduler
export const startAssigning = (): void => {
  if (!scheduledJob) {
    console.log('Starting the scheduler...');
    scheduledJob = scheduleJob('*/1 * * * *', checkAndAssignConversations); // Run every minute
  } else {
    console.log('Scheduler is already running.');
  }
};

export const stopAssigning = (): void => {
  if (scheduledJob) {
    scheduledJob.cancel();
    console.log('Scheduler stopped.');
    scheduledJob = null;
  } else {
    console.log('Scheduler is not running.');
  }
};






// get active teammates

interface AdminDetails {
    teammate: string;
    email: string;
  }
  
  interface AdminsResponse {
    activeTeammates: AdminDetails[];
    inactiveTeammates: AdminDetails[];
  }
  
  export const getAdminsInInboxByAwayModeStatus = async (): Promise<AdminsResponse> => {
    let activeAdmins: AdminDetails[] = [];
    let inactiveAdmins: AdminDetails[] = [];
  
    try {
      const url = 'https://api.intercom.io/admins';
      const headers = {
        'Intercom-Version': '2.11',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Accept': 'application/json',
      };
  
      const response: AxiosResponse = await axios.get(url, { headers });
      console.log("Response data:", response.data);  // Debug log
  
      if (response.status === 200 && response.data.admins) {
        response.data.admins.forEach((admin: any) => {
          console.log("Admin team_ids:", admin.team_ids, "INBOX_ID:", INBOX_ID); // Debug log
  
          if (admin.team_ids && admin.team_ids.some((id: any) => id == INBOX_ID)) { // Loose equality
            const adminDetails: AdminDetails = { teammate: admin.name, email: admin.email };
  
            // Check away_mode_enabled status
            if (!admin.away_mode_enabled) {
              console.log("Active Admin:", admin.name); // Debug log
              activeAdmins.push(adminDetails);
            } else {
              console.log("Inactive Admin:", admin.name); // Debug log
              inactiveAdmins.push(adminDetails);
            }
          }
        });
      } else {
        console.error(`Failed to fetch admin data: ${response.status}`, response.data);
      }
    } catch (error: any) {
      console.error(`Error fetching admin data: ${error}`);
    }
  
    return { activeTeammates: activeAdmins, inactiveTeammates: inactiveAdmins };
  };
  
  

  