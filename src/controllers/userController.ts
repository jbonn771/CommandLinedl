import { Request, Response } from 'express';
import { getClient } from '../models/userModel';

// Used for approving or denying users in the admin page
export const getPendingUsers = async (req: Request, res: Response): Promise<void> => {
    const client = getClient();
    try {
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');
        const pendingUsers = await users.find({ pendingApproval: true }).toArray();

        if (pendingUsers.length === 0) {
            res.status(404).json({ message: 'No users pending approval' });
            return;
        }

        res.status(200).json(pendingUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.close();
    }
};

// Get all approved users 
export const getApprovedUsers = async (req: Request, res: Response): Promise<void> => {
    const client = getClient();
    try {
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');
        const approvedUsers = await users.find({ pendingApproval: false }).toArray();
        
        if (approvedUsers.length === 0) {
            res.status(404).json({ message: 'No users approved' });
            return;
        }

        res.status(200).json(approvedUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.close();
    }
}
    

export const approveUser = async (req: Request, res: Response): Promise<void> => {
    const client = getClient();
    const { userId } = req.params;

    try {
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');

        const result = await users.updateOne({ user_id: userId }, { $set: { pendingApproval: false } });
        if (result.matchedCount === 0) {
            res.status(404).send('User not found');
            return;
        }

        res.send('User approved');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    } finally {
        await client.close();
    }
};

export const denyUser = async (req: Request, res: Response): Promise<void> => {
    const client = getClient();
    const { userId } = req.params;

    try {
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');

        const result = await users.deleteOne({ user_id: userId });
        if (result.deletedCount === 1) {
            res.status(200).send('User denied and removed');
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    } finally {
        await client.close();
    }
};
