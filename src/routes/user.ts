import { Hono } from 'hono';
import { validateTokens } from '../middleware/validateTokens';
import { validateAdmin } from '../middleware/validateAdmin';
import {
  deleteUser,
  getAllUsers,
  getUserFromCookies,
  updateUser,
} from '../handlers/userHandlers';

const app = new Hono()
  .get('/', validateTokens, validateAdmin, ...getAllUsers)
  .get('/me', validateTokens, ...getUserFromCookies)
  .put('/:userId', validateTokens, validateAdmin, ...updateUser)
  .delete('/:userId', validateTokens, validateAdmin, ...deleteUser);

export default app;
