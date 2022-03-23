import { PrismaClient } from '@prisma/client';
import { getDbUrl, getTestDatabaseName, getTestPrismaClient } from './utils';

describe('Utils', () => {
  describe('getTestDatabaseName', () => {
    it.each`
      workerId | testDatabaseName
      ${'abc'} | ${'foo_test_abc'}
      ${123}   | ${'foo_test_123'}
    `(
      'should generated the correct test database name',
      ({ workerId, testDatabaseName }: { workerId: string | number; testDatabaseName: string }) => {
        const result = getTestDatabaseName(workerId);

        expect(result).toEqual(testDatabaseName);
      },
    );

    it('should throw an error if workerId is not defined', () => {
      expect(getTestDatabaseName).toThrowErrorMatchingInlineSnapshot('"Jest Worker ID not set"');
    });
  });

  describe('getDbUrl', () => {
    afterAll(() => {
      delete process.env.CI;
      delete process.env.DB_PORT;
    });

    it.each`
      databaseName | ciEnvVar     | dbPortEnvVar | dbUrl
      ${'foo'}     | ${'true'}    | ${'1234'}    | ${'postgresql://postgres:password@localhost:1234/foo?schema=public'}
      ${'foo'}     | ${'true'}    | ${'5678'}    | ${'postgresql://postgres:password@localhost:5678/foo?schema=public'}
      ${'foo'}     | ${'false'}   | ${'1234'}    | ${'postgresql://postgres:password@localhost:5432/foo?schema=public'}
      ${'foo'}     | ${'false'}   | ${'5678'}    | ${'postgresql://postgres:password@localhost:5432/foo?schema=public'}
      ${'foo'}     | ${''}        | ${'1234'}    | ${'postgresql://postgres:password@localhost:5432/foo?schema=public'}
      ${'foo'}     | ${''}        | ${'5678'}    | ${'postgresql://postgres:password@localhost:5432/foo?schema=public'}
      ${'foo'}     | ${undefined} | ${'1234'}    | ${'postgresql://postgres:password@localhost:5432/foo?schema=public'}
      ${'foo'}     | ${undefined} | ${'5678'}    | ${'postgresql://postgres:password@localhost:5432/foo?schema=public'}
      ${'bar'}     | ${'true'}    | ${'1234'}    | ${'postgresql://postgres:password@localhost:1234/bar?schema=public'}
      ${'bar'}     | ${'true'}    | ${'5678'}    | ${'postgresql://postgres:password@localhost:5678/bar?schema=public'}
      ${'bar'}     | ${'false'}   | ${'1234'}    | ${'postgresql://postgres:password@localhost:5432/bar?schema=public'}
      ${'bar'}     | ${'false'}   | ${'5678'}    | ${'postgresql://postgres:password@localhost:5432/bar?schema=public'}
      ${'bar'}     | ${''}        | ${'1234'}    | ${'postgresql://postgres:password@localhost:5432/bar?schema=public'}
      ${'bar'}     | ${''}        | ${'5678'}    | ${'postgresql://postgres:password@localhost:5432/bar?schema=public'}
      ${'bar'}     | ${undefined} | ${'1234'}    | ${'postgresql://postgres:password@localhost:5432/bar?schema=public'}
      ${'bar'}     | ${undefined} | ${'5678'}    | ${'postgresql://postgres:password@localhost:5432/bar?schema=public'}
      ${undefined} | ${'true'}    | ${'1234'}    | ${'postgresql://postgres:password@localhost:1234'}
      ${undefined} | ${'true'}    | ${'5678'}    | ${'postgresql://postgres:password@localhost:5678'}
      ${undefined} | ${'false'}   | ${'1234'}    | ${'postgresql://postgres:password@localhost:5432'}
      ${undefined} | ${'false'}   | ${'5678'}    | ${'postgresql://postgres:password@localhost:5432'}
      ${undefined} | ${''}        | ${'1234'}    | ${'postgresql://postgres:password@localhost:5432'}
      ${undefined} | ${''}        | ${'5678'}    | ${'postgresql://postgres:password@localhost:5432'}
      ${undefined} | ${undefined} | ${'1234'}    | ${'postgresql://postgres:password@localhost:5432'}
      ${undefined} | ${undefined} | ${'5678'}    | ${'postgresql://postgres:password@localhost:5432'}
    `(
      'should generate the correct DB URL',
      ({
        databaseName,
        ciEnvVar,
        dbPortEnvVar,
        dbUrl,
      }: {
        databaseName: string | undefined;
        ciEnvVar: string | undefined;
        dbPortEnvVar: string;
        dbUrl: string;
      }) => {
        process.env.CI = ciEnvVar;
        process.env.DB_PORT = dbPortEnvVar;

        const result = getDbUrl(databaseName);

        expect(result).toEqual(dbUrl);
      },
    );

    it('should throw an error if the "CI" env var is "true" and the "DB_PORT" env var is not defined', () => {
      process.env.CI = 'true';
      delete process.env.DB_PORT;

      expect(getDbUrl).toThrowErrorMatchingInlineSnapshot(`"Env var 'DB_PORT' must be set"`);
    });
  });

  describe('getTestPrismaClient', () => {
    it('should return an instance of PrismaClient with the database URL injected', () => {
      const testPrismaClient = getTestPrismaClient('foo') as PrismaClient & {
        _engineConfig: { datasources: { name: string; url: string }[] };
      };
      expect(testPrismaClient._engineConfig.datasources).toEqual([
        {
          name: 'db',
          url: 'postgresql://postgres:password@localhost:5432/foo?schema=public',
        },
      ]);
    });
  });
});
