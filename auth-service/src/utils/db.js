import * as pg from 'pg';
import config from './config.js';
const { Pool } = pg.default;

const pool = new Pool({
    user: config.db_user,
    host: config.db_host,
    database: config.db_database,
    password: config.db_password,
    port: config.db_port,
});

export default pool;
