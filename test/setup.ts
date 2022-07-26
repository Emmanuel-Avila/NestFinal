import { promises as fs } from 'fs';
import { join } from 'path';
import { getConnection } from 'typeorm'

global.beforeEach(async () => {
  try {
    await fs.rm(join(__dirname, '..', 'test.sqlite'));
  } catch (error) {
    console.log(error)
  }
});

global.afterEach(async () => {
  const conn = getConnection()
  await conn.close()
})