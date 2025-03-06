import {Inject, Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {ClientKafka} from '@nestjs/microservices';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    constructor(
        @Inject('KAFKA_SERVICE')
        private readonly kafkaClient: ClientKafka
    ) {}

    async onModuleInit() {
        await this.kafkaClient.connect();
    }

    async onModuleDestroy() {
        await this.kafkaClient.close();
    }

    async sendMessage(topic: string, message: any) {
        return this.kafkaClient.emit(topic, message);
    }
}