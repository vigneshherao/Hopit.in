import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  BrainCircuit,
  CloudSun,
  ImagePlus,
  Facebook,
  Handshake,
  IndianRupee,
  Instagram,
  MapPinned,
  MessageCircle,
  Mic,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  TrendingUp,
  UsersRound,
  Youtube,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import webLogo from '@/assets/weblogo.png';
import {
  analyzerExamplePrompts,
  brandName,
  fadeUp,
  featureCards,
  landingImages,
  platformStats,
  testimonials,
  trustIndicators,
  usefulnessCards,
  workflowSteps,
} from '@/utils/homePageData.js';

export function HomePage() {
  const carouselCards = [...featureCards, ...featureCards];
  const { isAuthenticated } = useAuth();

  return (
    <main className="overflow-hidden bg-white text-slate-950">
      <HeroSection />
      <FeatureCarousel cards={carouselCards} />
      <FeatureOrbit cards={usefulnessCards} />
      <AnalyzerSection />
      <HowItWorks />
      <StatsSection />
      <TestimonialsSection />
      <FinalCta />
      <FooterSection isAuthenticated={isAuthenticated} />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative bg-[radial-gradient(circle_at_72%_22%,rgba(34,197,94,0.18),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8fff9_100%)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
      <div className="absolute left-8 top-28 hidden h-24 w-24 rounded-full bg-emerald-200/40 blur-3xl lg:block" />
      <div className="absolute bottom-20 right-12 hidden h-40 w-40 rounded-full bg-lime-200/50 blur-3xl lg:block" />

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-20 lg:pt-20 xl:gap-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.65 }}
          className="flex flex-col justify-center"
        >
          <Badge className="mb-5 w-fit rounded-full border-emerald-200 bg-white/80 px-4 py-2 text-xs text-emerald-700 shadow-sm backdrop-blur sm:mb-7 sm:text-sm">
            <Sparkles className="h-4 w-4" />
            AI Powered Agriculture Platform
          </Badge>

          <h1 className="max-w-4xl text-3xl font-semibold leading-[1.08] text-slate-950 min-[380px]:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
            Connecting Land, People & AI to Build the Future of Farming
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:mt-7 sm:text-xl sm:leading-8">
            Discover verified land for sale, lease, rent or partnership. Hire experienced farm
            workers. Get AI recommendations. Manage agreements digitally. Grow profitably.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
            <Button asChild size="lg" className="h-12 w-full rounded-full bg-emerald-500 px-7 text-base shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 sm:w-auto">
              <Link to="/lands">
                Explore Land
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-full border-slate-200 bg-white/80 px-7 text-base shadow-sm backdrop-blur hover:bg-emerald-50 sm:w-auto">
              <Link to="/lands/new">List Your Land</Link>
            </Button>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-2 gap-2 sm:mt-10 sm:grid-cols-4 sm:gap-3">
            {trustIndicators.map((item) => (
              <div key={item} className="flex min-w-0 items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm sm:text-sm">
                <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="truncate">{item}</span>
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
              alt="Land seekers using AI technology in a connected agriculture field"
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
      className={`absolute hidden rounded-3xl border border-emerald-100 bg-white/95 p-3 shadow-xl shadow-emerald-900/10 backdrop-blur-xl md:block lg:p-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">{label}</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureCarousel({ cards }) {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-x-0 top-16 h-72 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.16),transparent_58%)]" />
      <div className="absolute -left-24 top-32 h-64 w-64 rounded-full bg-lime-200/30 blur-3xl" />
      <div className="absolute -right-20 bottom-16 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[28px] border border-emerald-100 bg-white/82 p-4 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[36px] sm:p-5 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
          <div>
            <Badge className="border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Platform
            </Badge>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Everything agriculture deals need, in motion
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              From verified land discovery to AI insights, agreements, profit tracking, and field operations.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:w-[390px] sm:gap-3">
            {[
              ['8K+', 'lands'],
              ['25K+', 'users'],
              ['95%', 'success'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-center sm:rounded-3xl sm:p-4">
                <p className="text-xl font-semibold text-slate-950 sm:text-2xl">{value}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase text-emerald-600 sm:text-xs">{label}</p>
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
              className="group grid w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] ring-1 ring-white/80 backdrop-blur transition hover:border-emerald-100 sm:w-[430px] sm:rounded-[32px]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(135deg,#f8fafc,#ecfdf5)] p-3">
                <div className="absolute left-5 top-5 z-[1] rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm backdrop-blur">
                  {index % 2 === 0 ? 'Live module' : 'Workflow ready'}
                </div>
                {card.image ? (
                  <div className="h-full rounded-[26px] border border-white/90 bg-white/75 p-3 shadow-inner">
                    <img
                      src={card.image}
                      alt=""
                      className="h-full w-full rounded-[20px] object-contain object-center transition duration-500 group-hover:scale-[1.035]"
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
              <div className="flex min-h-44 flex-col justify-between bg-white p-5 sm:min-h-48 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                    <card.icon className="h-6 w-6" />
                  </span>
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="mt-5">
                  <h3 className="text-xl font-semibold text-slate-950 sm:text-2xl">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureOrbit({ cards }) {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/60 blur-3xl" />
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
      <SectionIntro
        eyebrow="Why Hopt It"
        title="One platform for land, AI, teams, and farm operations"
        subtitle="The circular workflow shows how Hopt It turns agriculture ideas into verified, planned, and trackable execution."
      />

      <div className="relative mx-auto mt-10 flex h-[390px] max-w-5xl items-center justify-center px-4 min-[380px]:h-[430px] sm:mt-14 sm:h-[620px]">
        <div className="absolute h-[250px] w-[250px] rounded-full border border-dashed border-emerald-200 min-[380px]:h-[286px] min-[380px]:w-[286px] sm:h-[460px] sm:w-[460px]" />
        <div className="absolute h-[168px] w-[168px] rounded-full border border-emerald-100 min-[380px]:h-[196px] min-[380px]:w-[196px] sm:h-[320px] sm:w-[320px]" />

        <div className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full border border-white/80 bg-white/90 p-4 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl min-[380px]:h-40 min-[380px]:w-40 sm:h-56 sm:w-56 sm:p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 sm:h-12 sm:w-12">
            <Sprout className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <h3 className="mt-3 text-base font-semibold text-slate-950 min-[380px]:text-lg sm:mt-4 sm:text-2xl">Useful From Day One</h3>
          <p className="mt-1.5 text-[11px] leading-4 text-slate-500 sm:mt-2 sm:text-sm sm:leading-5">Discover land, analyze risk, hire people, and manage execution.</p>
        </div>

        <div className="crop-orbit absolute h-[250px] w-[250px] min-[380px]:h-[286px] min-[380px]:w-[286px] sm:h-[460px] sm:w-[460px]">
          {cards.map((card, index) => {
            const angle = (360 / cards.length) * index;
            return (
              <div
                key={card.title}
                className="crop-orbit-slot"
                style={{ transform: `rotate(${angle}deg) translateY(var(--crop-orbit-radius))` }}
              >
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  className="crop-orbit-card"
                  style={{ '--crop-card-angle': `-${angle}deg` }}
                >
                  <span className="crop-orbit-icon text-emerald-600" aria-hidden="true">
                    <card.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-emerald-100 to-blue-50 p-1 sm:h-20 sm:w-20">
                    <img src={card.image} alt={card.title} className="h-full w-full rounded-full object-contain" loading="lazy" />
                  </div>
                  <span className="mt-2 max-w-24 truncate text-xs font-semibold text-slate-800">{card.shortTitle}</span>
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
  const promptRef = useRef(null);
  const resultRef = useRef(null);

  function analyzeLand(nextPrompt = prompt) {
    const promptToAnalyze = nextPrompt.trim() || analyzerExamplePrompts[0];
    if (!nextPrompt.trim()) {
      setPrompt(promptToAnalyze);
    }

    setIsAnalyzing(true);
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);

    window.setTimeout(() => {
      const text = promptToAnalyze.toLowerCase();
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

  function focusAnalyzer() {
    promptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => promptRef.current?.focus(), 350);
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_46%,#ffffff_100%)] py-16 sm:py-20 lg:py-24">
      <div className="absolute left-1/2 top-16 h-[420px] w-[min(980px,92vw)] -translate-x-1/2 rounded-b-full border-b border-blue-200/60 bg-white/55" />
      <div className="absolute left-1/2 top-56 h-40 w-[min(620px,80vw)] -translate-x-1/2 rounded-full bg-blue-300/25 blur-3xl" />
      <div className="absolute left-1/2 top-[430px] h-32 w-[min(540px,75vw)] -translate-x-1/2 rounded-full bg-slate-900/20 blur-2xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="border-white bg-white/90 px-4 py-2 text-slate-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            AI Land Analyzer
          </Badge>
          <h2 className="mt-6 text-4xl font-semibold leading-[1.08] text-slate-950 sm:text-6xl">
            Ask your land. Get farming clarity.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Type soil, water, area, season, and budget. Hopt It previews crop fit, risk, investment, profit, and next steps.
          </p>
          <Button
            type="button"
            onClick={focusAnalyzer}
            disabled={isAnalyzing}
            className="mt-8 h-12 rounded-2xl bg-blue-600 px-7 text-base text-white shadow-xl shadow-blue-600/20 hover:bg-emerald-600"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative mx-auto mt-24 max-w-5xl sm:mt-28">
          <div className="absolute left-1/2 top-[-78px] hidden h-36 w-[min(560px,70vw)] -translate-x-1/2 overflow-hidden rounded-t-full sm:block">
            <img src={landingImages.aiAssistant} alt="Animated AI assistant" className="h-full w-full object-cover object-top opacity-90" loading="lazy" />
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white/80 p-3 shadow-[0_30px_100px_rgba(37,99,235,0.16)] backdrop-blur-xl sm:rounded-[38px] sm:p-5"
          >
            <div className="rounded-[24px] border border-slate-100 bg-white p-3 shadow-inner sm:rounded-[30px] sm:p-4">
              <textarea
                ref={promptRef}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={5}
                className="min-h-40 w-full resize-none rounded-[20px] border border-transparent bg-white px-3 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:ring-4 focus:ring-blue-100 sm:px-4"
                placeholder="Ask anything... Example: I have 5 acres in Mandya with loamy soil, canal water, ₹3 lakh budget, and I want a high-profit crop for Kharif season."
              />
            </div>

            <div className="flex flex-col gap-3 px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  [Sparkles, 'AI'],
                  [Search, 'Search'],
                  [ImagePlus, 'Soil image'],
                ].map(([Icon, label]) => (
                  <button key={label} type="button" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-blue-50 hover:text-blue-700">
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-50 hover:text-slate-700" aria-label="Voice input">
                  <Mic className="h-4 w-4" />
                </button>
                <Button type="button" size="icon" onClick={() => analyzeLand()} disabled={isAnalyzing} className="h-10 w-10 rounded-full bg-slate-950 text-white hover:bg-blue-600" aria-label="Run AI analysis">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-2 border-t border-slate-100 px-2 py-3 sm:grid-cols-3">
              {analyzerExamplePrompts.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setPrompt(item);
                    analyzeLand(item);
                  }}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-left text-xs font-medium leading-5 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.08 }}
            className="mx-auto mt-5 grid max-w-4xl gap-3 sm:grid-cols-3"
          >
            {[
              ['Confidence', analysis?.confidence ?? '--'],
              ['Profit', analysis?.profit ?? '--'],
              ['Duration', analysis?.duration ?? '--'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-blue-100 bg-white/90 p-4 text-center shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">{label}</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </motion.div>

          <div ref={resultRef} className="mx-auto mt-5 max-w-4xl rounded-3xl border border-emerald-100 bg-white/92 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">AI answer</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950">
                  {analysis ? analysis.crop : isAnalyzing ? 'Reading your land details...' : 'Your recommendation will appear here'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {analysis
                    ? analysis.summary
                    : 'Describe the land and run the analyzer to preview crop suitability, economics, risk, and next steps.'}
                </p>
              </div>
            </div>

            {analysis ? (
              <div className="mt-4 grid gap-2">
                {analysis.nextSteps.map((step) => (
                  <div key={step} className="flex gap-2 text-sm leading-6 text-slate-600">
                    <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <SectionIntro
        eyebrow="How it works"
        title="A clean path from opportunity to operation"
        subtitle="Every step is built to make agriculture deals easier to discover, assess, and execute."
      />
      <div className="mx-auto mt-10 grid max-w-7xl gap-4 px-4 sm:mt-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:grid-cols-6 lg:px-8">
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
  const statItems = platformStats.map(([value, label]) => {
    const iconMap = {
      Users: UsersRound,
      'Verified Lands': MapPinned,
      'Success Rate': TrendingUp,
      Transactions: IndianRupee,
    };
    return {
      value,
      label,
      icon: iconMap[label] ?? BarChart3,
    };
  });

  const floatingBadges = [
    { label: 'Verified listings', icon: ShieldCheck, className: 'left-[12%] top-[18%] bg-emerald-50 text-emerald-800 border-emerald-200' },
    { label: 'AI recommendations', icon: BrainCircuit, className: 'left-[33%] top-[8%] bg-white text-slate-800 border-slate-200' },
    { label: 'Partnership deals', icon: Handshake, className: 'right-[31%] top-[8%] bg-white text-slate-800 border-slate-200' },
    { label: 'Farm growth', icon: TrendingUp, className: 'right-[12%] top-[18%] bg-emerald-50 text-emerald-800 border-emerald-200' },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="relative overflow-hidden bg-white px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="pointer-events-none absolute left-1/2 top-10 hidden h-[520px] w-[1120px] -translate-x-1/2 rounded-t-full border-t border-slate-200 lg:block" />
        <div className="pointer-events-none absolute left-1/2 top-28 hidden h-[430px] w-[860px] -translate-x-1/2 rounded-t-full border-t border-slate-200 lg:block" />
        <div className="pointer-events-none absolute left-1/2 top-44 hidden h-[330px] w-[620px] -translate-x-1/2 rounded-t-full border-t border-slate-100 lg:block" />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-50/35 to-transparent" />

        <div className="absolute inset-0 z-10 hidden lg:block">
          {floatingBadges.map((badge) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              className={`absolute flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-none ${badge.className}`}
            >
              <badge.icon className="h-4 w-4" />
              {badge.label}
            </motion.div>
          ))}
        </div>

        <div className="relative z-20 mx-auto max-w-5xl pt-16 lg:pt-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="group rounded-[28px] border border-slate-100 bg-white/88 p-5 text-center shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur transition hover:-translate-y-1 hover:border-emerald-200 sm:p-6 lg:border-transparent lg:bg-transparent lg:shadow-none"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm">
                  <item.icon className="h-5 w-5" />
                </span>
                <p className="mt-5 text-4xl font-semibold tracking-tight text-emerald-950 sm:text-5xl">{item.value}</p>
                <p className="mt-2 text-sm font-semibold text-slate-500">{item.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-4xl text-center sm:mt-16">
            <Badge className="border-emerald-100 bg-emerald-50 px-4 py-2 text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Platform traction
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Built for serious agriculture growth
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Hopt It brings land discovery, AI planning, worker hiring, and business execution into one trusted agriculture network.
            </p>
          </div>

          <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-3">
            {[
              ['Land owners', MapPinned],
              ['Land seekers', Sprout],
              ['Workers', UsersRound],
              ['AI planning', BrainCircuit],
            ].map(([label, Icon]) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
                <Icon className="h-4 w-4 text-emerald-600" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const portraitCloud = [
    ...testimonials,
    testimonials[1],
    testimonials[3],
    testimonials[0],
    testimonials[4],
    testimonials[2],
  ];

  return (
    <section className="relative overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1480px] rounded-[34px] border border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[44px] lg:rounded-[56px]">
        <div className="relative min-h-[720px] overflow-hidden rounded-[34px] px-5 py-10 sm:min-h-[760px] sm:rounded-[44px] sm:px-8 lg:min-h-[820px] lg:rounded-[56px] lg:px-12">
          <div className="absolute inset-0 opacity-[0.55] [background-image:linear-gradient(to_right,rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:132px_132px]" />
          <div className="absolute inset-x-10 top-0 hidden h-28 rounded-b-[32px] border border-t-0 border-slate-100 bg-white/55 sm:block" />
          <div className="absolute bottom-0 left-1/2 h-56 w-[min(780px,86vw)] -translate-x-1/2 rounded-t-full bg-emerald-50/55 blur-3xl" />

          <div className="relative mx-auto grid max-w-4xl grid-cols-3 gap-3 sm:grid-cols-5 lg:hidden">
            {portraitCloud.slice(0, 10).map((testimonial, index) => (
              <motion.div
                key={`${testimonial.name}-mobile-${index}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className={`${index > 5 ? 'hidden sm:block' : ''} overflow-hidden rounded-[24px] bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.12)]`}
              >
                <img src={testimonial.image} alt={testimonial.name} className="aspect-square w-full rounded-[20px] object-cover" loading="lazy" />
              </motion.div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            {portraitCloud.map((testimonial, index) => (
              <FloatingPortrait key={`${testimonial.name}-${index}`} testimonial={testimonial} index={index} />
            ))}
          </div>

          <div className="relative mx-auto flex min-h-[360px] max-w-4xl flex-col items-center justify-center pt-12 text-center sm:pt-16 lg:min-h-[650px] lg:pt-40">
            <Badge className="border-slate-100 bg-white px-4 py-2 text-slate-700 shadow-sm">
              <Quote className="h-3.5 w-3.5 text-emerald-600" />
              Testimonials
            </Badge>
            <h2 className="mt-8 max-w-4xl text-4xl font-semibold leading-[1.05] text-slate-950 sm:text-6xl lg:text-7xl">
              Trusted by every <span className="text-slate-400">agriculture role</span>
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
              Owners, land seekers, workers, managers, and investors use Hopt It to make land decisions clearer, faster, and easier to execute.
            </p>

            <div className="mt-8 flex items-center justify-center text-amber-400" aria-label="Five star rating">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <Star key={starIndex} className="h-5 w-5 fill-current" />
              ))}
            </div>

            <Button asChild size="lg" className="mt-10 h-12 rounded-full bg-slate-950 px-7 text-base text-white shadow-xl shadow-slate-950/15 hover:bg-emerald-600">
              <Link to="/register">
                Read Success Stories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingPortrait({ testimonial, index }) {
  const positions = [
    'left-[6%] top-[18%] h-36 w-36 opacity-70',
    'left-[16%] top-[10%] h-40 w-40',
    'left-[27%] top-[22%] h-36 w-36',
    'left-[38%] top-[11%] h-36 w-36',
    'left-[50%] top-[18%] h-32 w-32',
    'right-[35%] top-[9%] h-40 w-40',
    'right-[24%] top-[23%] h-36 w-36',
    'right-[13%] top-[10%] h-40 w-40',
    'right-[6%] top-[20%] h-36 w-36',
    'left-[16%] top-[42%] h-40 w-40',
    'right-[15%] top-[44%] h-40 w-40',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: index * 0.045 }}
      className={`absolute overflow-hidden rounded-[26px] bg-white p-1 shadow-[0_24px_70px_rgba(15,23,42,0.16)] ${positions[index % positions.length]}`}
    >
      <img src={testimonial.image} alt={testimonial.name} className="h-full w-full rounded-[22px] object-cover" loading="lazy" />
    </motion.div>
  );
}

