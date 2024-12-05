import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import env from '../env';
import { AccessTokenPayload, RefreshTokenPayload, UserPayload } from '../types';
import prisma from '../../prisma/client.ts';
import { generateTokens } from '../utils/generateTokens.ts';
import {
  accessTokenCookiesOptions,
  refreshTokenCookiesOptions,
} from '../config/cookiesOptions.ts';
import { FORBIDDEN, NOT_FOUND, UNAUTHORIZED } from '../http-status-codes.ts';
import { getDataOrError } from '../utils/getDataOrError.ts';

const validateTokens = createMiddleware<{ Variables: { user: UserPayload } }>(
  async (c, next) => {
    // Get Access and Refresh Tokens from cookies
    const { accessToken, refreshToken } = getCookie(c);

    // If no Refresh Token, throw unauthorized error
    if (!refreshToken) {
      c.status(UNAUTHORIZED);
      throw new Error('No Refresh Token found\nPlease log in to continue');
    }

    // If no Access Token, decode Refresh Token
    if (refreshToken && !accessToken) {
      const [decodedUser, error] = await getDataOrError<RefreshTokenPayload>(
        verify(refreshToken, env.REFRESH_TOKEN_SECRET)
      );
      if (error) {
        // Clear cookies and send 403 error
        deleteCookie(c, 'refreshToken');
        deleteCookie(c, 'accessToken');
        c.status(FORBIDDEN);
        throw new Error('Invalid token');
      }

      // Look up session
      const { sessionId } = decodedUser;
      const session = await prisma.session.findUnique({ where: { sessionId } });

      // If no session found
      if (!session || !session.valid) {
        // Clear cookies and send 403 error
        deleteCookie(c, 'refreshToken');
        deleteCookie(c, 'accessToken');
        c.status(FORBIDDEN);
        throw new Error('Session not found\nPlease log in to continue');
      }

      // If session exists but is not valid
      if (!session.valid) {
        c.status(FORBIDDEN);
        throw new Error('Invalid session');
      }

      // If session is valid find user
      const userId = session.userId;
      const user = await prisma.user.findUnique({ where: { userId } });
      if (!user) {
        c.status(NOT_FOUND);
        throw new Error('User not found');
      }

      // Refresh both tokens
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await generateTokens(userId, user.username, user?.roles, sessionId);

      // Set Tokens in Cookies
      setCookie(c, 'accessToken', newAccessToken, accessTokenCookiesOptions);
      setCookie(c, 'refreshToken', newRefreshToken, refreshTokenCookiesOptions);

      // Make user data available to further methods as c.var.user
      c.set('user', {
        userId,
        roles: user.roles,
        username: user.username,
        sessionId,
      });

      await next();
    }

    // If Access Token check its validity
    if (accessToken) {
      const [decodedUser, error] = await getDataOrError<AccessTokenPayload>(
        verify(accessToken, env.ACCESS_TOKEN_SECRET)
      );

      if (error) {
        // Clear cookies and send 403 error
        deleteCookie(c, 'refreshToken');
        deleteCookie(c, 'accessToken');
        c.status(FORBIDDEN);
        throw new Error('Invalid token');
      }

      // Make decodedUser available to further methods as c.var.user
      c.set('user', decodedUser);

      await next();
    }
  }
);

export { validateTokens };
