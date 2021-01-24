import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('login', table => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('email').notNullable().unique();
        table.string('password', 255).notNullable();
        table.string('passwordResetToken', 50)
        table.dateTime('passwordResetExpires')
    })

}

export async function down(knex: Knex) {
    return knex.schema.dropTable('login');
}
