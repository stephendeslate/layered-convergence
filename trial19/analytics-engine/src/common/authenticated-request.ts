import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  tenantId: string;
  userId: string;
  userRole: string;
}
