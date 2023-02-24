import { ClientToServerEvents, ServerToClientEvents } from '@chat-app/shared-types';
import { io, Socket } from 'socket.io-client';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  'http://localhost:3333',
  {
    autoConnect: false
  }
);
