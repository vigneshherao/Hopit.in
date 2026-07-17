import { z } from 'zod';
import { SELF_REGISTER_ROLES } from '@/constants/auth.constants.js';
import { indianPhoneRegex } from '@/utils/phone.js';
import { isStrongPassword, passwordMessage } from '@/utils/password-policy.js';

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters.').refine(isStrongPassword, {
  message: passwordMessage,
});

const locationSchema = z.object({
  address: z.string().trim().max(240).optional(),
  city: z.string().trim().max(120).optional(),
  district: z.string().trim().max(120).optional(),
  state: z.string().trim().max(120).optional(),
  country: z.string().trim().max(120).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80),
    email: z.string().trim().toLowerCase().email('Invalid email address.'),
    phone: z
      .string()
      .trim()
      .regex(indianPhoneRegex, 'Phone must be a valid Indian mobile number.')
      .optional()
      .or(z.literal('')),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(SELF_REGISTER_ROLES),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, 'Phone must be a valid Indian mobile number.')
    .optional()
    .or(z.literal('')),
  avatar: z.string().trim().url().optional().or(z.literal('')),
  location: locationSchema.optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
