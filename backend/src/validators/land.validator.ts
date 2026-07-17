import { z } from 'zod';
import {
  LAND_AGREEMENT_TYPES,
  LAND_AREA_UNITS_EXTENDED,
  LAND_DOCUMENT_TYPES,
  LAND_DOCUMENT_VERIFICATION_STATUSES,
  LAND_MARKETPLACE_STATUSES,
  LAND_OWNER_STATUS_ACTIONS,
  LAND_PURPOSES,
  LAND_SOIL_TYPES_EXTENDED,
  LAND_SORT_OPTIONS,
  LAND_TERRAINS,
  LAND_TRANSACTION_TYPES,
  LAND_WATER_AVAILABILITY,
  LAND_WATER_SOURCES,
} from '@/constants/land.constants.js';

const positiveOptional = z.coerce.number().min(0).optional();
const booleanQuery = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional();

export const coordinatesSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z
    .tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
    .describe('[longitude, latitude]'),
});

export const areaSchema = z.object({
  value: z.coerce.number().positive('Area must be greater than 0.'),
  unit: z.enum(LAND_AREA_UNITS_EXTENDED),
});

export const pricingSchema = z
  .object({
    salePrice: positiveOptional,
    monthlyRent: positiveOptional,
    annualLeaseAmount: positiveOptional,
    securityDeposit: positiveOptional,
    priceNegotiable: z.boolean().default(true),
    revenueShareOwnerPercentage: z.coerce.number().min(0).max(100).optional(),
    revenueShareFarmerPercentage: z.coerce.number().min(0).max(100).optional(),
  })
  .refine(
    (pricing) =>
      pricing.revenueShareOwnerPercentage === undefined ||
      pricing.revenueShareFarmerPercentage === undefined ||
      pricing.revenueShareOwnerPercentage + pricing.revenueShareFarmerPercentage === 100,
    {
      message: 'Owner and farmer revenue-share percentages must total 100.',
      path: ['revenueShareOwnerPercentage'],
    },
  );

export const mediaSchema = z.object({
  images: z.array(z.string().url()).default([]),
  videos: z.array(z.string().url()).optional(),
  droneImages: z.array(z.string().url()).optional(),
});

export const documentSchema = z.object({
  type: z.enum(LAND_DOCUMENT_TYPES),
  name: z.string().trim().min(2).max(160),
  url: z.string().url(),
  verificationStatus: z.enum(LAND_DOCUMENT_VERIFICATION_STATUSES).default('pending'),
  uploadedAt: z.coerce.date().default(() => new Date()),
});

export const agreementTermsSchema = z.object({
  minimumDurationMonths: positiveOptional,
  maximumDurationMonths: positiveOptional,
  availableFrom: z.coerce.date().optional(),
  noticePeriodDays: positiveOptional,
  ownerParticipationAllowed: z.boolean().default(false),
  preferredAgreementType: z.enum(LAND_AGREEMENT_TYPES).optional(),
});

const landDetailsSchema = z.object({
  soilType: z.enum(LAND_SOIL_TYPES_EXTENDED),
  soilDescription: z.string().trim().max(1000).optional(),
  currentCrop: z.string().trim().max(120).optional(),
  previousCrops: z.array(z.string().trim().min(1).max(120)).default([]),
  terrain: z.enum(LAND_TERRAINS),
  irrigationAvailable: z.boolean().default(false),
  waterSources: z.array(z.enum(LAND_WATER_SOURCES)).default([]),
  waterAvailability: z.enum(LAND_WATER_AVAILABILITY).default('unknown'),
  electricityAvailable: z.boolean().default(false),
  roadAccess: z.boolean().default(false),
  fencingAvailable: z.boolean().default(false),
  storageAvailable: z.boolean().default(false),
  farmHouseAvailable: z.boolean().default(false),
});

const locationSchema = z.object({
  address: z.string().trim().min(3).max(240),
  village: z.string().trim().max(120).optional(),
  taluk: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(120),
  district: z.string().trim().min(2).max(120),
  state: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(120).default('India'),
  pincode: z.string().trim().max(12).optional(),
  coordinates: coordinatesSchema.optional(),
});

const nearbyFacilitiesSchema = z.object({
  nearestMarketKm: positiveOptional,
  nearestHighwayKm: positiveOptional,
  nearestTownKm: positiveOptional,
  nearestRailwayKm: positiveOptional,
  nearestAirportKm: positiveOptional,
  nearestColdStorageKm: positiveOptional,
});

const businessSuitabilitySchema = z.object({
  suitableFor: z.array(z.string().trim().min(1).max(120)).default([]),
  restrictions: z.array(z.string().trim().min(1).max(160)).optional(),
  ownerExpectations: z.array(z.string().trim().min(1).max(160)).optional(),
});

