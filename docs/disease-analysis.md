# Hopt It AI Crop Disease Detection

This module lets authenticated users upload crop images and receive an AI-powered crop health report. The result is advisory: the assistant must never claim certainty and should always explain confidence and uncertainty.

## Architecture

Backend route base:

```text
/api/v1/disease
```

Core pieces:

- `DiseaseAnalysis` stores the structured AI report.
- `DiseaseImage` stores image URLs, dimensions, size, MIME type and SHA256 hash.
- `DiseaseRecommendation` stores organic, chemical, water, nutrition, monitoring, harvest and general actions.
- `DiseaseTimeline` stores farm-plan health score history.
- `imageHash.service.ts` validates image type, extension, size, signatures and dimensions.
- `analysisCache.service.ts` reuses previous results for the same image hash, crop and weather summary.
- `disease.prompts.ts` builds strict JSON prompts for provider-backed image analysis.

## Upload Flow

1. User uploads one to five images from `/farm-planner/:id/disease`.
2. Backend validates JPEG, PNG or WEBP only.
3. Backend rejects HEIC, GIF, TIFF, SVG, empty files and corrupted image headers.
4. Backend reads dimensions and generates a SHA256 hash.
5. If the same crop, weather summary and image hashes already exist, the cached analysis is reused.
6. Otherwise images are stored locally under `/uploads/disease` or in Cloudinary when configured.
7. AI provider receives the image data and summarized crop context.
8. JSON output is validated with Zod.
9. Analysis, images, recommendations and timeline records are saved.
10. A notification is created for healthy, diseased or critical results.

## API Routes

- `POST /analyze`
- `POST /analyze-multiple`
- `GET /history`
- `GET /history/:id`
- `DELETE /history/:id`
- `GET /statistics`
- `GET /latest`
- `GET /farm/:farmPlanId`

All routes require authentication. Owners can only access their own farm-plan analyses. Admins can access all records.

## AI Response Contract

The AI must return strict JSON:

```json
{
  "summary": "",
  "confidenceScore": 0,
  "cropHealthScore": 0,
  "severity": "Healthy",
  "disease": "",
  "symptoms": [],
  "causes": [],
  "organicTreatment": [],
  "chemicalTreatment": [],
  "prevention": [],
  "monitoringAdvice": [],
  "estimatedRecoveryDays": 0,
  "estimatedTreatmentCost": 0,
  "weatherRisk": "",
  "recommendations": []
}
```

Malformed AI output is rejected and not saved.

## Frontend

Route:

```text
/farm-planner/:id/disease
```

The page includes:

- drag-and-drop upload
- camera/gallery upload
- image previews
- progress state
- disease result report
- circular crop health score
- severity badge
- treatment accordions
- recommendations
- history list
- health and severity charts
- disease statistics

## Security

- JWT authentication is required.
- AI keys never leave the backend.
- Raw prompts are never exposed to React.
- Uploads are MIME, extension, size and signature checked.
- Duplicate images in one upload are rejected.
- AI requests are rate limited by `AI_DAILY_REQUEST_LIMIT`.

## Environment

Uses existing variables:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
AI_REQUEST_TIMEOUT_MS=30000
AI_DAILY_REQUEST_LIMIT=25
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Cloudinary is optional. Local development storage works through `/uploads/disease`.

## Limitations

This module only analyzes uploaded crop images. It does not implement drone monitoring, satellite imagery, live camera streaming, IoT sensors or weather prediction.

