import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Express } from 'express';
import { env } from '@/config/env.js';
import { ChatAttachmentModel } from '@/models/chat-attachment.model.js';
import { getActiveMember } from '@/services/chat/chat.permissions.js';
import { AppError } from '@/utils/app-error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(__dirname, '../../uploads/chat');
const mimeTypes = new Map([
  ['image/jpeg', 'image'],
  ['image/png', 'image'],
  ['image/webp', 'image'],
  ['application/pdf', 'document'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'document'],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'document'],
  ['text/csv', 'document'],
  ['text/plain', 'document'],
  ['audio/webm', 'voice'],
  ['audio/ogg', 'voice'],
  ['audio/mpeg', 'voice'],
  ['audio/mp4', 'voice'],
]);

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(0, 120);
}

function maxSizeFor(type: string): number {
  if (type === 'image') return env.chatMaxImageSizeMb * 1024 * 1024;
  if (type === 'voice') return env.chatMaxVoiceSizeMb * 1024 * 1024;
  return env.chatMaxDocumentSizeMb * 1024 * 1024;
}

export async function uploadChatAttachments(conversationId: string, userId: string, files: Express.Multer.File[]) {
  await getActiveMember(conversationId, userId);
  if (!files.length) throw new AppError('At least one attachment is required.', 400);
  if (files.length > env.chatMaxAttachmentsPerMessage) throw new AppError('Too many attachments.', 400);
  await fs.mkdir(uploadRoot, { recursive: true });

  const attachments = [];
  for (const file of files) {
    const type = mimeTypes.get(file.mimetype);
    if (!type) throw new AppError('Unsupported attachment type.', 400);
    if (file.size > maxSizeFor(type)) throw new AppError('Attachment is too large.', 400);
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const sanitized = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${sanitizeFileName(file.originalname)}`;
    const diskPath = path.join(uploadRoot, sanitized);
    await fs.writeFile(diskPath, file.buffer);
    const attachment = await ChatAttachmentModel.create({
      conversationId,
      uploadedBy: userId,
      type,
      originalFileName: file.originalname,
      sanitizedFileName: sanitized,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      fileUrl: `/uploads/chat/${sanitized}`,
      thumbnailUrl: type === 'image' ? `/uploads/chat/${sanitized}` : undefined,
      checksum,
      scanStatus: env.chatAttachmentScanEnabled ? 'pending' : 'clean',
      processingStatus: 'completed',
    });
    attachments.push(attachment);
  }
  return { attachments };
}

export async function getChatAttachment(attachmentId: string, userId: string) {
  const attachment = await ChatAttachmentModel.findById(attachmentId).lean();
  if (!attachment) throw new AppError('Attachment not found.', 404);
  await getActiveMember(attachment.conversationId.toString(), userId);
  return { attachment };
}

export async function deleteChatAttachment(attachmentId: string, userId: string) {
  const attachment = await ChatAttachmentModel.findById(attachmentId);
  if (!attachment) throw new AppError('Attachment not found.', 404);
  await getActiveMember(attachment.conversationId.toString(), userId);
  if (attachment.messageId && attachment.uploadedBy.toString() !== userId) throw new AppError('Attachment is already attached to a message.', 400);
  await attachment.deleteOne();
  return { deleted: true };
}
