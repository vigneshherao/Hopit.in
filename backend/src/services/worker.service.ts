import mongoose, { type FilterQuery } from 'mongoose';
import { ACTIVE_WORKER_JOB_APPLICATION_STATUSES, type FarmJobStatus } from '@/constants/worker.constants.js';
import { FarmJobModel, type FarmJobDocument } from '@/models/farm-job.model.js';
import { FarmManagementAssignmentModel } from '@/models/farm-management-assignment.model.js';
import { FarmProgressReportModel } from '@/models/farm-progress-report.model.js';
import { LandModel } from '@/models/land.model.js';
import { NotificationModel } from '@/models/notification.model.js';
import { UserModel } from '@/models/user.model.js';
import { WorkerBookingModel } from '@/models/worker-booking.model.js';
import { WorkerJobApplicationModel, type WorkerJobApplicationDocument } from '@/models/worker-job-application.model.js';
import { WorkerProfileModel } from '@/models/worker-profile.model.js';
import { WorkerReviewModel } from '@/models/worker-review.model.js';
import { WorkerTeamModel } from '@/models/worker-team.model.js';
import type { AuthenticatedUser } from '@/types/http.js';
import { AppError } from '@/utils/app-error.js';
import type { FarmJobQuery, WorkerQuery } from '@/validators/worker.validator.js';

const publicWorkerSelect = '-documents.url -location.address -location.pincode';

export async function createWorkerProfile(input: Record<string, unknown>, user: AuthenticatedUser) {
  if (!['worker', 'admin'].includes(user.role)) throw new AppError('Only workers can create worker profiles.', 403);
  const userId = user.role === 'admin' && typeof input.userId === 'string' ? input.userId : user.id;
  const profileUser = await UserModel.findById(userId).select('role');
  if (!profileUser || profileUser.role !== 'worker') throw new AppError('Worker profile user must have worker role.', 400);
  const existing = await WorkerProfileModel.exists({ userId });
  if (existing) throw new AppError('Worker profile already exists.', 409);
  const profile = await WorkerProfileModel.create({ ...input, userId });
  return profile;
}

export async function listWorkers(query: WorkerQuery) {
  const filter: FilterQuery<unknown> = { isActive: true };
  if (query.search) filter.$text = { $search: query.search };
  if (query.state) filter['location.state'] = new RegExp(escapeRegex(query.state), 'i');
  if (query.district) filter['location.district'] = new RegExp(escapeRegex(query.district), 'i');
  if (query.city) filter['location.city'] = new RegExp(escapeRegex(query.city), 'i');
  if (query.professionalRole) filter.professionalRoles = query.professionalRole;
  if (query.skill) filter.skills = query.skill;
  if (query.minimumExperience !== undefined) filter.experienceYears = { $gte: query.minimumExperience };
  if (query.maximumDailyWage !== undefined) filter['pricing.dailyWage'] = { $lte: query.maximumDailyWage };
  if (query.maximumMonthlySalary !== undefined) filter['pricing.monthlySalary'] = { $lte: query.maximumMonthlySalary };
  if (query.availabilityStatus) filter['availability.status'] = query.availabilityStatus;
  if (query.willingToRelocate !== undefined) filter['availability.willingToRelocate'] = query.willingToRelocate;
  if (query.willingToStayOnFarm !== undefined) filter['availability.willingToStayOnFarm'] = query.willingToStayOnFarm;
  if (query.acceptsFarmManagement !== undefined) filter['workPreferences.acceptsFarmManagement'] = query.acceptsFarmManagement;
  if (query.minimumRating !== undefined) filter['rating.average'] = { $gte: query.minimumRating };
  if (query.latitude !== undefined && query.longitude !== undefined && query.radiusKm) {
    filter['location.coordinates'] = {
      $near: {
        $geometry: { type: 'Point', coordinates: [query.longitude, query.latitude] },
        $maxDistance: query.radiusKm * 1000,
      },
    };
  }
  const sort = workerSort(query.sort);
  const skip = (query.page - 1) * query.limit;
  const [workers, total] = await Promise.all([
    WorkerProfileModel.find(filter).select(publicWorkerSelect).populate({ path: 'userId', select: 'name avatar role location.city' }).sort(sort).skip(skip).limit(query.limit).lean(),
    WorkerProfileModel.countDocuments(filter),
  ]);
  return { workers, pagination: pagination(query.page, query.limit, total) };
}

