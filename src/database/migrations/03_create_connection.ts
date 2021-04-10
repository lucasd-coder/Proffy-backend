import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema
             .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
             .createTable('connections', table => {
        table.uuid('id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v4()'));

        table.uuid('user_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');

        table.timestamp('created_at')
            .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
            .notNullable();
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('connections');
}