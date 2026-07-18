import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose, { type FilterQuery, type SortOrder } from 'mongoose';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/config/env.js';
import {
  LAND_LISTING_SELECT,
  type LandMarketplaceStatus,
} from '@/constants/land.constants.js';
import { NotificationModel } from '@/models/notification.model.js';
import { type Land, type LandDocument } from '@/models/land.model.js';
import * as landRepository from '@/repositories/land.repository.js';
import { ensureLandModeration } from '@/services/marketplace-moderation.service.js';
import type { LandAccessContext, LandStatistics } from '@/types/land.types.js';
import type {
  CreateLandInput,
  LandQueryInput,
  OwnerLandQueryInput,
  UpdateLandInput,
} from '@/validators/land.validator.js';
import { AppError } from '@/utils/app-error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localUploadRoot = path.resolve(__dirname, '../../uploads/lands');

export async function createLandListing(input: CreateLandInput, ownerId: string): Promise<LandDocument> {
  const slug = await createUniqueSlug(input.title);
  return landRepository.createLand({
    ...input,
    slug,
    ownerId: new mongoose.Types.ObjectId(ownerId) as unknown as Land['ownerId'],
    verification: {
      isOwnerVerified: false,
      isLandVerified: false,
    },
  });
}

export async function getPublicLands(query: LandQueryInput, context: LandAccessContext) {
  const filter = buildLandFilter(query);

  if (context.user?.role === 'admin' && query.status) {
    filter.status = query.status;
  } else {
    filter.status = 'available';
  }

  const sort = getSort(query.sort, query.priceType);

  if (query.latitude !== undefined && query.longitude !== undefined && query.radiusKm) {
    const lands = await landRepository.listNearbyLands(filter, query.longitude, query.latitude, query.radiusKm);
    const start = (query.page - 1) * query.limit;
    const paged = lands.slice(start, start + query.limit);
    return {
      lands: paged,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: lands.length,
        totalPages: Math.ceil(lands.length / query.limit) || 1,
      },
    };
  }

  return landRepository.listLands(filter, query.page, query.limit, sort, LAND_LISTING_SELECT);
}

export async function getLandDetails(identifier: string, context: LandAccessContext, viewKey?: string) {
  const land = await landRepository.findLandByIdentifier(identifier);
  if (!land) throw new AppError('Land listing not found.', 404);

  const ownerId = getDocumentId(land.ownerId);
  const isOwner = context.user?.id === ownerId;
  const isAdmin = context.user?.role === 'admin';

  if (land.status !== 'available' && !isOwner && !isAdmin) {
    throw new AppError('Land listing not found.', 404);
  }

  if (land.status === 'available' && shouldTrackView(land.id, viewKey)) {
    await landRepository.incrementLandViews(land.id);
    land.viewCount += 1;
  }

  const [related, applicationCount, hasApplied] = await Promise.all([
    landRepository.findRelatedLands(land),
    landRepository.countLandApplications(land.id),
    context.user?.role === 'farmer' ? landRepository.hasUserApplied(land.id, context.user.id) : Promise.resolve(false),
  ]);

  return {
    land: sanitizeLandForViewer(land.toObject(), Boolean(isOwner || isAdmin)),
    related,
    applicationCount: isOwner || isAdmin ? applicationCount : undefined,
    hasApplied,
  };
}

export async function getMyLands(query: OwnerLandQueryInput, userId: string, role: string) {
  const filter: FilterQuery<Land> = role === 'admin' ? {} : { ownerId: userId };
  if (query.status) filter.status = query.status;
  if (query.search) filter.$text = { $search: sanitizeSearch(query.search) };

  const result = await landRepository.listLands(filter, query.page, query.limit, getSort(query.sort), LAND_LISTING_SELECT);
  const enriched = await Promise.all(
    result.lands.map(async (land) => ({
      ...land,
      applicationCount: await landRepository.countLandApplications(String(land._id)),
    })),
  );

  return { ...result, lands: enriched };
}

