import { query } from '../db/client';
import { faker } from '@faker-js/faker';

const INTERATIONS = 1000000;
const BATCH_SIZE = 3000;

async function addUser() {
  for (let i = 0; i < INTERATIONS; i += BATCH_SIZE) {
    try {
      const start = performance.now();
      await query('BEGIN');
      let values = [];
      for (let j = 0; j < BATCH_SIZE; j++) {
        const name = faker.internet.username();
        const email = faker.internet.email();
        values.push(`(${name},${email})`);
      }
      await query(
        `
                INSERT INTO user (name, email)
                VALUES ()
            `,
        [values.join(',')],
      );
      await query('COMMIT');
      const end = performance.now();
      console.log(
        `API (/batch-insert-1million-user) took ${(end - start).toFixed(2)} ms`,
      );
    } catch (e) {
      console.error({ e });
      await query('ROLLBACK');
    }
  }
}
addUser();
