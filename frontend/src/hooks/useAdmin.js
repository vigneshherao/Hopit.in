import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminService from '@/services/adminService.js';

export const adminKeys = {
  all: ['admin'],
  me: () => [...adminKeys.all, 'me'],
  overview: () => [...adminKeys.all, 'overview'],
  users: (filters) => [...adminKeys.all, 'users', filters],
  user: (userId) => [...adminKeys.all, 'user', userId],
  verifications: (filters) => [...adminKeys.all, 'verifications', filters],
  verification: (verificationId) => [...adminKeys.all, 'verification', verificationId],
  admins: () => [...adminKeys.all, 'admins'],
  admin: (adminId) => [...adminKeys.all, 'admin', adminId],
  roles: () => [...adminKeys.all, 'roles'],
  permissions: () => [...adminKeys.all, 'permissions'],
  auditLogs: (filters) => [...adminKeys.all, 'audit-logs', filters],
  savedViews: (filters) => [...adminKeys.all, 'saved-views', filters],
};

export function useAdminMe() {
  return useQuery({ queryKey: adminKeys.me(), queryFn: adminService.getAdminMe, retry: 1 });
}

export function useAdminOverview() {
  return useQuery({ queryKey: adminKeys.overview(), queryFn: adminService.getAdminOverview, retry: 1, staleTime: 60_000 });
}

export function useAdminUsers(filters = {}) {
  return useQuery({ queryKey: adminKeys.users(filters), queryFn: () => adminService.getAdminUsers(filters), retry: 1 });
}

export function useAdminUser(userId) {
  return useQuery({ queryKey: adminKeys.user(userId), queryFn: () => adminService.getAdminUser(userId), enabled: Boolean(userId), retry: 1 });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }) => adminService.updateAdminUser(userId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.all }),
  });
}

export function useChangeAdminUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, action, payload }) => adminService.changeAdminUserStatus(userId, action, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.all }),
  });
}

export function useAdminVerifications(filters = {}) {
  return useQuery({ queryKey: adminKeys.verifications(filters), queryFn: () => adminService.getAdminVerifications(filters), retry: 1 });
}

export function useAdminVerification(verificationId) {
  return useQuery({ queryKey: adminKeys.verification(verificationId), queryFn: () => adminService.getAdminVerification(verificationId), enabled: Boolean(verificationId), retry: 1 });
}

export function useUpdateAdminVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ verificationId, action, payload }) => adminService.updateAdminVerification(verificationId, action, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.all }),
  });
}

export function useAdminAccounts() {
  return useQuery({ queryKey: adminKeys.admins(), queryFn: adminService.getAdminAccounts, retry: 1 });
}

export function useAdminRoles() {
  return useQuery({ queryKey: adminKeys.roles(), queryFn: adminService.getAdminRoles, retry: 1 });
}

export function useAdminPermissions() {
  return useQuery({ queryKey: adminKeys.permissions(), queryFn: adminService.getAdminPermissions, retry: 1, staleTime: 300_000 });
}

export function useAdminAuditLogs(filters = {}) {
  return useQuery({ queryKey: adminKeys.auditLogs(filters), queryFn: () => adminService.getAdminAuditLogs(filters), retry: 1 });
}

export function useAdminSavedViews(filters = {}) {
  return useQuery({ queryKey: adminKeys.savedViews(filters), queryFn: () => adminService.getAdminSavedViews(filters), retry: 1 });
}
