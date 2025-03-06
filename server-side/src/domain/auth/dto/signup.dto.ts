import {IsEmail, IsNotEmpty, IsString, MinLength, MaxLength} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class SignupDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User\'s email address'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'John',
        description: 'User\'s first name',
        minLength: 2,
        maxLength: 50
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;

    @ApiProperty({
        example: 'Doe',
        description: 'User\'s last name',
        minLength: 2,
        maxLength: 50
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    lastName: string;

    @ApiProperty({
        example: 'Password123',
        description: 'User\'s password',
        minLength: 8,
        maxLength: 32
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    password: string;
}