export async function getWorkerProfile(identifier: string, user?: AuthenticatedUser) {
  const filter = mongoose.isValidObjectId(identifier) ? { _id: identifier } : { userId: identifier };
  const profile = await WorkerProfileModel.findOne(filter).select(publicWorkerSelect).populate({ path: 'userId', select: 'name avatar role location.city' }).lean();
  if (!profile || !profile.isActive) throw new AppError('Worker profile not found.', 404);
  await WorkerProfileModel.updateOne({ _id: profile._id }, { $inc: { profileViews: 1 } });
  const reviews = await WorkerReviewModel.find({ workerId: profile.userId, isVisible: true }).sort({ createdAt: -1 }).limit(10).lean();
  return { worker: profile, reviews, canManage: Boolean(user && (user.role === 'admin' || documentId(profile.userId) === user.id)) };
}

export async function getMyWorkerProfile(user: AuthenticatedUser) {
  if (!['worker', 'admin'].includes(user.role)) throw new AppError('Only workers can access worker profile.', 403);
  const profile = await WorkerProfileModel.findOne({ userId: user.id }).select('+documents.url +location.address +location.pincode');
  if (!profile) throw new AppError('Worker profile not found.', 404);
  return profile;
}

export async function updateMyWorkerProfile(input: Record<string, unknown>, user: AuthenticatedUser) {
  const profile = await getMyWorkerProfile(user);
  const blocked = ['userId', 'identityVerification', 'rating', 'completedJobs', 'isFeatured'];
  for (const key of blocked) delete input[key];
  Object.assign(profile, input);
  await profile.save();
  return profile;
}

export async function submitWorkerVerification(user: AuthenticatedUser) {
  const profile = await getMyWorkerProfile(user);
  if (!profile.isProfileComplete) throw new AppError('Complete required profile fields before verification.', 400);
  if (!profile.documents.some((document) => ['identity-proof', 'address-proof'].includes(document.type))) {
    throw new AppError('Identity or address proof is required for verification.', 400);
  }
  profile.identityVerification.status = 'pending';
  await profile.save();
  return profile;
}

export async function verifyWorkerProfile(id: string, action: 'approve' | 'reject', adminId: string, reason?: string) {
  const profile = await WorkerProfileModel.findById(id);
  if (!profile) throw new AppError('Worker profile not found.', 404);
  profile.identityVerification.status = action === 'approve' ? 'verified' : 'rejected';
  profile.identityVerification.verifiedBy = adminId as never;
  profile.identityVerification.verifiedAt = action === 'approve' ? new Date() : undefined;
  profile.identityVerification.rejectionReason = action === 'reject' ? reason : undefined;
  await profile.save();
  await notify(profile.userId, action === 'approve' ? 'worker-profile-approved' : 'worker-profile-rejected', action === 'approve' ? 'Worker profile verified' : 'Worker profile rejected', reason ?? 'Your worker profile verification status changed.');
  return profile;
}

export async function getWorkerStatistics(user: AuthenticatedUser) {
  const profile = await getMyWorkerProfile(user);
  const [activeApplications, activeBookings] = await Promise.all([
    WorkerJobApplicationModel.countDocuments({ applicantUserId: user.id, status: { $in: [...ACTIVE_WORKER_JOB_APPLICATION_STATUSES] } }),
    WorkerBookingModel.countDocuments({ workerId: user.id, status: { $in: ['pending-confirmation', 'confirmed', 'in-progress'] } }),
  ]);
  return {
    profileViews: profile.profileViews,
    completedJobs: profile.completedJobs,
    activeApplications,
    activeBookings,
    averageRating: profile.rating.average,
    responseRate: profile.responseRate,
    totalEarningsPlaceholder: 0,
  };
}

export async function createFarmJob(input: Record<string, unknown>, user: AuthenticatedUser) {
  if (!['owner', 'farmer', 'admin'].includes(user.role)) throw new AppError('Not authorized to post farm jobs.', 403);
  await assertLandAccess(input.landId as string | undefined, user);
  const slug = await uniqueJobSlug(String(input.title));
  const job = await FarmJobModel.create({ ...input, postedBy: user.id, slug });
  return job;
}

