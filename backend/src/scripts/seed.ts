import { connectDatabase, disconnectDatabase } from '@/config/database.js';
import { env } from '@/config/env.js';
import { LandModel } from '@/models/land.model.js';
import { UserModel } from '@/models/user.model.js';
import { WorkerProfileModel } from '@/models/worker-profile.model.js';
import { logger } from '@/utils/logger.js';

const demoPassword = 'AgriLink@123';
const allowProductionSeed = process.env.ALLOW_PRODUCTION_SEED === 'true';

const demoUsers = [
  { name: 'Demo Owner', email: 'owner@agrilink.demo', role: 'owner' },
  { name: 'Demo Farmer', email: 'farmer@agrilink.demo', role: 'farmer' },
  { name: 'Demo Worker', email: 'worker@agrilink.demo', role: 'worker' },
  { name: 'Demo Admin', email: 'admin@agrilink.demo', role: 'admin' },
] as const;

const imageUrls = [
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=1200&q=80',
];

async function seed(): Promise<void> {
  if (env.nodeEnv === 'production' && !allowProductionSeed) {
    throw new Error('Seed blocked in production. Set ALLOW_PRODUCTION_SEED=true to override explicitly.');
  }

  await connectDatabase();

  for (const demoUser of demoUsers) {
    const existing = await UserModel.findOne({ email: demoUser.email }).select('+password');

    const user =
      existing ??
      new UserModel({
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        password: demoPassword,
        isEmailVerified: true,
        isPhoneVerified: false,
        isActive: true,
      });

    user.name = demoUser.name;
    user.role = demoUser.role;
    user.password = demoPassword;
    user.isActive = true;
    user.isEmailVerified = true;
    await user.save();

    if (demoUser.role === 'worker') {
      await WorkerProfileModel.updateOne(
        { userId: user._id },
        {
          $setOnInsert: {
            userId: user._id,
            skills: ['sowing', 'harvesting'],
            experienceYears: 3,
            dailyWage: 750,
            availabilityStatus: 'available',
            serviceRadiusKm: 25,
          },
        },
        { upsert: true },
      );
    }
  }

  const owner = await UserModel.findOne({ email: 'owner@agrilink.demo' });
  const admin = await UserModel.findOne({ email: 'admin@agrilink.demo' });
  if (!owner) throw new Error('Seed owner missing.');

  const listings = buildLandListings(owner._id, admin?._id);
  for (const listing of listings) {
    await LandModel.updateOne(
      { slug: listing.slug },
      {
        $set: listing,
      },
      { upsert: true, runValidators: true },
    );
  }

  logger.info('Development demo users seeded. Password: AgriLink@123');
}

