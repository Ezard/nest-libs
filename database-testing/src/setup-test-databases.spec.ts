import { getTestDatabaseName, getTestPrismaClient, setupTestDatabase } from '../src';
import { setupTestDatabases } from './setup-test-databases';

describe('Setup Test Databases', () => {
  it('should setup test databases', async () => {
    await setupTestDatabases();

    const prismaService = getTestPrismaClient(getTestDatabaseName(process.env.JEST_WORKER_ID));
    await prismaService.$connect();
    await prismaService.temp.count();
    await prismaService.$disconnect();
  }, 60000);
});

describe('Utils', () => {
  describe('setupTestDatabase', () => {
    const prismaClient = setupTestDatabase();

    describe('PrismaClient', () => {
      it('should be able to query the database', async () => {
        await prismaClient.temp.count();
      });

      it('should be able to insert records into the database', async () => {
        await prismaClient.temp.create({
          data: {
            id: 1,
          },
        });
      });

      it('should truncate database tables after each test', async () => {
        const count = await prismaClient.temp.count();

        expect(count).toEqual(0);
      });
    });
  });
});