export async function listFarmJobs(query: FarmJobQuery, user?: AuthenticatedUser) {
  await expireOldJobs();
  const filter: FilterQuery<unknown> = user?.role === 'admin' && query.status ? { status: query.status } : { status: 'open' };
  if (query.search) filter.$text = { $search: query.search };
  if (query.state) filter['location.state'] = new RegExp(escapeRegex(query.state), 'i');
  if (query.district) filter['location.district'] = new RegExp(escapeRegex(query.district), 'i');
  if (query.city) filter['location.city'] = new RegExp(escapeRegex(query.city), 'i');
  if (query.professionalRole) filter.professionalRolesRequired = query.professionalRole;
  if (query.skill) filter.skillsRequired = query.skill;
  if (query.workType) filter.workType = query.workType;
  if (query.hiringType) filter.hiringType = query.hiringType;
  if (query.paymentType) filter['compensation.paymentType'] = query.paymentType;
  if (query.minimumPay !== undefined || query.maximumPay !== undefined) filter['compensation.amount'] = moneyRange(query.minimumPay, query.maximumPay);
  if (query.accommodationProvided !== undefined) filter['schedule.accommodationProvided'] = query.accommodationProvided;
  if (query.foodProvided !== undefined) filter['schedule.foodProvided'] = query.foodProvided;
  if (query.transportProvided !== undefined) filter['schedule.transportProvided'] = query.transportProvided;
  if (query.cropOrBusinessType) filter.cropOrBusinessType = new RegExp(escapeRegex(query.cropOrBusinessType), 'i');
  if (query.startDate) filter['duration.startDate'] = { $gte: query.startDate };
  if (query.latitude !== undefined && query.longitude !== undefined && query.radiusKm) {
    filter['location.coordinates'] = {
      $near: { $geometry: { type: 'Point', coordinates: [query.longitude, query.latitude] }, $maxDistance: query.radiusKm * 1000 },
    };
  }
  const skip = (query.page - 1) * query.limit;
  const [jobs, total] = await Promise.all([
    FarmJobModel.find(filter).populate({ path: 'postedBy', select: 'name avatar role location.city' }).populate({ path: 'landId', select: 'title slug location area' }).sort(jobSort(query.sort)).skip(skip).limit(query.limit).lean(),
    FarmJobModel.countDocuments(filter),
  ]);
  return { jobs, pagination: pagination(query.page, query.limit, total) };
}

export async function getFarmJob(identifier: string, user?: AuthenticatedUser) {
  await expireOldJobs();
  const filter = mongoose.isValidObjectId(identifier) ? { _id: identifier } : { slug: identifier };
  const job = await FarmJobModel.findOne(filter).populate({ path: 'postedBy', select: 'name avatar role location.city' }).populate({ path: 'landId', select: 'title slug location area media' }).lean();
  if (!job || (!['open'].includes(job.status) && user?.role !== 'admin' && documentId(job.postedBy) !== user?.id)) throw new AppError('Farm job not found.', 404);
  await FarmJobModel.updateOne({ _id: job._id }, { $inc: { viewCount: 1 } });
  const alreadyApplied = user ? Boolean(await WorkerJobApplicationModel.exists({ jobId: job._id, applicantUserId: user.id, status: { $in: [...ACTIVE_WORKER_JOB_APPLICATION_STATUSES] } })) : false;
  return { job, alreadyApplied };
}

export async function getMyFarmJobs(query: FarmJobQuery, user: AuthenticatedUser) {
  const filter: FilterQuery<unknown> = user.role === 'admin' ? {} : { postedBy: user.id };
  if (query.status) filter.status = query.status;
  const skip = (query.page - 1) * query.limit;
  const [jobs, total] = await Promise.all([
    FarmJobModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
    FarmJobModel.countDocuments(filter),
  ]);
  return { jobs, pagination: pagination(query.page, query.limit, total) };
}

export async function updateFarmJob(id: string, input: Record<string, unknown>, user: AuthenticatedUser) {
  const job = await findJobForOwner(id, user);
  if (input.landId) await assertLandAccess(input.landId as string, user);
  Object.assign(job, input);
  await job.save();
  return job;
}

export async function updateFarmJobStatus(id: string, action: string, user: AuthenticatedUser) {
  const job = await findJobForOwner(id, user);
  const next = farmJobStatusFromAction(action, job.status as FarmJobStatus);
  job.status = next;
  await job.save();
  return job;
}

export async function deleteFarmJob(id: string, user: AuthenticatedUser) {
  const job = await findJobForOwner(id, user);
  if (job.status === 'draft' && job.applicationCount === 0) {
    await job.deleteOne();
    return { deleted: true };
  }
  job.status = 'cancelled';
  await job.save();
  return { deleted: false, job };
}

