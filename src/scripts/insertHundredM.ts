import { nanoid } from 'nanoid';
import { query } from '../config/db';
import { batchInsert } from './batchInsert';

async function insertHundredM() {
  try {
    const start = performance.now();
    const ITERATION = 100000000;
    const BATCH = 1000;
    for (let i = 0; i < ITERATION; i += BATCH) {
      try {
        await query('BEGIN');
        let failedInserts: Array<string> = [];
        const batchValues = [];
        let values: Array<string> = [];
        for (let j = 0; j < BATCH; j++) {
          const randomNum = i + j;
          const originalUrl = `https://google.com/${randomNum}`;
          let shortCode = '';
          shortCode = nanoid(10);
          values.push(`('${originalUrl}', '${shortCode}')`);
          batchValues.push(originalUrl);
        }
        const tempFailedInserts = await batchInsert({
          values,
          batchValues,
        });
        failedInserts.push(...tempFailedInserts);
        while (failedInserts.length > 0) {
          console.log(`Failed batch: ${i}`);
          const redoInserts = failedInserts.map((url) => {
            const shortCode = nanoid(10);
            return `('${url}', '${shortCode}')`;
          });
          failedInserts = await batchInsert({
            values: redoInserts,
            batchValues: failedInserts,
          });
        }
        await query('COMMIT'); // use to group multiple operations
      } catch (e) {
        await query('ROLLBACK');
      }
    }
    const end = performance.now();
    console.log(`100M rows inserted successfully`);
    console.log(
      `API (/batch-insert-short-hundred-million) took ${(end - start).toFixed(2)} ms`,
    );
  } catch (e) {
    console.log(e);
  }
}

insertHundredM();
