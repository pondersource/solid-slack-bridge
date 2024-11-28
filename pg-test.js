import pg from 'pg';
const { Client } = pg;
const client = new Client({
  user: 'tubs',
  password: process.env.PGPASS,
  database: 'tubs',
  host: '127.0.0.1'
});
await client.connect();
const thisChunk = 1;
const numChunk = 2;
const res = await client.query('SELECT * from slackers', []);
console.log(res.rows);
await client.end();
