import {Body, Controller, Param, Post, ValidationPipe} from '@nestjs/common';
import {AuthService} from './services/auth.service';
import {SignupDto} from './dto/signup.dto';
import {VerifyEmailDto} from './dto/verify-email.dto';
import {ApiTags, ApiOperation, ApiResponse} from '@nestjs/swagger';

import LoginDto from "./dto/login.dto";
import {TokenDto} from "./dto/token.dto";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('signup')
    @ApiOperation({summary: 'Register a new user'})
    @ApiResponse({status: 201, description: 'User has been successfully registered.', type: SignupDto})
    @ApiResponse({status: 400, description: 'Bad Request - Invalid input data.'})
    async signup(@Body(new ValidationPipe()) signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }

    @Post('verify-email')
    @ApiOperation({summary: 'Verify user email address'})
    @ApiResponse({status: 200, description: 'Email has been successfully verified.'})
    @ApiResponse({status: 400, description: 'Bad Request - Invalid verification code.'})
    @ApiResponse({status: 404, description: 'Not Found - Email not found.'})
    async verifyEmail(@Body(new ValidationPipe()) verifyEmailDto: VerifyEmailDto) {
        return this.authService.verifyEmail(verifyEmailDto);
    }

    @Post('login')
    @ApiOperation({summary: 'Login user'})
    @ApiResponse({status: 200, description: 'User has been successfully logged in.', type: TokenDto})
    @ApiResponse({status: 400, description: 'Bad Request - Invalid input data.'})
    @ApiResponse({status: 401, description: 'Unauthorized - Invalid email or password.'})
    async login(@Body(new ValidationPipe()) loginDto: LoginDto): Promise<TokenDto> {
        return this.authService.login(loginDto);
    }

    @Post('logout/:token')
    @ApiOperation({summary: 'Logout user'})
    @ApiResponse({status: 200, description: 'User has been successfully logged out.'})
    @ApiResponse({status: 400, description: 'Bad Request - Invalid token.'})
    @ApiResponse({status: 401, description: 'Unauthorized - Invalid token.'})
    async logout(@Param('token') token: string) {
        return this.authService.logout(token);
    }


}