#!/usr/bin/env node

import { execSync } from 'child_process';
import { cpus } from 'os';
import { getDbUrl, getTestDatabaseName, getTestPrismaClient, TEMPLATE_DATABASE_NAME } from './utils';

export async function setupTestDatabases(): Promise<void> {
  const prismaClient = getTestPrismaClient();
  await prismaClient.$connect();

  console.log(`Creating template database: '${TEMPLATE_DATABASE_NAME}'`);
  await prismaClient.$queryRawUnsafe(`DROP DATABASE IF EXISTS ${TEMPLATE_DATABASE_NAME}`);
  await prismaClient.$queryRawUnsafe(`CREATE DATABASE ${TEMPLATE_DATABASE_NAME}`);

  console.log('Running migrations');
  execSync('npm run db:migrate', {
    env: {
      ...process.env,
      DB_URL: getDbUrl(TEMPLATE_DATABASE_NAME),
    },
  });

  const numWorkers = cpus().length;
  for (let i = 0; i < numWorkers; i++) {
    const workerDatabaseName = getTestDatabaseName(i + 1);
    console.log(`Creating worker database: '${workerDatabaseName}'`);
    await prismaClient.$queryRawUnsafe(`DROP DATABASE IF EXISTS ${workerDatabaseName}`);
    await prismaClient.$queryRawUnsafe(`CREATE DATABASE ${workerDatabaseName} TEMPLATE ${TEMPLATE_DATABASE_NAME}`);
  }

  await prismaClient.$disconnect();
}
