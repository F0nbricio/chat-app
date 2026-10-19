require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth');
const chatSocket = require('./sockets/chatSocket');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Ligação ao MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB com sucesso!'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Registar Rotas HTTP
app.use('/api', authRoutes);

// Registrar Error
app.use(errorHandler);

// Registar Eventos do Socket.io
chatSocket(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});