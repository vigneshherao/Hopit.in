import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';

export function LandDetailPage() {
  const { id } = useParams();

  return (
    <section className="page-shell">
      <Card>
        <CardHeader>
          <Badge className="w-fit" variant="outline">
            Land ID: {id}
          </Badge>
          <CardTitle>Land detail</CardTitle>
          <CardDescription>
            This route is ready for listing media, lease terms, soil data, location, and owner contact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            Connect this surface to the land service when domain logic is added.
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
