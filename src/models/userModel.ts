import { Schema, model, Document } from 'mongoose';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.URI as string;

export const getClient = (): MongoClient => new MongoClient(uri);

export { ObjectId };

export interface IUser extends Document {
  user_id: string;
  email: string;
  hashed_password: string;
  pendingApproval: boolean;
}

const userSchema = new Schema<IUser>({
  user_id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  hashed_password: { type: String, required: true },
  pendingApproval: { type: Boolean, default: true },
});

export const User = model<IUser>('User', userSchema);

