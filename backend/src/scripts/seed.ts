import { connectDatabase, disconnectDatabase } from '@/config/database.js';
import { env } from '@/config/env.js';
import { AgreementModel } from '@/models/agreement.model.js';
import { AIHistoryModel } from '@/models/ai-history.model.js';
import { ApplicationNegotiationModel } from '@/models/application-negotiation.model.js';
import { ApplicationModel } from '@/models/application.model.js';
import { FarmPlanModel } from '@/models/farm-plan.model.js';
import { FarmTaskModel } from '@/models/farm-task.model.js';
import { LandModel } from '@/models/land.model.js';
import { UserModel } from '@/models/user.model.js';
import { WorkerProfileModel } from '@/models/worker-profile.model.js';
import { generateTasksForFarmPlan } from '@/services/farm-task.service.js';
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
  await seedAIHistory(owner._id);
  await seedFarmPlans(owner._id);

  logger.info('Development demo users seeded. Password: HoptIt@123');
}

async function seedFarmPlans(ownerId: unknown) {
  const lands = await LandModel.find({ ownerId }).limit(8);
  const crops = ['Tomato', 'Banana', 'Turmeric', 'Coconut', 'Green Chilli', 'Fodder Maize', 'Brinjal', 'Marigold'];
  for (const [index, land] of lands.entries()) {
    const crop = crops[index] ?? 'Vegetables';
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - index * 7);
    const expectedHarvestDate = new Date(startDate);
    expectedHarvestDate.setDate(expectedHarvestDate.getDate() + 110 + index * 10);
    const aiRecommendation = buildDemoFarmPlanAI(crop, startDate, 110 + index * 10);
    await FarmPlanModel.updateOne(
      { ownerId, landId: land._id, selectedCrop: crop, 'versions.reason': 'seed-demo' },
      {
        $set: {
          ownerId,
          landId: land._id,
          selectedCrop: crop,
          selectedSeason: index % 2 === 0 ? 'monsoon' : 'rabi',
          planTitle: `${crop} demo execution plan`,
          description: `Demo plan for ${crop} cultivation generated for scheduler testing.`,
          startDate,
          expectedHarvestDate,
          farmDurationDays: 110 + index * 10,
          farmDurationMonths: Number(((110 + index * 10) / 30).toFixed(1)),
          currentStage: 'planning',
          status: index % 3 === 0 ? 'active' : 'draft',
          AIRecommendation: aiRecommendation,
          estimatedInvestment: aiRecommendation.estimatedInvestment,
          estimatedRevenue: aiRecommendation.estimatedRevenue,
          estimatedProfit: aiRecommendation.estimatedProfit,
          expectedROI: aiRecommendation.expectedROI,
          labourRequirement: aiRecommendation.labourRequirement,
          equipmentRequirement: aiRecommendation.equipmentRequirement,
          fertilizerRequirement: aiRecommendation.fertilizerRequirement,
          waterRequirement: aiRecommendation.waterRequirement,
          riskLevel: aiRecommendation.riskAnalysis.riskLevel,
          riskScore: aiRecommendation.riskAnalysis.riskScore,
          weatherNotes: aiRecommendation.weatherNotes,
          progress: { percentage: 0, completedStages: [], nextAction: 'Land cleaning', updatedAt: new Date() },
          versions: [
            {
              version: 1,
              reason: 'seed-demo',
              AIRecommendation: aiRecommendation,
              estimatedInvestment: aiRecommendation.estimatedInvestment,
              estimatedRevenue: aiRecommendation.estimatedRevenue,
              estimatedProfit: aiRecommendation.estimatedProfit,
              expectedROI: aiRecommendation.expectedROI,
              createdAt: new Date(),
            },
          ],
        },
      },
      { upsert: true },
    );
    const plan = await FarmPlanModel.findOne({ ownerId, landId: land._id, selectedCrop: crop });
    if (plan && (await FarmTaskModel.countDocuments({ farmPlanId: plan._id })) === 0) await generateTasksForFarmPlan(plan);
  }
}

