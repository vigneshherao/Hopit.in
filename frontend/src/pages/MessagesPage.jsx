import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConversationDetailsPanel } from '@/components/chat/ConversationDetailsPanel.jsx';
import { ConversationHeader } from '@/components/chat/ConversationHeader.jsx';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar.jsx';
import { EmptyConversationState } from '@/components/chat/EmptyConversationState.jsx';
import { ChatSkeleton } from '@/components/chat/ChatSkeleton.jsx';
import { MessageBubble } from '@/components/chat/MessageBubble.jsx';
import { MessageComposer } from '@/components/chat/MessageComposer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useArchiveConversation, useConversation, useConversationMembers, useConversations, useCreateDirectConversation, useMessages, useMuteConversation, usePinConversation } from '@/hooks/useChat.js';
import { useConversationSocketEvents, useReadReceiptSocket } from '@/hooks/useChatSocket.js';
import { useAuth } from '@/context/AuthContext.jsx';

export function MessagesPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeId = params.conversationId;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const conversationFilters = useMemo(() => ({ search, type: filter === 'all' ? undefined : filter }), [filter, search]);
  const { data: conversationsData, isLoading: loadingConversations } = useConversations(conversationFilters);
  const { data: conversationData } = useConversation(activeId);
  const { data: messagesData, isLoading: loadingMessages } = useMessages(activeId);
  const { data: membersData } = useConversationMembers(activeId);
  const archiveConversation = useArchiveConversation();
  const muteConversation = useMuteConversation();
  const pinConversation = usePinConversation();
  const createDirect = useCreateDirectConversation();
  const { typingUsers } = useConversationSocketEvents(activeId);
  const { markRead } = useReadReceiptSocket(activeId);

  const conversation = conversationData?.conversation;
  const messages = messagesData?.messages ?? [];

  function startSupportConversation() {
    const participantId = window.prompt('Enter the Hopt It user id to message');
    if (!participantId) return;
    createDirect.mutate({ participantId }, { onSuccess: (data) => navigate(`/messages/${data.conversation._id}`) });
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
            onNew={startSupportConversation}
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
                <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6" onMouseEnter={() => markRead(messages.at(-1)?._id)}>
                  {loadingMessages ? <ChatSkeleton /> : messages.map((message) => <MessageBubble key={message._id} message={message} isOwn={message.senderId === user?.id} />)}
                  {!loadingMessages && !messages.length && <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 text-center text-sm text-slate-500">No messages yet. Send the first update.</div>}
                </div>
                <MessageComposer conversationId={activeId} />
              </div>
              <ConversationDetailsPanel conversation={conversation} members={membersData?.members ?? []} />
            </div>
          ) : loadingConversations ? (
            <ChatSkeleton />
          ) : (
            <div>
              <EmptyConversationState />
              <div className="pb-8 text-center">
                <Button type="button" onClick={startSupportConversation}>Start a support chat</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
