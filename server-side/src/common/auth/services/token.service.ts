import {Inject, Injectable} from '@nestjs/common';
import {and, eq, gt, lt} from 'drizzle-orm';


import {NewToken, Token, tokens} from "../../../config/database/schema";
import {NodePgDatabase} from "drizzle-orm/node-postgres";
import {TokenDto} from "../dto/token.dto";
import {JwtService} from "@nestjs/jwt";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {Cache} from "cache-manager";

@Injectable()
export class TokenService {

    constructor(
        @Inject('DB_INSTANCE')
        private db: NodePgDatabase,
        private jwtService: JwtService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {
    }

    private auth_cash_key = 'auth_token';

    private getCacheKey(token: string): string {
        return `${this.auth_cash_key}:${token}`;
    }

    async generateJWT(userId: number, userEmail: string): Promise<TokenDto> {
        const payload = {sub: userId, email: userEmail};
        const token = this.jwtService.sign(payload);
        const expiresAt = this.calculateExpiryDate(24);

        const tokenDto = new TokenDto();
        tokenDto.token = token;
        tokenDto.expiresAt = expiresAt;

        await this.saveToken(userId, token, expiresAt);

        return tokenDto;
    }

    private calculateExpiryDate(hours: number): Date {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + hours);
        return expiresAt;
    }

    async saveToken(userId: number, token: string, expiresAt: Date): Promise<Token> {

        const storeInCache = async (tk: string, uid: number, exp: Date) => {
            const ttl: number = Math.floor((exp.getTime() - Date.now()) / 1000);
            await this.cacheManager.set(this.getCacheKey(tk), uid, ttl);
        };

        // Check if token already exists
        const existingToken = await this.db
            .select()
            .from(tokens)
            .where(eq(tokens.userId, userId))
            .limit(1);

        // Update token if it already exists
        if (Array.isArray(existingToken) && existingToken[0]) {
            const [updatedToken] = await this.db
                .update(tokens)
                .set({
                    token,
                    expiresAt,
                    isValid: true
                })
                .where(eq(tokens.userId, userId))
                .returning();

            return updatedToken;
        } else {
            // Create new token
            const newToken: NewToken = {
                userId,
                token,
                expiresAt,
            };

            const [savedToken] = await this.db
                .insert(tokens)
                .values(newToken)
                .returning();

            // Store in Redis for fast access
            await storeInCache(token, userId, expiresAt);

            return savedToken;
        }
    }

    async findByToken(token: string): Promise<Token | undefined> {
        // Check cache first
        const cachedToken = await this.cacheManager.get<Token>(`${this.auth_cash_key}:${token}`);
        if (cachedToken) {
            return cachedToken;
        }

        // If not found in cache, query the database
        const [foundToken] = await this.db
            .select()
            .from(tokens)
            .where(
                and(
                    eq(tokens.token, token),
                    eq(tokens.isValid, true),
                    gt(tokens.expiresAt, new Date()) // Compare timestamps
                )
            )
            .limit(1);

        // Store the result in cache
        if (foundToken) {
            const ttl = Math.floor((foundToken.expiresAt.getTime() - Date.now()) / 1000);
            await this.cacheManager.set(this.getCacheKey(token), foundToken, ttl);
        }

        return foundToken;
    }

    async validateToken(token: string): Promise<boolean> {
        const storedToken = await this.findByToken(token);
        if (!storedToken) return false;

        // Check if token is expired
        if (storedToken.expiresAt < new Date()) {
            await this.invalidateToken(token);
            return false;
        }

        return true;
    }


    async invalidateToken(token: string): Promise<void> {
        await this.db
            .update(tokens)
            .set({isValid: false})
            .where(eq(tokens.token, token));

        // Delete from cache
        await this.cacheManager.del(this.getCacheKey(token));

    }

    async cleanExpiredTokens(): Promise<void> {
        const now = new Date();
        await this.db
            .update(tokens)
            .set({isValid: false})
            .where(
                and(
                    eq(tokens.isValid, true),
                    // Compare timestamps
                    lt(tokens.expiresAt, now)
                )
            );

        // Delete from cache
        const expiredTokens = await this.db
            .select()
            .from(tokens)
            .where(
                and(
                    eq(tokens.isValid, false),
                    lt(tokens.expiresAt, now)
                )
            );

        for (const token of expiredTokens) {
            await this.cacheManager.del(this.getCacheKey(token.token));
        }

    }

    async getUserTokens(userId: number): Promise<Token[]> {
        return this.db
            .select()
            .from(tokens)
            .where(
                and(
                    eq(tokens.userId, userId),
                    eq(tokens.isValid, true)
                )
            );
    }

    async invalidateUserTokens(userId: number): Promise<void> {
        await this.db
            .update(tokens)
            .set({isValid: false})
            .where(eq(tokens.userId, userId));

        // Delete from cache
        const userTokens = await this.getUserTokens(userId);
        for (const token of userTokens) {
            await this.cacheManager.del(this.getCacheKey(token.token));
        }
    }
}