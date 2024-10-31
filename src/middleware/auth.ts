
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: string | object; 
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authorization token missing' });
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      req.user = decoded; 
      next();
    } catch (error) {
      res.status(403).json({ message: 'Invalid or expired token' });
    }
  }
};
