import { Bot, BriefcaseBusiness, CalendarCheck, FileText, LayoutDashboard, Map, Sprout, UserRound } from 'lucide-react';

export const navigationItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Lands', href: '/lands', icon: Map },
  { label: 'My Lands', href: '/my-lands', icon: Map },
  { label: 'Applications', href: '/my-applications', icon: FileText },
  { label: 'Workers', href: '/workers', icon: BriefcaseBusiness },
  { label: 'Farm Jobs', href: '/farm-jobs', icon: Sprout },
  { label: 'Bookings', href: '/worker-bookings', icon: CalendarCheck },
  { label: 'AI', href: '/ai-analyzer', icon: Bot },
  { label: 'Profile', href: '/profile', icon: UserRound },
];
