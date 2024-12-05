import { createMiddleware } from 'hono/factory';
import { UserPayload } from '../types';
import { FORBIDDEN } from '../http-status-codes';

const validateAdmin = createMiddleware<{ Variables: { user: UserPayload } }>(
  async (c, next) => {
    const isAdmin = c.var.user.roles.includes('admin');

    if (!isAdmin) {
      c.status(FORBIDDEN);
      throw new Error('Unauthorized: admins only');
    }

    await next();
  }
);

export { validateAdmin };
