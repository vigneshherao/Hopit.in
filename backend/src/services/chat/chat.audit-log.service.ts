import { AuditLogModel } from '@/models/audit-log.model.js';

export async function writeAuditLog(input: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ip?: string;
  device?: string;
  browser?: string;
}) {
  return AuditLogModel.create(input);
}

export async function listAuditLogs(query: Record<string, unknown> = {}) {
  const limit = Number(query.limit ?? 50);
  const filter: Record<string, unknown> = {};
  if (query.userId) filter.userId = query.userId;
  if (query.action) filter.action = query.action;
  if (query.entity) filter.entity = query.entity;
  if (query.entityId) filter.entityId = query.entityId;
  if (query.from || query.to) filter.createdAt = { ...(query.from ? { $gte: query.from } : {}), ...(query.to ? { $lte: query.to } : {}) };
  const logs = await AuditLogModel.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  return { logs };
}
