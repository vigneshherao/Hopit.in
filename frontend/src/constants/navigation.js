import { Bot, BriefcaseBusiness, FileText, LayoutDashboard, Map, UserRound } from 'lucide-react';

export const navigationItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Lands', href: '/lands', icon: Map },
  { label: 'My Lands', href: '/my-lands', icon: Map },
  { label: 'Applications', href: '/my-applications', icon: FileText },
  { label: 'Workers', href: '/workers', icon: BriefcaseBusiness },
  { label: 'AI', href: '/ai', icon: Bot },
  { label: 'Profile', href: '/profile', icon: UserRound },
];
