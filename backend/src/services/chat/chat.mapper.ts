export function mapConversation(input: unknown) {
  const item = input as Record<string, unknown> & { _id?: { toString(): string }; createdBy?: { toString(): string }; lastMessageSenderId?: { toString(): string } };
  return {
    ...item,
    id: item._id?.toString(),
    _id: item._id?.toString(),
    createdBy: item.createdBy?.toString(),
    lastMessageSenderId: item.lastMessageSenderId?.toString(),
  };
}

export function mapMember(input: unknown) {
  const item = input as Record<string, unknown> & { _id?: { toString(): string }; conversationId?: { toString(): string }; userId?: { toString(): string } };
  return {
    ...item,
    id: item._id?.toString(),
    _id: item._id?.toString(),
    conversationId: item.conversationId?.toString(),
    userId: item.userId?.toString(),
  };
}

export function mapMessage(input: unknown) {
  const item = input as Record<string, unknown> & { _id?: { toString(): string }; conversationId?: { toString(): string }; senderId?: { toString(): string } };
  return {
    ...item,
    id: item._id?.toString(),
    _id: item._id?.toString(),
    conversationId: item.conversationId?.toString(),
    senderId: item.senderId?.toString(),
  };
}
