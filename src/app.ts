import express, { Router } from 'express';
import cors from 'cors';

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

export default app;
