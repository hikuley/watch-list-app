export const KAFKA_CONFIG = {
    BROKERS: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    CONSUMER_GROUP_ID: process.env.KAFKA_CONSUMER_GROUP_ID || 'my-consumer-group'
};