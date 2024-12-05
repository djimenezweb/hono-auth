import { Hono } from 'hono';
import { login, logout, signup } from '../handlers/authHandlers.ts';
import { validateTokens } from '../middleware/validateTokens.ts';

const app = new Hono()
  .post('/login', ...login)
  .post('/signup', ...signup)
  .get('/logout', validateTokens, ...logout);

export default app;
