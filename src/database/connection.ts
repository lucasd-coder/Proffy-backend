import knex from 'knex'
// import path from 'path';
import 'dotenv/config'

const db = knex({
  client: 'pg',
  connection: {
    host:process.env.PG_HOST,
		user:process.env.PG_USER,
		password:process.env.PG_PASSWORD,
    database:process.env.PG_DATABASE,
  },
  useNullAsDefault: true
})

export default db


// const db = knex({
//     client: 'sqlite3',
//     connection: {
//         filename: path.resolve(__dirname, 'database.sqlite')
//     },
//     useNullAsDefault: true,

// });

// export default db;

