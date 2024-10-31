import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.URI as string;

export const getClient = (): MongoClient => new MongoClient(uri);

export { ObjectId };

export const employeeCollection = 'employees';