export async function updateLandListing(
  id: string,
  input: UpdateLandInput,
  userId: string,
  role: string,
): Promise<LandDocument> {
  const land = await landRepository.findLandById(id);
  if (!land) throw new AppError('Land listing not found.', 404);
  assertCanManageLand(land, userId, role);

  const update = stripForbiddenUpdateFields(input, role);
  const importantChanged = hasImportantChange(update);

  if (role !== 'admin') {
    if (!['draft', 'pending-verification', 'inactive', 'rejected', 'available'].includes(land.status)) {
      throw new AppError('This listing cannot be edited in its current status.', 400);
    }
    if (land.status === 'available' && importantChanged) {
      update.status = 'pending-verification';
      update.verification = { ...land.verification, isLandVerified: false };
    }
  }

  const updated = await landRepository.updateLandById(id, update);
  if (!updated) throw new AppError('Land listing not found.', 404);
  return updated;
}

export async function deleteLandListing(id: string, userId: string, role: string) {
  const land = await landRepository.findLandById(id);
  if (!land) throw new AppError('Land listing not found.', 404);
  assertCanManageLand(land, userId, role);

  const applicationCount = await landRepository.countLandApplications(id);

  if (land.status === 'draft' && applicationCount === 0) {
    await land.deleteOne();
    return { deleted: true, status: 'deleted' };
  }

  land.status = 'inactive';
  await land.save();
  await createLandNotification(land, 'land-status-changed', 'Listing deactivated', 'Your land listing was deactivated.');
  return { deleted: false, status: 'inactive' };
}

export async function submitLandForVerification(id: string, userId: string): Promise<LandDocument> {
  const land = await landRepository.findLandById(id);
  if (!land) throw new AppError('Land listing not found.', 404);
  assertCanManageLand(land, userId, 'owner');

  land.status = 'pending-verification';
  await land.save();
  await ensureLandModeration(id, userId, 'Listing submitted for marketplace moderation.');
  await createLandNotification(
    land,
    'land-submitted',
    'Listing submitted for verification',
    'Your land listing has been submitted for verification.',
  );
  return land;
}

export async function verifyLandListing(
  id: string,
  action: 'approve' | 'reject',
  adminId: string,
  reason?: string,
): Promise<LandDocument> {
  const land = await landRepository.findLandById(id);
  if (!land) throw new AppError('Land listing not found.', 404);

  if (action === 'approve') {
    land.status = 'available';
    land.verification.isLandVerified = true;
    land.verification.verifiedBy = new mongoose.Types.ObjectId(adminId) as unknown as Land['verification']['verifiedBy'];
    land.verification.verifiedAt = new Date();
    land.verification.rejectionReason = undefined;
    await land.save();
    await createLandNotification(land, 'land-approved', 'Listing approved', 'Your land listing is now public.');
    return land;
  }

  land.status = 'rejected';
  land.verification.isLandVerified = false;
  land.verification.rejectionReason = reason;
  await land.save();
  await createLandNotification(land, 'land-rejected', 'Listing rejected', reason ?? 'Your land listing was rejected.');
  return land;
}

export async function changeLandStatus(id: string, action: string, userId: string, role: string): Promise<LandDocument> {
  const land = await landRepository.findLandById(id);
  if (!land) throw new AppError('Land listing not found.', 404);
  assertCanManageLand(land, userId, role);

  const transitions: Record<string, LandMarketplaceStatus> = {
    pause: 'inactive',
    resume: 'available',
    'mark-reserved': 'reserved',
    'mark-occupied': 'occupied',
  };

  if (action === 'resume' && !land.verification.isLandVerified && role !== 'admin') {
    throw new AppError('Only verified listings can be resumed.', 400);
  }

  land.status = transitions[action];
  await land.save();
  await createLandNotification(
    land,
    `land-${action}`,
    'Listing status changed',
    `Your land listing status changed to ${land.status}.`,
  );
  return land;
}