export async function getFarmJobStatistics(user: AuthenticatedUser) {
  const filter = user.role === 'admin' ? {} : { postedBy: user.id };
  const [jobs, activeBookings] = await Promise.all([
    FarmJobModel.find(filter).select('status applicationCount').lean(),
    WorkerBookingModel.countDocuments(user.role === 'admin' ? { status: { $in: ['confirmed', 'in-progress'] } } : { bookedBy: user.id, status: { $in: ['confirmed', 'in-progress'] } }),
  ]);
  const count = (status: string) => jobs.filter((job) => job.status === status).length;
  return {
    totalJobs: jobs.length,
    openJobs: count('open'),
    pausedJobs: count('paused'),
    filledJobs: count('filled'),
    completedJobs: count('completed'),
    totalApplications: jobs.reduce((sum, job) => sum + (job.applicationCount ?? 0), 0),
    activeBookings,
  };
}

export async function applyToFarmJob(jobId: string, input: Record<string, unknown>, user: AuthenticatedUser) {
  if (!['worker', 'admin'].includes(user.role)) throw new AppError('Only workers can apply to farm jobs.', 403);
  const job = await FarmJobModel.findById(jobId);
  if (!job || job.status !== 'open') throw new AppError('Farm job is not open.', 400);
  if (documentId(job.postedBy) === user.id) throw new AppError('You cannot apply to your own job.', 400);
  const profile = await WorkerProfileModel.findOne({ userId: user.id, isActive: true });
  if (!profile || !profile.isProfileComplete) throw new AppError('Complete your worker profile before applying.', 400);
  if (input.applicantType === 'team') {
    const team = await WorkerTeamModel.findById(input.teamId);
    if (!team || documentId(team.leaderId) !== user.id) throw new AppError('Only the team leader can apply as a team.', 403);
  }
  const application = await WorkerJobApplicationModel.create({
    ...input,
    jobId,
    workerId: input.applicantType === 'team' ? undefined : user.id,
    applicantUserId: user.id,
    jobOwnerId: job.postedBy,
  });
  job.applicationCount += 1;
  await job.save();
  await notify(job.postedBy, 'farm-job-application-submitted', 'New farm job application', `${profile.headline} applied to ${job.title}.`);
  return application;
}

export async function getMyJobApplications(user: AuthenticatedUser) {
  const applications = await WorkerJobApplicationModel.find({ applicantUserId: user.id }).populate({ path: 'jobId', select: 'title slug status location compensation' }).sort({ createdAt: -1 }).lean();
  return { applications };
}

export async function getJobApplications(jobId: string, user: AuthenticatedUser) {
  const job = await findJobForOwner(jobId, user);
  const applications = await WorkerJobApplicationModel.find({ jobId: job._id }).populate({ path: 'applicantUserId', select: 'name avatar role' }).populate({ path: 'teamId', select: 'name image ratingAverage teamSize' }).sort({ createdAt: -1 }).lean();
  return { applications };
}

export async function getJobApplication(id: string, user: AuthenticatedUser) {
  const application = await WorkerJobApplicationModel.findById(id).populate({ path: 'jobId', select: 'title slug postedBy location compensation' }).populate({ path: 'applicantUserId', select: 'name avatar role' });
  if (!application) throw new AppError('Job application not found.', 404);
  const job = application.jobId as unknown as FarmJobDocument;
  const canAccess = user.role === 'admin' || documentId(application.applicantUserId) === user.id || documentId(job.postedBy) === user.id;
  if (!canAccess) throw new AppError('Job application not found.', 404);
  return application;
}

export async function actionJobApplication(id: string, action: string, user: AuthenticatedUser, reason?: string) {
  const application = await WorkerJobApplicationModel.findById(id).populate({ path: 'jobId' });
  if (!application) throw new AppError('Job application not found.', 404);
  const job = application.jobId as unknown as FarmJobDocument;
  const isApplicant = documentId(application.applicantUserId) === user.id;
  const isOwner = documentId(job.postedBy) === user.id || user.role === 'admin';
  if (action === 'withdraw') {
    if (!isApplicant) throw new AppError('Not authorized.', 403);
    application.status = 'withdrawn';
    application.withdrawnAt = new Date();
  } else {
    if (!isOwner) throw new AppError('Not authorized.', 403);
    if (action === 'review') application.status = 'under-review';
    if (action === 'shortlist') application.status = 'shortlisted';
    if (action === 'reject') {
      application.status = 'rejected';
      application.review = { ...(application.review ?? {}), rejectionReason: reason };
    }
    if (action === 'accept') return acceptJobApplication(application, job);
  }
  await application.save();
  return { application };
}

