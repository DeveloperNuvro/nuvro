import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

const roleMiddleware = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) : any => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

export default roleMiddleware;
