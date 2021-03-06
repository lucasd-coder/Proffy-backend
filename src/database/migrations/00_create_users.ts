import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema
             .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
             .createTable('users', table => {
        table.uuid('id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('name').notNullable();
        table.string('whatsapp').notNullable();
        table.string('bio').notNullable();

    })
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('users');
}