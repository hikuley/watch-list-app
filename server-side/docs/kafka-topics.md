# Kafka Topics Management

This guide explains how Kafka topics are automatically created and managed in the application.

## Automatic Topic Synchronization

Kafka topics defined in `src/common/message/kafka.topics.ts` are automatically synchronized when the application starts. This is handled by the `KafkaAdminService` which implements `OnModuleInit` to ensure topics are in sync before the application needs them.

### Configuration

You can configure the synchronization behavior using environment variables:

- `KAFKA_AUTO_SYNC_TOPICS`: Enable/disable automatic topic synchronization (default: `true`)
- `KAFKA_DELETE_REDUNDANT_ON_STARTUP`: Whether to delete redundant topics on startup (default: `false`)

Example configuration in `.env` or `local.env`:
```
KAFKA_AUTO_SYNC_TOPICS=true
KAFKA_DELETE_REDUNDANT_ON_STARTUP=false
```

### Synchronization Process

The service performs the following steps:
1. Connects to Kafka using the admin client
2. Gets a list of all defined topics from `KafkaTopics`
3. Checks which topics already exist in Kafka
4. Creates any missing topics with default settings:
   - 1 partition
   - Replication factor of 1
   - 7-day retention period
5. If `KAFKA_DELETE_REDUNDANT_ON_STARTUP` is `true`, it will also delete any topics in Kafka that are not defined in `KafkaTopics` (excluding system topics like `__consumer_offsets`)

By default, the service only creates missing topics on startup (it doesn't delete redundant ones) to ensure safety in production environments.

## Topic Management Commands

### Create Topics

You can manually create the topics using the provided CLI command:

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

### Synchronize Topics

You can synchronize your Kafka topics with the `KafkaTopics` definition, which will:
1. Create any missing topics defined in `KafkaTopics`
2. Remove any redundant topics that exist in Kafka but are not defined in `KafkaTopics`

```bash
# Run with npm script
npm run sync:kafka-topics

# Or directly with ts-node
ts-node src/commands/cli.ts sync-kafka-topics
```

#### Options

The sync command supports several options:

- `--dry-run`: Show what would be created or deleted without actually making changes
  ```bash
  npm run sync:kafka-topics:dry-run
  # or
  ts-node src/commands/cli.ts sync-kafka-topics --dry-run true
  ```

- `--skip-delete`: Only create missing topics, don't delete any redundant topics
  ```bash
  ts-node src/commands/cli.ts sync-kafka-topics --skip-delete true
  ```

You can combine options:
```bash
ts-node src/commands/cli.ts sync-kafka-topics --dry-run true --skip-delete true
```

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

## Removing Topics

To remove a topic that's no longer needed:

1. Remove it from the `KafkaTopics` object in `src/common/message/kafka.topics.ts`
2. If `KAFKA_DELETE_REDUNDANT_ON_STARTUP` is set to `true`, the topic will be automatically deleted when the application restarts
3. Alternatively, run the sync command to remove it from Kafka immediately:
   ```bash
   npm run sync:kafka-topics
   ```

## Customizing Topic Configuration

If you need to create topics with custom settings (more partitions, different retention, etc.), you can modify the `KafkaAdminService` or extend it with additional methods. 