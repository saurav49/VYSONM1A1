import { query } from '../db/client';

const INTERATIONS = 1000000;
const BATCH_SIZE = 5000;

async function batchInsertUser() {
  const start = performance.now();
  for (let i = 0; i < INTERATIONS; i += BATCH_SIZE) {
    try {
      await query('BEGIN');
      let values = [];
      for (let j = 0; j < BATCH_SIZE; j++) {
        values.push(`('user_${i + j}@example.com', 'user_${i + j}')`);
      }
      await query(
        `
                  INSERT INTO users (name, email)
                  VALUES ${values.join(',')}
                  ON CONFLICT (email) DO NOTHING
              `,
      );
      // NOTE: RETRY LOGIC IF NEEDED BUT SINCE THE WAY WE ARE GENERATING THE DATA IT GURANTEE UNIQUENESS, SO HERE WE DONT NEED RETRY LOGIC
      // let failedCount = result?.rowCount
      //   ? values.length - result.rowCount
      //   : values.length;
      // while (failedCount > 0) {
      //   let failedInserts = [];
      //   console.log(`Failed batch : ${i / BATCH_SIZE}, count: ${failedCount}`);
      //   for (let k = 0; k < failedCount; k++) {
      //     failedInserts.push(
      //       `('${faker.internet.displayName()}', '${faker.internet.email()}')`,
      //     );
      //   }
      //   const result = await query(`
      //           INSERT INTO users (name, email)
      //           VALUES ${failedInserts.join(',')}
      //           ON CONFLICT (email) DO NOTHING
      //           RETURNING *
      //       `);
      //   failedCount = result?.rowCount
      //     ? failedCount - result.rowCount
      //     : failedCount;
      // }
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
batchInsertUser();
