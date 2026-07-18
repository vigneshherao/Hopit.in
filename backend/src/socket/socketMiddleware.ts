import type { Socket } from 'socket.io';
import { canJoinRoom } from '@/socket/socketRooms.js';

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function canEmit(socket: Socket, eventName: string, limit = 40, windowMs = 60_000): boolean {
  const key = `${socket.id}:${eventName}`;
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

export async function safeJoinRoom(socket: Socket, room: string): Promise<boolean> {
  if (!canEmit(socket, 'join-room', 30, 60_000)) return false;
  const allowed = await canJoinRoom({ room, userId: socket.data.userId as string, role: socket.data.role as string });
  if (allowed) socket.join(room);
  return allowed;
}
