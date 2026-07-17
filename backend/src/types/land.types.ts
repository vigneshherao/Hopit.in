import type { FilterQuery, SortOrder, Types } from 'mongoose';
import type { Land } from '@/models/land.model.js';

export interface LandQueryOptions {
  page: number;
  limit: number;
  filters: FilterQuery<Land>;
  sort: Record<string, SortOrder> | { [key: string]: { $meta: 'textScore' } };
  includeDistance?: boolean;
}

export interface LandListResult<TLand> {
  lands: TLand[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LandAccessContext {
  user?: {
    id: string;
    role: string;
  };
}

export interface LandStatistics {
  totalListings: number;
  draftListings: number;
  pendingListings: number;
  availableListings: number;
  reservedListings: number;
  occupiedListings: number;
  totalViews: number;
  totalApplications: number;
  mostViewedLand: {
    id: string;
    title: string;
    viewCount: number;
  } | null;
}

export type LandId = string | Types.ObjectId;
