import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    async comparePasswords(
        plainTextPassword: string,
        hashedPassword: string
    ): Promise<boolean> {
        return bcrypt.compare(plainTextPassword, hashedPassword);
    }
}