import {IsNotEmpty, IsString, IsNumber, IsPositive} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty({example: 1, description: 'User ID who created the comment'})
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    userId: number;

    @ApiProperty({example: 1, description: 'Movie ID the comment is about'})
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    movieId: number;

    @ApiProperty({example: 'Great movie, I enjoyed it a lot!', description: 'Comment text'})
    @IsNotEmpty()
    @IsString()
    comment: string;
} 