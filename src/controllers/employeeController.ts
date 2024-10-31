import { Request, Response } from 'express';
import { getClient, ObjectId, employeeCollection } from '../models/employeeModel';

// For the calendar, we need to create, read, update, and delete employees
export const createEmployee = async (req: Request, res: Response): Promise<void> => {
    const { name, schedule } = req.body;

    if (!name || !schedule) {
        res.status(400).json({ message: 'Invalid data' });
        return;
    }

    const client = getClient();
    try {
        await client.connect();
        const database = client.db('SupportApp');
        const employees = database.collection(employeeCollection);

        const result = await employees.insertOne({ name, schedule, deleted: false });
        res.status(201).json({ message: 'Employee created successfully', id: result.insertedId });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    } finally {
        await client.close();
    }
};

// Get all employees
export const getEmployees = async (req: Request, res: Response): Promise<void> => {
    const client = getClient();
    try {
        await client.connect();
        const database = client.db('SupportApp');
        const employees = database.collection(employeeCollection);

        const employeeList = await employees.find({ deleted: { $ne: true } }).toArray();
        res.status(200).json(employeeList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.close();
    }
};

// Update an employee's schedule
export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { day, schedule } = req.body;

    if (!ObjectId.isValid(id)) {
        res.status(400).json({ message: 'Invalid employee ID' });
        return;
    }

    const client = getClient();
    try {
        await client.connect();
        const database = client.db('SupportApp');
        const employees = database.collection(employeeCollection);

        const updatedSchedule: any = {};
        Object.keys(schedule).forEach((key) => {
            if (schedule[key].trim()) {
                updatedSchedule[`schedule.${day}.${key}`] = schedule[key];
            }
        });

        const result = await employees.updateOne({ _id: new ObjectId(id) }, { $set: updatedSchedule });
        if (result.matchedCount === 0) {
            res.status(404).json({ message: 'Employee not found' });
            return;
        }

        res.status(200).json({ message: 'Employee schedule updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.close();
    }
};

// Soft delete an employee
export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        res.status(400).json({ message: 'Invalid employee ID' });
        return;
    }

    const client = getClient();
    try {
        await client.connect();
        const database = client.db('SupportApp');
        const employees = database.collection(employeeCollection);

        const result = await employees.updateOne({ _id: new ObjectId(id) }, { $set: { deleted: true } });
        if (result.modifiedCount === 1) {
            res.status(200).json({ message: 'Employee deleted' });
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.close();
    }
};

