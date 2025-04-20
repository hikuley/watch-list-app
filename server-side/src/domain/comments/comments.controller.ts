import {Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, Req} from '@nestjs/common';
import {CommentsService} from './comments.service';
import {CreateCommentDto} from './dto/create-comment.dto';
import {UpdateCommentDto} from './dto/update-comment.dto';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth} from '@nestjs/swagger';
import {Comment} from './entities/comment.entity';
import {CacheInterceptor} from "../../common/cash/interceptors/cache.interceptor";
import {CacheEvict, CacheKey, CacheTTL} from "../../common/cash/decorators/cache.decorator";
import {AuthRequired} from "../../common/auth/interceptors/auth.decorator";
import {AuthInterceptor} from "../../common/auth/interceptors/auth.interceptor";

const CACHE_ALL_COMMENTS = 'all_comments';
const CACHE_MOVIE_COMMENTS = 'movie_comments';
const CACHE_USER_COMMENTS = 'user_comments';

@Controller('comments')
@ApiTags('Comments')
@ApiBearerAuth('JWT')
@UseInterceptors(CacheInterceptor)
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {
    }

    @Post()
    @AuthRequired()
    @CacheEvict(CACHE_ALL_COMMENTS)
    @CacheEvict(CACHE_MOVIE_COMMENTS)
    @CacheEvict(CACHE_USER_COMMENTS)
    @ApiOperation({summary: 'Create a new comment'})
    @ApiResponse({status: 201, description: 'The comment has been created successfully.', type: Comment})
    create(@Body() createCommentDto: CreateCommentDto): Promise<Comment> {
        return this.commentsService.create(createCommentDto);
    }

    @Get()
    @AuthRequired()
    @CacheKey(CACHE_ALL_COMMENTS)
    @CacheTTL(3600) // 1 hour
    @ApiOperation({summary: 'Get all comments'})
    @ApiResponse({status: 200, description: 'Return all comments.', type: [Comment]})
    findAll(): Promise<Comment[]> {
        return this.commentsService.findAll();
    }

    @Get('movie/:movieId')
    @AuthRequired()
    @CacheKey(CACHE_MOVIE_COMMENTS)
    @CacheTTL(3600) // 1 hour
    @ApiOperation({summary: 'Get all comments for a specific movie'})
    @ApiResponse({status: 200, description: 'Return all comments for a movie.', type: [Comment]})
    findAllByMovie(@Param('movieId', ParseIntPipe) movieId: number): Promise<Comment[]> {
        return this.commentsService.findAllByMovie(movieId);
    }

    @Get('user/:userId')
    @AuthRequired()
    @CacheKey(CACHE_USER_COMMENTS)
    @CacheTTL(3600) // 1 hour
    @ApiOperation({summary: 'Get all comments by a specific user'})
    @ApiResponse({status: 200, description: 'Return all comments by a user.', type: [Comment]})
    findAllByUser(@Param('userId', ParseIntPipe) userId: number): Promise<Comment[]> {
        return this.commentsService.findAllByUser(userId);
    }

    @Get(':id')
    @AuthRequired()
    @ApiOperation({summary: 'Get a comment by id'})
    @ApiResponse({status: 200, description: 'Return the comment.', type: Comment})
    @ApiResponse({status: 404, description: 'Comment not found.'})
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
        return this.commentsService.findOne(id);
    }

    @Patch(':id')
    @AuthRequired()
    @CacheEvict(CACHE_ALL_COMMENTS)
    @CacheEvict(CACHE_MOVIE_COMMENTS)
    @CacheEvict(CACHE_USER_COMMENTS)
    @ApiOperation({summary: 'Update a comment'})
    @ApiResponse({status: 200, description: 'The comment has been updated successfully.', type: Comment})
    @ApiResponse({status: 404, description: 'Comment not found.'})
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCommentDto: UpdateCommentDto,
        @Req() request: any
    ): Promise<Comment> {
        return this.commentsService.update(id, request.user.id, updateCommentDto);
    }

    @Delete(':id')
    @AuthRequired()
    @CacheEvict(CACHE_ALL_COMMENTS)
    @CacheEvict(CACHE_MOVIE_COMMENTS)
    @CacheEvict(CACHE_USER_COMMENTS)
    @ApiOperation({summary: 'Delete a comment'})
    @ApiResponse({status: 200, description: 'The comment has been deleted successfully.'})
    @ApiResponse({status: 404, description: 'Comment not found.'})
    remove(
        @Param('id', ParseIntPipe) id: number,
        @Req() request: any
    ): Promise<void> {
        return this.commentsService.remove(id, request.user.id);
    }
} 