import { Schema, model, type HydratedDocument } from 'mongoose';

export interface AssistantConversation {
  ownerId: Schema.Types.ObjectId;
  farmPlanId: Schema.Types.ObjectId;
  title: string;
  lastMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AssistantConversationDocument = HydratedDocument<AssistantConversation>;

const assistantConversationSchema = new Schema<AssistantConversation>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    lastMessage: { type: String, trim: true, maxlength: 600 },
  },
  { timestamps: true },
);

assistantConversationSchema.index({ ownerId: 1, farmPlanId: 1, updatedAt: -1 });

export const AssistantConversationModel = model<AssistantConversation>('AssistantConversation', assistantConversationSchema);

