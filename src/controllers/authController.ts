import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { IUser, User } from '../models/userModel';

interface SignupRequest {
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

export const signup = async (req: { body: SignupRequest }, res: any) => {
  const { email, password } = req.body;
  const generatedUserId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send('User already exists. Please login.');
    }

    const sanitizedEmail = email.toLowerCase();
    const newUser = new User({
      user_id: generatedUserId,
      email: sanitizedEmail,
      hashed_password: hashedPassword,
      pendingApproval: true,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', pendingApproval: true });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).send('Internal server error');
  }
};

export const login = async (req: { body: LoginRequest }, res: any) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found. Please sign up.');
    }

    if (user.pendingApproval) {
      return res.status(403).send('Your account is pending approval.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
    if (!isPasswordValid) {
      return res.status(401).send('Invalid credentials.');
    }

    const token = jwt.sign({ userId: user.user_id }, user.email, { expiresIn: '24h' });
    res.status(200).json({ token, userId: user.user_id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
};
