import type { AuthenticatedUser } from '@/types/http.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
