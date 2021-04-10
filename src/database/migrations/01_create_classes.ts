import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema
             .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
             .createTable('classes', table => {
        table.uuid('id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('subject').notNullable();
        table.decimal('cost').notNullable();

        table.uuid('user_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('classes');
}