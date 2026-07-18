import {
  Bot,
  BrainCircuit,
  ClipboardCheck,
  FileSignature,
  LineChart,
  MapPin,
  Orbit,
  Sprout,
  Tractor,
  Truck,
  Users,
} from 'lucide-react';
import heroImage from '@/assets/1.png';
import landCardImage from '@/assets/2.png';
import aiCardImage from '@/assets/3.png';
import agreementCardImage from '@/assets/4.png';
import profitCardImage from '@/assets/5.png';
import aiGif from '@/assets/aigif.gif';
import droneImage from '@/assets/drone.png';
import equipmentImage from '@/assets/equipment.png';
import farmersImage from '@/assets/farmers.png';
import logisticsImage from '@/assets/logistics.png';
import profileOneImage from '@/assets/profile1.jpg';
import profileTwoImage from '@/assets/profile2.jpeg';
import profileThreeImage from '@/assets/profile3.jpeg';
import profileFourImage from '@/assets/profil4.jpeg';
import profileFiveImage from '@/assets/profile5.jpeg';

export const brandName = 'Hopt It';

export const landingImages = {
  hero: heroImage,
  aiAssistant: aiGif,
};

export const trustIndicators = ['15K+ Users', '8K+ Lands', 'AI Powered', '98% Satisfaction'];

export const featureCards = [
  {
    title: 'Land Marketplace',
    description: 'Discover verified land for lease, rent, sale, revenue share, or partnership.',
    image: landCardImage,
    icon: MapPin,
  },
  {
    title: 'Hire Farmers & Workers',
    description: 'Build reliable farm teams with role-aware profiles, bookings, and trust signals.',
    image: farmersImage,
    icon: Users,
  },
  {
    title: 'AI Assistant',
    description: 'Use soil, water, budget, and market signals to plan profitable farming decisions.',
    image: aiCardImage,
    icon: BrainCircuit,
  },
  {
    title: 'Digital Agreements',
    description: 'Prepare transparent agreement drafts after proposal acceptance and negotiation.',
    image: agreementCardImage,
    icon: FileSignature,
  },
  {
    title: 'Track Profit',
    description: 'Monitor yield, expenses, ROI, and progress from one premium command center.',
    image: profitCardImage,
    icon: LineChart,
  },
  {
    title: 'Equipment Rental',
    description: 'Coordinate tractors, irrigation tools, harvest equipment, and seasonal machinery.',
    image: equipmentImage,
    icon: Tractor,
  },
  {
    title: 'Drone Monitoring',
    description: 'Prepare every listing for aerial inspection, crop health, and risk intelligence.',
    image: droneImage,
    icon: Orbit,
  },
  {
    title: 'Logistics',
    description: 'Connect production with storage, markets, cold chains, and transport partners.',
    image: logisticsImage,
    icon: Truck,
  },
];

export const usefulnessCards = [
  {
    title: 'Verified Land',
    shortTitle: 'Find Land',
    description: 'Compare sale, lease, rent, and partnership land with soil, water, price, and location clarity.',
    image: landCardImage,
    icon: MapPin,
    metric: 'Land clarity',
  },
  {
    title: 'AI Decisions',
    shortTitle: 'Use AI',
    description: 'Analyze crop fit, investment, profit, ROI, risk, and next steps before spending money.',
    image: aiCardImage,
    icon: BrainCircuit,
    metric: 'Plan smarter',
  },
  {
    title: 'Trusted Workers',
    shortTitle: 'Hire Team',
    description: 'Hire workers, supervisors, specialists, and farm managers for daily or long-term operations.',
    image: farmersImage,
    icon: Users,
    metric: 'Execute better',
  },
  {
    title: 'Agreements',
    shortTitle: 'Close Deals',
    description: 'Move proposals into structured agreements with clearer responsibilities and deal terms.',
    image: agreementCardImage,
    icon: FileSignature,
    metric: 'Deal confidence',
  },
  {
    title: 'Farm Operations',
    shortTitle: 'Track Work',
    description: 'Manage plans, tasks, progress, expenses, yield, revenue, and profit from one workspace.',
    image: profitCardImage,
    icon: LineChart,
    metric: 'Business control',
  },
];

export const workflowSteps = [
  ['Find Land', MapPin],
  ['Analyze with AI', Bot],
  ['Apply', ClipboardCheck],
  ['Agreement', FileSignature],
  ['Hire Workers', Users],
  ['Start Farming', Sprout],
];

export const platformStats = [
  ['25K+', 'Users'],
  ['8K+', 'Verified Lands'],
  ['95%', 'Success Rate'],
  ['₹120Cr+', 'Transactions'],
];

export const testimonials = [
  {
    role: 'Owner',
    name: 'Meera R.',
    location: 'Mandya, Karnataka',
    image: profileOneImage,
    metric: '3 land deals reviewed',
    quote: 'Hopt It made our idle land visible to serious farmers with clear proposals.',
  },
  {
    role: 'Farmer',
    name: 'Arun P.',
    location: 'Coimbatore, Tamil Nadu',
    image: profileTwoImage,
    metric: 'AI crop plan created',
    quote: 'I found verified lease land, negotiated terms, and planned crops from one dashboard.',
  },
  {
    role: 'Investor',
    name: 'Nikhil S.',
    location: 'Bengaluru, Karnataka',
    image: profileThreeImage,
    metric: 'ROI checked before visit',
    quote: 'The platform turns agriculture opportunities into structured, reviewable deals.',
  },
  {
    role: 'Worker',
    name: 'Devika M.',
    location: 'Wayanad, Kerala',
    image: profileFourImage,
    metric: 'Booked seasonal work',
    quote: 'Farm work discovery feels more organized, transparent, and professional.',
  },
  {
    role: 'Farm Manager',
    name: 'Rohan K.',
    location: 'Salem, Tamil Nadu',
    image: profileFiveImage,
    metric: 'Remote farm updates',
    quote: 'Owners can follow farm operations, tasks, and hiring without feeling disconnected.',
  },
];

export const analyzerExamplePrompts = [
  '5 acres in Mandya, loamy soil, canal water, ₹3 lakh budget, Kharif season',
  '2 acres near Coimbatore, red soil, limited water, organic farming preferred',
  '8 acres in Kerala, good rainfall, want high-profit horticulture',
];

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
