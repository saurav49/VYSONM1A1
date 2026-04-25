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

// [Q2] Insert 3-5 sample users and 5-10 sample todos (distributed among the users) into the tables. Share the SQL queries and a screenshot of both tables.

routes.post('/todos', async (req, res) => {
  try {
    const { title, userId } = req.body;
    if (!title) {
      return res.status(401).json({
        status: false,
        message: 'Title is a required field',
      });
    }
    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'UserId is a required field',
      });
    }
    const result = await query(
      `
        INSERT INTO todos (title, user_id)
        values ($1, $2)
        RETURNING *
      `,
      [title, userId],
    );
    return res.status(201).json({
      status: true,
      data: result?.rows,
    });
  } catch (e) {
    console.error({ e });
    throw e;
  }
});

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

// [Q3] Write a SQL query to update the is_completed status of a todo by id. Share a screenshot before and after the update.

routes.patch('/todos/:todoId', async (req, res) => {
  try {
    const { todoId } = req.params;
    const { isCompleted } = req.body;
    if (!todoId) {
      return res.status(401).json({
        status: false,
        message: 'Todo Id not found',
      });
    }
    const updateTodo = await query(
      `
        UPDATE todos
          SET is_completed=$1
        WHERE id=$2
        RETURNING *
      `,
      [isCompleted, todoId],
    );
    return res.status(201).json({
      status: true,
      data: updateTodo?.rows,
    });
  } catch (e) {
    console.log({ e });
    throw e;
  }
});

// [Q4] Write a SQL query to fetch all todos for a specific user, ordered by creation date. Test it with one of your sample users.

routes.get('/todos', async (req, res) => {
  try {
    const { userId } = req.query;

    const reqdTodos = await query(
      `
        SELECT *
        FROM todos
        WHERE user_id=$1
        ORDER BY created_at DESC
      `,
      [userId],
    );
    return res.status(200).json({
      status: true,
      data: reqdTodos?.rows,
    });
  } catch (e) {
    console.error({ e });
    throw e;
  }
});

// [Q6] Write a SQL query to fetch all overdue todos (due date is in the past and is_completed is false) for all users. Order the results by due date.

routes.get('/todos/get-overdue-todo', async (req, res) => {
  try {
    const result = await query(
      `
        SELECT * 
        FROM todos 
        WHERE is_completed = false 
          AND due_date < NOW()
        ORDER BY due_date DESC
      `,
    );
    return res.status(200).json({
      status: true,
      data: result?.rows,
    });
  } catch (e) {
    console.error({ e });
    throw e;
  }
});

routes.get('/todos/group-by-user', async (req, res) => {
  try {
    const result = await query(
      `
        SELECT user_id, count(*) 
        FROM todos 
        GROUP BY user_id
      `,
    );
    return res.status(200).json({
      status: true,
      data: result?.rows,
    });
  } catch (e) {
    console.error({ e });
    throw e;
  }
});

export default app;
