/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("artists", table => {
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("artists", table => {
    table.dropColumn("user_id");
  });
};
