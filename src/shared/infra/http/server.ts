import express from 'express';
import socketio from 'socket.io';
import http from 'http';
import cors from 'cors';
import { routes } from './routes';

const app = express();
app.use(routes);
app.use(cors());

interface ILocation {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  id: string;
  pinColor: string;
}

interface IProps {
  onlineUsers: number;
  online: boolean;
}

const httpServer = http.createServer(app);
const io = new socketio.Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', socket => {
  const room = socket.handshake.query?.room;
  const name = socket.handshake.query?.name;

  if (room) {
    socket.join(room);
  }
  console.log('new connection: ', name);
  console.log('qtd conections: ', io.sockets.listeners.length);

  console.log(socket.connected);

  socket.on('location', (location: ILocation) => {
    console.log('message: ', location);
    // if (room) io.to(room).emit('message', { user: name, message });
    io.emit('location', location);
  });

  socket.on('teste', () => {
    socket.emit('teste', {
      onlineUsers: io.sockets.listeners.length,
      online: true,
    } as IProps);
  });

  socket.on('disconnect', () => {
    console.log('desconectou');
    socket.disconnect();
  });
});

httpServer.listen(3333, () => {
  console.log(`🚀 Server started on port 3333`);
});