function buildLandListings(ownerId: unknown, adminId: unknown) {
  const base = {
    ownerId,
    description:
      'A well positioned land parcel with clear access, practical water planning, and strong suitability for agriculture-linked business use.',
    shortDescription: 'Verified land parcel ready for agriculture-linked use.',
    nearbyFacilities: {
      nearestMarketKm: 8,
      nearestHighwayKm: 12,
      nearestTownKm: 6,
      nearestRailwayKm: 28,
      nearestAirportKm: 70,
      nearestColdStorageKm: 18,
    },
    agreementTerms: {
      minimumDurationMonths: 12,
      maximumDurationMonths: 84,
      noticePeriodDays: 60,
      ownerParticipationAllowed: true,
      preferredAgreementType: 'registered',
    },
    media: { images: imageUrls },
    documents: [
      {
        type: 'ownership-proof',
        name: 'Ownership document submitted',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        verificationStatus: 'verified',
        uploadedAt: new Date(),
      },
    ],
    verification: {
      isOwnerVerified: true,
      isLandVerified: true,
      verifiedBy: adminId,
      verifiedAt: new Date(),
    },
    viewCount: 24,
    favoriteCount: 4,
  };

  return [
    land(base, {
      title: 'Mandya irrigated paddy and vegetable farm',
      slug: 'mandya-irrigated-paddy-vegetable-farm',
      purposes: ['agriculture', 'horticulture'],
      transactionTypes: ['lease', 'rent'],
      location: loc('Canal Road, Srirangapatna', 'Srirangapatna', 'Mandya', 'Karnataka', [76.7047, 12.4237]),
      area: { value: 8, unit: 'acre' },
      landDetails: details('alluvial', 'flat', 'abundant', ['canal', 'borewell']),
      pricing: { monthlyRent: 45000, annualLeaseAmount: 480000, securityDeposit: 90000, priceNegotiable: true },
      status: 'available',
    }),
    land(base, {
      title: 'Wayanad organic coffee and spice estate',
      slug: 'wayanad-organic-coffee-spice-estate',
      purposes: ['organic-farming', 'agri-business'],
      transactionTypes: ['revenue-share', 'joint-venture'],
      location: loc('Meppadi estate road', 'Meppadi', 'Wayanad', 'Kerala', [76.132, 11.555]),
      area: { value: 12, unit: 'acre' },
      landDetails: details('laterite', 'sloped', 'adequate', ['rainwater', 'open-well']),
      pricing: { revenueShareOwnerPercentage: 40, revenueShareFarmerPercentage: 60, priceNegotiable: true },
      status: 'available',
    }),
    land(base, {
      title: 'Coimbatore poultry and dairy ready land',
      slug: 'coimbatore-poultry-dairy-ready-land',
      purposes: ['dairy', 'poultry'],
      transactionTypes: ['rent', 'lease'],
      location: loc('Pollachi rural belt', 'Pollachi', 'Coimbatore', 'Tamil Nadu', [77.008, 10.657]),
      area: { value: 5, unit: 'acre' },
      landDetails: details('red', 'flat', 'adequate', ['borewell']),
      pricing: { monthlyRent: 30000, annualLeaseAmount: 320000, securityDeposit: 60000, priceNegotiable: true },
      status: 'available',
    }),
    land(base, {
      title: 'Tumakuru solar project land near highway',
      slug: 'tumakuru-solar-project-land-near-highway',
      purposes: ['solar-project', 'commercial'],
      transactionTypes: ['sale', 'lease'],
      location: loc('NH 48 service road', 'Tumakuru', 'Tumakuru', 'Karnataka', [77.1025, 13.3379]),
      area: { value: 20, unit: 'acre' },
      landDetails: details('red', 'flat', 'limited', ['none']),
      pricing: { salePrice: 32000000, annualLeaseAmount: 1500000, priceNegotiable: true },
      status: 'available',
    }),
    land(base, {
      title: 'Kochi agri warehouse parcel',
      slug: 'kochi-agri-warehouse-parcel',
      purposes: ['warehouse', 'agri-business'],
      transactionTypes: ['sale', 'rent'],
      location: loc('Aluva logistics corridor', 'Aluva', 'Ernakulam', 'Kerala', [76.3516, 10.1076]),
      area: { value: 90000, unit: 'square-feet' },
      landDetails: details('mixed', 'flat', 'adequate', ['municipal']),
      pricing: { salePrice: 85000000, monthlyRent: 420000, priceNegotiable: false },
      status: 'available',
    }),
    land(base, {
      title: 'Thanjavur fish farming pond land',
      slug: 'thanjavur-fish-farming-pond-land',
      purposes: ['fish-farming', 'agriculture'],
      transactionTypes: ['lease', 'revenue-share'],
      location: loc('Kaveri delta village road', 'Thiruvaiyaru', 'Thanjavur', 'Tamil Nadu', [79.104, 10.884]),
      area: { value: 6, unit: 'acre' },
      landDetails: details('clay', 'wetland', 'abundant', ['pond', 'canal']),
      pricing: { annualLeaseAmount: 360000, revenueShareOwnerPercentage: 35, revenueShareFarmerPercentage: 65, priceNegotiable: true },
      status: 'available',
    }),
    land(base, {
      title: 'Mysuru horticulture draft listing',
      slug: 'mysuru-horticulture-draft-listing',
      purposes: ['horticulture'],
      transactionTypes: ['lease'],
      location: loc('Nanjangud road', 'Nanjangud', 'Mysuru', 'Karnataka', [76.68, 12.12]),
      area: { value: 4, unit: 'acre' },
      landDetails: details('loamy', 'flat', 'seasonal', ['borewell', 'rainwater']),
      pricing: { annualLeaseAmount: 180000, priceNegotiable: true },
      status: 'draft',
      verification: { isOwnerVerified: true, isLandVerified: false },
    }),
    land(base, {
      title: 'Kanyakumari commercial agri business plot',
      slug: 'kanyakumari-commercial-agri-business-plot',
      purposes: ['commercial', 'agri-business'],
      transactionTypes: ['joint-venture', 'sale'],
      location: loc('Nagercoil bypass', 'Nagercoil', 'Kanyakumari', 'Tamil Nadu', [77.43, 8.17]),
      area: { value: 2.5, unit: 'acre' },
      landDetails: details('red', 'flat', 'adequate', ['municipal', 'rainwater']),
      pricing: { salePrice: 18000000, priceNegotiable: true },
      status: 'pending-verification',
      verification: { isOwnerVerified: true, isLandVerified: false },
    }),
  ];
}

function land(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  return {
    ...base,
    ...override,
    businessSuitability: {
      suitableFor: ['Farming operations', 'Agri business', 'Local employment'],
      restrictions: ['No hazardous storage'],
      ownerExpectations: ['Responsible water usage', 'Registered agreement'],
    },
  };
}

function loc(address: string, city: string, district: string, state: string, coordinates: [number, number]) {
  return {
    address,
    village: city,
    taluk: city,
    city,
    district,
    state,
    country: 'India',
    pincode: '560001',
    coordinates: { type: 'Point', coordinates },
  };
}

function details(
  soilType: string,
  terrain: string,
  waterAvailability: string,
  waterSources: string[],
) {
  return {
    soilType,
    soilDescription: `${soilType} soil with practical cultivation potential.`,
    currentCrop: 'Mixed seasonal crops',
    previousCrops: ['Paddy', 'Vegetables'],
    terrain,
    irrigationAvailable: !waterSources.includes('none'),
    waterSources,
    waterAvailability,
    electricityAvailable: true,
    roadAccess: true,
    fencingAvailable: true,
    storageAvailable: false,
    farmHouseAvailable: false,
  };
}

seed()
  .catch((error: unknown) => {
    logger.error('Seed failed', error instanceof Error ? error : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
