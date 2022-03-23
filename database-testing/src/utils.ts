import { Prisma, PrismaClient } from '@prisma/client';

function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (value !== null && value !== undefined) {
    return value;
  } else {
    throw new Error(`Env var '${key}' must be set`);
  }
}

const TEST_DATABASE_NAME = getRequiredEnvVar('TEST_DATABASE_NAME');
export const TEMPLATE_DATABASE_NAME = `${TEST_DATABASE_NAME}_test_template`;

export function getTestDatabaseName(workerId?: string | number): string {
  if (workerId) {
    return `${TEST_DATABASE_NAME}_test_${workerId}`;
  } else {
    throw new Error('Jest Worker ID not set');
  }
}

export function getDbUrl(databaseName?: string): string {
  const port = process.env.CI === 'true' ? getRequiredEnvVar('DB_PORT') : 5432;
  return `postgresql://postgres:password@localhost:${port}` + (databaseName ? `/${databaseName}?schema=public` : '');
}

function getPrismaClientOptions(databaseName?: string): Prisma.PrismaClientOptions {
  return {
    datasources: {
      db: {
        url: getDbUrl(databaseName),
      },
    },
  };
}

class TestPrismaClient extends PrismaClient {
  constructor(options: Prisma.PrismaClientOptions) {
    super(options);
  }
}

export function getTestPrismaClient(databaseName?: string): PrismaClient {
  return new TestPrismaClient(getPrismaClientOptions(databaseName));
}

export async function truncateAllDatabaseTables(prismaClient: PrismaClient): Promise<void> {
  await prismaClient.$queryRaw`
      DO
      $func$
      BEGIN
        EXECUTE (
          SELECT 'TRUNCATE TABLE ' || string_agg(oid::regclass::text, ', ') || ' CASCADE'
            FROM pg_class
            WHERE relkind = 'r'
            AND relnamespace = 'public'::regnamespace
        );
      END
      $func$;
    `;
}

export function setupTestDatabase(workerId?: string | number): PrismaClient {
  const prismaClient = getTestPrismaClient(getTestDatabaseName(workerId ?? process.env.JEST_WORKER_ID));

  afterEach(() => truncateAllDatabaseTables(prismaClient));

  return prismaClient;
}
