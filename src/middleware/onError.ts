import type { ErrorHandler } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';
import { INTERNAL_SERVER_ERROR, OK } from '../http-status-codes';
import { STATUS } from '../config/status';

// Source: https://github.com/w3cj/stoker/blob/main/src/middlewares/on-error.ts

const onError: ErrorHandler = (err, c) => {
  console.error(err);

  const currentStatus =
    'status' in err ? err.status : c.newResponse(null).status;

  const statusCode =
    currentStatus !== OK
      ? (currentStatus as StatusCode)
      : INTERNAL_SERVER_ERROR;

  return c.json(
    {
      status: STATUS.ERROR,
      time: new Date().getTime(),
      message: err.message,
    },
    statusCode
  );
};

export default onError;
