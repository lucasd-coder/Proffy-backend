import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('fotos', table => {
        table.increments('id').primary();
        table.string('originalname').notNullable();
        table.string('filename').notNullable();
        table.string('url').notNullable();

        table.integer('foto_id')
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
