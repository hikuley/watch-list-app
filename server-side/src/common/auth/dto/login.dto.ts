import {IsEmail, IsString, IsNotEmpty, MinLength, MaxLength} from "class-validator";
import {ApiProperty} from '@nestjs/swagger';

class LoginDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User\'s email address'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

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

export default LoginDto;