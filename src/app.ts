import express, { Application } from 'express';
import cors, { CorsOptions } from 'cors';
import { routerWebhook } from './router/webhook.router';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { routerChat } from './router/chat.router';
import { routerUser } from './router/user.route';
import { routerAuth } from './router/auth.route';
import { routerContacts } from './router/contacts.router';
import { routerdepartment } from './router/department.router';
import { config } from 'dotenv';

config();

const app: Application = express();

const corsOptions: CorsOptions = {
  origin: '*', // Permitindo o frontend
  methods: ['GET', 'POST'], // Métodos permitidos
  credentials: true // Permitindo cookies e credenciais
};

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Permitindo a origem do cliente
    methods: ['GET', 'POST'],
    credentials: true // Permitindo cookies e credenciais
  }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Rotas
app.use('/api', routerWebhook);
app.use('/api', routerChat);
app.use('/api', routerUser);
app.use('/api', routerAuth);
app.use('/api', routerContacts);
app.use('/api', routerdepartment);

// Configuração do Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected');

  // Escutando por mensagens enviadas do cliente
  socket.on('message', (message) => {
    console.log(`Message received: ${message}`);
    // Emitir a mensagem para todos os clientes conectados
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Exportar o servidor para ser utilizado em server.ts
export { app, server, io };
