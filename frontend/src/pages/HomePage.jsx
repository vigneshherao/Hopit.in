import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Handshake, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';

const pillars = [
  {
    title: 'Lease farmland',
    description: 'Give land owners a clear path to publish and manage farmland availability.',
    icon: Sprout,
  },
  {
    title: 'Find work',
    description: 'Help farm workers discover agricultural opportunities in one trusted place.',
    icon: Handshake,
  },
  {
    title: 'Use AI guidance',
    description: 'Prepare the platform for crop planning, soil recommendations, and risk signals.',
    icon: BrainCircuit,
  },
];

export function HomePage() {
  return (
    <section className="page-shell">
      <div className="grid gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-6"
        >
          <div className="inline-flex rounded-sm border bg-card px-3 py-1 text-sm text-muted-foreground">
            Agriculture network foundation
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal sm:text-5xl">
              Hopit connects land, labor, and farming intelligence.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              A hackathon-ready foundation for land owners, farmers, farm workers, and future
              AI-powered agriculture recommendations.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/dashboard">
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/lands">Explore lands</Link>
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-4">
          {pillars.map((pillar) => (
            <Card key={pillar.title}>
              <CardHeader className="flex-row items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary">
                  <pillar.icon className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle>{pillar.title}</CardTitle>
                  <CardDescription className="mt-2">{pillar.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
