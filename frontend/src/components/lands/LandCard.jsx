import { Eye, Heart, MapPin, ShieldCheck, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { demoLandImage, purposeLabels, transactionLabels } from '@/constants/land.js';

export function LandCard({ land, view = 'grid' }) {
  const image = land.media?.images?.[0] ?? demoLandImage;
  const price = getDisplayPrice(land);

  return (
    <Card className={view === 'list' ? 'overflow-hidden md:grid md:grid-cols-[280px_1fr]' : 'overflow-hidden'}>
      <img
        src={image}
        alt={land.title}
        className={view === 'list' ? 'h-56 w-full object-cover md:h-full' : 'h-52 w-full object-cover'}
        loading="lazy"
      />
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{land.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {land.location?.district}, {land.location?.state}
            </p>
          </div>
          <button className="rounded-md border p-2 text-muted-foreground" aria-label="Save for later" type="button">
            <Heart className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {land.transactionTypes?.slice(0, 3).map((type) => (
            <Badge key={type} variant="secondary">
              {transactionLabels[type]}
            </Badge>
          ))}
          {land.purposes?.slice(0, 2).map((purpose) => (
            <Badge key={purpose} variant="outline">
              {purposeLabels[purpose]}
            </Badge>
          ))}
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Area:</span> {land.area?.value} {land.area?.unit}
          </p>
          <p>
            <span className="text-muted-foreground">Soil:</span> {land.landDetails?.soilType}
          </p>
          <p className="flex items-center gap-1">
            <Waves className="h-4 w-4 text-primary" />
            {land.landDetails?.waterAvailability}
          </p>
          <p className="flex items-center gap-1">
            <Eye className="h-4 w-4 text-primary" />
            {land.viewCount ?? 0} views
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="font-semibold">{price}</p>
          </div>
          {land.verification?.isLandVerified ? (
            <Badge>
              <ShieldCheck className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          ) : null}
        </div>

        <Button asChild className="w-full">
          <Link to={`/lands/${land.slug ?? land._id}`}>View details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function getDisplayPrice(land) {
  if (land.pricing?.salePrice) return `₹${land.pricing.salePrice.toLocaleString('en-IN')}`;
  if (land.pricing?.monthlyRent) return `₹${land.pricing.monthlyRent.toLocaleString('en-IN')}/month`;
  if (land.pricing?.annualLeaseAmount) return `₹${land.pricing.annualLeaseAmount.toLocaleString('en-IN')}/year`;
  if (land.transactionTypes?.includes('revenue-share')) return 'Revenue share';
  return 'Negotiable';
}
