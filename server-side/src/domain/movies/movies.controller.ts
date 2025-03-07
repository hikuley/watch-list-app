import {Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors} from '@nestjs/common';
import {MoviesService} from './movies.service';
import {CreateMovieDto} from './dto/create-movie.dto';
import {UpdateMovieDto} from './dto/update-movie.dto';

import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth} from '@nestjs/swagger';
import {Movie} from "./entities/movies.entity";
import {CacheInterceptor} from "../../common/cash/interceptors/cache.interceptor";
import {CacheEvict, CacheKey, CacheTTL} from "../../common/cash/decorators/cache.decorator";
import {AuthRequired} from "../auth/interceptors/auth.decorator";
import {AuthInterceptor} from "../auth/interceptors/auth.interceptor";

const CASH_ALL_MOVIES = 'all_movies';

@Controller('movies')
@ApiTags('Movies')
@ApiBearerAuth('JWT')
@UseInterceptors(CacheInterceptor)
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {
    }

    @Post()
    @AuthRequired()
    @CacheEvict(CASH_ALL_MOVIES)
    @ApiOperation({summary: 'Create a new movie'})
    @ApiResponse({status: 201, description: 'The movie has been created successfully.', type: Movie})
    create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
        return this.moviesService.create(createMovieDto);
    }

    @Get()
    @AuthRequired()
    @CacheKey(CASH_ALL_MOVIES)
    @CacheTTL(3600) // 1 hour
    @ApiOperation({summary: 'Get all movies'})
    @ApiResponse({status: 200, description: 'Return all movies.', type: [Movie]})
    findAll(): Promise<Movie[]> {
        return this.moviesService.findAll();
    }

    @Get(':id')
    @AuthRequired()
    @CacheKey(CASH_ALL_MOVIES)
    @CacheTTL(3600) // 1 hour
    @ApiOperation({summary: 'Get a movie by id'})
    @ApiResponse({status: 200, description: 'Return the movie.', type: Movie})
    @ApiResponse({status: 404, description: 'Movie not found.'})
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
        return this.moviesService.findOne(id);
    }

    @Patch(':id')
    @AuthRequired()
    @CacheEvict(CASH_ALL_MOVIES)
    @ApiOperation({summary: 'Update a movie'})
    @ApiResponse({status: 200, description: 'The movie has been updated successfully.', type: Movie})
    @ApiResponse({status: 404, description: 'Movie not found.'})
    update(@Param('id', ParseIntPipe) id: number, @Body() updateMovieDto: UpdateMovieDto,): Promise<Movie> {
        return this.moviesService.update(id, updateMovieDto);
    }

    @Delete(':id')
    @AuthRequired()
    @CacheEvict(CASH_ALL_MOVIES)
    @ApiOperation({summary: 'Delete a movie'})
    @ApiResponse({status: 200, description: 'The movie has been deleted successfully.'})
    @ApiResponse({status: 404, description: 'Movie not found.'})
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.moviesService.remove(id);
    }
}