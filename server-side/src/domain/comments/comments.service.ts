import {Injectable, Inject, NotFoundException} from '@nestjs/common';
import {eq, and} from 'drizzle-orm';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';
import {comments, Comment, NewComment} from '../../config/database/schema';
import {CreateCommentDto} from './dto/create-comment.dto';
import {UpdateCommentDto} from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
    constructor(
        @Inject('DB_INSTANCE')
        private db: NodePgDatabase
    ) {
    }

    async create(createCommentDto: CreateCommentDto): Promise<Comment> {
        const newComment: NewComment = {
            userId: createCommentDto.userId,
            movieId: createCommentDto.movieId,
            comment: createCommentDto.comment,
        };

        const [comment] = await this.db.insert(comments).values(newComment).returning();
        return comment;
    }

    async findAll(): Promise<Comment[]> {
        return await this.db.select().from(comments);
    }

    async findAllByMovie(movieId: number): Promise<Comment[]> {
        return await this.db.select().from(comments).where(eq(comments.movieId, movieId));
    }

    async findAllByUser(userId: number): Promise<Comment[]> {
        return await this.db.select().from(comments).where(eq(comments.userId, userId));
    }

    async findOne(id: number): Promise<Comment> {
        const [comment] = await this.db.select().from(comments).where(eq(comments.id, id));

        if (!comment) {
            throw new NotFoundException(`Comment with ID ${id} not found`);
        }

        return comment;
    }

    async update(id: number, userId: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
        const [existingComment] = await this.db
            .select()
            .from(comments)
            .where(eq(comments.id, id));

        if (!existingComment) {
            throw new NotFoundException(`Comment with ID ${id} not found`);
        }

        // Ensure the user owns this comment
        if (existingComment.userId !== userId) {
            throw new NotFoundException(`Comment with ID ${id} not found`);
        }

        const updateData = {
            comment: updateCommentDto.comment,
            updatedAt: new Date()
        };

        const [updatedComment] = await this.db
            .update(comments)
            .set(updateData)
            .where(eq(comments.id, id))
            .returning();

        return updatedComment;
    }

    async remove(id: number, userId: number): Promise<void> {
        const [existingComment] = await this.db
            .select()
            .from(comments)
            .where(eq(comments.id, id));

        if (!existingComment) {
            throw new NotFoundException(`Comment with ID ${id} not found`);
        }

        // Ensure the user owns this comment
        if (existingComment.userId !== userId) {
            throw new NotFoundException(`Comment with ID ${id} not found`);
        }

        await this.db.delete(comments).where(eq(comments.id, id));
    }
} 