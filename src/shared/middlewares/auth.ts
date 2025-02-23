import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserRepository } from '../../users/repositories/UserRepository';
import { UserPayload } from '../config/types/userPayload';
import { AuthRequest } from '../config/types/authRequest';

dotenv.config();

const secretKey = process.env.SECRET || "";

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try{

    const payload = jwt.verify(token, secretKey) as UserPayload;
    const user = await UserRepository.findByUserId(payload.user_id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  
    req.userData = payload;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
  }
  return res.status(401).json({ message: 'Unauthorized' });
  }
};