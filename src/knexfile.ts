import path from 'path'
import 'dotenv/config'

module.exports = {
  client: 'pg',
  connection: {
    host:process.env.PG_HOST,
		user:process.env.PG_USER,
		password:process.env.PG_PASSWORD,
    database:process.env.PG_DATABASE,
  },
  migrations: {
    directory: path.resolve(__dirname ,'database', 'migrations')
  },
  useNullAsDefault: true
}


// module.exports = {
//     client: 'sqlite3',
//     connection: {
//         filename: path.resolve(__dirname, 'database', 'database.sqlite')
//     },
//     migrations: {
//         directory: path.resolve(__dirname, 'database', 'migrations')
//     },
//     useNullAsDefault: true,

// }

