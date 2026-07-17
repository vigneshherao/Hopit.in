import mongoose, { type FilterQuery, type SortOrder } from 'mongoose';
import { ApplicationModel } from '@/models/application.model.js';
import { LandModel, type Land, type LandDocument } from '@/models/land.model.js';
import type { LandListResult } from '@/types/land.types.js';

const ownerPopulate = {
  path: 'ownerId',
  select: 'name avatar location.city location.state isEmailVerified isPhoneVerified',
};

export async function createLand(data: Partial<Land>): Promise<LandDocument> {
  return LandModel.create(data);
}

export async function findLandById(id: string): Promise<LandDocument | null> {
  return LandModel.findById(id).populate(ownerPopulate);
}

export async function findLandByIdentifier(identifier: string): Promise<LandDocument | null> {
  const query = mongoose.Types.ObjectId.isValid(identifier) ? { _id: identifier } : { slug: identifier };
  return LandModel.findOne(query).populate(ownerPopulate);
}

export async function listLands<TLand = LandDocument>(
  filter: FilterQuery<Land>,
  page: number,
  limit: number,
  sort: Record<string, SortOrder>,
  select?: string,
): Promise<LandListResult<TLand>> {
  const skip = (page - 1) * limit;
  const [lands, total] = await Promise.all([
    LandModel.find(filter)
      .select(select ?? '')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(ownerPopulate)
      .lean<TLand[]>(),
    LandModel.countDocuments(filter),
  ]);

  return {
    lands,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function listNearbyLands(filter: FilterQuery<Land>, longitude: number, latitude: number, radiusKm: number) {
  return LandModel.find({
    ...filter,
    'location.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: radiusKm * 1000,
      },
    },
  })
    .limit(50)
    .populate(ownerPopulate)
    .lean();
}

export async function updateLandById(id: string, data: Partial<Land>): Promise<LandDocument | null> {
  return LandModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(ownerPopulate);
}

export async function incrementLandViews(id: string): Promise<void> {
  await LandModel.updateOne({ _id: id }, { $inc: { viewCount: 1 } });
}

export async function countLandApplications(landId: string): Promise<number> {
  return ApplicationModel.countDocuments({ landId });
}

export async function countApplicationsForOwner(ownerId: string): Promise<number> {
  return ApplicationModel.countDocuments({ ownerId });
}

export async function hasUserApplied(landId: string, farmerId: string): Promise<boolean> {
  const application = await ApplicationModel.exists({ landId, farmerId });
  return Boolean(application);
}

export async function findRelatedLands(land: LandDocument) {
  return LandModel.find({
    _id: { $ne: land._id },
    status: 'available',
    $or: [
      { 'location.district': land.location.district },
      { purposes: { $in: land.purposes } },
      { 'landDetails.soilType': land.landDetails.soilType },
      { transactionTypes: { $in: land.transactionTypes } },
    ],
  })
    .select('title slug shortDescription purposes transactionTypes location area landDetails pricing media status verification viewCount createdAt')
    .limit(4)
    .lean();
}
