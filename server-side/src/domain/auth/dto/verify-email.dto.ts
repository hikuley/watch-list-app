import {IsEmail, IsNotEmpty, IsString, Length} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class VerifyEmailDto {
    @ApiProperty({
        example: 'sim.reichel@ethereal.email',
        description: 'Email address to verify'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'Six-digit verification code sent to email',
        minLength: 6,
        maxLength: 6
    })
    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    verificationCode: string;
}