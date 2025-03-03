import {Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe} from '@nestjs/common';
import {MoviesService} from './movies.service';
import {CreateMovieDto} from './dto/create-movie.dto';
import {UpdateMovieDto} from './dto/update-movie.dto';
import {Movie} from '../db/schema';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {
    }

    @Post()
    create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
        return this.moviesService.create(createMovieDto);
    }

    @Get()
    findAll(): Promise<Movie[]> {
        return this.moviesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
        return this.moviesService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateMovieDto: UpdateMovieDto,
    ): Promise<Movie> {
        return this.moviesService.update(id, updateMovieDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.moviesService.remove(id);
    }
}