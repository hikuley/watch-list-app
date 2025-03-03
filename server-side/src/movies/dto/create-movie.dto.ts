import {IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max, Length} from 'class-validator';

export class CreateMovieDto {
    @IsNotEmpty()
    @IsString()
    @Length(1, 100)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(1900)
    releaseYear?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    duration?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    rating?: number;

    @IsOptional()
    @IsString()
    genre?: string;

    @IsOptional()
    @IsString()
    director?: string;
}