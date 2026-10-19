const Message = require('../models/Message');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Utilizador conectado: ${socket.id}`);

    socket.on('join_room', async (room) => {
      socket.join(room);
      console.log(`Utilizador ${socket.id} entrou na sala: ${room}`);

      try {
        const history = await Message.find({ room: room }).sort({ createdAt: 1 });
        socket.emit('load_history', history);
      } catch (err) {
        console.error('Erro ao carregar o histórico:', err);
      }
    });

    socket.on('send_message', async (data) => {
      try {
        const newMessage = new Message({
          room: data.room,
          author: data.author,
          message: data.message,
          time: data.time,
        });

        await newMessage.save();
        io.to(data.room).emit('receive_message', data);
      } catch (err) {
        console.error('Erro ao guardar a mensagem:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Utilizador desconectado: ${socket.id}`);
    });
  });
};