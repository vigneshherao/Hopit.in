import { Activity, Bell, Bot, BriefcaseBusiness, CalendarCheck, FileText, LayoutDashboard, Map, MessageCircle, Sprout, Tractor, UserRound } from 'lucide-react';

export const navigationItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Lands', href: '/lands', icon: Map },
  { label: 'My Lands', href: '/my-lands', icon: Map },
  { label: 'Applications', href: '/my-applications', icon: FileText },
  { label: 'Workers', href: '/workers', icon: BriefcaseBusiness },
  { label: 'Farm Jobs', href: '/farm-jobs', icon: Sprout },
  { label: 'Farm Planner', href: '/farm-planner', icon: Tractor },
  { label: 'Bookings', href: '/worker-bookings', icon: CalendarCheck },
  { label: 'AI', href: '/ai-analyzer', icon: Bot },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
  { label: 'Activity', href: '/activity', icon: Activity },
  { label: 'Alerts', href: '/notifications', icon: Bell },
  { label: 'Profile', href: '/profile', icon: UserRound },
];
