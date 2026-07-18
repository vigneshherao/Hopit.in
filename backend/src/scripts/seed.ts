import { connectDatabase, disconnectDatabase } from '@/config/database.js';
import { env } from '@/config/env.js';
import { AgreementModel } from '@/models/agreement.model.js';
import { AIHistoryModel } from '@/models/ai-history.model.js';
import { ApplicationNegotiationModel } from '@/models/application-negotiation.model.js';
import { ApplicationModel } from '@/models/application.model.js';
import { ADMIN_PERMISSIONS } from '@/constants/admin.constants.js';
import { AdminActionLogModel } from '@/models/admin-action-log.model.js';
import { AdminInternalNoteModel } from '@/models/admin-internal-note.model.js';
import { AdminNotificationPreferenceModel } from '@/models/admin-notification-preference.model.js';
import { AdminProfileModel } from '@/models/admin-profile.model.js';
import { AdminRoleModel } from '@/models/admin-role.model.js';
import { AdminSavedViewModel } from '@/models/admin-saved-view.model.js';
import { ChatAttachmentModel } from '@/models/chat-attachment.model.js';
import { ChatLocationModel } from '@/models/chat-location.model.js';
import { ConversationBlockModel } from '@/models/conversation-block.model.js';
import { ConversationMemberModel } from '@/models/conversation-member.model.js';
import { ConversationModel } from '@/models/conversation.model.js';
import { FarmPlanModel } from '@/models/farm-plan.model.js';
import { FarmTaskModel } from '@/models/farm-task.model.js';
import { ImpersonationSessionModel } from '@/models/impersonation-session.model.js';
import { LandModel } from '@/models/land.model.js';
import { LoginHistoryModel } from '@/models/login-history.model.js';
import { MessageModel } from '@/models/message.model.js';
import { UserStatusHistoryModel } from '@/models/user-status-history.model.js';
import { UserVerificationModel } from '@/models/user-verification.model.js';
import { UserModel } from '@/models/user.model.js';
import { WorkerProfileModel } from '@/models/worker-profile.model.js';
import { generateTasksForFarmPlan } from '@/services/farm-task.service.js';
import { ensureSystemAdminRoles } from '@/utils/adminPermission.util.js';
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
  { name: 'Demo Farm Manager', email: 'manager@hoptit.demo', role: 'worker' },
  { name: 'Demo Supervisor', email: 'supervisor@hoptit.demo', role: 'worker' },
  { name: 'Demo Security Admin', email: 'security@hoptit.demo', role: 'admin' },
  { name: 'Demo Support Admin', email: 'support@hoptit.demo', role: 'admin' },
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
      const workerPreset = workerProfilePreset(demoUser.email);
      await WorkerProfileModel.updateOne(
        { userId: user._id },
        {
          $set: {
            userId: user._id,
            ...workerPreset,
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
  await seedAdminFoundation();
  await seedChatDemoData();

  logger.info('Development demo users seeded. Password: HoptIt@123');
}

async function seedChatDemoData() {
  const users = await UserModel.find({ email: { $in: demoUsers.map((user) => user.email) } });
  const byEmail = new Map(users.map((user) => [user.email, user]));
  const owner = byEmail.get('owner@hoptit.demo');
  const farmer = byEmail.get('farmer@hoptit.demo');
  const worker = byEmail.get('worker@hoptit.demo');
  const admin = byEmail.get('admin@hoptit.demo');
  const investor = byEmail.get('investor@hoptit.demo');
  const dairy = byEmail.get('dairy@hoptit.demo');
  const solar = byEmail.get('solar@hoptit.demo');
  if (!owner || !farmer || !worker || !admin || !investor || !dairy || !solar) return;

  const plans = await FarmPlanModel.find({ ownerId: owner._id }).limit(6);
  const agreements = await AgreementModel.find({ ownerId: owner._id }).limit(6);
  const tasks = await FarmTaskModel.find({ ownerId: owner._id }).limit(10);
  const directPairs = [
    [owner, farmer],
    [owner, worker],
    [owner, admin],
    [owner, investor],
    [owner, dairy],
    [owner, solar],
    [farmer, worker],
    [investor, solar],
  ];
  const conversationSpecs = [
    ...directPairs.map(([first, second], index) => ({ seedKey: `chat-direct-${index}`, type: 'direct', members: [first, second], directParticipantKey: [first._id.toString(), second._id.toString()].sort().join(':'), title: undefined })),
    ...plans.map((plan, index) => ({ seedKey: `chat-farm-${index}`, type: 'farm-team', farmPlanId: plan._id, landId: plan.landId, members: [owner, farmer, worker], title: `${plan.selectedCrop} farm team` })),
    ...agreements.map((agreement, index) => ({ seedKey: `chat-agreement-${index}`, type: 'agreement', agreementId: agreement._id, landId: agreement.landId, members: [owner, farmer, admin], title: `Agreement discussion ${index + 1}` })),
    ...tasks.map((task, index) => ({ seedKey: `chat-task-${index}`, type: 'task', taskId: task._id, farmPlanId: task.farmPlanId, landId: task.landId, members: [owner, worker], title: task.title })),
    { seedKey: 'chat-support-1', type: 'admin-support', members: [owner, admin], title: 'Owner support desk' },
    { seedKey: 'chat-support-2', type: 'admin-support', members: [farmer, admin], title: 'Farmer support desk' },
    { seedKey: 'chat-group-1', type: 'custom-group', members: [owner, farmer, worker, investor], title: 'Mandya operations group' },
    { seedKey: 'chat-group-2', type: 'custom-group', members: [owner, dairy, solar, admin], title: 'Expansion planning group' },
  ];

  let messageIndex = 0;
  for (const spec of conversationSpecs) {
    const seedSpec = spec as Record<string, unknown> & { members: typeof users; seedKey: string; type: string; title?: string; directParticipantKey?: string };
    const conversation = await ConversationModel.findOneAndUpdate(
      { 'metadata.seedKey': seedSpec.seedKey },
      {
        $set: {
          type: seedSpec.type,
          title: seedSpec.title,
          createdBy: spec.members[0]._id,
          farmPlanId: seedSpec.farmPlanId,
          landId: seedSpec.landId,
          agreementId: seedSpec.agreementId,
          taskId: seedSpec.taskId,
          directParticipantKey: seedSpec.directParticipantKey,
          memberCount: spec.members.length,
          isActive: true,
          isArchivedGlobally: false,
          metadata: { seedKey: seedSpec.seedKey, seededDemo: true },
        },
      },
      { upsert: true, new: true },
    );
    for (const [index, member] of spec.members.entries()) {
      await ConversationMemberModel.updateOne(
        { conversationId: conversation._id, userId: member._id },
        {
          $set: {
            role: index === 0 ? 'owner' : member.role === 'worker' ? 'worker' : member.role === 'admin' ? 'admin' : 'member',
            status: 'active',
            unreadCount: index === 0 ? 0 : (messageIndex + index) % 4,
            isMuted: seedSpec.seedKey === 'chat-group-1' && index === 2,
            isPinned: seedSpec.seedKey === 'chat-support-1' && index === 0,
            isArchived: seedSpec.seedKey === 'chat-direct-5' && index === 0,
            notificationLevel: 'all',
            permissions: { canSendMessages: true, canUploadFiles: true, canAddMembers: index === 0, canRemoveMembers: index === 0, canEditConversation: index === 0, canViewHistory: true },
          },
          $setOnInsert: { addedBy: spec.members[0]._id, joinedAt: new Date() },
        },
        { upsert: true },
      );
    }
    const countForConversation = seedSpec.type === 'task' ? 4 : 6;
    for (let offset = 0; offset < countForConversation; offset += 1) {
      const sender = spec.members[(messageIndex + offset) % spec.members.length];
      const createdAt = new Date(Date.now() - (messageIndex + offset) * 60 * 60 * 1000);
      const text = chatSeedTexts[(messageIndex + offset) % chatSeedTexts.length];
      await MessageModel.updateOne(
        { senderId: sender._id, clientMessageId: `seed-chat-message-${messageIndex + offset}` },
        {
          $set: {
            conversationId: conversation._id,
            senderId: sender._id,
            type: offset === 0 ? 'system' : 'text',
            text: offset === 0 ? 'Demo data: conversation created for Hopt It chat testing.' : text,
            normalizedText: offset === 0 ? 'Demo data conversation created for Hopt It chat testing.' : text,
            attachments: [],
            status: offset % 3 === 0 ? 'read' : 'delivered',
            editVersion: offset === 2 ? 1 : 0,
            editedAt: offset === 2 ? createdAt : undefined,
            isDeletedForEveryone: offset === 3 && seedSpec.seedKey === 'chat-group-2',
            deletedForEveryoneAt: offset === 3 && seedSpec.seedKey === 'chat-group-2' ? createdAt : undefined,
            metadata: { seededDemo: true },
            createdAt,
            updatedAt: createdAt,
          },
        },
        { upsert: true },
      );
    }
    const lastMessage = await MessageModel.findOne({ conversationId: conversation._id }).sort({ createdAt: -1 });
    if (lastMessage) {
      conversation.lastMessageId = lastMessage._id as never;
      conversation.lastMessagePreview = lastMessage.text?.slice(0, 180);
      conversation.lastMessageAt = lastMessage.createdAt;
      conversation.lastMessageSenderId = lastMessage.senderId;
      await conversation.save();
    }
    messageIndex += countForConversation;
  }

  const sampleConversation = await ConversationModel.findOne({ 'metadata.seedKey': 'chat-group-1' });
  if (sampleConversation) {
    await ChatAttachmentModel.updateOne(
      { checksum: 'seed-chat-image' },
      { $set: { conversationId: sampleConversation._id, uploadedBy: owner._id, type: 'image', originalFileName: 'demo-field.jpg', sanitizedFileName: 'demo-field.jpg', mimeType: 'image/jpeg', sizeBytes: 120000, fileUrl: imageUrls[0], thumbnailUrl: imageUrls[0], checksum: 'seed-chat-image', scanStatus: 'clean', processingStatus: 'completed' } },
      { upsert: true },
    );
    await ChatAttachmentModel.updateOne(
      { checksum: 'seed-chat-document' },
      { $set: { conversationId: sampleConversation._id, uploadedBy: owner._id, type: 'document', originalFileName: 'soil-report.pdf', sanitizedFileName: 'soil-report.pdf', mimeType: 'application/pdf', sizeBytes: 95000, fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', checksum: 'seed-chat-document', scanStatus: 'clean', processingStatus: 'completed' } },
      { upsert: true },
    );
    await ChatLocationModel.updateOne(
      { conversationId: sampleConversation._id, label: 'Demo north field valve' },
      { $set: { conversationId: sampleConversation._id, sharedBy: owner._id, latitude: 12.9716, longitude: 77.5946, label: 'Demo north field valve', address: 'Demo farm point, Karnataka', sharedAt: new Date() } },
      { upsert: true },
    );
  }
  await ConversationBlockModel.updateOne({ blockerId: owner._id, blockedUserId: solar._id }, { $set: { reason: 'Demo blocked-user scenario' } }, { upsert: true });
}

const chatSeedTexts = [
  'Please check the irrigation line before evening.',
  'The north field looks healthy after the last rainfall.',
  'Can we move fertilizer application to tomorrow morning?',
  'Worker team reached the farm and started land cleaning.',
  'Market price is stronger this week, harvest timing looks good.',
  'I uploaded the soil report and will verify water availability.',
  'Let us inspect the pest traps near the banana block.',
  'The tractor operator confirmed availability for Friday.',
  'Please share photos after the disease monitoring round.',
  'Packing crates should arrive before harvest day.',
];

function workerProfilePreset(email: string) {
  const presets: Record<string, Record<string, unknown>> = {
    'manager@hoptit.demo': {
      headline: 'Full-time farm manager for remote landowners',
      bio: 'Experienced farm manager who can supervise daily operations, workers, input purchase, crop schedules, and owner progress updates for remote landowners.',
      professionalRoles: ['farm-manager', 'farm-supervisor'],
      skills: ['worker-management', 'crop-planning', 'farm-accounting', 'reporting', 'inventory-management'],
      experienceYears: 9,
      experienceDescription: 'Managed vegetable, banana, and coconut farms across Karnataka and Tamil Nadu.',
      languages: ['Kannada', 'Tamil', 'English'],
      profileImage: imageUrls[1],
      coverImage: imageUrls[0],
      location: { address: 'Demo manager village road', village: 'Srirangapatna', city: 'Mandya', district: 'Mandya', state: 'Karnataka', country: 'India', pincode: '571438', coordinates: { type: 'Point', coordinates: [76.7047, 12.4237] } },
      availability: { status: 'available', availableFrom: new Date(), preferredDurationTypes: ['monthly', 'long-term', 'contract'], willingToRelocate: true, willingToStayOnFarm: true, maximumTravelDistanceKm: 250 },
      pricing: { monthlySalary: 42000, seasonalRate: 180000, negotiable: true },
      workPreferences: { preferredCrops: ['Tomato', 'Banana', 'Coconut', 'Vegetables'], preferredWorkTypes: ['worker-management', 'crop-planning', 'reporting'], acceptsIndividualWork: true, acceptsTeamWork: true, acceptsFarmManagement: true, acceptsNightStay: true },
      identityVerification: { status: 'verified', verifiedAt: new Date() },
      documents: [{ type: 'identity-proof', name: 'Demo Aadhaar verification', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', verificationStatus: 'verified', uploadedAt: new Date() }],
      portfolio: [{ title: 'Remote tomato farm management', description: 'Managed irrigation, labour, harvest and weekly owner reporting.', images: [imageUrls[0]], cropOrWorkType: 'Tomato', location: 'Mandya', completedAt: new Date() }],
      rating: { average: 4.8, count: 24 },
      completedJobs: 38,
      profileViews: 410,
      responseRate: 96,
      isFeatured: true,
      isActive: true,
    },
    'supervisor@hoptit.demo': {
      headline: 'Field supervisor for irrigation, harvesting and labour teams',
      bio: 'Hands-on farm supervisor for daily field inspection, irrigation rounds, fertilizer schedules, harvesting teams, packing and transport coordination.',
      professionalRoles: ['farm-supervisor', 'irrigation-specialist'],
      skills: ['irrigation', 'fertilizer-application', 'harvesting', 'worker-management', 'disease-identification'],
      experienceYears: 6,
      experienceDescription: 'Supervised paddy, vegetable, poultry feed, and horticulture operations.',
      languages: ['Tamil', 'Malayalam', 'English'],
      profileImage: imageUrls[2],
      coverImage: imageUrls[3],
      location: { address: 'Demo supervisor lane', village: 'Pollachi', city: 'Pollachi', district: 'Coimbatore', state: 'Tamil Nadu', country: 'India', pincode: '642001', coordinates: { type: 'Point', coordinates: [77.008, 10.657] } },
      availability: { status: 'partially-available', availableFrom: new Date(), preferredDurationTypes: ['weekly', 'monthly', 'seasonal'], willingToRelocate: true, willingToStayOnFarm: false, maximumTravelDistanceKm: 120 },
      pricing: { dailyWage: 1200, weeklyRate: 7500, monthlySalary: 32000, negotiable: true },
      workPreferences: { preferredCrops: ['Paddy', 'Vegetables', 'Banana'], preferredWorkTypes: ['irrigation', 'harvesting', 'fertilizer-application'], acceptsIndividualWork: true, acceptsTeamWork: true, acceptsFarmManagement: false, acceptsNightStay: false },
      identityVerification: { status: 'pending' },
      documents: [{ type: 'experience-certificate', name: 'Demo supervisor experience letter', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', verificationStatus: 'pending', uploadedAt: new Date() }],
      portfolio: [{ title: 'Harvest team supervision', description: 'Coordinated harvest, grading and crate dispatch.', images: [imageUrls[2]], cropOrWorkType: 'Harvesting', location: 'Coimbatore', completedAt: new Date() }],
      rating: { average: 4.5, count: 18 },
      completedJobs: 27,
      profileViews: 260,
      responseRate: 91,
      isFeatured: true,
      isActive: true,
    },
  };

  return presets[email] ?? {
    headline: 'Experienced farm worker for sowing and harvest support',
    bio: 'Reliable agriculture worker with practical field experience in sowing, harvesting, irrigation support, and daily farm operations.',
    professionalRoles: ['general-farm-worker', 'seasonal-worker'],
    skills: ['sowing', 'harvesting', 'irrigation', 'weeding'],
    experienceYears: 3,
    experienceDescription: 'Worked with paddy, sugarcane, vegetables and seasonal harvest teams.',
    languages: ['Kannada', 'Tamil'],
    profileImage: imageUrls[0],
    coverImage: imageUrls[1],
    location: { city: 'Mandya', district: 'Mandya', state: 'Karnataka', country: 'India', coordinates: { type: 'Point', coordinates: [76.7047, 12.4237] } },
    availability: { status: 'available', availableFrom: new Date(), preferredDurationTypes: ['daily', 'seasonal'], willingToRelocate: false, willingToStayOnFarm: true, maximumTravelDistanceKm: 25 },
    pricing: { dailyWage: 750, weeklyRate: 4800, negotiable: true },
    workPreferences: { preferredCrops: ['Paddy', 'Sugarcane', 'Vegetables'], preferredWorkTypes: ['sowing', 'harvesting', 'irrigation'], acceptsIndividualWork: true, acceptsTeamWork: true, acceptsFarmManagement: false, acceptsNightStay: true },
    identityVerification: { status: 'verified', verifiedAt: new Date() },
    documents: [{ type: 'identity-proof', name: 'Demo worker identity proof', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', verificationStatus: 'verified', uploadedAt: new Date() }],
    portfolio: [{ title: 'Seasonal harvest support', description: 'Supported paddy and vegetable harvest teams.', images: [imageUrls[3]], cropOrWorkType: 'Harvesting', location: 'Mandya', completedAt: new Date() }],
    rating: { average: 4.4, count: 12 },
    completedJobs: 21,
    profileViews: 190,
    responseRate: 88,
    isFeatured: false,
    isActive: true,
  };
}

async function seedAdminFoundation() {
  await ensureSystemAdminRoles();
  const users = await UserModel.find({ email: { $in: demoUsers.map((user) => user.email) } });
  const byEmail = new Map(users.map((user) => [user.email, user]));
  const admin = byEmail.get('admin@hoptit.demo');
  const securityAdmin = byEmail.get('security@hoptit.demo');
  const supportAdmin = byEmail.get('support@hoptit.demo');
  const owner = byEmail.get('owner@hoptit.demo');
  const farmer = byEmail.get('farmer@hoptit.demo');
  const worker = byEmail.get('worker@hoptit.demo');
  const supervisor = byEmail.get('supervisor@hoptit.demo');
  if (!admin || !owner || !farmer || !worker) return;

  const superRole = await AdminRoleModel.findOne({ slug: 'super-admin' });
  const securityRole = await AdminRoleModel.findOne({ slug: 'security-admin' });
  const supportRole = await AdminRoleModel.findOne({ slug: 'support-admin' });
  const adminSpecs = [
    { user: admin, role: superRole, code: 'ADM-DEMO-ROOT', department: 'Platform', jobTitle: 'Demo Super Admin' },
    { user: securityAdmin, role: securityRole, code: 'ADM-DEMO-SEC', department: 'Security', jobTitle: 'Demo Security Admin' },
    { user: supportAdmin, role: supportRole, code: 'ADM-DEMO-SUP', department: 'Support', jobTitle: 'Demo Support Admin' },
  ].filter((spec) => spec.user && spec.role);

  for (const spec of adminSpecs) {
    await AdminProfileModel.updateOne(
      { userId: spec.user!._id },
      {
        $set: {
          userId: spec.user!._id,
          adminCode: spec.code,
          displayName: spec.user!.name,
          roleIds: [spec.role!._id],
          status: 'active',
          department: spec.department,
          jobTitle: spec.jobTitle,
          permissionsVersion: 1,
          activatedAt: new Date(),
          createdBy: admin._id,
          updatedBy: admin._id,
          metadata: { seededDemo: true },
        },
      },
      { upsert: true },
    );
  }

  const adminProfile = await AdminProfileModel.findOne({ userId: admin._id });
  await AdminNotificationPreferenceModel.updateOne(
    { adminId: admin._id },
    { $set: { adminId: admin._id, digestFrequency: 'instant', channels: ['in-app', 'email'], categories: { verifications: true, users: true, security: true, support: true } } },
    { upsert: true },
  );

  const savedViews = [
    { name: 'Pending verifications', resourceType: 'verifications', filters: { status: 'pending' }, sort: 'newest', columns: ['user', 'type', 'status', 'submittedAt'], isDefault: true },
    { name: 'Active owners', resourceType: 'users', filters: { role: 'owner', status: 'active' }, sort: 'last-login', columns: ['name', 'email', 'role', 'createdAt'], isDefault: false },
    { name: 'Failed security events', resourceType: 'audit-logs', filters: { result: 'failed' }, sort: 'newest', columns: ['action', 'targetType', 'result', 'createdAt'], isDefault: false },
  ] as const;

  for (const view of savedViews) {
    await AdminSavedViewModel.updateOne({ adminId: admin._id, resourceType: view.resourceType, name: view.name }, { $set: { adminId: admin._id, ...view } }, { upsert: true });
  }

  const verificationTargets = [
    { user: owner, type: 'land-owner', status: 'approved', notes: 'Demo owner profile verified.' },
    { user: farmer, type: 'farmer', status: 'pending', notes: 'Demo farmer verification waiting for review.' },
    { user: worker, type: 'worker', status: 'approved', notes: 'Demo worker identity verified.' },
    { user: supervisor, type: 'farm-manager', status: 'under-review', notes: 'Demo supervisor experience under review.' },
  ].filter((item) => item.user);

  for (const item of verificationTargets) {
    await UserVerificationModel.updateOne(
      { userId: item.user!._id, verificationType: item.type },
      {
        $set: {
          userId: item.user!._id,
          verificationType: item.type,
          status: item.status,
          submittedDocuments: [{ documentType: `${item.type}-document`, submittedAt: new Date() }],
          reviewNotes: item.notes,
          reviewedBy: item.status === 'approved' ? admin._id : undefined,
          reviewedAt: item.status === 'approved' ? new Date() : undefined,
          metadata: { seededDemo: true },
        },
      },
      { upsert: true },
    );
  }

  const notes = [
    { userId: owner._id, visibility: 'support', content: 'Demo note: owner prefers WhatsApp-style updates and weekly land verification summaries.' },
    { userId: farmer._id, visibility: 'admin', content: 'Demo note: farmer is interested in lease and revenue-share listings near Mandya.' },
    { userId: worker._id, visibility: 'security', content: 'Demo note: worker identity has been reviewed with no risk flags.' },
  ] as const;
  for (const note of notes) {
    await AdminInternalNoteModel.updateOne({ userId: note.userId, authorId: admin._id, content: note.content }, { $set: { ...note, authorId: admin._id } }, { upsert: true });
  }

  const now = Date.now();
  for (const [index, user] of [admin, owner, farmer, worker, securityAdmin, supportAdmin].filter(Boolean).entries()) {
    await LoginHistoryModel.updateOne(
      { userId: user!._id, email: user!.email, 'createdAt': { $gte: new Date(now - 14 * 24 * 60 * 60_000) } },
      {
        $set: {
          userId: user!._id,
          email: user!.email,
          success: index % 5 !== 4,
          failureReasonCategory: index % 5 === 4 ? 'invalid-credentials' : undefined,
          device: index % 2 === 0 ? 'Chrome on macOS' : 'Mobile Safari',
          browser: index % 2 === 0 ? 'Chrome' : 'Safari',
          platform: index % 2 === 0 ? 'macOS' : 'iOS',
          ip: `127.0.0.${index + 1}`,
          approximateLocation: index % 2 === 0 ? 'Bengaluru, Karnataka' : 'Coimbatore, Tamil Nadu',
          riskFlags: index % 5 === 4 ? ['failed-demo-login'] : [],
          createdAt: new Date(now - index * 6 * 60 * 60_000),
        },
      },
      { upsert: true },
    );
  }

  await createStatusHistoryOnce({ userId: farmer._id, previousStatus: 'pending', newStatus: 'active', reason: 'Demo account activated after profile review.', changedBy: admin._id, metadata: { seededDemo: true, seedKey: 'demo-status-farmer-active' } });
  await createStatusHistoryOnce({ userId: worker._id, previousStatus: 'active', newStatus: 'restricted', reason: 'Demo temporary restriction for documentation refresh.', changedBy: admin._id, expiresAt: new Date(now + 7 * 24 * 60 * 60_000), metadata: { seededDemo: true, seedKey: 'demo-status-worker-restricted' } });

  await ImpersonationSessionModel.updateOne(
    { adminId: admin._id, targetUserId: owner._id, ticketReference: 'DEMO-IMP-001' },
    { $set: { adminId: admin._id, targetUserId: owner._id, reason: 'Demo support troubleshooting session record.', ticketReference: 'DEMO-IMP-001', status: 'ended', startedAt: new Date(now - 2 * 24 * 60 * 60_000), expiresAt: new Date(now - 2 * 24 * 60 * 60_000 + 15 * 60_000), endedAt: new Date(now - 2 * 24 * 60 * 60_000 + 8 * 60_000), endedBy: admin._id, ip: '127.0.0.10', device: 'Demo admin console' } },
    { upsert: true },
  );

  await createAuditLogOnce({
    seedKey: 'demo-audit-admin-login',
    adminId: admin._id,
    adminProfileId: adminProfile?._id,
    action: 'admin-login-reviewed',
    targetType: 'login-history',
    permissionUsed: ADMIN_PERMISSIONS.SECURITY_LOGIN_HISTORY_VIEW,
    result: 'success',
    reason: 'Demo seeded audit event.',
  });
  await createAuditLogOnce({
    seedKey: 'demo-audit-verification',
    adminId: admin._id,
    adminProfileId: adminProfile?._id,
    action: 'verification-approved',
    targetType: 'user-verification',
    targetId: owner._id,
    permissionUsed: ADMIN_PERMISSIONS.USERS_VERIFY,
    result: 'success',
    reason: 'Demo owner verification approved.',
  });
  await createAuditLogOnce({
    seedKey: 'demo-audit-user-note',
    adminId: admin._id,
    adminProfileId: adminProfile?._id,
    action: 'admin-note-created',
    targetType: 'user',
    targetId: farmer._id,
    permissionUsed: ADMIN_PERMISSIONS.SUPPORT_NOTES_CREATE,
    result: 'success',
    reason: 'Demo support note created.',
  });
}

async function createStatusHistoryOnce(input: Record<string, unknown>) {
  const seedKey = (input.metadata as Record<string, unknown> | undefined)?.seedKey;
  if (seedKey && (await UserStatusHistoryModel.exists({ 'metadata.seedKey': seedKey }))) return;
  await UserStatusHistoryModel.create(input);
}

async function createAuditLogOnce(input: Record<string, unknown> & { seedKey: string }) {
  if (await AdminActionLogModel.exists({ 'metadata.seedKey': input.seedKey })) return;
  const { seedKey, ...payload } = input;
  await AdminActionLogModel.create({ ...payload, requestId: seedKey, ip: '127.0.0.1', userAgent: 'Hopt It demo seed', metadata: { seededDemo: true, seedKey } });
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
