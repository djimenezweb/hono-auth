import app from './app.ts';
import env from './env.ts';

import { serve } from '@hono/node-server';

serve({ fetch: app.fetch, port: env.PORT }, info => {
  console.log(`Listening on http://localhost:${info.port}`);
});

