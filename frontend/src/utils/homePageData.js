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
import appleImage from '@/assets/apple.jpg';
import bananaImage from '@/assets/banana.jpg';
import broccoliImage from '@/assets/brocoli.jpg';
import carrotImage from '@/assets/carrot.webp';
import pineappleImage from '@/assets/pineapple.jpg';
import droneImage from '@/assets/drone.png';
import equipmentImage from '@/assets/equipment.png';
import farmersImage from '@/assets/farmers.png';
import logisticsImage from '@/assets/logistics.png';

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

export const cropOrbitItems = [
  { name: 'Apple', icon: '🍎', image: appleImage },
  { name: 'Carrot', icon: '🥕', image: carrotImage },
  { name: 'Broccoli', icon: '🥦', image: broccoliImage },
  { name: 'Banana', icon: '🍌', image: bananaImage },
  { name: 'Pineapple', icon: '🍍', image: pineappleImage },
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
    quote: 'Hopt It made our idle land visible to serious farmers with clear proposals.',
  },
  {
    role: 'Farmer',
    name: 'Arun P.',
    quote: 'I found verified lease land, negotiated terms, and planned crops from one dashboard.',
  },
  {
    role: 'Investor',
    name: 'Nikhil S.',
    quote: 'The platform turns agriculture opportunities into structured, reviewable deals.',
  },
  {
    role: 'Worker',
    name: 'Devika M.',
    quote: 'Farm work discovery feels more organized, transparent, and professional.',
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
