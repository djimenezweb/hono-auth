import { createFactory } from 'hono/factory';
import { UserPayload } from '../types';
import prisma from '../../prisma/client';
import { STATUS } from '../config/status';
import { deleteCookie } from 'hono/cookie';
import { cookiesOptions } from '../config/cookiesOptions';
import { FORBIDDEN } from '../http-status-codes';

const factory = createFactory<{ Variables: { user: UserPayload } }>();

const getSessionsFromUserId = factory.createHandlers(async c => {
  const userId = c.req.param('userId');

  // Clean up possibly expired sessions from user
  const now = new Date().getTime();
  const expiredSessions = await prisma.session.deleteMany({
    where: {
      AND: [{ userId }, { expires: { lt: now } }],
    },
  });

  // Get remaining sessions from userId
  const sessionsWithBigInt =
    (await prisma.session.findMany({
      where: { userId },
      select: {
        sessionId: true,
        valid: true,
        userAgentName: true,
        userAgentOS: true,
        userAgentDevice: true,
        ip: true,
        expires: true,
      },
    })) ?? [];

  // Convert BigInt
  const sessions = sessionsWithBigInt.map(s => ({
    ...s,
    _id: s.sessionId,
    expires: Number(s.expires),
  }));

  // Return response
  return c.json({
    status: STATUS.SUCCESS,
    time: new Date().getTime(),
    message: `Retrieved sessions successfully\n${expiredSessions.count} expired sessions removed`,
    sessions,
  });
});

const deleteSessionFromSessionId = factory.createHandlers(async c => {
  const sessionId = c.req.param('sessionId');
  const { userId } = c.var.user;
  const isAdmin = c.var.user.roles.includes('admin');
  const isCurrentSession = sessionId === c.var.user.sessionId;

  // Find session
  const sessionToDelete = await prisma.session.findUnique({
    where: { sessionId },
  });

  // Grant access to admins only or session owners
  if (sessionToDelete?.userId !== userId && !isAdmin) {
    c.status(FORBIDDEN);
    throw new Error('Unauthorized');
  }

  // Delete the session
  const result = await prisma.session.delete({ where: { sessionId } });

  // If deleting current session, clear cookies
  if (isCurrentSession) {
    deleteCookie(c, 'accessToken', cookiesOptions);
    deleteCookie(c, 'refreshToken', cookiesOptions);
  }

  // Return response
  return c.json({
    logout: isCurrentSession,
    status: STATUS.SUCCESS,
    time: new Date().getTime(),
    message: `Closed session from ${result?.userAgentName} on ${result?.userAgentOS} (${result?.userAgentDevice})`,
  });
});

const updateSession = factory.createHandlers(async c => {
  const sessionId = c.req.param('sessionId');
  const json = await c.req.json();

  // Find and update session
  const updatedSession = await prisma.session.update({
    where: { sessionId },
    data: { ...json },
  });

  // Return response
  return c.json({
    status: STATUS.SUCCESS,
    time: new Date().getTime(),
    message: 'Updated session',
  });
});

export { getSessionsFromUserId, deleteSessionFromSessionId, updateSession };
