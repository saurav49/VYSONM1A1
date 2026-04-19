import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { query } from '../db/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migration() {
  const MIGRATION_DIR = path.join(__dirname, '../migrations');
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
    const files = fs
      .readdirSync(MIGRATION_DIR, {
        recursive: true,
      })
      .sort()
      .slice(1);
    console.log({ files });
    for (const file of files) {
      const migrationDone = await query(
        `
          SELECT id
          FROM migrations
          WHERE name = $1
        `,
        [file],
      );
      if (
        migrationDone &&
        migrationDone?.rowCount &&
        migrationDone.rowCount > 0
      ) {
        continue;
      }
      const fileContent = fs.readFileSync(
        path.join(__dirname, '../migrations', file as string),
      );
      await query(fileContent.toString());
      await query(
        `
          INSERT INTO migrations (name)
          VALUES ($1)
        `,
        [file],
      );
    }
  } catch (e) {
    console.error(e);
  }
}
// '/Users/sauravbiswas/Desktop/workspace/VYSONM1/src/migrations'
migration();
