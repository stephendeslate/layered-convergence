import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  companyId: string;
  userId: string;
  userRole: string;
}
