export type NodeEnvironment = 'development' | 'test' | 'production';

export interface AppEnvironment {
  nodeEnv: NodeEnvironment;
  port: number;
  clientOrigin: string;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
}
