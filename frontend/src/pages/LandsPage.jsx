import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';

export function LandsPage() {
  return (
    <section className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold">Lands</h1>
          <p className="mt-2 text-muted-foreground">Foundation for farmland discovery and leasing.</p>
        </div>
        <Button variant="outline">Create listing</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Land marketplace module</CardTitle>
          <CardDescription>
            Listing search, filters, maps, lease terms, and owner workflows can extend from this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/lands/foundation">
              View route shell
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
