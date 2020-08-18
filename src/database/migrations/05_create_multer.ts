import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('fotos', table => {
        table.increments('id').primary();
        table.string('originalname').notNullable().defaultTo('');
        table.string('filename').notNullable().defaultTo('');
        table.string('image').notNullable();

        table.integer('foto_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });

}

export async function down(knex: Knex) {
    return knex.schema.dropTable('fotos');
}
