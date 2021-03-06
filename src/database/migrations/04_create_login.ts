import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema
             .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
             .createTable('login', table => {
        table.uuid('id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('name', 255).notNullable();
        table.string('surname', 255).notNullable();
        table.string('email').notNullable().unique();
        table.string('password', 255).notNullable();
        table.string('passwordResetToken', 50)
        table.dateTime('passwordResetExpires')
    })

}

export async function down(knex: Knex) {
    return knex.schema.dropTable('login');
}
