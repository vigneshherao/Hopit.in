import { Schema, model, type HydratedDocument } from 'mongoose';

export interface AuditLog {
  userId?: Schema.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: Schema.Types.ObjectId;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ip?: string;
  device?: string;
  browser?: string;
  createdAt?: Date;
}

export type AuditLogDocument = HydratedDocument<AuditLog>;

const auditLogSchema = new Schema<AuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, trim: true, index: true },
    entity: { type: String, required: true, trim: true, index: true },
    entityId: { type: Schema.Types.ObjectId, index: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    ip: { type: String, trim: true },
    device: { type: String, trim: true },
    browser: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });

auditLogSchema.pre('findOneAndUpdate', function preventUpdate() {
  throw new Error('Audit logs are append-only.');
});

auditLogSchema.pre('updateOne', function preventUpdate() {
  throw new Error('Audit logs are append-only.');
});

auditLogSchema.pre('deleteOne', function preventDelete() {
  throw new Error('Audit logs are append-only.');
});

export const AuditLogModel = model<AuditLog>('AuditLog', auditLogSchema);
