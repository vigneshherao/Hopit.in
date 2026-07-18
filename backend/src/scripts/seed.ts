import { connectDatabase, disconnectDatabase } from '@/config/database.js';
import { env } from '@/config/env.js';
import { AgreementModel } from '@/models/agreement.model.js';
import { ApplicationNegotiationModel } from '@/models/application-negotiation.model.js';
import { ApplicationModel } from '@/models/application.model.js';
import { LandModel } from '@/models/land.model.js';
import { UserModel } from '@/models/user.model.js';
import { WorkerProfileModel } from '@/models/worker-profile.model.js';
import { logger } from '@/utils/logger.js';

const demoPassword = 'HoptIt@123';
const allowProductionSeed = process.env.ALLOW_PRODUCTION_SEED === 'true';

const demoUsers = [
  { name: 'Demo Owner', email: 'owner@hoptit.demo', role: 'owner' },
  { name: 'Demo Farmer', email: 'farmer@hoptit.demo', role: 'farmer' },
  { name: 'Demo Worker', email: 'worker@hoptit.demo', role: 'worker' },
  { name: 'Demo Admin', email: 'admin@hoptit.demo', role: 'admin' },
  { name: 'Demo Investor', email: 'investor@hoptit.demo', role: 'owner' },
  { name: 'Demo Dairy Farmer', email: 'dairy@hoptit.demo', role: 'farmer' },
  { name: 'Demo Solar Entrepreneur', email: 'solar@hoptit.demo', role: 'owner' },
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
            headline: 'Experienced farm worker for sowing and harvest support',
            bio: 'Reliable agriculture worker with practical field experience in sowing, harvesting, irrigation support, and daily farm operations.',
            professionalRoles: ['general-farm-worker', 'seasonal-worker'],
            skills: ['sowing', 'harvesting'],
            experienceYears: 3,
            languages: ['Kannada', 'Tamil'],
            location: {
              city: 'Mandya',
              district: 'Mandya',
              state: 'Karnataka',
              country: 'India',
            },
            availability: {
              status: 'available',
              preferredDurationTypes: ['daily', 'seasonal'],
              willingToRelocate: false,
              willingToStayOnFarm: true,
              maximumTravelDistanceKm: 25,
            },
            pricing: {
              dailyWage: 750,
              negotiable: true,
            },
            workPreferences: {
              preferredCrops: ['Paddy', 'Sugarcane', 'Vegetables'],
              preferredWorkTypes: ['sowing', 'harvesting', 'irrigation'],
              acceptsIndividualWork: true,
              acceptsTeamWork: true,
              acceptsFarmManagement: false,
              acceptsNightStay: true,
            },
          },
        },
        { upsert: true },
      );
    }
  }

  const owner = await UserModel.findOne({ email: 'owner@hoptit.demo' });
  const admin = await UserModel.findOne({ email: 'admin@hoptit.demo' });
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

  await seedApplications(owner._id, admin?._id);

  logger.info('Development demo users seeded. Password: HoptIt@123');
}

