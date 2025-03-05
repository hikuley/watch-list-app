import * as schema from '../../db/schema';
import {ConflictException, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';
import {and, eq} from 'drizzle-orm';
import {SignupDto} from '../dto/signup.dto';
import {VerifyEmailDto} from '../dto/verify-email.dto';
import {PasswordService} from './password.service';
import {generateVerificationCode} from '../../utils/generate-verification-code';

@Injectable()
export class AuthService {
    constructor(
        @Inject('DB_INSTANCE')
        private db: NodePgDatabase<typeof schema>,
        private passwordService: PasswordService,
    ) {
    }

    async signup(signupDto: SignupDto) {
        const {email, password, firstName, lastName} = signupDto;

        // Check if user already exists
        const existingUser = await this.db.query.users.findFirst({
            where: eq(schema.users.email, email)
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await this.passwordService.hashPassword(password);

        // Generate verification code
        const verificationCode = generateVerificationCode();
        const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Create user
        const [newUser] = await this.db
            .insert(schema.users)
            .values({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                verificationCode,
                verificationCodeExpiry,
                isVerified: false
            })
            .returning();

        // Send verification email via Kafka
        // this.kafkaClient.emit('send_verification_email', JSON.stringify({
        //     email: newUser.email,
        //     verificationCode: verificationCode
        // }));


        return {
            message: 'User registered successfully. Please check your email for verification.',
            userId: newUser.id
        };
    }

    async verifyEmail(verifyEmailDto: VerifyEmailDto) {
        const {email, verificationCode} = verifyEmailDto;

        const user = await this.db.query.users.findFirst({
            where: and(
                eq(schema.users.email, email),
                eq(schema.users.verificationCode, verificationCode)
            )
        });

        if (!user) {
            throw new UnauthorizedException('Invalid verification code');
        }

        // Check if verification code is expired
        if (user.verificationCodeExpiry! < new Date()) {
            throw new UnauthorizedException('Verification code has expired');
        }

        // Update user as verified
        await this.db
            .update(schema.users)
            .set({
                isVerified: true,
                verificationCode: null,
                verificationCodeExpiry: null
            })
            .where(eq(schema.users.id, user.id));

        return {
            message: 'Email verified successfully',
            userId: user.id
        };
    }
}