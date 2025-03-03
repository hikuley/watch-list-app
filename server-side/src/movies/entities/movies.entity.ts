import {ApiProperty} from '@nestjs/swagger';

export class Movie {
    @ApiProperty({example: 1, description: 'Unique identifier'})
    id: number;

    @ApiProperty({example: 'The Matrix', description: 'Movie title'})
    title: string;

    @ApiProperty({example: 'A computer programmer discovers...', description: 'Movie description', nullable: true})
    description: string | null;

    @ApiProperty({example: 1999, description: 'Release year', nullable: true})
    releaseYear: number | null;

    @ApiProperty({example: 136, description: 'Duration in minutes', nullable: true})
    duration: number | null;

    @ApiProperty({example: 8, description: 'Rating from 0 to 10', nullable: true})
    rating: number | null;

    @ApiProperty({example: 'Sci-Fi', description: 'Movie genre', nullable: true})
    genre: string | null;

    @ApiProperty({example: 'Lana Wachowski', description: 'Movie director', nullable: true})
    director: string | null;

    @ApiProperty({description: 'Creation timestamp', nullable: true})
    createdAt: Date | null;

    @ApiProperty({description: 'Last update timestamp', nullable: true})
    updatedAt: Date | null;
}