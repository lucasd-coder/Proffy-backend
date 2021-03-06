import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema
             .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
             .createTable('class_schedule', table => {
        table.uuid('id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v4()'));

        table.integer('week_day').notNullable();
        table.integer('from').notNullable();
        table.integer('to').notNullable();


        table.uuid('class_id')
            .notNullable()
            .references('id')
            .inTable('classes')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('class_schedule');
}