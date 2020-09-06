import path from 'path';
import 'dotenv/config';

module.exports = {
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'database', 'database.sqlite')
    },
    migrations: {
        directory: path.resolve(__dirname, 'database', 'migrations')
    },
    useNullAsDefault: true,

}