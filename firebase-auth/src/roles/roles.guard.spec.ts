import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext, GraphQLModule, Int, Query, Resolver } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { unlinkSync } from 'fs';
import { join } from 'path';
import supertest from 'supertest';
import { AuthGuard } from '../auth.guard';
import { Public } from '../public.decorator';
import { IgnoreGlobalRole } from './ignore-global-role.decorator';
import { RequiresRole } from './roles.decorator';
import { RolesGuard } from './roles.guard';

const adminRole = 'admin';
const companyAdminRole = 'company-admin';
const practitionerRole = 'practitioner';

@Resolver()
class TestResolver {
  @Query(() => Int)
  unguardedQuery(): number {
    return 1;
  }

  @IgnoreGlobalRole()
  @Query(() => Int)
  unguardedQueryIgnoringGlobalRole(): number {
    return 1;
  }

  @Public()
  @Query(() => Int)
  unguardedPublicQuery(): number {
    return 1;
  }

  @RequiresRole(practitionerRole)
  @Query(() => Int)
  guardedQuery(): number {
    return 1;
  }
}

function unguardedQuerySuccess(body: unknown): void {
  const b = body as { data?: { unguardedQuery: number }; errors?: unknown[] };
  expect(b.data?.unguardedQuery).toEqual(1);
  expect(b.errors).toBeUndefined();
}

function unguardedPublicQuerySuccess(body: unknown): void {
  const b = body as { data?: { unguardedPublicQuery: number }; errors?: unknown[] };
  expect(b.data?.unguardedPublicQuery).toEqual(1);
  expect(b.errors).toBeUndefined();
}

function unguardedQueryIgnoringGlobalRoleSuccess(body: unknown): void {
  const b = body as { data?: { unguardedQueryIgnoringGlobalRole: number }; errors?: unknown[] };
  expect(b.data?.unguardedQueryIgnoringGlobalRole).toEqual(1);
  expect(b.errors).toBeUndefined();
}

function unguardedQueryFailure(body: unknown): void {
  const b = body as { data?: { publicQuery: number }; errors?: unknown[] };
  expect(b.data).toBeNull();
  expect(b.errors).toBeDefined();
  expect(b.errors).toHaveLength(1);
}

function guardedQuerySuccess(body: unknown): void {
  const b = body as { data?: { guardedQuery: number }; errors?: unknown[] };
  expect(b.data?.guardedQuery).toEqual(1);
  expect(b.errors).toBeUndefined();
}

function guardedQueryFailure(body: unknown): void {
  const b = body as { data?: { privateQuery: number }; errors?: unknown[] };
  expect(b.data).toBeNull();
  expect(b.errors).toBeDefined();
  expect(b.errors).toHaveLength(1);
}

describe('RolesGuard', () => {
  const autoSchemaFile = 'RolesGuard.test.graphql';
  let app: INestApplication;
  const authGuard = (roles?: string[]) =>
    ({
      async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context).getContext();
        ctx.firebaseUser = {
          roles,
        };
        return Promise.resolve(true);
      },
    } as AuthGuard);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot({
          autoSchemaFile,
        }),
      ],
      providers: [TestResolver],
    }).compile();
    app = module.createNestApplication();
  });

  afterEach(() => {
    unlinkSync(join(process.cwd(), autoSchemaFile));
  });

  it('should allow queries to be accessed when both a globally-required role and a locally-required role are not defined', async () => {
    app.useGlobalGuards(authGuard(), new RolesGuard(app.get(Reflector)));
    await app.init();
    return supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          query {
            unguardedQuery
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: unknown }) => unguardedQuerySuccess(body));
  });

  it('should allow queries to be accessed when both a globally-required role is defined but is ignored for the query', async () => {
    app.useGlobalGuards(authGuard(), new RolesGuard(app.get(Reflector), adminRole));
    await app.init();
    return supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          query {
            unguardedQueryIgnoringGlobalRole
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: unknown }) => unguardedQueryIgnoringGlobalRoleSuccess(body));
  });

  it('should allow unguarded queries to be accessed if the user has the globally-required role', async () => {
    app.useGlobalGuards(authGuard([adminRole]), new RolesGuard(app.get(Reflector), adminRole));
    await app.init();
    return supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          query {
            unguardedQuery
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: unknown }) => unguardedQuerySuccess(body));
  });

  it('should allow unguarded queries to be accessed if the query is marked as public', async () => {
    app.useGlobalGuards(authGuard([]), new RolesGuard(app.get(Reflector), adminRole));
    await app.init();
    return supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          query {
            unguardedPublicQuery
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: unknown }) => unguardedPublicQuerySuccess(body));
  });

  it('should allow guarded queries to be accessed if the user has the locally-required role and there is no globally-required role', async () => {
    app.useGlobalGuards(authGuard([practitionerRole]), new RolesGuard(app.get(Reflector)));
    await app.init();
    return supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          query {
            guardedQuery
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: unknown }) => guardedQuerySuccess(body));
  });

  it('should allow guarded queries to be accessed if the user has both the globally-required role and the locally-required role', async () => {
    app.useGlobalGuards(
      authGuard([practitionerRole, companyAdminRole]),
      new RolesGuard(app.get(Reflector), companyAdminRole),
    );
    await app.init();
    return supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          query {
            guardedQuery
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: unknown }) => guardedQuerySuccess(body));
  });

  it('should cause an error to be returned if the user does not have the globally-required role when accessing an unguarded query', async () => {
    app.useGlobalGuards(authGuard(), new RolesGuard(app.get(Reflector), practitionerRole));
    await app.init();
    return supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          query {
            unguardedQuery
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: unknown }) => unguardedQueryFailure(body));
  });

  it('should cause an error to be returned if the user has the required globally-required role but not the locally-required role when using a guarded query', async () => {
    app.useGlobalGuards(authGuard([companyAdminRole]), new RolesGuard(app.get(Reflector), companyAdminRole));
    await app.init();
    return supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          query {
            guardedQuery
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: unknown }) => guardedQueryFailure(body));
  });

  it('should cause an error to be returned if the user has the required locally-required role but not the globally-required role when using a guarded query', async () => {
    app.useGlobalGuards(authGuard([companyAdminRole]), new RolesGuard(app.get(Reflector), practitionerRole));
    await app.init();
    return supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          query {
            guardedQuery
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: unknown }) => guardedQueryFailure(body));
  });

  it('should cause an error to be returned if the user has neither the required globally-required role nor the locally-required role when using a guarded query', async () => {
    app.useGlobalGuards(authGuard(), new RolesGuard(app.get(Reflector), practitionerRole));
    await app.init();
    return supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          query {
            guardedQuery
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: unknown }) => guardedQueryFailure(body));
  });
});
