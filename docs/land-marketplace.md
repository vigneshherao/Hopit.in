# Land Marketplace

The land marketplace lets owners list land for sale, lease, rent, joint venture, or revenue share. Public users can browse available listings, while owners and admins manage verification and lifecycle state.

## Listing Lifecycle

`draft -> pending-verification -> available`

Additional operational states:

- `reserved`
- `occupied`
- `sold`
- `inactive`
- `rejected`

Owners can pause, resume verified listings, mark reserved, and mark occupied. Admins approve or reject listings.

## API Routes

- `POST /api/v1/lands`
- `GET /api/v1/lands`
- `GET /api/v1/lands/:identifier`
- `GET /api/v1/lands/my/listings`
- `GET /api/v1/lands/my/statistics`
- `PATCH /api/v1/lands/:id`
- `DELETE /api/v1/lands/:id`
- `POST /api/v1/lands/:id/submit-verification`
- `PATCH /api/v1/lands/:id/verification`
- `PATCH /api/v1/lands/:id/status`
- `POST /api/v1/lands/upload/images`
- `POST /api/v1/lands/upload/documents`
- `DELETE /api/v1/lands/upload`

## Query Filters

Public browse supports `page`, `limit`, `search`, `state`, `district`, `city`, `purpose`, `transactionType`, `soilType`, `terrain`, `waterAvailability`, `minimumArea`, `maximumArea`, `areaUnit`, `minimumPrice`, `maximumPrice`, `priceType`, `roadAccess`, `electricityAvailable`, `irrigationAvailable`, `ownerParticipationAllowed`, `sort`, `latitude`, `longitude`, and `radiusKm`.

Example:

```bash
curl "http://localhost:5000/api/v1/lands?state=Karnataka&transactionType=lease"
```

## Permissions

- Public users: browse and view available listings.
- Farmers and workers: browse and view available listings.
- Owners: create, edit, submit, pause, resume, reserve, occupy, and deactivate their own listings.
- Admins: view all listings, edit verification fields, approve, reject, and manage statuses.

## Uploads

Cloudinary is used when configured. Otherwise local development stores files under `backend/uploads/lands` and serves them at `/uploads/lands/...`.

Allowed image types: `jpg`, `jpeg`, `png`, `webp`.

Allowed document types: images and `pdf`.

## Map Configuration

Frontend maps use Leaflet with OpenStreetMap tiles. Stored GeoJSON coordinates use `[longitude, latitude]`. Display values use latitude then longitude.

## Seed Data

Run:

```bash
npm run seed --workspace backend
```

The seed creates demo users and eight realistic land listings across Karnataka, Kerala, and Tamil Nadu.

## Frontend Routes

- `/lands`
- `/lands/:identifier`
- `/lands/new`
- `/lands/:id/edit`
- `/my-lands`
- `/my-lands/:id`

## Example Create Request

```json
{
  "title": "Mandya irrigated vegetable land",
  "description": "A well connected irrigated farm parcel suitable for vegetables and seasonal crops.",
  "purposes": ["agriculture"],
  "transactionTypes": ["lease"],
  "location": {
    "address": "Canal road",
    "city": "Mandya",
    "district": "Mandya",
    "state": "Karnataka",
    "country": "India"
  },
  "area": { "value": 5, "unit": "acre" },
  "landDetails": {
    "soilType": "alluvial",
    "terrain": "flat",
    "irrigationAvailable": true,
    "waterSources": ["canal"],
    "waterAvailability": "adequate",
    "electricityAvailable": true,
    "roadAccess": true,
    "fencingAvailable": true,
    "storageAvailable": false,
    "farmHouseAvailable": false
  },
  "pricing": {
    "annualLeaseAmount": 300000,
    "priceNegotiable": true
  },
  "agreementTerms": {
    "ownerParticipationAllowed": true
  },
  "media": {
    "images": ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"]
  },
  "documents": [
    {
      "type": "ownership-proof",
      "name": "Ownership document",
      "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  ],
  "status": "pending-verification"
}
```
