import {IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max, Length} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class CreateMovieDto {
    @ApiProperty({example: 'The Matrix', description: 'The title of the movie'})
    @IsNotEmpty()
    @IsString()
    @Length(1, 100)
    title: string;

    @ApiProperty({required: false, example: 'A computer programmer discovers a mysterious world...', description: 'Movie description'})
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({required: false, example: 1999, description: 'Year of release'})
    @IsOptional()
    @IsNumber()
    @Min(1900)
    releaseYear?: number;

    @ApiProperty({required: false, example: 136, description: 'Duration in minutes'})
    @IsOptional()
    @IsNumber()
    @Min(1)
    duration?: number;

    @ApiProperty({required: false, example: 8, description: 'Rating from 0 to 10'})
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    rating?: number;

    @ApiProperty({required: false, example: 'Sci-Fi', description: 'Movie genre'})
    @IsOptional()
    @IsString()
    genre?: string;

    @ApiProperty({required: false, example: 'Lana Wachowski', description: 'Movie director'})
    @IsOptional()
    @IsString()
    director?: string;
}