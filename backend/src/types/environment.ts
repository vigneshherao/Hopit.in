export type NodeEnvironment = 'development' | 'test' | 'production';

export interface AppEnvironment {
  nodeEnv: NodeEnvironment;
  port: number;
  clientUrl: string;
  mongoUri: string;
  jwtAccessSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  cookieSecure: boolean;
  cookieSameSite: 'lax' | 'strict' | 'none';
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
  openaiApiKey?: string;
  openaiModel: string;
  aiRequestTimeoutMs: number;
  aiDailyRequestLimit: number;
  weatherProvider: string;
  openWeatherApiKey?: string;
  weatherCacheTtlMinutes: number;
  satelliteProvider: string;
  satelliteApiKey?: string;
  satelliteApiSecret?: string;
  satelliteApiBaseUrl?: string;
  satelliteRequestTimeoutMs: number;
  satelliteCacheTtlMinutes: number;
  remoteMonitoringDemoMode: boolean;
  remoteMonitoringMaxImageSizeMb: number;
  remoteMonitoringMaxOrthomosaicSizeMb: number;
  remoteMonitoringMaxImagesPerSurvey: number;
  remoteMonitoringProcessingEnabled: boolean;
  remoteMonitoringTempDirectory?: string;
  mapTileBaseUrl?: string;
  signedFileUrlExpiryMinutes: number;
}
