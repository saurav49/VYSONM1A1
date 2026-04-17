import dotenv from 'dotenv';
import express, { Router, Request, Response, NextFunction } from 'express';
import { insertIntoTable } from './scripts/insertIntoTable';
import { nanoid } from 'nanoid';
import cors from 'cors';
import { query } from './config/db';

dotenv.config();

function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ error: message });
}
const routes = Router();

const app = express();
app.use(
  cors({
    origin: '*', // REMOVE IN PRODUCTION
  }),
);
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

routes.get('/ping', (_req, res) => {
  return res.status(200).json({
    status: true,
    message: 'Server up and running',
  });
});
// routes.get('/check-db-size', async (_req, res) => {
//   const r = await query(
//     `SELECT pg_size_pretty(pg_total_relation_size('url_shortener'));`,
//   );
//   return res.status(200).json({
//     status: true,
//     data: r?.rows[0],
//   });
// });

routes.post('/short', async (req, res) => {
  try {
    const { originalUrl } = req.body;
    if (!originalUrl) {
      return res.status(400).json({
        status: false,
        message: 'Original url is required',
      });
    }
    let shortCode = '';
    shortCode = nanoid(7);
    const q = await query(
      `
            SELECT * 
            FROM "url_shortener"
            WHERE short_code=$1
            `,
      [shortCode],
    );
    while (q?.rowCount && q.rowCount > 0) {
      shortCode = nanoid(7);
    }
    await insertIntoTable({
      original_url: originalUrl,
      short_code: shortCode,
    });
    return res.status(201).json({
      status: true,
      data: {
        originalUrl,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: false,
      error: e,
    });
  }
});
routes.post('/batch-insert-short', async (req, res) => {
  try {
    const start = performance.now();
    const { originalUrl, iteration } = req.body;
    if (typeof iteration !== 'number' || iteration <= 0) {
      return res.status(400).json({
        status: false,
        message: 'Invalid iteration',
      });
    }
    if (!originalUrl) {
      return res.status(400).json({
        status: false,
        message: 'Original url is required',
      });
    }
    for (let i = 0; i < iteration; i++) {
      let shortCode = '';
      shortCode = nanoid(7);
      const q = await query(
        `
                SELECT * 
                FROM "url_shortener"
                WHERE short_code=$1
                `,
        [shortCode],
      );
      while (q?.rowCount && q.rowCount > 0) {
        shortCode = nanoid(7);
      }
      await insertIntoTable({
        original_url: originalUrl,
        short_code: shortCode,
      });
    }
    const end = performance.now();
    console.log(`API took ${(end - start).toFixed(2)} ms`);
    return res.status(201).json({
      status: true,
      message: 'Successful!!',
    });
  } catch (e) {
    return res.status(500).json({
      status: false,
      error: e,
    });
  }
});

export default app;
