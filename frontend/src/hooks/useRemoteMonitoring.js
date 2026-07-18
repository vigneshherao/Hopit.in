import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as service from '@/services/remoteMonitoringService.js';

export const remoteMonitoringKeys = {
  all: ['remote-monitoring'],
  dashboard: (id) => [...remoteMonitoringKeys.all, 'dashboard', id],
  boundary: (id) => [...remoteMonitoringKeys.all, 'boundary', id],
  scenes: (id) => [...remoteMonitoringKeys.all, 'scenes', id],
  scene: (id) => [...remoteMonitoringKeys.all, 'scene', id],
  zones: (id) => [...remoteMonitoringKeys.all, 'zones', id],
  observations: (id) => [...remoteMonitoringKeys.all, 'observations', id],
  comparisons: (id) => [...remoteMonitoringKeys.all, 'comparisons', id],
  reports: (id) => [...remoteMonitoringKeys.all, 'reports', id],
  surveys: (id) => [...remoteMonitoringKeys.all, 'surveys', id],
};

export function useMonitoringDashboard(farmPlanId) {
  return useQuery({ queryKey: remoteMonitoringKeys.dashboard(farmPlanId), queryFn: () => service.getMonitoringDashboard(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}
export function useFarmBoundary(farmPlanId) {
  return useQuery({ queryKey: remoteMonitoringKeys.boundary(farmPlanId), queryFn: () => service.getFarmBoundary(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}
export function useCreateFarmBoundary() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ farmPlanId, payload }) => service.createFarmBoundary(farmPlanId, payload), onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: remoteMonitoringKeys.boundary(variables.farmPlanId) }) });
}
export function useSatelliteScenes(farmPlanId) {
  return useQuery({ queryKey: [...remoteMonitoringKeys.scenes(farmPlanId), 'satellite'], queryFn: () => service.getSatelliteScenes(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}
export function useRequestSatelliteScene() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ farmPlanId, payload }) => service.requestSatelliteScene(farmPlanId, payload), onSuccess: () => qc.invalidateQueries({ queryKey: remoteMonitoringKeys.all }) });
}
export function useRemoteMonitoringScenes(farmPlanId) {
  return useQuery({ queryKey: remoteMonitoringKeys.scenes(farmPlanId), queryFn: () => service.getScenes(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}
export function useRemoteMonitoringScene(sceneId) {
  return useQuery({ queryKey: remoteMonitoringKeys.scene(sceneId), queryFn: () => service.getScene(sceneId), enabled: Boolean(sceneId), retry: 1 });
}
export function useMonitoringZones(farmPlanId) {
  return useQuery({ queryKey: remoteMonitoringKeys.zones(farmPlanId), queryFn: () => service.getZones(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}
export function useCreateZoneTask() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ zoneId, payload }) => service.createZoneTask(zoneId, payload), onSuccess: () => qc.invalidateQueries({ queryKey: remoteMonitoringKeys.all }) });
}
export function useReviewMonitoringZone() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: service.reviewZone, onSuccess: () => qc.invalidateQueries({ queryKey: remoteMonitoringKeys.all }) });
}
export function useResolveMonitoringZone() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: service.resolveZone, onSuccess: () => qc.invalidateQueries({ queryKey: remoteMonitoringKeys.all }) });
}
export function useDismissMonitoringZone() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: service.dismissZone, onSuccess: () => qc.invalidateQueries({ queryKey: remoteMonitoringKeys.all }) });
}
export function useFieldObservations(farmPlanId) {
  return useQuery({ queryKey: remoteMonitoringKeys.observations(farmPlanId), queryFn: () => service.getObservations(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}
export function useCreateFieldObservation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ farmPlanId, payload }) => service.createObservation(farmPlanId, payload), onSuccess: () => qc.invalidateQueries({ queryKey: remoteMonitoringKeys.all }) });
}
export function useImageryComparisons(farmPlanId) {
  return useQuery({ queryKey: remoteMonitoringKeys.comparisons(farmPlanId), queryFn: () => service.getComparisons(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}
export function useCreateImageryComparison() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ farmPlanId, payload }) => service.createComparison(farmPlanId, payload), onSuccess: () => qc.invalidateQueries({ queryKey: remoteMonitoringKeys.all }) });
}
export function useMonitoringReports(farmPlanId) {
  return useQuery({ queryKey: remoteMonitoringKeys.reports(farmPlanId), queryFn: () => service.getReports(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}
export function useGenerateMonitoringReport() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ farmPlanId, payload }) => service.generateReport(farmPlanId, payload), onSuccess: () => qc.invalidateQueries({ queryKey: remoteMonitoringKeys.all }) });
}
export function useDroneSurveys(farmPlanId) {
  return useQuery({ queryKey: remoteMonitoringKeys.surveys(farmPlanId), queryFn: () => service.getDroneSurveys(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}
export function useCreateDroneSurvey() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ farmPlanId, payload }) => service.createDroneSurvey(farmPlanId, payload), onSuccess: () => qc.invalidateQueries({ queryKey: remoteMonitoringKeys.all }) });
}
