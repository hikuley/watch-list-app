CREATE TABLE "movies" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"release_year" integer,
	"duration" integer,
	"rating" integer,
	"genre" varchar(50),
	"director" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"country" varchar(255) NOT NULL,
	"age" integer NOT NULL,
	"age2" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
