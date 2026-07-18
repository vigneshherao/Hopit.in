import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as workerService from '@/services/workerService.js';

export const workerKeys = {
  all: ['worker-hiring'],
  workers: (filters) => [...workerKeys.all, 'workers', filters],
  worker: (identifier) => [...workerKeys.all, 'worker', identifier],
  profile: () => [...workerKeys.all, 'profile'],
  jobs: (filters) => [...workerKeys.all, 'jobs', filters],
  job: (identifier) => [...workerKeys.all, 'job', identifier],
  myJobs: (filters) => [...workerKeys.all, 'my-jobs', filters],
  applications: () => [...workerKeys.all, 'applications'],
  jobApplications: (jobId) => [...workerKeys.all, 'job-applications', jobId],
  bookings: () => [...workerKeys.all, 'bookings'],
  booking: (id) => [...workerKeys.all, 'booking', id],
  management: () => [...workerKeys.all, 'management'],
  assignment: (id) => [...workerKeys.all, 'assignment', id],
  reports: (id) => [...workerKeys.all, 'reports', id],
};

export function useWorkers(filters) {
  return useQuery({ queryKey: workerKeys.workers(filters), queryFn: () => workerService.getWorkers(filters) });
}

export function useWorker(identifier) {
  return useQuery({ queryKey: workerKeys.worker(identifier), queryFn: () => workerService.getWorker(identifier), enabled: Boolean(identifier) });
}

export function useMyWorkerProfile() {
  return useQuery({ queryKey: workerKeys.profile(), queryFn: workerService.getMyWorkerProfile, retry: false });
}

export function useCreateWorkerProfile() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: workerService.createWorkerProfile, onSuccess: () => queryClient.invalidateQueries({ queryKey: workerKeys.all }) });
}

export function useUpdateWorkerProfile() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: workerService.updateWorkerProfile, onSuccess: () => queryClient.invalidateQueries({ queryKey: workerKeys.all }) });
}

export function useSubmitWorkerVerification() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: workerService.submitWorkerVerification, onSuccess: () => queryClient.invalidateQueries({ queryKey: workerKeys.all }) });
}

export function useFarmJobs(filters) {
  return useQuery({ queryKey: workerKeys.jobs(filters), queryFn: () => workerService.getFarmJobs(filters) });
}

export function useFarmJob(identifier) {
  return useQuery({ queryKey: workerKeys.job(identifier), queryFn: () => workerService.getFarmJob(identifier), enabled: Boolean(identifier) });
}

export function useMyFarmJobs(filters) {
  return useQuery({ queryKey: workerKeys.myJobs(filters), queryFn: () => workerService.getMyFarmJobs(filters) });
}

export function useCreateFarmJob() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: workerService.createFarmJob, onSuccess: () => queryClient.invalidateQueries({ queryKey: workerKeys.all }) });
}

export function useUpdateFarmJob() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }) => workerService.updateFarmJob(id, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: workerKeys.all }) });
}

export function useUpdateFarmJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, action }) => workerService.updateFarmJobStatus(id, action), onSuccess: () => queryClient.invalidateQueries({ queryKey: workerKeys.all }) });
}

export function useApplyToFarmJob() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ jobId, payload }) => workerService.applyToFarmJob(jobId, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: workerKeys.all }) });
}

export function useMyJobApplications() {
  return useQuery({ queryKey: workerKeys.applications(), queryFn: workerService.getMyJobApplications });
}

export function useJobApplications(jobId) {
  return useQuery({ queryKey: workerKeys.jobApplications(jobId), queryFn: () => workerService.getJobApplications(jobId), enabled: Boolean(jobId) });
}

export function useJobApplicationAction() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, action, payload }) => workerService.actionJobApplication(id, action, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: workerKeys.all }) });
}

export function useWorkerBookings() {
  return useQuery({ queryKey: workerKeys.bookings(), queryFn: workerService.getWorkerBookings });
}

export function useWorkerBooking(id) {
  return useQuery({ queryKey: workerKeys.booking(id), queryFn: () => workerService.getWorkerBooking(id), enabled: Boolean(id) });
}

export function useWorkerBookingAction(action) {
  const queryClient = useQueryClient();
  const mutationMap = {
    confirm: workerService.confirmWorkerBooking,
    start: workerService.startWorkerBooking,
    complete: workerService.completeWorkerBooking,
  };
  return useMutation({ mutationFn: mutationMap[action], onSuccess: () => queryClient.invalidateQueries({ queryKey: workerKeys.all }) });
}

export function useUpdateBookingProgress() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }) => workerService.updateBookingProgress(id, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: workerKeys.all }) });
}

export function useCancelWorkerBooking() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }) => workerService.cancelWorkerBooking(id, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: workerKeys.all }) });
}

export function useFarmManagementAssignments() {
  return useQuery({ queryKey: workerKeys.management(), queryFn: workerService.getFarmManagementAssignments });
}

export function useFarmManagementAssignment(id) {
  return useQuery({ queryKey: workerKeys.assignment(id), queryFn: () => workerService.getFarmManagementAssignment(id), enabled: Boolean(id) });
}

export function useFarmProgressReports(id) {
  return useQuery({ queryKey: workerKeys.reports(id), queryFn: () => workerService.getFarmProgressReports(id), enabled: Boolean(id) });
}

export function useCreateFarmProgressReport() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }) => workerService.createFarmProgressReport(id, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: workerKeys.all }) });
}

export function useSubmitReportFeedback() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ reportId, payload }) => workerService.submitReportFeedback(reportId, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: workerKeys.all }) });
}