async function seedApplications(ownerId: unknown, adminId: unknown) {
  const applicants = await UserModel.find({
    email: { $in: ['farmer@hoptit.demo', 'investor@hoptit.demo', 'dairy@hoptit.demo', 'solar@hoptit.demo'] },
  });
  const lands = await LandModel.find({ ownerId }).limit(8);
  if (!lands.length || !applicants.length) return;

  const statuses = [
    'submitted',
    'submitted',
    'submitted',
    'submitted',
    'submitted',
    'submitted',
    'shortlisted',
    'shortlisted',
    'changes-requested',
    'agreement-pending',
    'rejected',
    'draft',
  ] as const;
  const types = ['lease', 'rent', 'revenue-share', 'joint-venture', 'sale-enquiry', 'business-proposal'] as const;

  for (let index = 0; index < statuses.length; index += 1) {
    const applicant = applicants[index % applicants.length];
    const land = lands[index % lands.length];
    const type = compatibleType(types[index % types.length], land.transactionTypes, land.purposes);
    const status = statuses[index];
    const application = await ApplicationModel.findOneAndUpdate(
      { landId: land._id, applicantId: applicant._id, status: { $in: ['draft', 'submitted', 'under-review', 'shortlisted', 'changes-requested', 'agreement-pending'] } },
      {
        $set: {
          landId: land._id,
          applicantId: applicant._id,
          farmerId: applicant.role === 'farmer' ? applicant._id : undefined,
          ownerId,
          applicationType: type,
          status,
          applicantProfile: {
            occupation: applicant.role === 'farmer' ? 'Farmer' : 'Entrepreneur',
            experienceYears: 5 + index,
            currentLocation: land.location.city,
            preferredLanguage: 'English',
            farmingExperience: 'Experienced in regional crop and labor planning.',
            businessExperience: 'Managed small agricultural operations and local partnerships.',
          },
          proposal: {
            title: `${type} proposal for ${land.title}`,
            summary: 'A practical proposal with clear investment, operating responsibility, and local market access.',
            intendedUse: land.purposes[0],
            cropsOrBusinessTypes: land.purposes,
            expectedStartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            proposedDurationMonths: 24,
            proposedMonthlyRent: type === 'rent' ? 35000 : undefined,
            proposedAnnualLeaseAmount: type === 'lease' ? 360000 : undefined,
            proposedPurchasePrice: type === 'sale-enquiry' ? 15000000 : undefined,
            proposedSecurityDeposit: 75000,
            proposedOwnerRevenuePercentage: type === 'revenue-share' || type === 'joint-venture' ? 40 : undefined,
            proposedApplicantRevenuePercentage: type === 'revenue-share' || type === 'joint-venture' ? 60 : undefined,
            expectedInvestment: 500000 + index * 100000,
            fundingSource: 'self-funded',
            ownerParticipationRequested: type === 'joint-venture',
            requestedOwnerResponsibilities: ['Land access', 'Local introductions'],
            applicantResponsibilities: ['Operations', 'Labor', 'Input planning'],
            estimatedWorkersRequired: 4 + index,
          },
          coverMessage: 'Please consider this proposal for a structured land partnership.',
          submittedAt: status === 'draft' ? undefined : new Date(),
          acceptedAt: status === 'agreement-pending' ? new Date() : undefined,
          rejectedAt: status === 'rejected' ? new Date() : undefined,
          negotiation: { currentRound: index < 3 ? 2 : 1, lastActionBy: applicant._id, lastActionAt: new Date() },
        },
      },
      { upsert: true, new: true, runValidators: true },
    );

    await ApplicationNegotiationModel.updateOne(
      { applicationId: application._id, round: 1 },
      {
        $set: {
          applicationId: application._id,
          round: 1,
          createdBy: applicant._id,
          createdByRole: 'applicant',
          message: 'Initial proposal submitted.',
          proposedTerms: { durationMonths: 24, annualLeaseAmount: 360000, ownerParticipation: false },
          action: 'proposal-created',
        },
      },
      { upsert: true },
    );

    if (index < 3) {
      await ApplicationNegotiationModel.updateOne(
        { applicationId: application._id, round: 2 },
        {
          $set: {
            applicationId: application._id,
            round: 2,
            createdBy: ownerId,
            createdByRole: 'owner',
            message: 'Owner counter-offer with adjusted duration and amount.',
            proposedTerms: { durationMonths: 36, annualLeaseAmount: 390000, ownerParticipation: true },
            action: 'counter-offer',
          },
        },
        { upsert: true },
      );
    }

    if (status === 'agreement-pending') {
      const agreement = await AgreementModel.findOneAndUpdate(
        { applicationId: application._id },
        {
          $set: {
            applicationId: application._id,
            landId: land._id,
            ownerId,
            applicantId: applicant._id,
            agreementType: type === 'sale-enquiry' ? 'sale' : type === 'business-proposal' ? 'business-use' : type,
            status: 'review-pending',
            terms: {
              landTitle: land.title,
              landLocation: `${land.location.district}, ${land.location.state}`,
              landAreaValue: land.area.value,
              landAreaUnit: land.area.unit,
              purpose: land.purposes[0],
              durationMonths: 24,
              annualLeaseAmount: 360000,
              ownerParticipation: false,
              ownerResponsibilities: ['Provide possession after legal review'],
              applicantResponsibilities: ['Operate responsibly and pay agreed charges'],
              additionalTerms: ['Subject to legal review'],
            },
            generatedSummary: `Draft agreement summary for ${land.title}. Legal review is required before execution.`,
            version: 1,
            generatedBy: adminId ? 'admin' : 'system',
          },
        },
        { upsert: true, new: true, runValidators: true },
      );
      application.agreement = { agreementId: agreement._id as never, summaryGenerated: true, generatedAt: new Date() };
      await application.save();
    }
  }
}

function compatibleType(preferred: string, transactions: string[], purposes: string[]) {
  if (preferred === 'sale-enquiry' && transactions.includes('sale')) return preferred;
  if (preferred !== 'sale-enquiry' && transactions.includes(preferred)) return preferred;
  if (purposes.some((purpose) => ['commercial', 'agri-business', 'warehouse', 'solar-project', 'dairy', 'poultry', 'fish-farming', 'other'].includes(purpose))) {
    return 'business-proposal';
  }
  return transactions.includes('rent') ? 'rent' : 'lease';
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
