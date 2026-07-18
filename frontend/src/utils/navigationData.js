import { Activity, Bell, Bot, BriefcaseBusiness, CalendarCheck, FileText, LayoutDashboard, Map, MessageCircle, ShieldCheck, Sprout, Tractor, UserRound } from 'lucide-react';

export const navigationItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, requiresAuth: true },
  { label: 'Lands', href: '/lands', icon: Map },
  { label: 'My Lands', href: '/my-lands', icon: Map, requiresAuth: true, roles: ['owner', 'admin'] },
  { label: 'Applications', href: '/my-applications', icon: FileText, requiresAuth: true },
  { label: 'Workers', href: '/workers', icon: BriefcaseBusiness },
  { label: 'Farm Jobs', href: '/farm-jobs', icon: Sprout },
  { label: 'Farm Planner', href: '/farm-planner', icon: Tractor, requiresAuth: true, roles: ['owner', 'admin'] },
  { label: 'Bookings', href: '/worker-bookings', icon: CalendarCheck, requiresAuth: true },
  { label: 'AI', href: '/ai-analyzer', icon: Bot },
  { label: 'Messages', href: '/messages', icon: MessageCircle, requiresAuth: true },
  { label: 'Activity', href: '/activity', icon: Activity, requiresAuth: true },
  { label: 'Admin', href: '/admin', icon: ShieldCheck, requiresAuth: true, roles: ['admin'] },
  { label: 'Alerts', href: '/notifications', icon: Bell, requiresAuth: true },
  { label: 'Profile', href: '/profile', icon: UserRound, requiresAuth: true },
];
