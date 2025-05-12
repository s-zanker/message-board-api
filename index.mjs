import express from 'express';
import { postsRouter } from './routes/posts.mjs';

const app = express();
const apiPath = '/api/v1';

app.use(express.json());
app.use(apiPath + '/posts', postsRouter);

async function run() {
  const config = await import(
    `./config/${process.env.MESSAGE_BOARD_ENV}.env.mjs`
  );
  const port = config.APP_PORT;
  const host = config.APP_HOST;

  app.listen(port, host, () => {
    console.log(`Server is listening on http://${host}:${port}`);
  });
}

run();

//If we use an frontend later, we will need 1. total path and 2.middleware for static files
// 1. -> const __dirname = import.meta.dirname
// 2. -> app.use(express.static(path.join(__dirname, 'static')))
