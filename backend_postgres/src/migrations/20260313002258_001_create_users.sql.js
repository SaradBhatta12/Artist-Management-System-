/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {

  return knex.schema.createTable("users", table => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password").notNullable();
    table.string("phone").notNullable();
    table.enum("role", ["super_admin", "artist", "artist_manager", "user"]).notNullable().defaultTo("user");
    table.date("dob");
    table.enum("gender", ["male", "female", "other"]);
    table.string("address");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users")
};
