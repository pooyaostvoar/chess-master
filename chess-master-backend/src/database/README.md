# Database Migrations Guide Made by claude :D that's why it's a bit aggressive

This guide explains how to work with TypeORM migrations in this project.

## Overview

We use TypeORM migrations to manage database schema changes. Migrations are automatically applied when the application starts.

## Available Commands

### Create Empty Migration

Creates a new empty migration file with the basic structure.

```bash
pnpm run migration:create src/database/migrations/YourMigrationName
```

**Example:**

```bash
pnpm run migration:create src/database/migrations/AddUserProfileFields
```

This generates a file like `src/database/migrations/1733678400000-AddUserProfileFields.ts` with empty `up()` and `down()` methods.

### Generate Migration from Entity Changes

Automatically generates a migration by comparing your entity definitions with the current database schema.

```bash
pnpm run migration:generate src/database/migrations/YourMigrationName
```

**Example:**

```bash
pnpm run migration:generate src/database/migrations/AddEmailVerification
```

TypeORM will detect differences between your entities and database, then generate the appropriate SQL statements.

### Run Pending Migrations

Executes all pending migrations that haven't been applied yet.

```bash
pnpm run migration:run
```

This command:

- Checks which migrations have already been executed
- Runs only the new migrations in chronological order
- Updates the `migrations` table to track executed migrations

### Revert Last Migration

Rolls back the most recently executed migration.

```bash
pnpm run migration:revert
```

To revert multiple migrations, run this command multiple times.

## How Migrations Are Applied

**Currently, migrations are applied automatically when the application starts.**

The migration logic is in the application startup code:

```typescript
await AppDataSource.initialize();
await AppDataSource.runMigrations();
```

This means:

- ✅ Migrations run automatically on app startup
- ✅ Only pending migrations are executed
- ✅ No manual intervention needed in production
- ⚠️ Make sure to test migrations thoroughly before deploying

## Migration Workflow

### 1. Making Schema Changes

**Option A: Modify entities, then generate migration**

```bash
# 1. Update your entity files (e.g., add a new column)
# 2. Generate migration from entity changes
pnpm run migration:generate src/database/migrations/AddNewField

# 3. Review the generated migration file
# 4. Commit and deploy (migration runs automatically)
```

**Option B: Create custom migration manually**

```bash
# 1. Create empty migration
pnpm run migration:create src/database/migrations/CustomDataMigration

# 2. Write custom SQL in the up() and down() methods
# 3. Commit and deploy (migration runs automatically)
```

### 2. Testing Migrations Locally

```bash
# Run migrations
pnpm run migration:run

# If something goes wrong, revert
pnpm run migration:revert
```

### 3. Deploying Migrations

When you deploy your application:

1. The app starts
2. Migrations automatically run via `AppDataSource.runMigrations()`
3. App continues normal operation

## Best Practices

### ✅ Do's

- **Always test migrations locally first** before deploying
- **Write reversible migrations** - implement both `up()` and `down()` methods
- **Use descriptive names** for migrations (e.g., `AddUserEmailIndex`, not `UpdateDB`)
- **Review generated migrations** - auto-generated SQL may need adjustments
- **Commit migrations with code changes** that require them
- **Keep migrations small and focused** on a single change

### ❌ Don'ts

- **Don't modify existing migrations** that have been deployed
- **Don't delete migration files** from the migrations folder
- **Don't mix schema and data changes** in the same migration when possible
- **Don't run migrations manually in production** - let the app handle it

## Migration File Structure

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserEmailIndex1733678400000 implements MigrationInterface {
  name = "AddUserEmailIndex1733678400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // SQL to apply the migration
    await queryRunner.query(`
            CREATE INDEX "IDX_user_email" ON "users" ("email")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // SQL to revert the migration
    await queryRunner.query(`
            DROP INDEX "IDX_user_email"
        `);
  }
}
```

## Troubleshooting

### Migration fails on startup

If a migration fails during app startup, the app will not start. Check:

1. Database connection is working
2. Migration SQL is valid
3. Database user has proper permissions
4. Review error logs for specific SQL errors

### Need to skip a migration

If you need to manually mark a migration as executed without running it:

```sql
INSERT INTO migrations (timestamp, name)
VALUES (1733678400000, 'YourMigration1733678400000');
```

### Clean test databases

To drop all test databases matching a pattern:

```sql
-- Generate DROP commands
SELECT format('DROP DATABASE %I;', datname)
FROM pg_database
WHERE datname LIKE '%chess_master_test%'
AND datistemplate = false
\gexec
```

## Additional Resources

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