export async function listWorkerBookings(user: AuthenticatedUser) {
  const filter = user.role === 'admin' ? {} : user.role === 'worker' ? { workerId: user.id } : { bookedBy: user.id };
  const bookings = await WorkerBookingModel.find(filter).populate({ path: 'jobId', select: 'title slug' }).populate({ path: 'workerId', select: 'name avatar role' }).populate({ path: 'teamId', select: 'name image' }).sort({ createdAt: -1 }).lean();
  return { bookings };
}

export async function getWorkerBooking(id: string, user: AuthenticatedUser) {
  const booking = await findBookingForAccess(id, user);
  return booking;
}

export async function confirmWorkerBooking(id: string, user: AuthenticatedUser) {
  const booking = await findBookingForAccess(id, user);
  if (documentId(booking.bookedBy) === user.id || user.role === 'admin') {
    booking.confirmation.hirerConfirmed = true;
    booking.confirmation.hirerConfirmedAt = new Date();
  }
  if (documentId(booking.workerId) === user.id || user.role === 'admin') {
    booking.confirmation.workerConfirmed = true;
    booking.confirmation.workerConfirmedAt = new Date();
  }
  await booking.save();
  return booking;
}

export async function startWorkerBooking(id: string, user: AuthenticatedUser) {
  const booking = await findBookingForAccess(id, user);
  if (booking.status !== 'confirmed') throw new AppError('Booking must be confirmed before starting.', 400);
  booking.status = 'in-progress';
  await booking.save();
  return booking;
}

export async function updateWorkerBookingProgress(id: string, percentage: number, user: AuthenticatedUser) {
  const booking = await findBookingForAccess(id, user);
  booking.progress.percentage = percentage;
  booking.progress.lastUpdatedAt = new Date();
  await booking.save();
  return booking;
}

export async function completeWorkerBooking(id: string, user: AuthenticatedUser) {
  const booking = await findBookingForAccess(id, user);
  if (documentId(booking.bookedBy) !== user.id && user.role !== 'admin') throw new AppError('Only the hirer can complete a booking.', 403);
  booking.status = 'completed';
  booking.progress.percentage = 100;
  await booking.save();
  if (booking.workerId) await WorkerProfileModel.updateOne({ userId: booking.workerId }, { $inc: { completedJobs: 1 } });
  if (booking.jobId) await FarmJobModel.updateOne({ _id: booking.jobId }, { $set: { status: 'completed' } });
  return booking;
}

export async function cancelWorkerBooking(id: string, reason: string, user: AuthenticatedUser) {
  const booking = await findBookingForAccess(id, user);
  booking.status = 'cancelled';
  booking.cancellation = { cancelledBy: user.id as never, cancelledAt: new Date(), reason };
  await booking.save();
  return booking;
}

export async function reviewWorkerBooking(id: string, input: Record<string, unknown>, user: AuthenticatedUser) {
  const booking = await findBookingForAccess(id, user);
  if (booking.status !== 'completed') throw new AppError('Reviews are allowed after completed bookings.', 400);
  if (documentId(booking.bookedBy) !== user.id && user.role !== 'admin') throw new AppError('Only the hirer can review.', 403);
  const review = await WorkerReviewModel.create({ ...input, bookingId: booking._id, workerId: booking.workerId, teamId: booking.teamId, reviewerId: user.id });
  await recalculateRatings(booking.workerId, booking.teamId);
  return review;
}

export async function createFarmManagement(input: Record<string, unknown>, user: AuthenticatedUser) {
  if (!['owner', 'admin'].includes(user.role)) throw new AppError('Only landowners can create farm management assignments.', 403);
  const land = await LandModel.findById(input.landId);
  if (!land) throw new AppError('Land not found.', 404);
  if (user.role !== 'admin' && documentId(land.ownerId) !== user.id) throw new AppError('Not authorized for this land.', 403);
  const assignment = await FarmManagementAssignmentModel.create({ ...input, ownerId: land.ownerId });
  return assignment;
}