const createLandBaseSchema = z
  .object({
    title: z.string().trim().min(3).max(160),
    description: z.string().trim().min(20).max(5000),
    shortDescription: z.string().trim().max(260).optional(),
    purposes: z.array(z.enum(LAND_PURPOSES)).min(1),
    transactionTypes: z.array(z.enum(LAND_TRANSACTION_TYPES)).min(1),
    location: locationSchema,
    area: areaSchema,
    landDetails: landDetailsSchema,
    nearbyFacilities: nearbyFacilitiesSchema.default({}),
    pricing: pricingSchema,
    agreementTerms: agreementTermsSchema.default({ ownerParticipationAllowed: false }),
    businessSuitability: businessSuitabilitySchema.optional(),
    media: mediaSchema.default({ images: [] }),
    documents: z.array(documentSchema).default([]),
    status: z.enum(['draft', 'pending-verification']).default('draft'),
  })
export const createLandSchema = createLandBaseSchema.superRefine(validatePublishableInput);

export const updateLandSchema = createLandBaseSchema.partial().extend({
  status: z.enum(LAND_MARKETPLACE_STATUSES).optional(),
  verification: z
    .object({
      isOwnerVerified: z.boolean().optional(),
      isLandVerified: z.boolean().optional(),
      rejectionReason: z.string().trim().max(1000).optional(),
    })
    .optional(),
});

export const landQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  search: z.string().trim().max(120).optional(),
  state: z.string().trim().max(120).optional(),
  district: z.string().trim().max(120).optional(),
  city: z.string().trim().max(120).optional(),
  purpose: z.enum(LAND_PURPOSES).optional(),
  transactionType: z.enum(LAND_TRANSACTION_TYPES).optional(),
  soilType: z.enum(LAND_SOIL_TYPES_EXTENDED).optional(),
  terrain: z.enum(LAND_TERRAINS).optional(),
  waterAvailability: z.enum(LAND_WATER_AVAILABILITY).optional(),
  minimumArea: z.coerce.number().min(0).optional(),
  maximumArea: z.coerce.number().min(0).optional(),
  areaUnit: z.enum(LAND_AREA_UNITS_EXTENDED).optional(),
  minimumPrice: z.coerce.number().min(0).optional(),
  maximumPrice: z.coerce.number().min(0).optional(),
  priceType: z.enum(['salePrice', 'monthlyRent', 'annualLeaseAmount']).optional(),
  roadAccess: booleanQuery,
  electricityAvailable: booleanQuery,
  irrigationAvailable: booleanQuery,
  ownerParticipationAllowed: booleanQuery,
  sort: z.enum(LAND_SORT_OPTIONS).default('newest'),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(500).optional(),
  status: z.enum(LAND_MARKETPLACE_STATUSES).optional(),
});

export const ownerLandQuerySchema = z.object({
  status: z.enum(LAND_MARKETPLACE_STATUSES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(LAND_SORT_OPTIONS).default('newest'),
});

export const identifierParamSchema = z.object({
  identifier: z.string().trim().min(1),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id.'),
});

export const statusUpdateSchema = z.object({
  action: z.enum(LAND_OWNER_STATUS_ACTIONS),
});

export const verificationActionSchema = z
  .object({
    action: z.enum(['approve', 'reject']),
    reason: z.string().trim().max(1000).optional(),
  })
  .refine((data) => data.action === 'approve' || Boolean(data.reason), {
    path: ['reason'],
    message: 'Rejection reason is required.',
  });

function validatePublishableInput(data: z.infer<typeof createLandBaseSchema>, ctx: z.RefinementCtx): void {
  if (data.status === 'draft') return;

  if (data.transactionTypes.includes('sale') && !data.pricing.salePrice) {
    ctx.addIssue({ code: 'custom', path: ['pricing', 'salePrice'], message: 'Sale price is required.' });
  }
  if (data.transactionTypes.includes('rent') && !data.pricing.monthlyRent) {
    ctx.addIssue({ code: 'custom', path: ['pricing', 'monthlyRent'], message: 'Monthly rent is required.' });
  }
  if (data.transactionTypes.includes('lease') && !data.pricing.annualLeaseAmount) {
    ctx.addIssue({
      code: 'custom',
      path: ['pricing', 'annualLeaseAmount'],
      message: 'Annual lease amount is required.',
    });
  }
  if (
    data.transactionTypes.includes('revenue-share') &&
    (data.pricing.revenueShareOwnerPercentage === undefined ||
      data.pricing.revenueShareFarmerPercentage === undefined)
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['pricing', 'revenueShareOwnerPercentage'],
      message: 'Revenue-share percentages are required.',
    });
  }
  if (!data.media.images.length) {
    ctx.addIssue({ code: 'custom', path: ['media', 'images'], message: 'At least one image is required.' });
  }
  if (!data.documents.length) {
    ctx.addIssue({ code: 'custom', path: ['documents'], message: 'At least one document is required.' });
  }
}

export type CreateLandInput = z.infer<typeof createLandSchema>;
export type UpdateLandInput = z.infer<typeof updateLandSchema>;
export type LandQueryInput = z.infer<typeof landQuerySchema>;
export type OwnerLandQueryInput = z.infer<typeof ownerLandQuerySchema>;
