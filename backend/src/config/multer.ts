import multer from 'multer';
import path from 'node:path';
import { AppError } from '@/utils/app-error.js';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const allowed = new Map<string, Set<string>>([
      ['image/jpeg', new Set(['.jpg', '.jpeg'])],
      ['image/png', new Set(['.png'])],
      ['image/webp', new Set(['.webp'])],
      ['application/pdf', new Set(['.pdf'])],
      ['text/plain', new Set(['.txt'])],
      ['audio/mpeg', new Set(['.mp3'])],
      ['audio/wav', new Set(['.wav'])],
      ['audio/webm', new Set(['.webm'])],
    ]);
    const extensions = allowed.get(file.mimetype.toLowerCase());
    if (!extensions?.has(extension)) {
      callback(new AppError('Unsupported or mismatched file type.', 415));
      return;
    }
    callback(null, true);
  },
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 10,
    fields: 30,
  },
});