export async function listFarmManagement(user: AuthenticatedUser) {
  const filter = user.role === 'admin' ? {} : user.role === 'worker' ? { managerId: user.id } : { ownerId: user.id };
  const assignments = await FarmManagementAssignmentModel.find(filter).populate({ path: 'landId', select: 'title slug location area' }).populate({ path: 'managerId', select: 'name avatar role' }).sort({ createdAt: -1 }).lean();
  return { assignments };
}

export async function getFarmManagement(id: string, user: AuthenticatedUser) {
  const assignment = await FarmManagementAssignmentModel.findById(id).populate({ path: 'landId', select: 'title slug location area media' }).populate({ path: 'managerId', select: 'name avatar role' });
  if (!assignment) throw new AppError('Farm management assignment not found.', 404);
  if (user.role !== 'admin' && documentId(assignment.ownerId) !== user.id && documentId(assignment.managerId) !== user.id) throw new AppError('Not authorized.', 403);
  return assignment;
}

export async function createFarmReport(assignmentId: string, input: Record<string, unknown>, user: AuthenticatedUser) {
  const assignment = await getFarmManagement(assignmentId, user);
  if (user.role !== 'admin' && documentId(assignment.managerId) !== user.id) throw new AppError('Only the assigned manager can create reports.', 403);
  const report = await FarmProgressReportModel.create({ ...input, assignmentId: assignment._id, landId: assignment.landId, managerId: assignment.managerId });
  assignment.currentProgressPercentage = report.progressPercentage;
  assignment.nextReportDueAt = nextReportDate(assignment.reportingFrequency);
  await assignment.save();
  return report;
}

export async function listFarmReports(assignmentId: string, user: AuthenticatedUser) {
  await getFarmManagement(assignmentId, user);
  const reports = await FarmProgressReportModel.find({ assignmentId }).sort({ reportDate: -1 }).lean();
  return { reports };
}

export async function submitReportFeedback(reportId: string, message: string, user: AuthenticatedUser) {
  const report = await FarmProgressReportModel.findById(reportId);
  if (!report) throw new AppError('Progress report not found.', 404);
  const assignment = await getFarmManagement(documentId(report.assignmentId), user);
  if (user.role !== 'admin' && documentId(assignment.ownerId) !== user.id) throw new AppError('Only the owner can submit feedback.', 403);
  report.ownerFeedback = { message, submittedAt: new Date() };
  await report.save();
  return report;
}

async function acceptJobApplication(application: WorkerJobApplicationDocument, job: FarmJobDocument) {
  application.status = 'accepted';
  application.acceptedAt = new Date();
  await application.save();
  const booking = await WorkerBookingModel.create({
    jobId: job._id,
    landId: job.landId,
    bookedBy: job.postedBy,
    workerId: application.workerId,
    teamId: application.teamId,
    bookingType: application.applicantType === 'team' ? 'team' : job.hiringType === 'farm-manager' ? 'farm-manager' : 'individual',
    workTitle: job.title,
    workDescription: job.description,
    workType: job.workType,
    startDate: job.duration.startDate ?? new Date(),
    endDate: job.duration.endDate,
    numberOfDays: job.duration.numberOfDays,
    numberOfMonths: job.duration.numberOfMonths,
    numberOfWorkers: application.applicantType === 'team' ? job.numberOfWorkersRequired : 1,
    agreedPayment: {
      paymentType: job.compensation.paymentType === 'negotiable' ? 'fixed-contract' : job.compensation.paymentType,
      rate: application.proposedRate ?? job.compensation.amount ?? job.compensation.minimumAmount ?? 0,
      advanceAmount: 0,
      totalAmount: 0,
      remainingAmount: 0,
      currency: job.compensation.currency,
    },
    facilities: {
      accommodationProvided: job.schedule.accommodationProvided,
      foodProvided: job.schedule.foodProvided,
      transportProvided: job.schedule.transportProvided,
    },
  });
  job.selectedApplicantIds.push(application._id as never);
  if (job.selectedApplicantIds.length >= job.numberOfWorkersRequired || application.applicantType === 'team') {
    job.status = 'filled';
    await WorkerJobApplicationModel.updateMany(
      { jobId: job._id, _id: { $ne: application._id }, status: { $in: [...ACTIVE_WORKER_JOB_APPLICATION_STATUSES] } },
      { $set: { status: 'rejected', 'review.rejectionReason': 'The job has been filled.' } },
    );
  }
  await job.save();
  await notify(application.applicantUserId, 'farm-job-application-accepted', 'Farm job application accepted', `Your application for ${job.title} was accepted.`);
  return { application, booking };
}

