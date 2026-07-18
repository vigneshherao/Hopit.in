import { Schema, model, type HydratedDocument } from 'mongoose';

export interface ConversationAnalytics {
  conversationId: Schema.Types.ObjectId;
  messageCount: number;
  attachmentCount: number;
  activeMembers: number;
  dailyMessages: number;
  weeklyMessages: number;
  monthlyMessages: number;
  reactionCount: number;
  threadCount: number;
  announcementCount: number;
  mostUsedReaction?: string;
  averageReplyTimeMinutes?: number;
  calculatedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ConversationAnalyticsDocument = HydratedDocument<ConversationAnalytics>;

const conversationAnalyticsSchema = new Schema<ConversationAnalytics>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, unique: true, index: true },
    messageCount: { type: Number, default: 0, min: 0 },
    attachmentCount: { type: Number, default: 0, min: 0 },
    activeMembers: { type: Number, default: 0, min: 0 },
    dailyMessages: { type: Number, default: 0, min: 0 },
    weeklyMessages: { type: Number, default: 0, min: 0 },
    monthlyMessages: { type: Number, default: 0, min: 0 },
    reactionCount: { type: Number, default: 0, min: 0 },
    threadCount: { type: Number, default: 0, min: 0 },
    announcementCount: { type: Number, default: 0, min: 0 },
    mostUsedReaction: { type: String, trim: true },
    averageReplyTimeMinutes: { type: Number, min: 0 },
    calculatedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

export const ConversationAnalyticsModel = model<ConversationAnalytics>('ConversationAnalytics', conversationAnalyticsSchema);