function buildDemoFarmPlanAI(crop: string, startDate: Date, duration: number) {
  const expectedHarvestDate = new Date(startDate);
  expectedHarvestDate.setDate(expectedHarvestDate.getDate() + duration);
  return {
    planTitle: `${crop} demo execution plan`,
    description: `Demo data: practical ${crop} execution plan with preparation, sowing, inputs, monitoring, harvest and logistics.`,
    farmDurationDays: duration,
    farmDurationMonths: Number((duration / 30).toFixed(1)),
    expectedHarvestDate,
    currentStage: 'planning',
    landPreparation: ['Land cleaning', 'Ploughing', 'Rotavator pass', 'Leveling', 'Water channel preparation'],
    seedRecommendation: { variety: `Certified ${crop} variety`, seedRate: 'As per local agriculture officer guidance', notes: ['Buy from trusted supplier', 'Treat seed before sowing'] },
    sowing: { method: 'Line sowing or transplanting based on crop', spacing: 'Crop-specific spacing', steps: ['Prepare nursery if needed', 'Sow in moist soil', 'Maintain spacing'] },
    waterSchedule: [{ stage: 'Initial', frequency: 'Every 2 days', notes: 'Avoid waterlogging' }, { stage: 'Growth', frequency: 'Weekly', notes: 'Adjust for rainfall' }],
    fertilizerSchedule: [{ day: 20, item: 'Compost', quantity: '2 tons', purpose: 'Soil health' }, { day: 40, item: 'NPK', quantity: 'Soil-test based', purpose: 'Crop growth' }],
    pesticideSchedule: [{ stage: 'Vegetative', treatment: 'Neem spray', notes: 'Prevent pest attack' }, { stage: 'Flowering', treatment: 'Disease inspection', notes: 'Spray only when needed' }],
    harvestSchedule: { expectedWindow: `${duration - 10} to ${duration} days`, steps: ['Prepare crates', 'Harvest mature produce'], postHarvest: ['Grade', 'Pack', 'Transport'] },
    labourRequirement: { totalWorkers: 3, peakWorkers: 8, notes: ['More workers during harvest'] },
    equipmentRequirement: { items: ['Tractor', 'Rotavator', 'Sprayer', 'Crates'], estimatedCost: { minimum: 15000, maximum: 45000, currency: 'INR' } },
    fertilizerRequirement: { items: ['Compost', 'NPK', 'Micronutrients'], estimatedCost: { minimum: 12000, maximum: 35000, currency: 'INR' } },
    waterRequirement: { level: 'medium', estimatedLitresPerDay: 2500, notes: ['Use drip irrigation where possible'] },
    timeline: [
      { day: 1, stage: 'Land Preparation', activity: 'Land Cleaning', expectedCost: 3000, progressWeight: 5 },
      { day: 3, stage: 'Ploughing', activity: 'Ploughing', expectedCost: 8000, progressWeight: 8 },
      { day: 5, stage: 'Rotavator', activity: 'Rotavator', expectedCost: 6000, progressWeight: 8 },
      { day: 7, stage: 'Seed Purchase', activity: 'Seed Purchase', expectedCost: 5000, progressWeight: 5 },
      { day: 8, stage: 'Seed Treatment', activity: 'Seed Treatment', expectedCost: 1000, progressWeight: 4 },
      { day: 10, stage: 'Sowing', activity: 'Sowing', expectedCost: 9000, progressWeight: 10 },
      { day: 14, stage: 'Irrigation', activity: 'First Irrigation', expectedCost: 2000, progressWeight: 5 },
      { day: 20, stage: 'Fertilizer', activity: 'Fertilizer', expectedCost: 7000, progressWeight: 8 },
      { day: 25, stage: 'Disease Monitoring', activity: 'Disease Inspection', expectedCost: 1500, progressWeight: 5 },
      { day: 40, stage: 'Fertilizer', activity: 'Second Fertilizer', expectedCost: 9000, progressWeight: 10 },
      { day: duration - 15, stage: 'Inspection', activity: 'Harvest Preparation', expectedCost: 2500, progressWeight: 7 },
      { day: duration - 2, stage: 'Harvesting', activity: 'Harvest', expectedCost: 12000, progressWeight: 15 },
      { day: duration - 1, stage: 'Packing', activity: 'Packing', expectedCost: 5000, progressWeight: 5 },
      { day: duration, stage: 'Transportation', activity: 'Transport', expectedCost: 6000, progressWeight: 5 },
    ],
    riskAnalysis: { riskLevel: 'medium', riskScore: 42, risks: ['Rainfall variation', 'Market price changes'], mitigation: ['Maintain drainage', 'Plan staggered harvest'] },
    weatherNotes: 'Demo data: monitor rainfall and keep drainage clear during critical stages.',
    estimatedInvestment: 85000,
    estimatedRevenue: 210000,
    estimatedProfit: 125000,
    expectedROI: 147,
  };
}