async function findJobForOwner(id: string, user: AuthenticatedUser) {
  const job = await FarmJobModel.findById(id);
  if (!job) throw new AppError('Farm job not found.', 404);
  if (user.role !== 'admin' && documentId(job.postedBy) !== user.id) throw new AppError('Not authorized.', 403);
  return job;
}

async function findBookingForAccess(id: string, user: AuthenticatedUser) {
  const booking = await WorkerBookingModel.findById(id);
  if (!booking) throw new AppError('Worker booking not found.', 404);
  const canAccess = user.role === 'admin' || documentId(booking.bookedBy) === user.id || documentId(booking.workerId) === user.id;
  if (!canAccess) throw new AppError('Worker booking not found.', 404);
  return booking;
}

async function assertLandAccess(landId: string | undefined, user: AuthenticatedUser) {
  if (!landId) return;
  const land = await LandModel.findById(landId);
  if (!land) throw new AppError('Land not found.', 404);
  if (user.role === 'admin') return;
  if (documentId(land.ownerId) === user.id) return;
  throw new AppError('You cannot post jobs for this land.', 403);
}

async function uniqueJobSlug(title: string) {
  const base = slugify(title);
  let slug = base;
  let counter = 1;
  while (await FarmJobModel.exists({ slug })) {
    counter += 1;
    slug = `${base}-${counter}`;
  }
  return slug;
}

async function expireOldJobs() {
  await FarmJobModel.updateMany({ status: 'open', expiresAt: { $lte: new Date() } }, { $set: { status: 'expired' } });
}

async function recalculateRatings(workerId?: unknown, teamId?: unknown) {
  if (workerId) {
    const reviews = await WorkerReviewModel.find({ workerId, isVisible: true }).select('rating').lean();
    const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
    await WorkerProfileModel.updateOne({ userId: workerId }, { $set: { 'rating.average': Number(average.toFixed(2)), 'rating.count': reviews.length } });
  }
  if (teamId) {
    const reviews = await WorkerReviewModel.find({ teamId, isVisible: true }).select('rating').lean();
    const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
    await WorkerTeamModel.updateOne({ _id: teamId }, { $set: { ratingAverage: Number(average.toFixed(2)), ratingCount: reviews.length } });
  }
}

function farmJobStatusFromAction(action: string, current: FarmJobStatus) {
  if (action === 'open' || action === 'resume') return 'open';
  if (action === 'pause') return 'paused';
  if (action === 'mark-filled') return 'filled';
  if (action === 'cancel') return 'cancelled';
  if (action === 'complete') return 'completed';
  return current;
}

function workerSort(sort: string): Record<string, 1 | -1> {
  if (sort === 'highest-rated') return { 'rating.average': -1 };
  if (sort === 'most-experienced') return { experienceYears: -1 };
  if (sort === 'price-low-high') return { 'pricing.dailyWage': 1 };
  if (sort === 'price-high-low') return { 'pricing.dailyWage': -1 };
  if (sort === 'newest') return { createdAt: -1 };
  return { isFeatured: -1, 'rating.average': -1, createdAt: -1 };
}

function jobSort(sort: string): Record<string, 1 | -1> {
  if (sort === 'oldest') return { createdAt: 1 };
  if (sort === 'highest-pay') return { 'compensation.amount': -1 };
  if (sort === 'lowest-pay') return { 'compensation.amount': 1 };
  if (sort === 'starting-soon') return { 'duration.startDate': 1 };
  return { createdAt: -1 };
}

function pagination(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

function moneyRange(minimum?: number, maximum?: number) {
  return { ...(minimum !== undefined ? { $gte: minimum } : {}), ...(maximum !== undefined ? { $lte: maximum } : {}) };
}

function nextReportDate(frequency: string) {
  const days = frequency === 'daily' ? 1 : frequency === 'biweekly' ? 14 : frequency === 'monthly' ? 30 : 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function notify(userId: unknown, type: string, title: string, message: string) {
  await NotificationModel.create({ userId: documentId(userId), type, title, message });
}

function documentId(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'object' && '_id' in value) return String((value as { _id: unknown })._id);
  return String(value);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'farm-job';
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
