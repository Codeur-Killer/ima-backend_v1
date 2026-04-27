// socket/socket.js
import { Server } from 'socket.io';

let socketIO = null;

export const initSocketIO = (httpServer, corsOrigin) => {
  socketIO = new Server(httpServer, {
    cors: {
      origin: (corsOrigin || 'http://localhost:5173').split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  socketIO.on('connection', (socket) => {
    console.log(`🔌 Socket connecté : ${socket.id}`);

    socket.on('join-category', (categoryId) => {
      socket.join(`category:${categoryId}`);
    });

    socket.on('leave-category', (categoryId) => {
      socket.leave(`category:${categoryId}`);
    });

    socket.on('join-admin', () => {
      socket.join('admin');
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket déconnecté : ${socket.id}`);
    });
  });

  return socketIO;
};

export const getIO = () => socketIO;

// Émettre une mise à jour de vote en temps réel
export const emitVoteUpdate = (data) => {
  if (!socketIO) return;
  // À toute la plateforme
  socketIO.emit('vote:update', {
    artistId:    data.artistId,
    categoryId:  data.categoryId,
    artist:      data.artist,
    categoryStats: data.categoryStats,
    globalStats: data.globalStats,
    timestamp:   new Date().toISOString(),
  });
  // Room catégorie spécifique
  if (data.categoryId) {
    socketIO.to(`category:${data.categoryId}`).emit('vote:category-update', data);
  }
  // Dashboard admin
  socketIO.to('admin').emit('admin:vote-update', data);
};

export const emitAdminStats = (stats) => {
  if (!socketIO) return;
  socketIO.to('admin').emit('admin:stats-update', stats);
};
