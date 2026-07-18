import { UserRound } from 'lucide-react';
import { PresenceDot } from '@/components/realtime/PresenceDot.jsx';

export function OnlineAvatar({ user, status = 'offline' }) {
  return (
    <div className="relative inline-flex">
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-emerald-50 text-emerald-700">
        {user?.avatar ? <img src={user.avatar} alt={user.name ?? 'User'} className="h-full w-full object-cover" /> : <UserRound className="h-5 w-5" />}
      </span>
      <PresenceDot status={status} className="absolute bottom-0 right-0" />
    </div>
  );
}
