import { Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';

export function AiPage() {
  return (
    <section className="page-shell">
      <Card className="mx-auto max-w-4xl overflow-hidden">
        <CardHeader>
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
            <Bot className="h-7 w-7" />
          </div>
          <CardTitle className="text-3xl">AI farming recommendations</CardTitle>
          <CardDescription>
            Prepared for crop recommendations, soil insights, weather risk, and farming advisory workflows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>
            <Sparkles className="h-4 w-4" />
            Recommendation module ready
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
