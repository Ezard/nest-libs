import { FirebaseModule, FirebaseService } from '@apposing/nest-firebase';
import { ApolloDriver } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GraphQLModule, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { unlinkSync } from 'fs';
import { join } from 'path';
import supertest from 'supertest';
import { AuthGuard } from './auth.guard';
import { BasicAuth } from './basic-auth.decorator';
import { Public } from './public.decorator';

@Resolver()
class TestResolver {
  @Public()
  @Query(() => Int)
  publicQuery(): number {
    return 1;
  }

  @Query(() => Int)
  privateQuery(): number {
    return 1;
  }

  @BasicAuth('foo', 'bar')
  @Query(() => Int)
  basicAuthQuery(): number {
    return 1;
  }

  @Public()
  @Mutation(() => Int)
  publicMutation(): number {
    return 1;
  }

  @Mutation(() => Int)
  privateMutation(): number {
    return 1;
  }

  @BasicAuth('foo', 'bar')
  @Mutation(() => Int)
  basicAuthMutation(): number {
    return 1;
  }
}

function expectQuerySuccess(body: unknown): void {
  const b = body as { data?: { publicQuery: number }; errors?: unknown[] };
  expect(b.data?.publicQuery).toEqual(1);
  expect(b.errors).toBeUndefined();
}

function expectQueryFailure(body: unknown): void {
  const b = body as { data?: { privateQuery: number }; errors?: unknown[] };
  expect(b.data).toBeNull();
  expect(b.errors).toBeDefined();
  expect(b.errors).toHaveLength(1);
}

function expectMutationSuccess(body: unknown): void {
  const b = body as { data?: { publicMutation: number }; errors?: unknown[] };
  expect(b.data?.publicMutation).toEqual(1);
  expect(b.errors).toBeUndefined();
}

function expectMutationFailure(body: unknown): void {
  const b = body as { data?: { privateMutation: number }; errors?: unknown[] };
  expect(b.data).toBeNull();
  expect(b.errors).toBeDefined();
  expect(b.errors).toHaveLength(1);
}

describe('AuthGuard', () => {
  const autoSchemaFile = 'AuthGuard.test.graphql';
  let app: INestApplication;
  let firebaseService: FirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        FirebaseModule.forRoot({
          name: expect.getState().currentTestName,
        }),
        GraphQLModule.forRoot({
          driver: ApolloDriver,
          autoSchemaFile,
        }),
      ],
      providers: [TestResolver],
    }).compile();
    firebaseService = module.get(FirebaseService);
    app = module.createNestApplication();
    app.useGlobalGuards(new AuthGuard(app.get(Reflector), firebaseService));
    await app.init();
  });

  afterEach(() => {
    unlinkSync(join(process.cwd(), autoSchemaFile));
  });

  it('should allow public queries to be used without authentication', () => {
    return supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          query {
            publicQuery
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: unknown }) => expectQuerySuccess(body));
  });
  it('should cause an error to be returned if a private query is used without authentication', () => {
    return supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          query {
            privateQuery
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: unknown }) => expectQueryFailure(body));
  });
  it('should allow public mutations to be used without authentication', () => {
    return supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          mutation {
            publicMutation
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: unknown }) => expectMutationSuccess(body));
  });
  it('should cause an error to be returned if a private mutation is used without authentication', () => {
    return supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          mutation {
            privateMutation
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: unknown }) => expectMutationFailure(body));
  });
  it('should allow queries if the correct basic auth credentials are supplied', () => {
    return supertest(app.getHttpServer())
      .post('/graphql')
      .auth('foo', 'bar', { type: 'basic' })
      .send({
        operationName: null,
        query: `
          query {
            basicAuthQuery
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: { data?: { basicAuthQuery: number }; errors?: unknown[] } }) => {
        expect(body.data?.basicAuthQuery).toEqual(1);
        expect(body.errors).toBeUndefined();
      });
  });
  it('should allow mutations if the correct basic auth credentials are supplied', () => {
    return supertest(app.getHttpServer())
      .post('/graphql')
      .auth('foo', 'bar', { type: 'basic' })
      .send({
        operationName: null,
        query: `
          mutation {
            basicAuthMutation
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: { data?: { basicAuthMutation: number }; errors?: unknown[] } }) => {
        expect(body.data?.basicAuthMutation).toEqual(1);
        expect(body.errors).toBeUndefined();
      });
  });
  it('should cause an error to be returned if the incorrect basic auth credentials are supplied', () => {
    return supertest(app.getHttpServer())
      .post('/graphql')
      .auth('user', 'pass', { type: 'basic' })
      .send({
        operationName: null,
        query: `
          query {
            basicAuthQuery
          }
        `,
      })
      .expect(200)
      .expect(({ body }: { body: { data?: { basicAuthQuery: number }; errors?: unknown[] } }) => {
        expect(body.data?.basicAuthQuery).toBeUndefined();
        expect(body.errors).toHaveLength(1);
      });
  });
  it('should attempt to verify the user if an authentication header is supplied in the bearer token format', () => {
    const verifyIdTokenFn = jest.spyOn(getAuth(firebaseService.app), 'verifyIdToken').mockResolvedValue({
      uid: 'abc123',
    } as DecodedIdToken);
    const token = 'abc123';

    return supertest(app.getHttpServer())
      .post('/graphql')
      .auth(token, { type: 'bearer' })
      .send({
        operationName: null,
        query: `
          query {
            privateQuery
          }
        `,
      })
      .expect(200)
      .expect(() => {
        expect(verifyIdTokenFn).toHaveBeenCalledWith(token);
      });
  });
});
