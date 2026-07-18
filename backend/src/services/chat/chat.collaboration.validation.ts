import { z } from 'zod';
import { ANNOUNCEMENT_PRIORITIES, CHAT_REACTIONS } from '@/constants/chat.constants.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id.');

export const reactionSchema = z.object({
  messageId: objectId,
  emoji: z.enum(CHAT_REACTIONS),
});

export const messageTargetSchema = z.object({
  messageId: objectId,
});

export const conversationQuerySchema = z.object({
  conversationId: objectId.optional(),
  cursor: objectId.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const threadQuerySchema = z.object({
  messageId: objectId,
  cursor: objectId.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
});

export const threadReplySchema = z.object({
  messageId: objectId,
  text: z.string().trim().min(1).max(5000),
  clientMessageId: z.string().trim().min(4).max(120).optional(),
});

export const noteCreateSchema = z.object({
  conversationId: objectId,
  title: z.string().trim().min(2).max(160),
  content: z.string().trim().min(1).max(12000),
});

export const noteUpdateSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  content: z.string().trim().min(1).max(12000).optional(),
}).refine((value) => Boolean(value.title || value.content), 'At least one note field is required.');

export const noteParamSchema = z.object({
  noteId: objectId,
});

export const announcementCreateSchema = z.object({
  conversationId: objectId,
  title: z.string().trim().min(2).max(160),
  message: z.string().trim().min(1).max(2000),
  priority: z.enum(ANNOUNCEMENT_PRIORITIES).default('normal'),
  expiresAt: z.coerce.date().optional(),
});

export const announcementUpdateSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  message: z.string().trim().min(1).max(2000).optional(),
  priority: z.enum(ANNOUNCEMENT_PRIORITIES).optional(),
  expiresAt: z.coerce.date().nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, 'At least one announcement field is required.');

export const announcementParamSchema = z.object({
  announcementId: objectId,
});

const bookmarkBaseSchema = z.object({
  conversationId: objectId,
  messageId: objectId.optional(),
  noteId: objectId.optional(),
  announcementId: objectId.optional(),
  label: z.string().trim().max(120).optional(),
});

export const bookmarkCreateSchema = bookmarkBaseSchema.refine((value) => [value.messageId, value.noteId, value.announcementId].filter(Boolean).length === 1, 'Bookmark exactly one item.');

export const bookmarkDeleteSchema = bookmarkBaseSchema.pick({ messageId: true, noteId: true, announcementId: true }).refine((value) => [value.messageId, value.noteId, value.announcementId].filter(Boolean).length === 1, 'Select one bookmark item.');
