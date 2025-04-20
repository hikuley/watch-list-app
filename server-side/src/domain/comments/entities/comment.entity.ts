import {ApiProperty} from '@nestjs/swagger';

export class Comment {
    @ApiProperty({example: 1, description: 'Unique identifier'})
    id: number;

    @ApiProperty({example: 1, description: 'User ID who created the comment'})
    userId: number;

    @ApiProperty({example: 1, description: 'Movie ID the comment is about'})
    movieId: number;

    @ApiProperty({example: 'Great movie, I enjoyed it a lot!', description: 'Comment text'})
    comment: string;

    @ApiProperty({description: 'Creation timestamp', nullable: true})
    createdAt: Date | null;

    @ApiProperty({description: 'Last update timestamp', nullable: true})
    updatedAt: Date | null;
} 