import type { Socket } from 'socket.io';
import { UserModel } from '@/models/user.model.js';
import { verifyAccessToken } from '@/utils/token.js';

export interface AuthenticatedSocketData {
  userId: string;
  role: string;
  device?: string;
  connectedAt: Date;
  lastSeen: Date;
}

export type AuthenticatedSocket = Socket & { data: AuthenticatedSocketData };

function getSocketToken(socket: Socket): string | undefined {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === 'string') return authToken;
  const header = socket.handshake.headers.authorization;
  return header?.startsWith('Bearer ') ? header.slice(7) : undefined;
}

export async function authenticateSocket(socket: Socket, next: (error?: Error) => void): Promise<void> {
  try {
    const token = getSocketToken(socket);
    if (!token) throw new Error('Authentication token is required.');

    const decoded = verifyAccessToken(token);
    const user = await UserModel.findById(decoded.sub).select('role isActive').lean();
    if (!user?.isActive) throw new Error('User account is inactive.');

    socket.data.userId = decoded.sub;
    socket.data.role = user.role;
    socket.data.device = typeof socket.handshake.auth?.device === 'string' ? socket.handshake.auth.device : 'web';
    socket.data.connectedAt = new Date();
    socket.data.lastSeen = new Date();
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error('Socket authentication failed.'));
  }
}
