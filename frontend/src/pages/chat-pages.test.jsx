import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessagesPage } from '@/pages/MessagesPage.jsx';
import { TeamWorkspacePage } from '@/pages/TeamWorkspacePage.jsx';
import { ProtectedRoute } from '@/routes/ProtectedRoute.jsx';

const mocks = vi.hoisted(() => ({
  authState: { isAuthenticated: true, isLoading: false, user: { id: 'user1', role: 'owner' } },
  conversations: null,
  conversation: null,
  messages: null,
  members: null,
  sendMessage: { isPending: false, mutateAsync: vi.fn() },
  createDirect: { mutate: vi.fn() },
  archive: { mutate: vi.fn() },
  mute: { mutate: vi.fn() },
  pin: { mutate: vi.fn() },
  messagePin: { mutate: vi.fn() },
  star: { mutate: vi.fn() },
  deleteMessage: { mutate: vi.fn() },
  reaction: { mutate: vi.fn() },
  createNote: { mutate: vi.fn() },
  threadReply: { mutate: vi.fn() },
  moderate: { mutate: vi.fn() },
  updateDigest: { mutate: vi.fn() },
}));

vi.mock('@/context/AuthContext.jsx', () => ({ useAuth: () => mocks.authState }));
vi.mock('@/hooks/useChatSocket.js', () => ({
  useConversationSocketEvents: () => ({ typingUsers: [], emitTypingStart: vi.fn(), emitTypingStop: vi.fn() }),
  useReadReceiptSocket: () => ({ markRead: vi.fn() }),
  useTypingSocket: () => ({ typingUsers: [], emitTypingStart: vi.fn(), emitTypingStop: vi.fn() }),
}));
vi.mock('@/hooks/useChat.js', () => ({
  useConversations: () => ({ isLoading: false, data: mocks.conversations }),
  useChatUsers: () => ({ isLoading: false, data: { users: [] } }),
  useConversation: () => ({ isLoading: false, data: mocks.conversation }),
  useMessages: () => ({ isLoading: false, data: mocks.messages }),
  useConversationMembers: () => ({ isLoading: false, data: mocks.members }),
  useSendMessage: () => mocks.sendMessage,
  useUploadChatAttachment: () => ({ mutateAsync: vi.fn() }),
  useCreateDirectConversation: () => mocks.createDirect,
  useArchiveConversation: () => mocks.archive,
  useMuteConversation: () => mocks.mute,
  usePinConversation: () => mocks.pin,
  useReactions: () => ({ addReaction: mocks.reaction, removeReaction: { mutate: vi.fn() } }),
  usePinMessage: () => mocks.messagePin,
  useStarMessage: () => mocks.star,
  useDeleteMessage: () => mocks.deleteMessage,
  useCreateSharedNote: () => mocks.createNote,
  useThreadReply: () => mocks.threadReply,
  usePinnedMessages: () => ({ isLoading: false, data: { pins: [] } }),
  useStarredMessages: () => ({ isLoading: false, data: { stars: [] } }),
  useSharedNotes: () => ({ isLoading: false, data: { notes: [] } }),
  useAnnouncements: () => ({ isLoading: false, data: { announcements: [] } }),
  useThreads: () => ({ isLoading: false, data: null }),
}));
vi.mock('@/hooks/useChatEnterprise.js', () => ({
  useTeamWorkspace: () => ({
    isLoading: false,
    data: {
      conversation: { _id: 'conversation1', title: 'Field Operations Team' },
      analytics: { messageCount: 8, dailyMessages: 2, weeklyMessages: 8, monthlyMessages: 8, reactionCount: 3, threadCount: 1 },
      recentFiles: [{ _id: 'file1', originalFileName: 'soil-report.pdf', type: 'document' }],
      recentDiscussions: [{ _id: 'message1', text: 'Irrigation line is ready.' }],
      pinnedMessages: [],
      upcomingTasks: [{ _id: 'task1', title: 'First irrigation', category: 'Irrigation', startDate: new Date().toISOString() }],
      upcomingEvents: [{ _id: 'event1', title: 'Harvest review', startDate: new Date().toISOString() }],
      activities: [{ _id: 'activity1', activityType: 'message-sent', actorId: { name: 'Owner' }, createdAt: new Date().toISOString() }],
    },
  }),
  useAnalyticsDashboard: () => ({ data: { widgets: { unreadMessages: 2, activeConversationCount: 1, mostUsedReaction: '🌱', topConversation: { conversationId: { title: 'Field Operations Team' } } } } }),
  useReports: () => ({ data: { reports: [{ _id: 'report1', reason: 'spam', entityType: 'message', status: 'open' }] } }),
  useModeration: () => mocks.moderate,
  useNotificationDigest: () => ({ data: { settings: { frequency: 'instant', channels: ['in-app'] } } }),
  useUpdateNotificationDigest: () => mocks.updateDigest,
  useAuditLogs: () => ({ data: { logs: [{ _id: 'log1', action: 'report-created', entity: 'message', createdAt: new Date().toISOString() }] } }),
}));
vi.mock('@/hooks/useSocket.js', () => ({ useSocket: () => ({ status: 'online' }) }));

