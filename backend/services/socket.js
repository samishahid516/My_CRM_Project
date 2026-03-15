const socketIo = require('socket.io');

let io;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('🔌 New client connected');
      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected');
      });
    });

    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  sendNotification: (topic, data) => {
    if (io) {
      io.emit(topic, data);
    }
  }
};
