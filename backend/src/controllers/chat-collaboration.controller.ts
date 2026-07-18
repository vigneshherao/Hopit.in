import type { Response } from 'express';
import { addReaction, createAnnouncement, createBookmark, createSharedNote, createThreadReply, deleteAnnouncement, deleteBookmark, deleteSharedNote, getThread, listAnnouncements, listBookmarks, listMentions, listPinnedMessages, listSharedNotes, listStarredMessages, pinMessage, removeReaction, starMessage, unpinMessage, unstarMessage, updateAnnouncement, updateSharedNote } from '@/services/chat/chat.collaboration.service.js';
import type { AuthenticatedRequest } from '@/types/http.js';
import { sendSuccess } from '@/utils/api-response.js';

export async function addReactionController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Reaction saved.', await addReaction(req.user!.id, req.body));
}

export async function removeReactionController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Reaction removed.', await removeReaction(req.user!.id, req.body.messageId));
}

export async function mentionsController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Mentions retrieved.', await listMentions(req.user!.id, req.query));
}

export async function pinnedMessagesController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Pinned messages retrieved.', await listPinnedMessages(req.user!.id, req.query));
}

export async function pinMessageController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Message pinned.', await pinMessage(req.user!.id, req.body.messageId));
}

export async function unpinMessageController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Message unpinned.', await unpinMessage(req.user!.id, req.body.messageId));
}

export async function starredMessagesController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Starred messages retrieved.', await listStarredMessages(req.user!.id, req.query));
}

export async function starMessageController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Message starred.', await starMessage(req.user!.id, req.body.messageId));
}

export async function unstarMessageController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Message unstarred.', await unstarMessage(req.user!.id, req.body.messageId));
}

export async function threadController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Thread retrieved.', await getThread(req.user!.id, req.query));
}

export async function threadReplyController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Thread reply sent.', await createThreadReply(req.user!.id, req.body));
}

export async function notesController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Shared notes retrieved.', await listSharedNotes(req.user!.id, req.query));
}

export async function createNoteController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Shared note created.', await createSharedNote(req.user!.id, req.body));
}

export async function updateNoteController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Shared note updated.', await updateSharedNote(req.user!.id, req.params.noteId as string, req.body));
}

export async function deleteNoteController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Shared note deleted.', await deleteSharedNote(req.user!.id, req.params.noteId as string));
}

export async function announcementsController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Announcements retrieved.', await listAnnouncements(req.user!.id, req.query));
}

export async function createAnnouncementController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Announcement created.', await createAnnouncement(req.user!.id, req.body));
}

export async function updateAnnouncementController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Announcement updated.', await updateAnnouncement(req.user!.id, req.params.announcementId as string, req.body));
}

export async function deleteAnnouncementController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Announcement deleted.', await deleteAnnouncement(req.user!.id, req.params.announcementId as string));
}

export async function bookmarksController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Bookmarks retrieved.', await listBookmarks(req.user!.id, req.query));
}

export async function createBookmarkController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Bookmark saved.', await createBookmark(req.user!.id, req.body));
}

export async function deleteBookmarkController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Bookmark removed.', await deleteBookmark(req.user!.id, req.body));
}