function renderPage(ui, initialEntries = ['/messages']) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('chat frontend pages', () => {
  beforeEach(() => {
    const conversation = { _id: 'conversation1', type: 'farm-team', title: 'Field Operations Team', memberCount: 3, lastMessagePreview: 'Irrigation ready', lastMessageAt: new Date().toISOString(), member: { unreadCount: 2 } };
    mocks.conversations = { conversations: [conversation] };
    mocks.conversation = { conversation };
    mocks.messages = {
      messages: [
        { _id: 'message1', conversationId: 'conversation1', senderId: 'user2', type: 'text', text: 'Irrigation line is ready.', status: 'sent', createdAt: new Date().toISOString() },
        { _id: 'message2', conversationId: 'conversation1', senderId: 'user1', type: 'text', text: 'Please inspect north field.', status: 'read', createdAt: new Date().toISOString(), editedAt: new Date().toISOString() },
      ],
    };
    mocks.members = { members: [{ _id: 'member1', role: 'owner', userId: { name: 'Owner' } }] };
    mocks.authState.isAuthenticated = true;
    mocks.sendMessage.isPending = false;
    mocks.sendMessage.mutateAsync.mockReset();
    mocks.sendMessage.mutateAsync.mockResolvedValue({ message: { _id: 'message3' } });
    mocks.archive.mutate.mockReset();
    mocks.mute.mutate.mockReset();
    mocks.pin.mutate.mockReset();
    mocks.messagePin.mutate.mockReset();
    mocks.star.mutate.mockReset();
    mocks.deleteMessage.mutate.mockReset();
    mocks.reaction.mutate.mockReset();
    mocks.createNote.mutate.mockReset();
    mocks.threadReply.mutate.mockReset();
    mocks.moderate.mutate.mockReset();
    mocks.updateDigest.mutate.mockReset();
  });

  it('protects messages route', () => {
    mocks.authState.isAuthenticated = false;
    renderPage(
      <Routes>
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/login" element={<div>Login route</div>} />
      </Routes>,
    );
    expect(screen.getByText('Login route')).toBeInTheDocument();
  });

  it('renders conversation list and messages', () => {
    renderPage(<Routes><Route path="/messages/:conversationId" element={<MessagesPage />} /></Routes>, ['/messages/conversation1']);
    expect(screen.getAllByText('Field Operations Team').length).toBeGreaterThan(0);
    expect(screen.getByText('Irrigation line is ready.')).toBeInTheDocument();
    expect(screen.getByText('Please inspect north field.')).toBeInTheDocument();
  });

  it('sends a text message from the composer', async () => {
    renderPage(<Routes><Route path="/messages/:conversationId" element={<MessagesPage />} /></Routes>, ['/messages/conversation1']);
    await userEvent.type(screen.getByPlaceholderText('Message your Hopt It team'), 'Checking today');
    await userEvent.click(screen.getByLabelText('Send message'));
    expect(mocks.sendMessage.mutateAsync).toHaveBeenCalled();
  });

  it('renders empty conversation state', () => {
    renderPage(<Routes><Route path="/messages" element={<MessagesPage />} /></Routes>, ['/messages']);
    expect(screen.getByText('Open a conversation')).toBeInTheDocument();
  });

  it('renders team workspace dashboard', () => {
    renderPage(<Routes><Route path="/messages/:conversationId/workspace" element={<TeamWorkspacePage />} /></Routes>, ['/messages/conversation1/workspace']);
    expect(screen.getByText('Team Workspace')).toBeInTheDocument();
    expect(screen.getAllByText('Field Operations Team').length).toBeGreaterThan(0);
    expect(screen.getByText('Recent files')).toBeInTheDocument();
    expect(screen.getByText('Activity timeline')).toBeInTheDocument();
  });
});