async function seedAIHistory(ownerId: unknown) {
  const lands = await LandModel.find({ ownerId }).limit(6);
  for (const [index, land] of lands.entries()) {
    const cropName = ['Tomato', 'Banana', 'Turmeric', 'Coconut', 'Green chilli', 'Fodder maize'][index] ?? 'Vegetables';
    await AIHistoryModel.updateOne(
      { userId: ownerId, 'metadata.seedKey': `demo-ai-${land.slug}` },
      {
        $set: {
          userId: ownerId,
          landId: land._id,
          feature: 'crop-recommendation',
          prompt: 'Seeded demo crop recommendation for Hopt It demo data.',
          input: {
            landId: land._id,
            soilType: land.landDetails.soilType,
            landArea: land.area.value,
            areaUnit: land.area.unit,
            state: land.location.state,
            district: land.location.district,
            waterAvailability: land.landDetails.waterAvailability,
            seededDemo: true,
          },
          response: buildDemoAIResponse(cropName),
          provider: 'seed',
          model: 'demo-data',
          durationMs: 0,
          metadata: { seededDemo: true, seedKey: `demo-ai-${land.slug}` },
        },
      },
      { upsert: true },
    );
  }
}

function buildDemoAIResponse(topCrop: string) {
  const crops = [topCrop, 'Okra', 'Groundnut', 'Marigold', 'Finger millet'];
  return {
    summary: `Demo data: ${topCrop} is ranked highest based on the seeded land profile, water availability, road access, and regional market assumptions.`,
    topRecommendedCrop: topCrop,
    recommendations: crops.map((crop, index) => ({
      cropName: crop,
      suitabilityScore: 88 - index * 6,
      reason: `Demo data: ${crop} fits the land profile with manageable input cost and local demand.`,
      idealSeason: index % 2 === 0 ? 'Monsoon' : 'Rabi',
      estimatedDuration: `${90 + index * 20} days`,
      waterRequirement: index < 2 ? 'medium' : 'low',
      investmentRange: { minimum: 45000 + index * 8000, maximum: 85000 + index * 10000, currency: 'INR' },
      expectedYieldRange: { minimum: 4 + index, maximum: 8 + index, unit: 'tons per acre' },
      expectedRevenueRange: { minimum: 120000 + index * 15000, maximum: 220000 + index * 20000, currency: 'INR' },
      expectedProfitRange: { minimum: 55000 + index * 7000, maximum: 125000 + index * 9000, currency: 'INR' },
      roiRange: { minimum: 35 + index * 3, maximum: 80 + index * 4, unit: 'percentage' },
      marketDemand: index < 3 ? 'high' : 'medium',
      majorRisks: ['Price fluctuation', 'Pest pressure', 'Weather variability'],
      soilPreparation: ['Deep ploughing', 'Add compost', 'Prepare drainage channels'],
      seedRecommendation: `Use certified ${crop} seed from a trusted local supplier.`,
      irrigationPlan: ['Irrigate lightly after sowing', 'Use drip irrigation where possible', 'Avoid waterlogging'],
      fertilizerPlan: ['Apply farmyard manure', 'Use soil-test based NPK', 'Add micronutrients if deficiency appears'],
      labourRequirement: '2 to 4 workers per acre during peak operations',
      confidenceScore: 82 - index * 3,
    })),
  };
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
