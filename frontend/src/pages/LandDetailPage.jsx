import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { LandCard, getDisplayPrice } from '@/components/lands/LandCard.jsx';
import { LandMap } from '@/components/lands/LandMap.jsx';
import { demoLandImage, purposeLabels, transactionLabels } from '@/utils/landData.js';
import { useAuth } from '@/context/AuthContext.jsx';
import { useLand } from '@/hooks/useLands.js';

export function LandDetailPage() {
  const { identifier, id } = useParams();
  const { user } = useAuth();
  const landQuery = useLand(identifier ?? id);

  if (landQuery.isLoading) return <section className="page-shell">Loading land details...</section>;
  if (landQuery.isError || !landQuery.data?.land) return <section className="page-shell">Land listing not found.</section>;

  const { land, related, hasApplied } = landQuery.data;
  const images = land.media?.images?.length ? land.media.images : [demoLandImage];
  const userRole = user?.role;
  const canHireWorkers = ['owner', 'farmer', 'admin'].includes(userRole);
  const isWorker = userRole === 'worker';
  const aiAnalyzerUrl = buildAiAnalyzerUrl(land, isWorker);

  return (
    <section className="page-shell space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <img src={images[0]} alt={land.title} className="h-[420px] w-full rounded-md object-cover" />
          <div className="grid gap-3 sm:grid-cols-4">
            {images.slice(1, 5).map((image) => (
              <img key={image} src={image} alt="" className="h-28 w-full rounded-md object-cover" />
            ))}
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              {land.verification?.isLandVerified ? <Badge>Verified</Badge> : <Badge variant="outline">Verification pending</Badge>}
              {land.transactionTypes.map((type) => <Badge key={type} variant="secondary">{transactionLabels[type]}</Badge>)}
            </div>
            <CardTitle className="text-2xl">{land.title}</CardTitle>
            <CardDescription>{land.location.address}, {land.location.district}, {land.location.state}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-semibold">{getDisplayPrice(land)}</p>
            <p>{land.area.value} {land.area.unit}</p>
            <div className="flex flex-wrap gap-2">
              {land.purposes.map((purpose) => <Badge key={purpose} variant="outline">{purposeLabels[purpose]}</Badge>)}
            </div>
            <Button asChild className="w-full">
              <Link to={`/lands/${land.slug ?? land._id}/apply`}>
                {isWorker ? 'Submit work interest' : 'Apply or submit proposal'}
              </Link>
            </Button>
            {hasApplied ? <p className="text-sm text-muted-foreground">You have already applied for this land.</p> : null}
            <Button asChild variant="outline" className="w-full">
              <Link to={aiAnalyzerUrl}>{isWorker ? 'Analyze work suitability' : 'Run AI analysis'}</Link>
            </Button>
            {canHireWorkers ? <Button asChild variant="outline" className="w-full"><Link to="/workers">Hire workers</Link></Button> : null}
            {isWorker ? (
              <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900">
                Workers can review land, submit work interest, and use AI to understand whether the land matches their skills. Hiring workers is only for landowners, land seekers, and admins.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <InfoCard title="Soil and water" items={[
          ['Soil', land.landDetails.soilType],
          ['Terrain', land.landDetails.terrain],
          ['Water', land.landDetails.waterAvailability],
          ['Sources', land.landDetails.waterSources.join(', ')],
          ['Current crop', land.landDetails.currentCrop || 'Not specified'],
        ]} />
        <InfoCard title="Infrastructure" items={[
          ['Road access', yesNo(land.landDetails.roadAccess)],
          ['Electricity', yesNo(land.landDetails.electricityAvailable)],
          ['Irrigation', yesNo(land.landDetails.irrigationAvailable)],
          ['Fencing', yesNo(land.landDetails.fencingAvailable)],
          ['Storage', yesNo(land.landDetails.storageAvailable)],
          ['Farmhouse', yesNo(land.landDetails.farmHouseAvailable)],
        ]} />
        <InfoCard title="Agreement" items={[
          ['Minimum duration', land.agreementTerms.minimumDurationMonths ? `${land.agreementTerms.minimumDurationMonths} months` : 'Flexible'],
          ['Maximum duration', land.agreementTerms.maximumDurationMonths ? `${land.agreementTerms.maximumDurationMonths} months` : 'Flexible'],
          ['Owner participation', yesNo(land.agreementTerms.ownerParticipationAllowed)],
          ['Preferred agreement', land.agreementTerms.preferredAgreementType || 'Mutual'],
        ]} />
      </div>

      <Card>
        <CardHeader><CardTitle>Description</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{land.description}</p>
          <p className="text-sm text-muted-foreground">
            Documents: {documentSummary(land.documents)}
          </p>
        </CardContent>
      </Card>

      {land.location.coordinates ? <LandMap lands={[land]} /> : null}

      {related?.length ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Related listings</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {related.map((item) => <LandCard key={item._id} land={item} />)}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function InfoCard({ title, items }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b py-2 last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function yesNo(value) {
  return value ? 'Yes' : 'No';
}

function documentSummary(documents = []) {
  if (!documents.length) return 'No public document summary available';
  return documents.map((document) => document.name).join(', ');
}

function buildAiAnalyzerUrl(land, isWorker) {
  const params = new URLSearchParams({
    mode: isWorker ? 'worker-fit' : 'land-analysis',
    soilType: land.landDetails?.soilType ?? '',
    landArea: String(land.area?.value ?? ''),
    areaUnit: land.area?.unit ?? '',
    state: land.location?.state ?? '',
    district: land.location?.district ?? '',
    waterAvailability: land.landDetails?.waterAvailability ?? '',
    marketDistanceKm: String(land.nearbyFacilities?.nearestMarketKm ?? ''),
    irrigationAvailable: land.landDetails?.irrigationAvailable ? 'true' : 'false',
    roadAccess: land.landDetails?.roadAccess ? 'true' : 'false',
    ownerParticipation: land.agreementTerms?.ownerParticipationAllowed ? 'true' : 'false',
    notes: isWorker
      ? `Analyze whether ${land.title} is suitable for my farm work skills, likely labour demand, work season, water constraints, and safety risks.`
      : `Analyze ${land.title} for crop fit, investment, ROI, risk, and next steps.`,
  });

  return `/ai-analyzer?${params.toString()}`;
}
