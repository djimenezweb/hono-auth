import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { userFormSchema, UserPayload } from '../types.ts';
import { comparePasswords, hashPassword } from '../utils/bcrypt.ts';
import prisma from '../prisma/client.ts';
import { parse } from '../utils/userAgentParser.ts';
import { refreshTokenExpiration } from '../config/expireOptions.ts';
import { deleteCookie, setCookie } from 'hono/cookie';
import {
  accessTokenCookiesOptions,
  refreshTokenCookiesOptions,
} from '../config/cookiesOptions.ts';
import { STATUS } from '../config/status.ts';
import { getConnInfo } from '@hono/node-server/conninfo';
import { generateTokens } from '../utils/generateTokens.ts';
import {
  CONFLICT,
  CREATED,
  FORBIDDEN,
  NOT_FOUND,
} from '../http-status-codes.ts';

const factory = createFactory<{ Variables: { user: UserPayload } }>();

const signup = factory.createHandlers(
  zValidator('json', userFormSchema),
  async c => {
    // Get username and password from validated request
    const validatedUser = c.req.valid('json');
    const { username, password } = validatedUser;

    const duplicate = await prisma.user.findUnique({ where: { username } });
    if (duplicate) {
      c.status(CONFLICT);
      throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Connection info
    const connInfo = getConnInfo(c);
    const parsedUserAgent = parse(c.req.header('User-Agent'));

    // Save username and hashed password to database
    // Create new Session and return newly created user and session
    const userAndSession = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        roles: JSON.stringify(['user']),
        sessions: {
          create: {
            userAgent: parsedUserAgent.full,
            userAgentName: parsedUserAgent.name,
            userAgentOS: parsedUserAgent.os,
            userAgentDevice: parsedUserAgent.device_type,
            ip: connInfo.remote.address || '0',
            expires: new Date().getTime() + refreshTokenExpiration * 1000,
          },
        },
      },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Generate Access and Refresh Tokens
    const { accessToken, refreshToken } = await generateTokens(
      userAndSession.userId,
      username,
      userAndSession.roles,
      userAndSession.sessions[0].sessionId
    );

    // Set Tokens in Cookies
    setCookie(c, 'accessToken', accessToken, accessTokenCookiesOptions);
    setCookie(c, 'refreshToken', refreshToken, refreshTokenCookiesOptions);

    // Send Response
    return c.json(
      {
        status: STATUS.SUCCESS,
        time: new Date().getTime(),
        message: `User ${userAndSession.username} created and logged in successfully`,
        user: {
          userId: userAndSession.userId,
          username: username,
          roles: await JSON.parse(userAndSession.roles),
        },
      },
      CREATED
    );
  }
);

const login = factory.createHandlers(
  zValidator('json', userFormSchema),
  async c => {
    // Get username and password from validated request
    const validatedUser = c.req.valid('json');
    const { username, password } = validatedUser;

    // Find user in database
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      c.status(NOT_FOUND);
      throw new Error('User does not exist');
    }

    // Compare password from database against password from login form
    const match = await comparePasswords(password, user.password);
    if (!match) {
      c.status(FORBIDDEN);
      throw new Error('Incorrect password');
    }

    // Connection info
    const connInfo = getConnInfo(c);
    const parsedUserAgent = parse(c.req.header('User-Agent'));

    // Create new Session
    const session = await prisma.session.create({
      data: {
        userId: user.userId,
        userAgent: parsedUserAgent.full,
        userAgentName: parsedUserAgent.name,
        userAgentOS: parsedUserAgent.os,
        userAgentDevice: parsedUserAgent.device_type,
        ip: connInfo.remote.address || '0',
        expires: new Date().getTime() + refreshTokenExpiration * 1000,
      },
    });

    // Generate Access and Refresh Tokens
    const { accessToken, refreshToken } = await generateTokens(
      user.userId,
      user.username,
      user.roles,
      session.sessionId
    );

    // Set Tokens in Cookies
    setCookie(c, 'accessToken', accessToken, accessTokenCookiesOptions);
    setCookie(c, 'refreshToken', refreshToken, refreshTokenCookiesOptions);

    // Send Response
    return c.json({
      status: STATUS.SUCCESS,
      time: new Date().getTime(),
      message: `User ${user.username} created and logged in successfully`,
      user: {
        userId: user.userId,
        username: username,
        roles: JSON.parse(user.roles),
      },
    });
  }
);

const logout = factory.createHandlers(async c => {
  // Get sessionId from c.var.user (passed through validateTokens middleware)
  const { sessionId } = c.var.user;

  // Find session and delete it from database
  if (sessionId) {
    const result = await prisma.session.delete({ where: { sessionId } });
  }

  // Clear cookies
  deleteCookie(c, 'accessToken');
  deleteCookie(c, 'refreshToken');

  // Send response
  return c.json({
    status: STATUS.SUCCESS,
    time: new Date().getTime(),
    message: `User ${c.var.user.username} logged out`,
  });
});

export { signup, login, logout };
