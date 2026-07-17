export const LAND_PURPOSES = [
  'agriculture',
  'organic-farming',
  'horticulture',
  'dairy',
  'poultry',
  'fish-farming',
  'warehouse',
  'solar-project',
  'commercial',
  'agri-business',
  'other',
] as const;

export const LAND_TRANSACTION_TYPES = ['sale', 'lease', 'rent', 'joint-venture', 'revenue-share'] as const;

export const LAND_AREA_UNITS_EXTENDED = ['acre', 'hectare', 'cent', 'square-feet'] as const;

export const LAND_SOIL_TYPES_EXTENDED = [
  'red',
  'black',
  'alluvial',
  'laterite',
  'clay',
  'sandy',
  'loamy',
  'mixed',
  'unknown',
] as const;

export const LAND_TERRAINS = ['flat', 'sloped', 'hilly', 'wetland', 'mixed'] as const;

export const LAND_WATER_SOURCES = [
  'borewell',
  'open-well',
  'river',
  'canal',
  'pond',
  'rainwater',
  'municipal',
  'none',
  'other',
] as const;

export const LAND_WATER_AVAILABILITY = ['abundant', 'adequate', 'seasonal', 'limited', 'unknown'] as const;

export const LAND_AGREEMENT_TYPES = ['registered', 'notarized', 'platform-assisted', 'mutual'] as const;

export const LAND_DOCUMENT_TYPES = [
  'ownership-proof',
  'tax-receipt',
  'survey-document',
  'encumbrance-certificate',
  'soil-report',
  'water-report',
  'identity-proof',
  'other',
] as const;

export const LAND_DOCUMENT_VERIFICATION_STATUSES = ['pending', 'verified', 'rejected'] as const;

export const LAND_MARKETPLACE_STATUSES = [
  'draft',
  'pending-verification',
  'available',
  'reserved',
  'occupied',
  'sold',
  'inactive',
  'rejected',
] as const;

export const LAND_OWNER_STATUS_ACTIONS = ['pause', 'resume', 'mark-reserved', 'mark-occupied'] as const;

export const LAND_SORT_OPTIONS = [
  'newest',
  'oldest',
  'price-low-high',
  'price-high-low',
  'area-low-high',
  'area-high-low',
  'most-viewed',
  'nearest',
] as const;

export const PUBLIC_LAND_STATUSES = ['available'] as const;

export const LAND_LISTING_SELECT =
  'title slug shortDescription purposes transactionTypes location area landDetails pricing agreementTerms media status verification viewCount favoriteCount createdAt updatedAt';

export type LandPurpose = (typeof LAND_PURPOSES)[number];
export type LandTransactionType = (typeof LAND_TRANSACTION_TYPES)[number];
export type LandMarketplaceStatus = (typeof LAND_MARKETPLACE_STATUSES)[number];
