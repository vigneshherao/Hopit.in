import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { NotificationDropdown } from '@/components/realtime/NotificationDropdown.jsx';
import { UnreadBadge } from '@/components/realtime/UnreadBadge.jsx';
import { useDeleteNotification, useReadAllNotifications, useReadNotification, useUnreadNotifications } from '@/hooks/useRealtime.js';
import { useNotificationsSocket } from '@/hooks/useSocket.js';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  useNotificationsSocket();
  const { data } = useUnreadNotifications();
  const readNotification = useReadNotification();
  const readAll = useReadAllNotifications();
  const deleteNotification = useDeleteNotification();
  const unreadCount = data?.unreadCount ?? data?.notifications?.length ?? 0;

  return (
    <div className="relative">
      <Button type="button" variant="outline" size="sm" className="relative h-10 w-10 rounded-2xl p-0" onClick={() => setIsOpen((value) => !value)} aria-label="Open notifications">
        <Bell className="h-4 w-4" />
        <UnreadBadge count={unreadCount} />
      </Button>
      {isOpen && (
        <NotificationDropdown
          notifications={data?.notifications ?? []}
          onRead={(id) => readNotification.mutate(id)}
          onDelete={(id) => deleteNotification.mutate(id)}
          onReadAll={() => readAll.mutate()}
        />
      )}
    </div>
  );
}
