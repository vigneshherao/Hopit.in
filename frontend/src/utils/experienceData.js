import {
  Activity,
  Bot,
  BriefcaseBusiness,
  CalendarCheck,
  FileText,
  Home,
  Map,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Sprout,
  Tractor,
  UserRound,
} from 'lucide-react';

export const commandGroups = [
  {
    label: 'Explore',
    items: [
      { label: 'Home', href: '/', icon: Home, keywords: 'landing start overview' },
      { label: 'Find land', href: '/lands', icon: Map, keywords: 'marketplace lease rent sale' },
      { label: 'Hire workers', href: '/workers', icon: BriefcaseBusiness, keywords: 'farm worker manager hiring' },
      { label: 'AI analyzer', href: '/ai-analyzer', icon: Bot, requiresAuth: true, keywords: 'crop recommendation land analysis' },
    ],
  },
  {
    label: 'Operate',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: Activity, requiresAuth: true, keywords: 'metrics overview' },
      { label: 'Farm planner', href: '/farm-planner', icon: Tractor, requiresAuth: true, roles: ['owner', 'admin'], keywords: 'plans timeline roi' },
      { label: 'Applications', href: '/my-applications', icon: FileText, requiresAuth: true, keywords: 'proposals deals' },
      { label: 'Messages', href: '/messages', icon: MessageCircle, requiresAuth: true, keywords: 'chat inbox' },
      { label: 'Bookings', href: '/worker-bookings', icon: CalendarCheck, requiresAuth: true, keywords: 'worker schedule' },
    ],
  },
  {
    label: 'Create',
    items: [
      { label: 'List new land', href: '/lands/new', icon: Plus, requiresAuth: true, roles: ['owner', 'admin'], keywords: 'create land' },
      { label: 'Create farm job', href: '/farm-jobs/new', icon: Plus, requiresAuth: true, roles: ['owner', 'admin'], keywords: 'post job worker' },
      { label: 'Worker profile', href: '/worker/profile', icon: UserRound, requiresAuth: true, roles: ['worker', 'admin'], keywords: 'profile availability' },
      { label: 'Admin moderation', href: '/admin/moderation', icon: ShieldCheck, requiresAuth: true, roles: ['admin'], keywords: 'review approve reject' },
    ],
  },
];

export const quickActions = [
  { label: 'Search', href: null, icon: Search, action: 'command' },
  { label: 'List land', href: '/lands/new', icon: Plus, requiresAuth: true, roles: ['owner', 'admin'] },
  { label: 'Analyze', href: '/ai-analyzer', icon: Bot, requiresAuth: true },
  { label: 'Planner', href: '/farm-planner', icon: Sprout, requiresAuth: true, roles: ['owner', 'admin'] },
];

export const routeLabels = {
  admin: 'Admin',
  activity: 'Activity',
  agreements: 'Agreements',
  'ai-analyzer': 'AI Analyzer',
  'ai-history': 'AI History',
  'ai-results': 'AI Results',
  dashboard: 'Dashboard',
  'farm-jobs': 'Farm Jobs',
  'farm-management': 'Farm Management',
  'farm-planner': 'Farm Planner',
  lands: 'Lands',
  messages: 'Messages',
  'my-applications': 'My Applications',
  'my-farm-jobs': 'My Farm Jobs',
  'my-job-applications': 'Job Applications',
  'my-lands': 'My Lands',
  notifications: 'Notifications',
  profile: 'Profile',
  workers: 'Workers',
};
