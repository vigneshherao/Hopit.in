import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '@/config/env.js';
import { authenticateSocket } from '@/socket/socketAuth.js';
import { registerSocketEvents } from '@/socket/socketEvents.js';

let io: Server | undefined;

export function initSocketServer(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
    path: '/socket.io',
    maxHttpBufferSize: 1_000_000,
  });

  io.use((socket, next) => {
    void authenticateSocket(socket, next);
  });

  registerSocketEvents(io);
  return io;
}

export function getSocketServer(): Server | undefined {
  return io;
}