function FinalCta() {
  return (
    <section className="relative bg-white px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-slate-950 px-5 py-12 text-center text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)] sm:rounded-[32px] sm:px-12 sm:py-16">
        <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-emerald-400/25 blur-3xl" />
        <div className="absolute bottom-8 right-10 h-40 w-40 rounded-full bg-lime-300/20 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase text-emerald-300">{brandName}</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">Ready to Build Your Future?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Find land, evaluate opportunity, negotiate proposals, and prepare your next agriculture
            agreement with a platform designed for serious growth.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 w-full rounded-full bg-emerald-500 px-7 text-base hover:bg-emerald-600 sm:w-auto">
              <Link to="/lands">Explore Land</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-full border-white/20 bg-white/10 px-7 text-base text-white hover:bg-white/15 sm:w-auto">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterSection({ isAuthenticated }) {
  const footerGroups = [
    {
      title: 'Marketplace',
      links: [
        ['Browse land', '/lands'],
        ['List land', '/lands/new'],
        ['Farm jobs', '/farm-jobs'],
        ['Hire workers', '/workers'],
      ],
    },
    {
      title: 'AI tools',
      links: [
        ['AI analyzer', '/ai-analyzer'],
        ['AI history', '/ai-history'],
        ['Farm planner', '/farm-planner'],
        ['Weather insights', '/farm-planner'],
      ],
    },
    {
      title: 'Workflows',
      links: [
        ['Applications', '/my-applications'],
        ['Agreements', '/dashboard'],
        ['Messages', '/messages'],
        ['Activity feed', '/activity'],
      ],
    },
  ];

  return (
    <footer className="border-t border-emerald-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.6fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3" aria-label="Hopt It home">
              <img src={webLogo} alt="Hopt It logo" className="h-16 w-16 rounded-2xl object-cover" loading="lazy" />
              <span className="sr-only">Hopt It</span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
              Hopt It connects verified land, farming talent, AI recommendations, and farm operations in one modern agriculture platform.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                ['Instagram', Instagram],
                ['Facebook', Facebook],
                ['YouTube', Youtube],
                ['Support', MessageCircle],
              ].map(([label, Icon]) => (
                <button
                  key={label}
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-950">{group.title}</h3>
                <div className="mt-4 grid gap-3">
                  {group.links.map(([label, href]) => (
                    <Link key={label} to={href} className="text-sm font-semibold text-slate-500 transition hover:text-emerald-700">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-emerald-50/55 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-600">© 2026 Hopt It. Built for the future of agriculture.</p>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="transition hover:text-emerald-700">Dashboard</Link>
                <Link to="/profile" className="transition hover:text-emerald-700">Profile</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="transition hover:text-emerald-700">Login</Link>
                <Link to="/register" className="transition hover:text-emerald-700">Register</Link>
              </>
            )}
            <Link to="/lands" className="transition hover:text-emerald-700">Explore</Link>
          </div>
        </div>
      </div>
    </footer>
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
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600 sm:text-sm">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{subtitle}</p>
    </motion.div>
  );
}
