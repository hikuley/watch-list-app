import {Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {ClientKafka} from '@nestjs/microservices';

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(KafkaProducer.name);

    constructor(
        @Inject('KAFKA_SERVICE')
        private readonly kafkaClient: ClientKafka
    ) {}

    async onModuleInit() {
        try {
            this.logger.log('Connecting to Kafka...');
            await this.kafkaClient.connect();
            this.logger.log('Successfully connected to Kafka');
        } catch (error) {
            this.logger.error(`Failed to connect to Kafka: ${error.message}`, error.stack);
            throw error;
        }
    }

    async onModuleDestroy() {
        try {
            this.logger.log('Disconnecting from Kafka...');
            await this.kafkaClient.close();
            this.logger.log('Successfully disconnected from Kafka');
        } catch (error) {
            this.logger.error(`Failed to disconnect from Kafka: ${error.message}`, error.stack);
        }
    }

    async sendMessage(topic: string, message: any) {
        try {
            this.logger.debug(`Sending message to topic '${topic}': ${JSON.stringify(message)}`);
            const result = await this.kafkaClient.emit(topic, message);
            this.logger.debug(`Successfully sent message to topic '${topic}'`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to send message to topic '${topic}': ${error.message}`, error.stack);
            throw error;
        }
    }
}