import {Controller, Get} from '@nestjs/common';
import {AppService} from './app.service';

@Controller()
export class AppController {

    constructor(private readonly appService: AppService) {
    }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('api/data')
    getData(): any {
        return {
            message: "Success",
            data: {
                id: 1,
                name: "Sample Data",
                description: "This is a sample JSON response",
                timestamp: new Date().toISOString()
            },
            status: 200
        };
    }
}
