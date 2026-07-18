# Remote Monitoring

Hopt It includes a geospatial crop-health monitoring module for farm plans. It stores farm boundaries, simulated satellite scenes, drone survey metadata, vegetation analyses, detected field zones, observations, imagery comparisons, and monitoring reports.

## Purpose

The module helps landowners and farm managers review crop health between physical visits. It is designed for demo-ready satellite and drone workflows while keeping the provider layer replaceable for real imagery services later.

## Environment Variables

```env
SATELLITE_PROVIDER=demo
SATELLITE_API_KEY=
SATELLITE_API_SECRET=
SATELLITE_API_BASE_URL=
SATELLITE_REQUEST_TIMEOUT_MS=30000
SATELLITE_CACHE_TTL_MINUTES=360
REMOTE_MONITORING_DEMO_MODE=true
REMOTE_MONITORING_MAX_IMAGE_SIZE_MB=15
REMOTE_MONITORING_MAX_ORTHOMOSAIC_SIZE_MB=250
REMOTE_MONITORING_MAX_IMAGES_PER_SURVEY=50
REMOTE_MONITORING_PROCESSING_ENABLED=true
REMOTE_MONITORING_TEMP_DIRECTORY=
MAP_TILE_BASE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
SIGNED_FILE_URL_EXPIRY_MINUTES=30
```

`SATELLITE_PROVIDER=demo` returns deterministic simulated scenes and does not call a third-party satellite API. When a real provider is added, the same service abstraction can be extended without changing controllers or frontend calls.

## Data Model

- `FarmBoundary`: active GeoJSON boundary for a farm plan, calculated acreage, centroid, source, and verification status.
- `BoundaryRevision`: history of previous boundary geometry and metadata.
- `RemoteSensingScene`: satellite or drone-derived scene metadata, bands, cloud coverage, preview URLs, and processing state.
- `DroneSurvey`: uploaded drone survey metadata for a farm plan.
- `DroneImage`: individual drone image metadata, checksum, GPS fields, and processing status.
- `VegetationAnalysis`: NDVI/RGB-health style analysis summary, index statistics, coverage split, confidence, and limitations.
- `MonitoringZone`: geospatial issue/opportunity zone with severity, confidence, recommended actions, status, and optional linked task.
- `FieldObservation`: human field note connected to a farm plan and optionally a monitoring zone.
- `ImageryComparison`: comparison between two scenes or analyses.
- `MonitoringReport`: generated report snapshot for weekly, harvest, risk, or custom review.

## API Routes

All routes require authentication. Owners can access their own farm plans; admins can access all.

- `GET /api/v1/remote-monitoring/plans/:farmPlanId/boundary`
- `POST /api/v1/remote-monitoring/plans/:farmPlanId/boundary`
- `PATCH /api/v1/remote-monitoring/boundaries/:boundaryId`
- `POST /api/v1/remote-monitoring/boundaries/:boundaryId/submit-verification`
- `GET /api/v1/remote-monitoring/boundaries/:boundaryId/history`
- `GET /api/v1/remote-monitoring/plans/:farmPlanId/satellite/scenes`
- `POST /api/v1/remote-monitoring/plans/:farmPlanId/satellite/request`
- `GET /api/v1/remote-monitoring/satellite/scenes/:sceneId`
- `POST /api/v1/remote-monitoring/satellite/scenes/:sceneId/process`
- `POST /api/v1/remote-monitoring/plans/:farmPlanId/drone-surveys`
- `GET /api/v1/remote-monitoring/plans/:farmPlanId/drone-surveys`
- `GET /api/v1/remote-monitoring/drone-surveys/:surveyId`
- `POST /api/v1/remote-monitoring/drone-surveys/:surveyId/images`
- `POST /api/v1/remote-monitoring/drone-surveys/:surveyId/process`
- `GET /api/v1/remote-monitoring/plans/:farmPlanId/scenes`
- `GET /api/v1/remote-monitoring/scenes/:sceneId`
- `POST /api/v1/remote-monitoring/scenes/:sceneId/vegetation-analysis`
- `GET /api/v1/remote-monitoring/plans/:farmPlanId/analyses`
- `GET /api/v1/remote-monitoring/plans/:farmPlanId/health-trend`
- `GET /api/v1/remote-monitoring/plans/:farmPlanId/zones`
- `POST /api/v1/remote-monitoring/zones/:zoneId/review`
- `POST /api/v1/remote-monitoring/zones/:zoneId/create-task`
- `POST /api/v1/remote-monitoring/zones/:zoneId/resolve`
- `POST /api/v1/remote-monitoring/zones/:zoneId/dismiss`
- `POST /api/v1/remote-monitoring/plans/:farmPlanId/observations`
- `GET /api/v1/remote-monitoring/plans/:farmPlanId/observations`
- `POST /api/v1/remote-monitoring/plans/:farmPlanId/comparisons`
- `GET /api/v1/remote-monitoring/plans/:farmPlanId/comparisons`
- `GET /api/v1/remote-monitoring/plans/:farmPlanId/dashboard`
- `POST /api/v1/remote-monitoring/plans/:farmPlanId/reports`
- `GET /api/v1/remote-monitoring/plans/:farmPlanId/reports`

## Example Satellite Request

```json
{
  "dateRange": {
    "startDate": "2026-06-01T00:00:00.000Z",
    "endDate": "2026-07-01T00:00:00.000Z"
  },
  "maximumCloudCoverage": 80,
  "analysisTypes": ["ndvi", "rgb-health"]
}
```

The demo response includes `isSimulated: true` and creates vegetation analyses plus detected monitoring zones for the selected farm plan.

## Frontend Routes

- `/farm-planner/:farmPlanId/monitoring`
- `/farm-planner/:farmPlanId/monitoring/map`
- `/farm-planner/:farmPlanId/monitoring/scenes`
- `/farm-planner/:farmPlanId/monitoring/scenes/:sceneId`
- `/farm-planner/:farmPlanId/monitoring/drone-surveys`
- `/farm-planner/:farmPlanId/monitoring/drone-surveys/new`
- `/farm-planner/:farmPlanId/monitoring/zones`
- `/farm-planner/:farmPlanId/monitoring/observations`
- `/farm-planner/:farmPlanId/monitoring/comparison`
- `/farm-planner/:farmPlanId/monitoring/reports`

## Security

- Farm-plan ownership is checked before every read or mutation.
- Admins can access all farm plans.
- Uploads use MIME and size limits.
- Demo satellite scenes are clearly marked as simulated.
- The backend does not expose provider secrets to React.
- RGB-only imagery is treated as estimated health, not true NDVI.
- Monitoring zones are advisory and are not confirmed disease diagnoses.

## Limitations

The current provider is demo-only. It does not control drones, stream live drone footage, process real orthomosaics, or create legally certified agronomy reports. Real provider adapters can be added behind `SatelliteProvider` when API credentials and imagery products are available.