export async function getLandStatistics(userId: string, role: string): Promise<LandStatistics> {
  const filter: FilterQuery<Land> = role === 'admin' ? {} : { ownerId: userId };
  const [groups, totalApplications, mostViewed] = await Promise.all([
    landRepository.listLands(filter, 1, 1000, { createdAt: -1 }),
    landRepository.countApplicationsForOwner(userId),
    landRepository.listLands(filter, 1, 1, { viewCount: -1 }),
  ]);

  const lands = groups.lands as unknown as Land[];
  const count = (status: string) => lands.filter((land) => land.status === status).length;

  return {
    totalListings: groups.pagination.total,
    draftListings: count('draft'),
    pendingListings: count('pending-verification'),
    availableListings: count('available'),
    reservedListings: count('reserved'),
    occupiedListings: count('occupied'),
    totalViews: lands.reduce((sum, land) => sum + land.viewCount, 0),
    totalApplications,
    mostViewedLand: mostViewed.lands[0]
      ? {
          id: String((mostViewed.lands[0] as unknown as { _id: string })._id),
          title: (mostViewed.lands[0] as unknown as Land).title,
          viewCount: (mostViewed.lands[0] as unknown as Land).viewCount,
        }
      : null,
  };
}

export async function uploadLandFiles(files: Express.Multer.File[], kind: 'images' | 'documents') {
  const allowedMimeTypes =
    kind === 'images'
      ? ['image/jpeg', 'image/png', 'image/webp']
      : ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  const uploads = [];

  for (const file of files) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new AppError('Unsupported file type.', 400);
    }

    if (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret) {
      const uploaded = await uploadToCloudinary(file, kind);
      uploads.push(uploaded);
    } else {
      uploads.push(await uploadLocally(file, kind));
    }
  }

  return uploads;
}

export async function removeUploadedFile(url: string): Promise<void> {
  if (!url.startsWith('/uploads/lands/')) return;
  const relative = url.replace('/uploads/lands/', '');
  const filePath = path.join(localUploadRoot, relative);
  if (!filePath.startsWith(localUploadRoot)) return;
  await fs.rm(filePath, { force: true });
}

async function uploadLocally(file: Express.Multer.File, kind: 'images' | 'documents') {
  const folder = path.join(localUploadRoot, kind);
  await fs.mkdir(folder, { recursive: true });
  const extension = extensionFromMime(file.mimetype);
  const filename = `${Date.now()}-${cryptoSafeName(file.originalname)}.${extension}`;
  const filePath = path.join(folder, filename);
  await fs.writeFile(filePath, file.buffer);

  return {
    url: `/uploads/lands/${kind}/${filename}`,
    name: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  };
}

async function uploadToCloudinary(file: Express.Multer.File, kind: 'images' | 'documents') {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder: `hopit/lands/${kind}`,
    resource_type: kind === 'documents' && file.mimetype === 'application/pdf' ? 'raw' : 'image',
  });

  return {
    url: uploaded.secure_url,
    name: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  };
}

async function createUniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let suffix = 1;

  while (await landRepository.findLandByIdentifier(slug)) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return slug;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function buildLandFilter(query: LandQueryInput): FilterQuery<Land> {
  const filter: FilterQuery<Land> = {};
  if (query.search) filter.$text = { $search: sanitizeSearch(query.search) };
  if (query.state) filter['location.state'] = caseInsensitive(query.state);
  if (query.district) filter['location.district'] = caseInsensitive(query.district);
  if (query.city) filter['location.city'] = caseInsensitive(query.city);
  if (query.purpose) filter.purposes = query.purpose;
  if (query.transactionType) filter.transactionTypes = query.transactionType;
  if (query.soilType) filter['landDetails.soilType'] = query.soilType;
  if (query.terrain) filter['landDetails.terrain'] = query.terrain;
  if (query.waterAvailability) filter['landDetails.waterAvailability'] = query.waterAvailability;
  if (query.areaUnit) filter['area.unit'] = query.areaUnit;
  if (query.minimumArea !== undefined || query.maximumArea !== undefined) {
    filter['area.value'] = range(query.minimumArea, query.maximumArea);
  }
  if (query.priceType && (query.minimumPrice !== undefined || query.maximumPrice !== undefined)) {
    filter[`pricing.${query.priceType}`] = range(query.minimumPrice, query.maximumPrice);
  }
  if (query.roadAccess !== undefined) filter['landDetails.roadAccess'] = query.roadAccess;
  if (query.electricityAvailable !== undefined) filter['landDetails.electricityAvailable'] = query.electricityAvailable;
  if (query.irrigationAvailable !== undefined) filter['landDetails.irrigationAvailable'] = query.irrigationAvailable;
  if (query.ownerParticipationAllowed !== undefined) {
    filter['agreementTerms.ownerParticipationAllowed'] = query.ownerParticipationAllowed;
  }
  return filter;
}

