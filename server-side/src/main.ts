import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import {ConfigService} from "@nestjs/config";


async function configureKafkaConsumer(app: INestApplication<any>) {
    const configService = app.get(ConfigService);

    const kafkaBrokers = configService.getOrThrow<string>('KAFKA_BROKERS');
    const groupId = configService.getOrThrow<string>('KAFKA_CONSUMER_GROUP_ID');

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: {
                brokers: kafkaBrokers.split(','),
            },
            consumer: {
                groupId: groupId,
            },
        },
    });
    await app.startAllMicroservices();
}

async function configureSwaggerDoc(app: INestApplication<any>) {
    const config = new DocumentBuilder()
        .setTitle('Watch List API')
        .setDescription('Watch List API description')
        .setVersion('1.0')
        // Configure JWT Bearer token auth
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT', // This name must match the one used in @ApiBearerAuth() decorator
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api');

    // Configure Swagger documentation
    await configureSwaggerDoc(app);

    // Configure Kafka consumer
    await configureKafkaConsumer(app);


    await app.listen(3000);
}

bootstrap().then(r => console.log('Server started!'));
