import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConversationDetailsPanel } from '@/components/chat/ConversationDetailsPanel.jsx';
import { ConversationHeader } from '@/components/chat/ConversationHeader.jsx';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar.jsx';
import { EmptyConversationState } from '@/components/chat/EmptyConversationState.jsx';
import { ChatSkeleton } from '@/components/chat/ChatSkeleton.jsx';
import { AnnouncementBanner } from '@/components/chat/AnnouncementBanner.jsx';
import { MessageBubble } from '@/components/chat/MessageBubble.jsx';
import { MessageComposer } from '@/components/chat/MessageComposer.jsx';
import { ThreadSidebar } from '@/components/chat/ThreadSidebar.jsx';
import { NewConversationModal } from '@/components/chat/NewConversationModal.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useArchiveConversation, useAnnouncements, useChatUsers, useConversation, useConversationMembers, useConversations, useCreateDirectConversation, useCreateSharedNote, useDeleteMessage, useMessages, useMuteConversation, usePinConversation, usePinMessage, usePinnedMessages, useReactions, useSharedNotes, useStarMessage, useStarredMessages, useThreadReply, useThreads } from '@/hooks/useChat.js';
import { useConversationSocketEvents, useReadReceiptSocket } from '@/hooks/useChatSocket.js';
import { useAuth } from '@/context/AuthContext.jsx';

export function MessagesPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeId = params.conversationId;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('');
  const [activeThreadMessage, setActiveThreadMessage] = useState(null);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const conversationFilters = useMemo(() => ({ search, type: filter === 'all' ? undefined : filter }), [filter, search]);
  const { data: conversationsData, isLoading: loadingConversations } = useConversations(conversationFilters);
  const userDirectoryFilters = useMemo(() => ({ search: userSearch || undefined, role: userRole || undefined, limit: 16 }), [userRole, userSearch]);
  const chatUsers = useChatUsers(userDirectoryFilters, isNewConversationOpen);
  const { data: conversationData } = useConversation(activeId);
  const { data: messagesData, isLoading: loadingMessages } = useMessages(activeId);
  const { data: membersData } = useConversationMembers(activeId);
  const archiveConversation = useArchiveConversation();
  const muteConversation = useMuteConversation();
  const pinConversation = usePinConversation();
  const createDirect = useCreateDirectConversation();
  const { addReaction } = useReactions();
  const pinMessage = usePinMessage();
  const starMessage = useStarMessage();
  const deleteMessage = useDeleteMessage();
  const createNote = useCreateSharedNote();
  const threadReply = useThreadReply();
  const { data: pinsData } = usePinnedMessages({ conversationId: activeId });
  const { data: starsData } = useStarredMessages({ conversationId: activeId });
  const { data: notesData } = useSharedNotes({ conversationId: activeId });
  const { data: announcementsData } = useAnnouncements({ conversationId: activeId });
  const { data: threadData } = useThreads(activeThreadMessage?._id);
  const { typingUsers } = useConversationSocketEvents(activeId);
  const { markRead } = useReadReceiptSocket(activeId);

  const conversation = conversationData?.conversation;
  const messages = messagesData?.messages ?? [];

  function openNewConversationModal() {
    setIsNewConversationOpen(true);
  }

  function startDirectConversation(participantId) {
    createDirect.mutate(
      { participantId },
      {
        onSuccess: (data) => {
          setIsNewConversationOpen(false);
          navigate(`/messages/${data.conversation._id}`);
        },
      },
    );
  }

  return (
    <section className="mx-auto max-w-[1600px] px-0 py-0 sm:px-4 sm:py-6 lg:px-8">
      <div className="overflow-hidden border-emerald-100 bg-white shadow-2xl shadow-emerald-900/8 sm:rounded-[2rem] sm:border">
        <div className="grid min-h-[calc(100vh-7rem)] lg:grid-cols-[384px_1fr]">
          <ConversationSidebar
            conversations={conversationsData?.conversations ?? []}
            activeId={activeId}
            search={search}
            onSearch={setSearch}
            filter={filter}
            onFilter={setFilter}
            onSelect={(id) => navigate(`/messages/${id}`)}
            onNew={openNewConversationModal}
          />
          {activeId ? (
            <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[1fr_320px]">
              <div className="flex min-h-[calc(100vh-8rem)] min-w-0 flex-col bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_32%),#f8fffb]">
                <ConversationHeader
                  conversation={conversation}
                  typingUsers={typingUsers}
                  onArchive={() => archiveConversation.mutate(activeId)}
                  onMute={() => muteConversation.mutate({ id: activeId, duration: '1-day' })}
                  onPin={() => pinConversation.mutate(activeId)}
                />
                <AnnouncementBanner announcements={announcementsData?.announcements ?? []} />
                <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6" onMouseEnter={() => markRead(messages.at(-1)?._id)}>
                  {loadingMessages ? <ChatSkeleton /> : messages.map((message) => (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isOwn={message.senderId === user?.id}
                      onReact={(item, emoji) => addReaction.mutate({ messageId: item._id, emoji })}
                      onPin={(item) => pinMessage.mutate(item._id)}
                      onStar={(item) => starMessage.mutate(item._id)}
                      onThread={(item) => setActiveThreadMessage(item)}
                      onReply={(item) => setReplyToMessage(item)}
                      onDelete={(item) => deleteMessage.mutate({ id: item._id, scope: 'self' })}
                    />
                  ))}
                  {!loadingMessages && !messages.length && <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 text-center text-sm text-slate-500">No messages yet. Send the first update.</div>}
                </div>
                <MessageComposer conversationId={activeId} members={membersData?.members ?? []} replyToMessage={replyToMessage} onClearReply={() => setReplyToMessage(null)} />
              </div>
              <ConversationDetailsPanel
                conversation={conversation}
                members={membersData?.members ?? []}
                pins={pinsData?.pins ?? []}
                stars={starsData?.stars ?? []}
                notes={notesData?.notes ?? []}
                announcements={announcementsData?.announcements ?? []}
                onCreateNote={(payload) => createNote.mutate(payload)}
                onOpenPinned={(messageId) => setActiveThreadMessage(messages.find((message) => message._id === messageId) ?? { _id: messageId })}
              />
              <ThreadSidebar
                messageId={activeThreadMessage?._id}
                thread={threadData}
                onClose={() => setActiveThreadMessage(null)}
                onReply={(payload) => threadReply.mutate(payload)}
              />
            </div>
          ) : loadingConversations ? (
            <ChatSkeleton />
          ) : (
            <div>
              <EmptyConversationState />
              <div className="pb-8 text-center">
                <Button type="button" onClick={openNewConversationModal}>Start a chat</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <NewConversationModal
        open={isNewConversationOpen}
        users={chatUsers.data?.users ?? []}
        isLoading={chatUsers.isLoading}
        isError={chatUsers.isError}
        isStarting={createDirect.isPending}
        search={userSearch}
        role={userRole || 'all'}
        onClose={() => setIsNewConversationOpen(false)}
        onSearch={setUserSearch}
        onRoleChange={setUserRole}
        onStart={startDirectConversation}
      />
    </section>
  );
}
