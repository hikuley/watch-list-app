import {pgTable, serial, varchar, text, integer, timestamp} from 'drizzle-orm/pg-core';


export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({length: 255}).notNull(),
    country: varchar({length: 255}).notNull(),
    age: integer().notNull(),
    email: varchar({length: 255}).notNull().unique(),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export const movies = pgTable('movies', {
    id: serial('id').primaryKey(),
    title: varchar('title', {length: 100}).notNull(),
    description: text('description'),
    releaseYear: integer('release_year'),
    duration: integer('duration'),
    rating: integer('rating').default(0),
    genre: varchar('genre', {length: 50}),
    director: varchar('director', {length: 100}),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

// Types for our movie entity
export type Movie = typeof movies.$inferSelect;
export type NewMovie = typeof movies.$inferInsert;