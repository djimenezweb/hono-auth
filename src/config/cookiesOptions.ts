import { CookieOptions } from 'hono/utils/cookie';
import {
  accessTokenExpiration,
  refreshTokenExpiration,
} from './expireOptions.ts';

const cookiesOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
};

const accessTokenCookiesOptions = {
  ...cookiesOptions,
};

const refreshTokenCookiesOptions = {
  ...cookiesOptions,
  maxAge: refreshTokenExpiration,
};

export {
  cookiesOptions,
  accessTokenCookiesOptions,
  refreshTokenCookiesOptions,
};
