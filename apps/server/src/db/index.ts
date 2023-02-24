import { Pool } from 'pg';
import { PG_DATABASE, PG_HOST, PG_PASSWORD, PG_PORT, PG_USER } from '@server/config';

export const pool = new Pool({
  user: PG_USER,
  host: PG_HOST,
  database: PG_DATABASE,
  password: PG_PASSWORD,
  port: PG_PORT
});
