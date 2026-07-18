export interface PushPayload {
  userId: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PushProvider {
  send(payload: PushPayload): Promise<{ delivered: boolean; provider: string }>;
}

class DisabledPushProvider implements PushProvider {
  async send() {
    return { delivered: false, provider: 'disabled' };
  }
}

export function createPushProvider(): PushProvider {
  return new DisabledPushProvider();
}
