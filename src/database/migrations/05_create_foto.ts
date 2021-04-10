import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema
             .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
             .createTable('fotos', table => {
        table.uuid('id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('originalname');
        table.string('filename');
        table.string('url');

        table.uuid('foto_id')
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
    return knex.schema.dropTable('fotos');
}
