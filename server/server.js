const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const rooms = new Map();
const userColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Map(),
        code: '',
        language: 'javascript'
      });
    }

    const room = rooms.get(roomId);
    const userColor = userColors[room.users.size % userColors.length];
    
    room.users.set(socket.id, {
      id: socket.id,
      username: username || 'Anonymous',
      color: userColor
    });

    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      username: username || 'Anonymous',
      color: userColor
    });

    const currentUsers = Array.from(room.users.values());
    socket.emit('room-users', currentUsers);
    socket.emit('room-state', { code: room.code, language: room.language });

    console.log(`User ${username} joined room ${roomId}`);
  });

  socket.on('code-change', ({ roomId, code }) => {
    const room = rooms.get(roomId);
    if (room) room.code = code;
    socket.to(roomId).emit('code-update', { userId: socket.id, code });
  });

  socket.on('language-change', ({ roomId, language }) => {
    const room = rooms.get(roomId);
    if (room) room.language = language;
    socket.to(roomId).emit('language-update', { userId: socket.id, language });
  });

  socket.on('cursor-change', ({ roomId, position, selection }) => {
    socket.to(roomId).emit('cursor-update', { userId: socket.id, position, selection });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        const user = room.users.get(socket.id);
        room.users.delete(socket.id);
        socket.to(roomId).emit('user-left', { userId: socket.id, username: user?.username });
        if (room.users.size === 0) rooms.delete(roomId);
      }
    });
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
});