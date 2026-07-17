type LogPayload = Record<string, unknown> | Error | string;

function write(level: 'info' | 'warn' | 'error', message: string, payload?: LogPayload): void {
  const timestamp = new Date().toISOString();
  const suffix = payload ? ` ${formatPayload(payload)}` : '';
  console[level](`[${timestamp}] ${level.toUpperCase()} ${message}${suffix}`);
}

function formatPayload(payload: LogPayload): string {
  if (payload instanceof Error) {
    return JSON.stringify({ name: payload.name, message: payload.message, stack: payload.stack });
  }

  if (typeof payload === 'string') {
    return payload;
  }

  return JSON.stringify(payload);
}

export const logger = {
  info: (message: string, payload?: LogPayload) => write('info', message, payload),
  warn: (message: string, payload?: LogPayload) => write('warn', message, payload),
  error: (message: string, payload?: LogPayload) => write('error', message, payload),
};
