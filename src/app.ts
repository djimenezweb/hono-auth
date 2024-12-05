import { Hono } from 'hono';
import authRoutes from './routes/auth.ts';
import sessionRoutes from './routes/session.ts';
import userRoutes from './routes/user.ts';
import { NOT_FOUND } from './http-status-codes.ts';
import { cors } from 'hono/cors';
import { corsOptions } from './config/corsOptions.ts';
import { logger } from 'hono/logger';
import onError from './middleware/onError.ts';

const app = new Hono({ strict: false });
app.use(logger());
app.use('/api/*', cors(corsOptions));

app.get('/', c => {
  return c.json({ message: 'Hello Hono!' });
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/session', sessionRoutes);
app.route('/api/users', userRoutes);

// Not Found handler
app.notFound(c => {
  return c.json({ message: `Path ${c.req.path} not found` }, NOT_FOUND);
});

// Error handler
app.onError(onError);

export default app;
