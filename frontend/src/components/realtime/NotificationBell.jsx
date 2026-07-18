import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { NotificationDropdown } from '@/components/realtime/NotificationDropdown.jsx';
import { UnreadBadge } from '@/components/realtime/UnreadBadge.jsx';
import { useDeleteNotification, useReadAllNotifications, useReadNotification, useUnreadNotifications } from '@/hooks/useRealtime.js';
import { useNotificationsSocket } from '@/hooks/useSocket.js';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  useNotificationsSocket();
  const { data } = useUnreadNotifications();
  const readNotification = useReadNotification();
  const readAll = useReadAllNotifications();
  const deleteNotification = useDeleteNotification();
  const unreadCount = data?.unreadCount ?? data?.notifications?.length ?? 0;

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="relative h-10 w-10 rounded-2xl p-0"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? 'Close notifications' : 'Open notifications'}
        aria-expanded={isOpen}
      >
        <Bell className="h-4 w-4" />
        <UnreadBadge count={unreadCount} />
      </Button>
      {isOpen && (
        <NotificationDropdown
          notifications={data?.notifications ?? []}
          onRead={(id) => readNotification.mutate(id)}
          onDelete={(id) => deleteNotification.mutate(id)}
          onReadAll={() => readAll.mutate()}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
