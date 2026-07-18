import crypto from 'node:crypto';
import path from 'node:path';
import { DISEASE_ALLOWED_EXTENSIONS, DISEASE_ALLOWED_MIME_TYPES, DISEASE_MAX_IMAGE_SIZE_BYTES } from '@/constants/disease.constants.js';
import { AppError } from '@/utils/app-error.js';

export interface ValidatedDiseaseImage {
  hash: string;
  width: number;
  height: number;
  mimeType: string;
  size: number;
}

export function generateImageHash(buffer: Buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function validateDiseaseImage(file: Express.Multer.File): ValidatedDiseaseImage {
  if (!file?.buffer?.length) throw new AppError('Uploaded image is empty or corrupted.', 400);
  if (file.size > DISEASE_MAX_IMAGE_SIZE_BYTES) throw new AppError('Image must be 10 MB or smaller.', 400);
  if (!DISEASE_ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof DISEASE_ALLOWED_MIME_TYPES)[number])) throw new AppError('Only JPEG, PNG and WEBP crop images are supported.', 400);

  const extension = path.extname(file.originalname).replace('.', '').toLowerCase();
  if (!DISEASE_ALLOWED_EXTENSIONS.includes(extension as (typeof DISEASE_ALLOWED_EXTENSIONS)[number])) throw new AppError('Unsupported image extension.', 400);
  if (/(heic|gif|tiff?|svg)$/i.test(extension)) throw new AppError('HEIC, GIF, TIFF and SVG files are not supported.', 400);

  const dimensions = readImageDimensions(file.buffer, file.mimetype);
  if (!dimensions) throw new AppError('Image appears corrupted or unsupported.', 400);
  if (dimensions.width < 64 || dimensions.height < 64) throw new AppError('Image dimensions are too small for disease analysis.', 400);

  return { hash: generateImageHash(file.buffer), width: dimensions.width, height: dimensions.height, mimeType: file.mimetype, size: file.size };
}

function readImageDimensions(buffer: Buffer, mimeType: string) {
  if (mimeType === 'image/png') return readPngDimensions(buffer);
  if (mimeType === 'image/jpeg') return readJpegDimensions(buffer);
  if (mimeType === 'image/webp') return readWebpDimensions(buffer);
  return null;
}

function readPngDimensions(buffer: Buffer) {
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function readJpegDimensions(buffer: Buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

function readWebpDimensions(buffer: Buffer) {
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  if (chunk === 'VP8 ') return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

