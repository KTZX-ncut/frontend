import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors';
import fileRoutes from './routes/minio.route.ts';

const app = new Hono()

app.use('*', cors()); // 允许跨域

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/ai', fileRoutes);

app.get('/health', (c) => c.text('OK'));

app.onError((err, c) => {
  console.error(err);
  if (err) {
    // @ts-ignore
    return c.json({ message: err.message }, err.cause);
  }
  return c.json({ message: 'Internal BFF Error' }, 500);
});

serve({
  fetch: app.fetch,
  port: 9000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
