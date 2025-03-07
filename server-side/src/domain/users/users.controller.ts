import {Controller, Get} from '@nestjs/common';
import {AuthRequired} from "../../common/auth/interceptors/auth.decorator";

@Controller('users')
export class UsersController {

    @Get()
    @AuthRequired()
    getUsers() {
        return 'hello';
    }

}
