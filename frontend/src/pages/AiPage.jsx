import { Link } from 'react-router-dom';
import { Bot, History, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';

export function AiPage() {
  return (
    <section className="page-shell space-y-6">
      <Card className="mx-auto max-w-5xl overflow-hidden border-emerald-100 bg-white shadow-xl shadow-emerald-900/5">
        <CardHeader>
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
            <Bot className="h-7 w-7" />
          </div>
          <CardTitle className="text-4xl">AI land analyzer</CardTitle>
          <CardDescription>
            Generate structured crop recommendations, business options, risk checks, and farm preparation plans from your Hopt It land data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/ai-analyzer">
              <Sparkles className="h-4 w-4" />
              Start analysis
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/ai-history">
              <History className="h-4 w-4" />
              View history
            </Link>
          </Button>
        </CardContent>
      </Card>
      <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
        {['Soil and water suitability', 'Crop profit ranking', 'Business recommendations'].map((item) => (
          <Card key={item}>
            <CardContent className="p-5">
            <Sparkles className="h-4 w-4" />
              <h3 className="mt-3 font-semibold">{item}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Strict JSON AI output validated by the backend before saving.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
