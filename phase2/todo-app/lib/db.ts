import { sql } from '@vercel/postgres';

export { sql };
export const query = sql.query;