function getSort(sort: string, priceType = 'salePrice'): Record<string, SortOrder> {
  const map: Record<string, Record<string, SortOrder>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    'price-low-high': { [`pricing.${priceType}`]: 1, createdAt: -1 },
    'price-high-low': { [`pricing.${priceType}`]: -1, createdAt: -1 },
    'area-low-high': { 'area.value': 1 },
    'area-high-low': { 'area.value': -1 },
    'most-viewed': { viewCount: -1 },
    nearest: { createdAt: -1 },
  };
  return map[sort] ?? map.newest;
}

function range(minimum?: number, maximum?: number) {
  return {
    ...(minimum !== undefined ? { $gte: minimum } : {}),
    ...(maximum !== undefined ? { $lte: maximum } : {}),
  };
}

function caseInsensitive(value: string) {
  return new RegExp(`^${escapeRegex(value)}$`, 'i');
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeSearch(value: string): string {
  return value.replace(/[^\w\s-]/g, ' ').trim();
}

function assertCanManageLand(land: LandDocument, userId: string, role: string): void {
  const ownerId = getDocumentId(land.ownerId);
  if (role !== 'admin' && ownerId !== userId) {
    throw new AppError('You are not authorized to manage this listing.', 403);
  }
}

function stripForbiddenUpdateFields(input: UpdateLandInput, role: string): Partial<Land> {
  const update = structuredClone(input) as Partial<Land>;
  delete (update as { ownerId?: unknown }).ownerId;
  delete (update as { slug?: unknown }).slug;

  if (role !== 'admin') {
    delete update.verification;
    if (update.status && !['draft', 'pending-verification', 'inactive'].includes(update.status)) {
      delete update.status;
    }
  }

  return update;
}

function hasImportantChange(update: Partial<Land>): boolean {
  return Boolean(
    update.location ||
      update.area ||
      update.pricing ||
      update.transactionTypes ||
      update.documents ||
      update.landDetails,
  );
}

function shouldTrackView(landId: string, viewKey?: string): boolean {
  if (!viewKey) return true;
  return !viewKey.includes(landId);
}

function sanitizeLandForViewer(land: Land, canSeeDocuments: boolean) {
  if (canSeeDocuments) return land;

  return {
    ...land,
    documents: land.documents.map((document) => ({
      type: document.type,
      verificationStatus: document.verificationStatus,
      uploadedAt: document.uploadedAt,
      name:
        document.type === 'soil-report'
          ? 'Soil report available'
          : document.type === 'water-report'
            ? 'Water report available'
            : 'Ownership document submitted',
    })),
  };
}

async function createLandNotification(land: LandDocument, type: string, title: string, message: string): Promise<void> {
  await NotificationModel.create({
    userId: land.ownerId,
    type,
    title,
    message,
    data: { landId: land._id, status: land.status },
  });
}

function cryptoSafeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function getDocumentId(value: unknown): string {
  if (value && typeof value === 'object' && '_id' in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

function extensionFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
  };
  return map[mimeType] ?? 'bin';
}
