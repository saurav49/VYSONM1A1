import { query } from '../db/client';

const INTERATIONS = 10000000;
const TOTAL_USERS = 1000000;
const BATCH_SIZE = 7500;
const status = ['pending', 'in_progress', 'completed'];
const baseDate = new Date();

async function batchInsertTodo() {
  const start = performance.now();
  for (let i = 0; i < INTERATIONS; i += BATCH_SIZE) {
    try {
      let values = [];
      for (let j = 0; j < BATCH_SIZE; j++) {
        const date = new Date(baseDate);
        const randomNumberForStatus = Math.floor(Math.random() * 3);
        date.setDate(date.getDate() + randomNumberForStatus);
        const randomUserNumber = Math.floor(Math.random() * TOTAL_USERS) + 1;
        const currentStatus = status[randomNumberForStatus];
        values.push(
          `('title_${i + j}', ${randomUserNumber}, '${date.toISOString()}', '${currentStatus}', 'desc_${i + j}')`,
        );
      }
      await query(
        `
                  INSERT INTO todos (title, user_id, due_date, status, description)
                  VALUES ${values.join(',')}
              `,
      );
    } catch (e) {
      console.error({ e });
    }
  }
  const end = performance.now();
  console.log(
    `API (/batch-insert-1million-todos) took ${(end - start).toFixed(2)} ms`,
  );
}
batchInsertTodo();
