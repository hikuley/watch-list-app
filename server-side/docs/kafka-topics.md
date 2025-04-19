# Kafka Topics Management

This guide explains how Kafka topics are automatically created and managed in the application.

## Automatic Topic Creation

Kafka topics defined in `src/common/message/kafka.topics.ts` are automatically created when the application starts. This is handled by the `KafkaAdminService` which implements `OnModuleInit` to ensure topics exist before the application needs them.

The service performs the following steps:
1. Connects to Kafka using the admin client
2. Gets a list of all defined topics from `KafkaTopics`
3. Checks which topics already exist in Kafka
4. Creates any missing topics with default settings:
   - 1 partition
   - Replication factor of 1
   - 7-day retention period

## Manual Topic Creation

You can also manually create the topics using the provided CLI command:

```bash
# Run with npm script
npm run create:kafka-topics

# Or directly with ts-node
ts-node src/commands/cli.ts create-kafka-topics
```

This is useful for:
- CI/CD pipelines
- Ensuring topics exist before running tests
- Creating topics in development environments

## Adding New Topics

To add a new topic:

1. Add the topic to the `KafkaTopics` object in `src/common/message/kafka.topics.ts`:
   ```typescript
   export const KafkaTopics = {
     // Existing topics
     TEST_TOPIC_TEST: 'test-topic-test',
     SEND_VERIFICATION_EMAIL: 'send-verification-email',
     
     // Add your new topic here
     YOUR_NEW_TOPIC: 'your-new-topic-name',
   }
   ```

2. The topic will be automatically created the next time the application starts, or you can manually create it using the CLI command.

## Customizing Topic Configuration

If you need to create topics with custom settings (more partitions, different retention, etc.), you can modify the `KafkaAdminService` or extend it with additional methods. 