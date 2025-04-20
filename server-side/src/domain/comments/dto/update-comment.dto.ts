import {IsOptional, IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {PartialType} from '@nestjs/swagger';
import {CreateCommentDto} from './create-comment.dto';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
    @ApiProperty({example: 'Updated comment text', description: 'Comment text', required: false})
    @IsOptional()
    @IsString()
    comment?: string;
} 