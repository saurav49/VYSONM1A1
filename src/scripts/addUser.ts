import { query } from '../db/client';
import { faker } from '@faker-js/faker';

const INTERATIONS = 1;
const BATCH_SIZE = 1;

async function addUser() {
  const start = performance.now();
  for (let i = 0; i < INTERATIONS; i += BATCH_SIZE) {
    try {
      await query('BEGIN');
      let values = [];
      for (let j = 0; j < BATCH_SIZE; j++) {
        values.push(
          `(${faker.internet.displayName()}, ${faker.internet.email()})`,
        );
      }
      console.log(`
                  INSERT INTO users (name, email)
                  VALUES ${values.join(',')}
                  ON CONFLICT (id) DO NOTHING
                  RETURNING *
              `);
      const result = await query(
        `
                  INSERT INTO users (name, email)
                  VALUES ${values.join(',')}
                  ON CONFLICT (id) DO NOTHING
                  RETURNING *
              `,
      );
      let failedCount = result?.rowCount
        ? values.length - result.rowCount
        : values.length;
      let failedInserts = [];
      while (failedCount > 0) {
        for (let k = 0; k < failedCount; k++) {
          failedInserts.push(
            `(${faker.internet.displayName()}, ${faker.internet.email()})`,
          );
        }
        const result = await query(`
                INSERT INTO users (name, email)
                VALUES ${failedInserts.join(',')}
                RETURNING *
            `);
        failedCount = result?.rowCount
          ? values.length - result.rowCount
          : values.length;
      }
      await query('COMMIT');
    } catch (e) {
      console.error({ e });
      await query('ROLLBACK');
    }
  }
  const end = performance.now();
  console.log(
    `API (/batch-insert-1million-user) took ${(end - start).toFixed(2)} ms`,
  );
}
addUser();
