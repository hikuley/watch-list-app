import {boolean, integer, pgTable, serial, text, timestamp, varchar} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    isVerified: boolean('is_verified').default(false),
    verificationCode: varchar('verification_code', { length: 6 }),
    verificationCodeExpiry: timestamp('verification_code_expiry'),
    createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const movies = pgTable('movies', {
    id: serial('id').primaryKey(),
    title: varchar('title', {length: 100}).notNull(),
    description: text('description'),
    releaseYear: integer('release_year'),
    duration: integer('duration'),
    rating: integer('rating'),
    genre: varchar('genre', {length: 50}),
    director: varchar('director', {length: 100}),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

// Types for our movie entity
export type Movie = typeof movies.$inferSelect;
export type NewMovie = typeof movies.$inferInsert;