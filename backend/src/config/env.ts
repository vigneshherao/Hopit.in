import dotenv from 'dotenv';
import { z } from 'zod';
import type { AppEnvironment } from '@/types/environment.js';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  CLIENT_ORIGIN: z.string().url().optional(),
  ALLOWED_ORIGINS: z.string().optional(),
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required')
    .default('mongodb://127.0.0.1:27017/hopit'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(24, 'JWT_ACCESS_SECRET must be at least 24 characters')
    .default('development-hopit-access-secret-change-me'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(24, 'JWT_REFRESH_SECRET must be at least 24 characters')
    .default('development-hopit-refresh-secret-change-me'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_ISSUER: z.string().trim().min(1).default('hopit-api'),
  JWT_AUDIENCE: z.string().trim().min(1).default('hopit-web'),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().trim().min(1).default('gemini-3.5-flash'),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().max(120000).default(30000),
  AI_DAILY_REQUEST_LIMIT: z.coerce.number().int().positive().max(500).default(25),
  WEATHER_PROVIDER: z.string().trim().default('local'),
  OPENWEATHER_API_KEY: z.string().optional(),
  WEATHER_CACHE_TTL_MINUTES: z.coerce.number().int().positive().max(360).default(60),
  SATELLITE_PROVIDER: z.string().trim().default('demo'),
  SATELLITE_API_KEY: z.string().optional(),
  SATELLITE_API_SECRET: z.string().optional(),
  SATELLITE_API_BASE_URL: z.string().url().optional(),
  SATELLITE_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().max(120000).default(30000),
  SATELLITE_CACHE_TTL_MINUTES: z.coerce.number().int().positive().max(1440).default(360),
  REMOTE_MONITORING_DEMO_MODE: z.enum(['true', 'false']).default('true').transform((value) => value === 'true'),
  REMOTE_MONITORING_MAX_IMAGE_SIZE_MB: z.coerce.number().int().positive().max(100).default(15),
  REMOTE_MONITORING_MAX_ORTHOMOSAIC_SIZE_MB: z.coerce.number().int().positive().max(1000).default(250),
  REMOTE_MONITORING_MAX_IMAGES_PER_SURVEY: z.coerce.number().int().positive().max(200).default(50),
  REMOTE_MONITORING_PROCESSING_ENABLED: z.enum(['true', 'false']).default('true').transform((value) => value === 'true'),
  REMOTE_MONITORING_TEMP_DIRECTORY: z.string().optional(),
  MAP_TILE_BASE_URL: z.string().url().optional(),
  SIGNED_FILE_URL_EXPIRY_MINUTES: z.coerce.number().int().positive().max(1440).default(30),
  CHAT_ENABLED: z.enum(['true', 'false']).default('true').transform((value) => value === 'true'),
  CHAT_MAX_MESSAGE_LENGTH: z.coerce.number().int().positive().max(20000).default(5000),
  CHAT_MAX_GROUP_MEMBERS: z.coerce.number().int().positive().max(500).default(100),
  CHAT_MESSAGE_EDIT_WINDOW_MINUTES: z.coerce.number().int().positive().max(1440).default(15),
  CHAT_DELETE_FOR_EVERYONE_WINDOW_MINUTES: z.coerce.number().int().positive().max(1440).default(60),
  CHAT_MAX_IMAGE_SIZE_MB: z.coerce.number().int().positive().max(50).default(10),
  CHAT_MAX_DOCUMENT_SIZE_MB: z.coerce.number().int().positive().max(100).default(25),
  CHAT_MAX_VOICE_SIZE_MB: z.coerce.number().int().positive().max(50).default(15),
  CHAT_MAX_VOICE_DURATION_SECONDS: z.coerce.number().int().positive().max(1800).default(300),
  CHAT_MAX_ATTACHMENTS_PER_MESSAGE: z.coerce.number().int().positive().max(20).default(10),
  CHAT_ATTACHMENT_URL_EXPIRY_MINUTES: z.coerce.number().int().positive().max(1440).default(30),
  CHAT_TYPING_TIMEOUT_SECONDS: z.coerce.number().int().positive().max(30).default(5),
  CHAT_MESSAGE_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().max(300).default(60),
  CHAT_CONVERSATION_CREATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().max(200).default(20),
  CHAT_SEARCH_LIMIT_PER_MINUTE: z.coerce.number().int().positive().max(200).default(30),
  CHAT_ATTACHMENT_SCAN_ENABLED: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  ADMIN_MODULE_ENABLED: z.enum(['true', 'false']).default('true').transform((value) => value === 'true'),
  ADMIN_IMPERSONATION_ENABLED: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  ADMIN_IMPERSONATION_MAX_MINUTES: z.coerce.number().int().positive().max(120).default(15),
  ADMIN_RECENT_AUTH_WINDOW_MINUTES: z.coerce.number().int().positive().max(120).default(10),
  ADMIN_MAX_BULK_ACTION_SIZE: z.coerce.number().int().positive().max(500).default(100),
  ADMIN_AUDIT_RETENTION_DAYS: z.coerce.number().int().positive().default(2555),
  ADMIN_DASHBOARD_CACHE_SECONDS: z.coerce.number().int().positive().max(3600).default(60),
  ADMIN_USER_EXPORT_MAX_ROWS: z.coerce.number().int().positive().max(100000).default(10000),
  ADMIN_REQUIRE_2FA: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  ADMIN_IP_ALLOWLIST_ENABLED: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  ADMIN_LOGIN_ALERTS_ENABLED: z.enum(['true', 'false']).default('true').transform((value) => value === 'true'),
  VERIFICATION_SIGNED_URL_EXPIRY_MINUTES: z.coerce.number().int().positive().max(1440).default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Invalid environment configuration: ${details}`);
}

const developmentSecrets = [
  'development-hopit-access-secret-change-me',
  'development-hopit-refresh-secret-change-me',
];
if (
  parsed.data.NODE_ENV === 'production' &&
  (developmentSecrets.includes(parsed.data.JWT_ACCESS_SECRET) ||
    developmentSecrets.includes(parsed.data.JWT_REFRESH_SECRET) ||
    parsed.data.JWT_ACCESS_SECRET === parsed.data.JWT_REFRESH_SECRET)
) {
  throw new Error('Invalid environment configuration: production JWT secrets must be unique and explicitly configured.');
}

const clientUrl = parsed.data.CLIENT_ORIGIN ?? parsed.data.CLIENT_URL;
const allowedOrigins = [...new Set([
  clientUrl,
  ...(parsed.data.ALLOWED_ORIGINS ?? '').split(',').map((origin) => origin.trim()).filter(Boolean),
])];

export const env: AppEnvironment = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  clientUrl,
  allowedOrigins,
  mongoUri: parsed.data.MONGODB_URI,
  jwtAccessSecret: parsed.data.JWT_ACCESS_SECRET,
  jwtAccessExpiresIn: parsed.data.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshSecret: parsed.data.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: parsed.data.JWT_REFRESH_EXPIRES_IN,
  jwtIssuer: parsed.data.JWT_ISSUER,
  jwtAudience: parsed.data.JWT_AUDIENCE,
  cookieSecure: parsed.data.COOKIE_SECURE,
  cookieSameSite: parsed.data.COOKIE_SAME_SITE,
  cloudinaryCloudName: parsed.data.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: parsed.data.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: parsed.data.CLOUDINARY_API_SECRET,
  geminiApiKey: parsed.data.GEMINI_API_KEY,
  geminiModel: parsed.data.GEMINI_MODEL,
  aiRequestTimeoutMs: parsed.data.AI_REQUEST_TIMEOUT_MS,
  aiDailyRequestLimit: parsed.data.AI_DAILY_REQUEST_LIMIT,
  weatherProvider: parsed.data.WEATHER_PROVIDER,
  openWeatherApiKey: parsed.data.OPENWEATHER_API_KEY,
  weatherCacheTtlMinutes: parsed.data.WEATHER_CACHE_TTL_MINUTES,
  satelliteProvider: parsed.data.SATELLITE_PROVIDER,
  satelliteApiKey: parsed.data.SATELLITE_API_KEY,
  satelliteApiSecret: parsed.data.SATELLITE_API_SECRET,
  satelliteApiBaseUrl: parsed.data.SATELLITE_API_BASE_URL,
  satelliteRequestTimeoutMs: parsed.data.SATELLITE_REQUEST_TIMEOUT_MS,
  satelliteCacheTtlMinutes: parsed.data.SATELLITE_CACHE_TTL_MINUTES,
  remoteMonitoringDemoMode: parsed.data.REMOTE_MONITORING_DEMO_MODE,
  remoteMonitoringMaxImageSizeMb: parsed.data.REMOTE_MONITORING_MAX_IMAGE_SIZE_MB,
  remoteMonitoringMaxOrthomosaicSizeMb: parsed.data.REMOTE_MONITORING_MAX_ORTHOMOSAIC_SIZE_MB,
  remoteMonitoringMaxImagesPerSurvey: parsed.data.REMOTE_MONITORING_MAX_IMAGES_PER_SURVEY,
  remoteMonitoringProcessingEnabled: parsed.data.REMOTE_MONITORING_PROCESSING_ENABLED,
  remoteMonitoringTempDirectory: parsed.data.REMOTE_MONITORING_TEMP_DIRECTORY,
  mapTileBaseUrl: parsed.data.MAP_TILE_BASE_URL,
  signedFileUrlExpiryMinutes: parsed.data.SIGNED_FILE_URL_EXPIRY_MINUTES,
  chatEnabled: parsed.data.CHAT_ENABLED,
  chatMaxMessageLength: parsed.data.CHAT_MAX_MESSAGE_LENGTH,
  chatMaxGroupMembers: parsed.data.CHAT_MAX_GROUP_MEMBERS,
  chatMessageEditWindowMinutes: parsed.data.CHAT_MESSAGE_EDIT_WINDOW_MINUTES,
  chatDeleteForEveryoneWindowMinutes: parsed.data.CHAT_DELETE_FOR_EVERYONE_WINDOW_MINUTES,
  chatMaxImageSizeMb: parsed.data.CHAT_MAX_IMAGE_SIZE_MB,
  chatMaxDocumentSizeMb: parsed.data.CHAT_MAX_DOCUMENT_SIZE_MB,
  chatMaxVoiceSizeMb: parsed.data.CHAT_MAX_VOICE_SIZE_MB,
  chatMaxVoiceDurationSeconds: parsed.data.CHAT_MAX_VOICE_DURATION_SECONDS,
  chatMaxAttachmentsPerMessage: parsed.data.CHAT_MAX_ATTACHMENTS_PER_MESSAGE,
  chatAttachmentUrlExpiryMinutes: parsed.data.CHAT_ATTACHMENT_URL_EXPIRY_MINUTES,
  chatTypingTimeoutSeconds: parsed.data.CHAT_TYPING_TIMEOUT_SECONDS,
  chatMessageRateLimitPerMinute: parsed.data.CHAT_MESSAGE_RATE_LIMIT_PER_MINUTE,
  chatConversationCreateLimitPerHour: parsed.data.CHAT_CONVERSATION_CREATE_LIMIT_PER_HOUR,
  chatSearchLimitPerMinute: parsed.data.CHAT_SEARCH_LIMIT_PER_MINUTE,
  chatAttachmentScanEnabled: parsed.data.CHAT_ATTACHMENT_SCAN_ENABLED,
  adminModuleEnabled: parsed.data.ADMIN_MODULE_ENABLED,
  adminImpersonationEnabled: parsed.data.ADMIN_IMPERSONATION_ENABLED,
  adminImpersonationMaxMinutes: parsed.data.ADMIN_IMPERSONATION_MAX_MINUTES,
  adminRecentAuthWindowMinutes: parsed.data.ADMIN_RECENT_AUTH_WINDOW_MINUTES,
  adminMaxBulkActionSize: parsed.data.ADMIN_MAX_BULK_ACTION_SIZE,
  adminAuditRetentionDays: parsed.data.ADMIN_AUDIT_RETENTION_DAYS,
  adminDashboardCacheSeconds: parsed.data.ADMIN_DASHBOARD_CACHE_SECONDS,
  adminUserExportMaxRows: parsed.data.ADMIN_USER_EXPORT_MAX_ROWS,
  adminRequire2fa: parsed.data.ADMIN_REQUIRE_2FA,
  adminIpAllowlistEnabled: parsed.data.ADMIN_IP_ALLOWLIST_ENABLED,
  adminLoginAlertsEnabled: parsed.data.ADMIN_LOGIN_ALERTS_ENABLED,
  verificationSignedUrlExpiryMinutes: parsed.data.VERIFICATION_SIGNED_URL_EXPIRY_MINUTES,
};
