import { FarmPlanModel } from '@/models/farm-plan.model.js';
import { UserPresenceModel } from '@/models/user-presence.model.js';
import { UserSessionModel } from '@/models/user-session.model.js';
import { emitPresenceUpdate } from '@/services/presence/presence.socket.js';
import { AppError } from '@/utils/app-error.js';

export async function setPresence(userId: string, status: 'online' | 'offline' | 'away' | 'busy' | 'invisible', activeDevice?: string) {
  const presence = await UserPresenceModel.findOneAndUpdate({ userId }, { status, lastSeen: new Date(), activeDevice }, { new: true, upsert: true });
  emitPresenceUpdate(userId, presence);
  return presence;
}

export async function getPresence(userId: string) {
  const presence = await UserPresenceModel.findOne({ userId }).lean();
  return { presence: presence ?? { userId, status: 'offline', lastSeen: null } };
}

export async function listTeamPresence(requesterId: string, farmId: string, role: string) {
  const farm = await FarmPlanModel.findById(farmId).select('ownerId').lean();
  if (!farm) throw new AppError('Farm plan not found.', 404);
  if (role !== 'admin' && farm.ownerId.toString() !== requesterId) throw new AppError('Farm plan not found.', 404);
  const presences = await UserPresenceModel.find({ userId: farm.ownerId }).lean();
  return { presences };
}

export async function createSession(input: { userId: string; socketId: string; ip?: string; device?: string; browser?: string; platform?: string }) {
  await UserSessionModel.create({ ...input, connectedAt: new Date() });
}

export async function closeSession(socketId: string) {
  await UserSessionModel.findOneAndUpdate({ socketId }, { disconnectedAt: new Date() });
}
