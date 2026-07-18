import { ADMIN_PERMISSION_CATALOG, ADMIN_ROLE_DEFAULT_PERMISSIONS } from '@/constants/admin.constants.js';
import { AdminPermissionOverrideModel } from '@/models/admin-permission-override.model.js';
import { AdminProfileModel, type AdminProfileDocument } from '@/models/admin-profile.model.js';
import { AdminRoleModel } from '@/models/admin-role.model.js';
import { UserModel } from '@/models/user.model.js';
import { AppError } from '@/utils/app-error.js';

export interface EffectiveAdmin {
  profile: AdminProfileDocument;
  roles: { id: string; name: string; slug: string; permissions: string[]; isSystemRole: boolean }[];
  permissions: string[];
  deniedPermissions: string[];
  isSuperAdmin: boolean;
}

export function isKnownAdminPermission(permission: string) {
  return ADMIN_PERMISSION_CATALOG.includes(permission as never);
}

export async function ensureSystemAdminRoles(createdBy?: string) {
  await Promise.all(
    Object.entries(ADMIN_ROLE_DEFAULT_PERMISSIONS).map(([slug, permissions]) =>
      AdminRoleModel.findOneAndUpdate(
        { slug },
        {
          name: slug.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' '),
          slug,
          permissions,
          isSystemRole: true,
          isActive: true,
          createdBy,
          updatedBy: createdBy,
        },
        { upsert: true, new: true },
      ),
    ),
  );
}

export async function resolveAdminPermissions(userId: string): Promise<EffectiveAdmin> {
  const user = await UserModel.findById(userId).select('role isActive').lean();
  if (!user || !user.isActive || user.role !== 'admin') throw new AppError('Admin access is required.', 403);
  const profile = await AdminProfileModel.findOne({ userId, status: 'active' });
  if (!profile) throw new AppError('Active admin profile is required.', 403);
  const roles = await AdminRoleModel.find({ _id: { $in: profile.roleIds }, isActive: true }).lean();
  const override = await AdminPermissionOverrideModel.findOne({ adminProfileId: profile._id }).lean();
  const rolePermissions = new Set(roles.flatMap((role) => role.permissions));
  const allowed = new Set([...rolePermissions, ...(override?.allow ?? [])]);
  const denied = new Set(override?.deny ?? []);
  denied.forEach((permission) => allowed.delete(permission));
  const isSuperAdmin = roles.some((role) => role.slug === 'super-admin') && profile.status === 'active';
  return {
    profile,
    roles: roles.map((role) => ({ id: role._id.toString(), name: role.name, slug: role.slug, permissions: role.permissions, isSystemRole: role.isSystemRole })),
    permissions: isSuperAdmin ? ADMIN_PERMISSION_CATALOG.filter((permission) => !denied.has(permission)) : [...allowed],
    deniedPermissions: [...denied],
    isSuperAdmin,
  };
}

export function hasAdminPermission(effective: EffectiveAdmin, permission: string) {
  if (!isKnownAdminPermission(permission)) return false;
  if (effective.deniedPermissions.includes(permission)) return false;
  return effective.isSuperAdmin || effective.permissions.includes(permission);
}
