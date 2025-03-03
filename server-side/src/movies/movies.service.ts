import {Injectable, Inject, NotFoundException} from '@nestjs/common';
import {eq} from 'drizzle-orm';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';
import {movies, Movie, NewMovie} from '../db/schema';
import {CreateMovieDto} from './dto/create-movie.dto';
import {UpdateMovieDto} from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
    constructor(
        @Inject('DRIZZLE')
        private db: NodePgDatabase
    ) {
    }

    async create(createMovieDto: CreateMovieDto): Promise<Movie> {
        const newMovie: NewMovie = {
            title: createMovieDto.title,
            description: createMovieDto.description,
            releaseYear: createMovieDto.releaseYear,
            duration: createMovieDto.duration,
            rating: createMovieDto.rating,
            genre: createMovieDto.genre,
            director: createMovieDto.director,
        };

        const [movie] = await this.db.insert(movies).values(newMovie).returning();
        return movie;
    }

    async findAll(): Promise<Movie[]> {
        return await this.db.select().from(movies);
    }

    async findOne(id: number): Promise<Movie> {
        const [movie] = await this.db.select().from(movies).where(eq(movies.id, id));

        if (!movie) {
            throw new NotFoundException(`Movie with ID ${id} not found`);
        }

        return movie;
    }

    async update(id: number, updateMovieDto: UpdateMovieDto): Promise<Movie> {
        await this.findOne(id);

        const [updatedMovie] = await this.db
            .update(movies)
            .set({
                ...updateMovieDto,
                updatedAt: new Date()
            })
            .where(eq(movies.id, id))
            .returning();

        return updatedMovie;
    }

    async remove(id: number): Promise<void> {
        await this.findOne(id);
        await this.db.delete(movies).where(eq(movies.id, id));
    }
}