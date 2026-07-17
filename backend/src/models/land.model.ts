import { Schema, model, type HydratedDocument } from 'mongoose';
import {
  LAND_AGREEMENT_TYPES,
  LAND_AREA_UNITS_EXTENDED,
  LAND_DOCUMENT_TYPES,
  LAND_DOCUMENT_VERIFICATION_STATUSES,
  LAND_MARKETPLACE_STATUSES,
  LAND_PURPOSES,
  LAND_SOIL_TYPES_EXTENDED,
  LAND_TERRAINS,
  LAND_TRANSACTION_TYPES,
  LAND_WATER_AVAILABILITY,
  LAND_WATER_SOURCES,
  type LandMarketplaceStatus,
  type LandPurpose,
  type LandTransactionType,
} from '@/constants/land.constants.js';
import { AppError } from '@/utils/app-error.js';

export interface Land {
  ownerId: Schema.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  purposes: LandPurpose[];
  transactionTypes: LandTransactionType[];
  location: {
    address: string;
    village?: string;
    taluk?: string;
    city: string;
    district: string;
    state: string;
    country: string;
    pincode?: string;
    coordinates?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  area: {
    value: number;
    unit: (typeof LAND_AREA_UNITS_EXTENDED)[number];
  };
  landDetails: {
    soilType: (typeof LAND_SOIL_TYPES_EXTENDED)[number];
    soilDescription?: string;
    currentCrop?: string;
    previousCrops?: string[];
    terrain: (typeof LAND_TERRAINS)[number];
    irrigationAvailable: boolean;
    waterSources: (typeof LAND_WATER_SOURCES)[number][];
    waterAvailability: (typeof LAND_WATER_AVAILABILITY)[number];
    electricityAvailable: boolean;
    roadAccess: boolean;
    fencingAvailable: boolean;
    storageAvailable: boolean;
    farmHouseAvailable: boolean;
  };
  nearbyFacilities: {
    nearestMarketKm?: number;
    nearestHighwayKm?: number;
    nearestTownKm?: number;
    nearestRailwayKm?: number;
    nearestAirportKm?: number;
    nearestColdStorageKm?: number;
  };
  pricing: {
    salePrice?: number;
    monthlyRent?: number;
    annualLeaseAmount?: number;
    securityDeposit?: number;
    priceNegotiable: boolean;
    revenueShareOwnerPercentage?: number;
    revenueShareFarmerPercentage?: number;
  };
  agreementTerms: {
    minimumDurationMonths?: number;
    maximumDurationMonths?: number;
    availableFrom?: Date;
    noticePeriodDays?: number;
    ownerParticipationAllowed: boolean;
    preferredAgreementType?: (typeof LAND_AGREEMENT_TYPES)[number];
  };
  businessSuitability?: {
    suitableFor: string[];
    restrictions?: string[];
    ownerExpectations?: string[];
  };
  media: {
    images: string[];
    videos?: string[];
    droneImages?: string[];
  };
  documents: {
    type: (typeof LAND_DOCUMENT_TYPES)[number];
    name: string;
    url: string;
    verificationStatus: (typeof LAND_DOCUMENT_VERIFICATION_STATUSES)[number];
    uploadedAt: Date;
  }[];
  status: LandMarketplaceStatus;
  verification: {
    isOwnerVerified: boolean;
    isLandVerified: boolean;
    verifiedBy?: Schema.Types.ObjectId;
    verifiedAt?: Date;
    rejectionReason?: string;
  };
  viewCount: number;
  favoriteCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LandDocument = HydratedDocument<Land>;

const positiveNumber = { type: Number, min: 0 };

const landSchema = new Schema<Land>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    shortDescription: { type: String, trim: true, maxlength: 260 },
    purposes: [{ type: String, enum: LAND_PURPOSES, required: true, index: true }],
    transactionTypes: [{ type: String, enum: LAND_TRANSACTION_TYPES, required: true, index: true }],
    location: {
      address: { type: String, required: true, trim: true },
      village: { type: String, trim: true },
      taluk: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true, index: true },
      state: { type: String, required: true, trim: true, index: true },
      country: { type: String, required: true, trim: true, default: 'India' },
      pincode: { type: String, trim: true },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: undefined,
        },
        coordinates: {
          type: [Number],
          default: undefined,
          validate: {
            validator(value: number[] | undefined) {
              return (
                !value ||
                (value.length === 2 &&
                  value[0] >= -180 &&
                  value[0] <= 180 &&
                  value[1] >= -90 &&
                  value[1] <= 90)
              );
            },
            message: 'Coordinates must be [longitude, latitude].',
          },
        },
      },
    },
    area: {
      value: { type: Number, required: true, min: 0.0001, index: true },
      unit: { type: String, enum: LAND_AREA_UNITS_EXTENDED, required: true },
    },
    landDetails: {
      soilType: { type: String, enum: LAND_SOIL_TYPES_EXTENDED, required: true, index: true },
      soilDescription: { type: String, trim: true },
      currentCrop: { type: String, trim: true },
      previousCrops: [{ type: String, trim: true }],
      terrain: { type: String, enum: LAND_TERRAINS, required: true },
      irrigationAvailable: { type: Boolean, default: false },
      waterSources: [{ type: String, enum: LAND_WATER_SOURCES }],
      waterAvailability: { type: String, enum: LAND_WATER_AVAILABILITY, default: 'unknown' },
      electricityAvailable: { type: Boolean, default: false },
      roadAccess: { type: Boolean, default: false },
      fencingAvailable: { type: Boolean, default: false },
      storageAvailable: { type: Boolean, default: false },
      farmHouseAvailable: { type: Boolean, default: false },
    },
    nearbyFacilities: {
      nearestMarketKm: positiveNumber,
      nearestHighwayKm: positiveNumber,
      nearestTownKm: positiveNumber,
      nearestRailwayKm: positiveNumber,
      nearestAirportKm: positiveNumber,
      nearestColdStorageKm: positiveNumber,
    },
    pricing: {
      salePrice: { ...positiveNumber, index: true },
      monthlyRent: { ...positiveNumber, index: true },
      annualLeaseAmount: { ...positiveNumber, index: true },
      securityDeposit: positiveNumber,
      priceNegotiable: { type: Boolean, default: true },
      revenueShareOwnerPercentage: { type: Number, min: 0, max: 100 },
      revenueShareFarmerPercentage: { type: Number, min: 0, max: 100 },
    },
    agreementTerms: {
      minimumDurationMonths: positiveNumber,
      maximumDurationMonths: positiveNumber,
      availableFrom: { type: Date },
      noticePeriodDays: positiveNumber,
      ownerParticipationAllowed: { type: Boolean, default: false },
      preferredAgreementType: { type: String, enum: LAND_AGREEMENT_TYPES },
    },
    businessSuitability: {
      suitableFor: [{ type: String, trim: true }],
      restrictions: [{ type: String, trim: true }],
      ownerExpectations: [{ type: String, trim: true }],
    },
    media: {
      images: [{ type: String, trim: true }],
      videos: [{ type: String, trim: true }],
      droneImages: [{ type: String, trim: true }],
    },
    documents: [
      {
        type: { type: String, enum: LAND_DOCUMENT_TYPES, required: true },
        name: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
        verificationStatus: {
          type: String,
          enum: LAND_DOCUMENT_VERIFICATION_STATUSES,
          default: 'pending',
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    status: { type: String, enum: LAND_MARKETPLACE_STATUSES, default: 'draft', index: true },
    verification: {
      isOwnerVerified: { type: Boolean, default: false },
      isLandVerified: { type: Boolean, default: false },
      verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: { type: Date },
      rejectionReason: { type: String, trim: true },
    },
    viewCount: { type: Number, default: 0, min: 0 },
    favoriteCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

landSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });
landSchema.index({
  title: 'text',
  description: 'text',
  'location.village': 'text',
  'location.city': 'text',
  'location.district': 'text',
  'location.state': 'text',
});
landSchema.index({ ownerId: 1, status: 1, updatedAt: -1 });
landSchema.index({ status: 1, purposes: 1, createdAt: -1 });
landSchema.index({ status: 1, transactionTypes: 1, createdAt: -1 });
landSchema.index({ 'location.state': 1, 'location.district': 1, 'location.city': 1 });
landSchema.index({ 'landDetails.soilType': 1, 'landDetails.terrain': 1, 'landDetails.waterAvailability': 1 });
landSchema.index({ 'pricing.salePrice': 1, 'pricing.monthlyRent': 1, 'pricing.annualLeaseAmount': 1 });
landSchema.index({ createdAt: -1 });

landSchema.pre('validate', function validateLand(next) {
  try {
    validateTransactionRules(this);
    validatePublishingRules(this);
    next();
  } catch (error) {
    next(error as Error);
  }
});

function validateTransactionRules(land: LandDocument): void {
  if (!land.purposes?.length) {
    throw new AppError('At least one land purpose is required.', 400);
  }

  if (!land.transactionTypes?.length) {
    throw new AppError('At least one transaction type is required.', 400);
  }

  const { pricing, transactionTypes } = land;

  if (transactionTypes.includes('sale') && land.status !== 'draft' && !pricing.salePrice) {
    throw new AppError('Sale price is required when sale is selected.', 400);
  }

  if (transactionTypes.includes('rent') && land.status !== 'draft' && !pricing.monthlyRent) {
    throw new AppError('Monthly rent is required when rent is selected.', 400);
  }

  if (transactionTypes.includes('lease') && land.status !== 'draft' && !pricing.annualLeaseAmount) {
    throw new AppError('Annual lease amount is required when lease is selected.', 400);
  }

  if (transactionTypes.includes('revenue-share') && land.status !== 'draft') {
    if (
      pricing.revenueShareOwnerPercentage === undefined ||
      pricing.revenueShareFarmerPercentage === undefined
    ) {
      throw new AppError('Revenue-share percentages are required.', 400);
    }
  }

  if (
    pricing.revenueShareOwnerPercentage !== undefined &&
    pricing.revenueShareFarmerPercentage !== undefined &&
    pricing.revenueShareOwnerPercentage + pricing.revenueShareFarmerPercentage !== 100
  ) {
    throw new AppError('Owner and farmer revenue-share percentages must total 100.', 400);
  }
}

function validatePublishingRules(land: LandDocument): void {
  if (land.status === 'draft') return;

  if (!land.media.images?.length) {
    throw new AppError('At least one land image is required before publishing.', 400);
  }

  if (!land.documents?.length) {
    throw new AppError('At least one document is required before verification.', 400);
  }
}

export const LandModel = model<Land>('Land', landSchema);
