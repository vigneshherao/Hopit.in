import { env } from '@/config/env.js';
import type { PolygonGeometry } from '@/services/geospatial/geometry.service.js';

export interface SatelliteSceneMetadata {
  provider: string;
  providerSceneId: string;
  title: string;
  description: string;
  capturedAt: Date;
  cloudCoverage: number;
  spatialResolutionMeters: number;
  availableBands: string[];
  previewUrl: string;
  thumbnailUrl: string;
  processedLayerUrls: Record<string, string>;
  dataQualityScore: number;
  isSimulated: boolean;
}

export interface SatelliteProvider {
  readonly name: string;
  getAvailableScenes(input: { farmPlanId: string; boundary?: PolygonGeometry; startDate?: Date; endDate?: Date; maximumCloudCoverage?: number }): Promise<SatelliteSceneMetadata[]>;
}

class DemoSatelliteProvider implements SatelliteProvider {
  readonly name = 'demo';

  async getAvailableScenes(input: { farmPlanId: string; startDate?: Date; maximumCloudCoverage?: number }): Promise<SatelliteSceneMetadata[]> {
    const base = hashNumber(input.farmPlanId);
    return Array.from({ length: 3 }, (_, index) => {
      const capturedAt = new Date(input.startDate ?? Date.now());
      capturedAt.setDate(capturedAt.getDate() + index * 12);
      const cloudCoverage = Math.min(88, (base + index * 17) % 65);
      return {
        provider: this.name,
        providerSceneId: `demo-${input.farmPlanId}-${index + 1}`,
        title: `Simulated satellite scene ${index + 1}`,
        description: 'Simulated data for Hopt It demo monitoring. Not live satellite analysis.',
        capturedAt,
        cloudCoverage,
        spatialResolutionMeters: 10,
        availableBands: ['red', 'green', 'blue', 'nir'],
        previewUrl: `/uploads/demo/remote-monitoring/scene-${index + 1}.jpg`,
        thumbnailUrl: `/uploads/demo/remote-monitoring/scene-${index + 1}.jpg`,
        processedLayerUrls: {
          rgb: `/uploads/demo/remote-monitoring/rgb-${index + 1}.png`,
          ndvi: `/uploads/demo/remote-monitoring/ndvi-${index + 1}.png`,
          stress: `/uploads/demo/remote-monitoring/stress-${index + 1}.png`,
        },
        dataQualityScore: Math.max(35, 92 - cloudCoverage),
        isSimulated: true,
      };
    }).filter((scene) => scene.cloudCoverage <= (input.maximumCloudCoverage ?? 100));
  }
}

export function getSatelliteProvider(): SatelliteProvider {
  if (env.satelliteProvider !== 'demo' && !env.remoteMonitoringDemoMode) {
    throw new Error('Configured satellite provider is not implemented in this milestone.');
  }
  return new DemoSatelliteProvider();
}

function hashNumber(value: string) {
  return value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

