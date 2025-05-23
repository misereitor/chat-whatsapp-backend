import express, { Application } from 'express';
import bodyParser from 'body-parser';
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
import { routerCompany } from './router/company.route';
import { routerPlans } from './router/plan.router';
import { routerModules } from './router/module.route';
import { routerTag } from './router/tag.router';
import { routerFastMessage } from './router/fast-message.router';

config();

const app: Application = express();

app.use(bodyParser.json({ limit: '200mb' }));
const corsOptions: CorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', routerWebhook);
app.use('/api', routerChat);
app.use('/api', routerUser);
app.use('/api', routerAuth);
app.use('/api', routerContacts);
app.use('/api', routerdepartment);
app.use('/api', routerCompany);
app.use('/api', routerPlans);
app.use('/api', routerModules);
app.use('/api', routerTag);
app.use('/api', routerFastMessage);

export { app, server, io };
