export const KAFKA_CONFIG = {
    BROKERS: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    CLIENT_ID: process.env.KAFKA_CLIENT_ID || 'default-kafka-client',
    CONSUMER_GROUP_ID: process.env.KAFKA_CONSUMER_GROUP_ID || 'default-consumer-group'
};