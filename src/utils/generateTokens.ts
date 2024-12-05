import { sign } from 'hono/jwt';
import env from '../env';
import { refreshTokenExpiration } from '../config/expireOptions';

export async function generateTokens(
  userId: string,
  username: string,
  roles: string,
  sessionId: string
) {
  // Generate Access Token
  const accessToken = await sign(
    {
      userId,
      username,
      roles,
      sessionId,
    },
    env.ACCESS_TOKEN_SECRET
  );

  // Generate Refresh Token
  const refreshToken = await sign(
    {
      sessionId,
      exp: refreshTokenExpiration,
    },
    env.REFRESH_TOKEN_SECRET
  );

  // Return Tokens
  return { accessToken, refreshToken };
}
