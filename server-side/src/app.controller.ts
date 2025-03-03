import {Controller, Get} from '@nestjs/common';
import {AppService} from './app.service';

@Controller()
export class AppController {

    constructor(private readonly appService: AppService) {
    }

    @Get('health_check')
    getData(): any {
        return {
            message: "Success",
            status: 200,
        };
    }
}
