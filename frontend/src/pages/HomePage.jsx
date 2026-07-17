import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  BrainCircuit,
  ChevronRight,
  CloudSun,
  ShieldCheck,
  Sparkles,
  Sprout,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
  analyzerExamplePrompts,
  brandName,
  cropOrbitItems,
  fadeUp,
  featureCards,
  landingImages,
  platformStats,
  testimonials,
  trustIndicators,
  workflowSteps,
} from '@/utils/homePageData.js';

export function HomePage() {
  const carouselCards = [...featureCards, ...featureCards];

  return (
    <main className="overflow-hidden bg-white text-slate-950">
      <HeroSection />
      <FeatureCarousel cards={carouselCards} />
      <CropOrbit crops={cropOrbitItems} />
      <AnalyzerSection />
      <HowItWorks />
      <StatsSection />
      <TestimonialsSection />
      <FinalCta />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative bg-[radial-gradient(circle_at_72%_22%,rgba(34,197,94,0.18),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8fff9_100%)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
      <div className="absolute left-8 top-28 hidden h-24 w-24 rounded-full bg-emerald-200/40 blur-3xl lg:block" />
      <div className="absolute bottom-20 right-12 hidden h-40 w-40 rounded-full bg-lime-200/50 blur-3xl lg:block" />

      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-20 lg:pt-20 xl:gap-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.65 }}
          className="flex flex-col justify-center"
        >
          <Badge className="mb-7 w-fit rounded-full border-emerald-200 bg-white/80 px-4 py-2 text-sm text-emerald-700 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            AI Powered Agriculture Platform
          </Badge>

          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.06] text-slate-950 sm:text-5xl lg:text-6xl xl:text-7xl">
            Connecting Land, People & AI to Build the Future of Farming
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Discover verified land for sale, lease, rent or partnership. Hire experienced farm
            workers. Get AI recommendations. Manage agreements digitally. Grow profitably.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full bg-emerald-500 px-7 text-base shadow-lg shadow-emerald-500/25 hover:bg-emerald-600">
              <Link to="/lands">
                Explore Land
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-slate-200 bg-white/80 px-7 text-base shadow-sm backdrop-blur hover:bg-emerald-50">
              <Link to="/lands/new">List Your Land</Link>
            </Button>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            {trustIndicators.map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                <BadgeCheck className="h-4 w-4 text-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, x: 24 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.12 }}
          className="relative mx-auto w-full max-w-[760px] self-center"
        >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative overflow-hidden rounded-[28px] border border-emerald-100/70 bg-white p-2 shadow-[0_30px_90px_rgba(15,23,42,0.14)] sm:rounded-[32px]"
          >
            <img
              src={landingImages.hero}
              alt="Farmers using AI technology in a connected agriculture field"
              className="aspect-[1672/941] h-auto w-full rounded-[22px] object-contain"
              loading="eager"
            />
          </motion.div>

          <FloatingCard className="-left-2 top-8 xl:-left-8" icon={BrainCircuit} label="AI Recommendation" value="High yield plan" />
          <FloatingCard className="-right-1 top-20 xl:-right-6" icon={ShieldCheck} label="Verified Land" value="Ready to apply" />
          <FloatingCard className="bottom-24 left-2 xl:-left-5" icon={CloudSun} label="Crop Health" value="92% stable" />
          <FloatingCard className="bottom-8 right-3 xl:-right-4" icon={BarChart3} label="Growth" value="+24% ROI" />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingCard({ className, icon: Icon, label, value }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute hidden rounded-3xl border border-white/70 bg-white/82 p-3 shadow-xl shadow-emerald-900/10 backdrop-blur-xl md:block lg:p-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureCarousel({ cards }) {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="absolute inset-x-0 top-16 h-72 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.16),transparent_58%)]" />
      <div className="absolute -left-24 top-32 h-64 w-64 rounded-full bg-lime-200/30 blur-3xl" />
      <div className="absolute -right-20 bottom-16 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[36px] border border-emerald-100 bg-white/82 p-5 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
          <div>
            <Badge className="border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Platform
            </Badge>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Everything agriculture deals need, in motion
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              From verified land discovery to AI insights, agreements, profit tracking, and field operations.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:w-[390px]">
            {[
              ['8K+', 'lands'],
              ['25K+', 'users'],
              ['95%', 'success'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4 text-center">
                <p className="text-2xl font-semibold text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase text-emerald-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-12 overflow-hidden py-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent sm:w-36" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent sm:w-36" />
        <div className="landing-carousel flex w-max gap-5 px-4 hover:[animation-play-state:paused] sm:gap-6">
          {cards.map((card, index) => (
            <motion.article
              key={`${card.title}-${index}`}
              whileHover={{ y: -10, scale: 1.018 }}
              className="group grid w-[min(430px,calc(100vw-2rem))] overflow-hidden rounded-[32px] border border-white/90 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.1)] ring-1 ring-emerald-100/70 backdrop-blur"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[radial-gradient(circle_at_78%_16%,rgba(34,197,94,0.16),transparent_34%),linear-gradient(135deg,#f0fdf4,#ffffff)] p-3">
                <div className="absolute left-5 top-5 z-[1] rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">
                  {index % 2 === 0 ? 'Live module' : 'Workflow ready'}
                </div>
                {card.image ? (
                  <div className="h-full rounded-[26px] border border-white/80 bg-white/70 p-2 shadow-inner">
                    <img
                      src={card.image}
                      alt=""
                      className="h-full w-full rounded-[20px] object-contain object-center transition duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[26px] border border-white/80 bg-gradient-to-br from-emerald-100 to-lime-50">
                    <div className="relative flex h-36 w-36 items-center justify-center rounded-[36px] bg-white/82 text-emerald-600 shadow-[0_18px_55px_rgba(15,23,42,0.1)]">
                      <card.icon className="h-16 w-16 transition duration-500 group-hover:scale-110" />
                      <span className="absolute -right-5 -top-5 h-14 w-14 rounded-full bg-lime-200/80 blur-xl" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex min-h-48 flex-col justify-between bg-gradient-to-b from-white to-emerald-50/40 p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300 shadow-lg shadow-slate-950/10">
                    <card.icon className="h-6 w-6" />
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-500 shadow-sm transition-transform group-hover:translate-x-1">
                    <ChevronRight className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-5">
                  <h3 className="text-2xl font-semibold text-slate-950">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
                </div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-400 to-lime-400 transition-all duration-500 group-hover:w-full" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CropOrbit({ crops }) {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/60 blur-3xl" />
      <SectionIntro
        eyebrow="Cultivate This"
        title="Choose your crop. Start your journey."
        subtitle="Real crop choices orbit around your next farming plan."
      />

      <div className="relative mx-auto mt-14 flex h-[500px] max-w-5xl items-center justify-center px-4 sm:h-[620px]">
        <div className="absolute h-[320px] w-[320px] rounded-full border border-dashed border-emerald-200 sm:h-[460px] sm:w-[460px]" />
        <div className="absolute h-[220px] w-[220px] rounded-full border border-emerald-100 sm:h-[320px] sm:w-[320px]" />

        <div className="relative z-10 flex h-44 w-44 flex-col items-center justify-center rounded-full border border-white/80 bg-white/90 p-5 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:h-56 sm:w-56">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Sprout className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-xl font-semibold text-slate-950 sm:text-2xl">High Yield Crops</h3>
          <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">Pick a crop and let AI plan the economics.</p>
        </div>

        <div className="crop-orbit absolute h-[320px] w-[320px] sm:h-[460px] sm:w-[460px]">
          {crops.map((crop, index) => {
            const angle = (360 / crops.length) * index;
            return (
              <div
                key={crop.name}
                className="crop-orbit-slot"
                style={{ transform: `rotate(${angle}deg) translateY(var(--crop-orbit-radius))` }}
              >
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  className="crop-orbit-card"
                  style={{ '--crop-card-angle': `-${angle}deg` }}
                >
                  <span className="crop-orbit-icon" aria-hidden="true">
                    {crop.icon}
                  </span>
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-emerald-100 to-lime-100 sm:h-20 sm:w-20">
                    <img src={crop.image} alt={crop.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <span className="mt-2 max-w-20 truncate text-xs font-semibold text-slate-800">{crop.name}</span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AnalyzerSection() {
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  function analyzeLand() {
    setIsAnalyzing(true);
    window.setTimeout(() => {
      const text = prompt.toLowerCase();
      const limitedWater = text.includes('limited') || text.includes('less water') || text.includes('dry');
      const organic = text.includes('organic');
      const largeLand = text.includes('8') || text.includes('10') || text.includes('large');

      setAnalysis({
        crop: largeLand ? 'Banana + turmeric intercropping' : organic ? 'Organic tomato' : 'Tomato with drip irrigation',
        confidence: limitedWater ? '84%' : '91%',
        summary: limitedWater
          ? 'Your land looks suitable for moderate-water crops with drip irrigation and mulching. Avoid water-heavy crops unless storage improves.'
          : 'The land profile is strong for vegetable cultivation with good yield potential, short crop duration, and nearby market demand.',
        profit: largeLand ? '₹9.8L' : '₹5.6L',
        duration: largeLand ? '9-11 months' : '90-120 days',
        water: limitedWater ? 'Medium-low' : 'Medium',
        nextSteps: [
          'Confirm soil pH and organic carbon before sowing.',
          'Use drip irrigation to reduce water risk.',
          'Reserve 10-15% budget for pest and nutrient management.',
        ],
      });
      setIsAnalyzing(false);
    }, 700);
  }

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20">
      <div className="absolute left-[12%] top-20 h-52 w-52 rounded-full bg-emerald-200/35 blur-3xl" />
      <div className="absolute bottom-8 right-[8%] h-60 w-60 rounded-full bg-lime-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-emerald-100 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-5 lg:p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <Badge className="border-emerald-200 bg-white px-3 py-1.5 text-emerald-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                AI Land Analyzer
              </Badge>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                Ask about your land. Get a clear answer.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600">
              Type soil, water, area, season, and budget. The assistant suggests crops, profit, and next steps.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-stretch">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="rounded-[28px] border border-emerald-100 bg-emerald-50/45 p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase text-emerald-600">Ask the AI</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">Describe your land</h3>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                  <Bot className="h-6 w-6" />
                </span>
              </div>

              <div className="mt-4 rounded-[24px] border border-emerald-100 bg-white p-2 shadow-inner">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={4}
                  className="min-h-32 w-full resize-none rounded-[20px] border border-transparent bg-white px-3 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Example: I have 5 acres in Mandya with loamy soil, canal water, ₹3 lakh budget, and I want a high-profit crop for Kharif season."
                />
                <div className="flex flex-wrap gap-2 border-t border-emerald-50 pt-2">
                  {analyzerExamplePrompts.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPrompt(item)}
                      className="rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-left text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                onClick={analyzeLand}
                disabled={isAnalyzing}
                className="mt-4 h-11 w-full rounded-2xl bg-slate-950 text-sm shadow-xl shadow-slate-950/15 hover:bg-emerald-600"
              >
                {isAnalyzing ? 'Analyzing land...' : 'Analyze with AI'}
                <Sparkles className="h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: 0.08 }}
              className="relative overflow-hidden rounded-[28px] border border-slate-900 bg-slate-950 p-4 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-5"
            >
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-lime-300/10 blur-3xl" />

              <div className="relative grid gap-4 sm:grid-cols-[150px_1fr] sm:items-start">
                <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-[32px] border border-white/10 bg-white/10 p-2 shadow-2xl sm:mx-0">
                  <img src={landingImages.aiAssistant} alt="Animated AI assistant" className="h-full w-full rounded-[26px] object-cover" loading="lazy" />
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase text-emerald-300">AI answer</p>
                    <h3 className="mt-1 text-xl font-semibold">
                      {analysis ? analysis.crop : isAnalyzing ? 'Reading your land details...' : 'Your recommendation will appear here'}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {analysis
                        ? analysis.summary
                        : 'Type your land details on the left and click Analyze with AI. The assistant will suggest a crop, explain why, and show the next steps.'}
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-2 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs font-semibold uppercase text-emerald-300">Confidence</p>
                    <p className="mt-1 text-lg font-semibold">{analysis?.confidence ?? '--'}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs font-semibold uppercase text-emerald-300">Profit</p>
                    <p className="mt-1 text-lg font-semibold">{analysis?.profit ?? '--'}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs font-semibold uppercase text-emerald-300">Duration</p>
                    <p className="mt-1 text-lg font-semibold">{analysis?.duration ?? '--'}</p>
                  </div>
                </div>

                {analysis ? (
                  <div className="sm:col-span-2 rounded-2xl bg-white p-3 text-slate-900">
                    <p className="text-sm font-semibold text-slate-950">Suggested next steps</p>
                    <div className="mt-2 grid gap-1.5">
                      {analysis.nextSteps.map((step) => (
                        <div key={step} className="flex gap-2 text-sm leading-6 text-slate-600">
                          <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bg-white py-24">
      <SectionIntro
        eyebrow="How it works"
        title="A clean path from opportunity to operation"
        subtitle="Every step is built to make agriculture deals easier to discover, assess, and execute."
      />
      <div className="mx-auto mt-14 grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-6 lg:px-8">
        {workflowSteps.map(([label, Icon], index) => (
          <motion.div
            key={label}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: index * 0.06 }}
            className="relative rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,0.06)]"
          >
            <span className="text-sm font-semibold text-emerald-600">0{index + 1}</span>
            <Icon className="mt-6 h-7 w-7 text-emerald-500" />
            <h3 className="mt-4 text-lg font-semibold text-slate-950">{label}</h3>
            {index < workflowSteps.length - 1 && <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-emerald-200 lg:block" />}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="bg-slate-950 py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {platformStats.map(([value, label]) => (
          <motion.div
            key={label}
            whileHover={{ y: -6 }}
            className="rounded-[28px] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur"
          >
            <p className="text-5xl font-semibold text-white">{value}</p>
            <p className="mt-3 text-sm font-medium uppercase text-emerald-300">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="bg-white py-24">
      <SectionIntro
        eyebrow="Trusted by every role"
        title="Built for owners, farmers, investors, and workers"
        subtitle="A premium operating layer for real agricultural collaboration."
      />
      <div className="mx-auto mt-12 grid max-w-7xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {testimonials.map((testimonial) => (
          <motion.article
            key={testimonial.name}
            whileHover={{ y: -8 }}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.07)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                {testimonial.name.slice(0, 1)}
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">{testimonial.name}</h3>
                <p className="text-sm text-emerald-600">{testimonial.role}</p>
              </div>
            </div>
            <p className="mt-6 leading-7 text-slate-600">{testimonial.quote}</p>
            <div className="mt-5 flex text-emerald-500" aria-label="Five star rating">
              {'*****'}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative bg-white px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-slate-950 px-6 py-16 text-center text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)] sm:px-12">
        <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-emerald-400/25 blur-3xl" />
        <div className="absolute bottom-8 right-10 h-40 w-40 rounded-full bg-lime-300/20 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase text-emerald-300">{brandName}</p>
          <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">Ready to Build Your Future?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Find land, evaluate opportunity, negotiate proposals, and prepare your next agriculture
            agreement with a platform designed for serious growth.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full bg-emerald-500 px-7 text-base hover:bg-emerald-600">
              <Link to="/lands">Explore Land</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/20 bg-white/10 px-7 text-base text-white hover:bg-white/15">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionIntro({ eyebrow, title, subtitle }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-3xl px-4 text-center sm:px-6"
    >
      <p className="text-sm font-semibold uppercase text-emerald-600">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">{title}</h2>
      <p className="mt-4 text-lg leading-8 text-slate-600">{subtitle}</p>
    </motion.div>
  );
}
