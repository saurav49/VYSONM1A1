import express, { Router } from 'express';
import cors from 'cors';
import validator from 'validator';
import { query } from './db/client';

const app = express();
const routes = Router();

app.use(express.json());
app.use(
  cors({
    origin: '*',
  }),
);
app.use('/api', routes);

// ROUTE
routes.get('/health', (_req, res) => {
  return res.status(200).json({
    status: true,
    message: 'Server up and running',
  });
});

routes.post('/todos', async (req, res) => {});

routes.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const isValidEmail = validator.isEmail(email);
    if (!name) {
      return res.status(401).json({
        status: false,
        message: 'Name is a required field',
      });
    }
    if (!isValidEmail) {
      return res.status(401).json({
        status: false,
        message: 'Invalid email',
      });
    }
    const result = await query(
      `
        INSERT INTO users (name, email)
        VALUES ($1, $2)
        RETURNING *
      `,
      [name, email],
    );
    return res.status(201).json({
      status: true,
      data: result?.rows,
    });
  } catch (e) {
    console.log({ e });
    throw e;
  }
});

export default app;
