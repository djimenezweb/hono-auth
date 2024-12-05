import { Hono } from 'hono';
import { validateTokens } from '../middleware/validateTokens';
import {
  deleteSessionFromSessionId,
  getSessionsFromUserId,
  updateSession,
} from '../handlers/sessionHandlers';
import { validateAdmin } from '../middleware/validateAdmin';

const app = new Hono()
  .get('/:userId', validateTokens, ...getSessionsFromUserId)
  .delete('/:sessionId', validateTokens, ...deleteSessionFromSessionId)
  .put('/:sessionId', validateTokens, validateAdmin, ...updateSession);

export default app;
