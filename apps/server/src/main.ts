import { Server } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData
} from '@chat-app/shared-types';
import { CognitoService } from './services';

const cognitoService = new CognitoService();

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>({
  cors: { origin: '*' }
});

io.on('connection', async (socket) => {
  const token = socket.handshake.auth.token;
  const response = await cognitoService.validateAccessToken(token);

  console.log('user connected', socket.id);
  console.log('socket.id:', socket.id);
  console.log('auth token (user_id):', response.sub);

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });

  socket.on('addMessage', (message) => console.log('message received from client:', message));
});

const port = 3333;

io.listen(port);
