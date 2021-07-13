import { ExecutionContext, INestApplication } from '@nestjs/common';
import { GqlExecutionContext, GraphQLModule, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { unlinkSync } from 'fs';
import { join } from 'path';
import supertest from 'supertest';
import { AuthGuard } from './auth.guard';
import { FirebaseUid } from './firebase-uid.decorator';

const mockFn = jest.fn();

@Resolver()
class TestResolver {
  @Query(() => Int)
  query(@FirebaseUid() uid?: string): number {
    mockFn(uid);
    return 1;
  }

  @Mutation(() => Int)
  mutation(@FirebaseUid() uid?: string): number {
    mockFn(uid);
    return 1;
  }
}

describe('FirebaseUid', () => {
  const autoSchemaFile = 'CurrentUser.test.graphql';
  let app: INestApplication;
  let authGuard: (uid?: string) => AuthGuard;

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
    authGuard = (uid?: string) =>
      ({
        async canActivate(context: ExecutionContext): Promise<boolean> {
          const ctx = GqlExecutionContext.create(context).getContext();
          if (uid) {
            ctx.firebaseUser = { uid };
          }
          return true;
        },
      } as AuthGuard);
  });

  afterEach(() => {
    unlinkSync(join(process.cwd(), autoSchemaFile));
  });

  async function runQuery(): Promise<void> {
    await supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          query {
            query
          }
        `,
      });
  }

  async function runMutation(): Promise<void> {
    await supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          mutation {
            mutation
          }
        `,
      });
  }

  it("should provide 'undefined' as the UID if a Firebase user hasn't been attached to the context of a query", async () => {
    app.useGlobalGuards(authGuard());
    await app.init();

    await runQuery();

    expect(mockFn).toHaveBeenCalledWith(undefined);
  });
  it("should provide the user's UID if a Firebase user has been attached to the context of a query", async () => {
    const uid = 'abc123';
    app.useGlobalGuards(authGuard(uid));
    await app.init();

    await runQuery();

    expect(mockFn).toHaveBeenCalledWith(uid);
  });
  it("should provide 'undefined' as the UID if a Firebase user hasn't been attached to the context of a mutation", async () => {
    app.useGlobalGuards(authGuard());
    await app.init();

    await runMutation();

    expect(mockFn).toHaveBeenCalledWith(undefined);
  });
  it("should provide the user's UID if a Firebase user has been attached to the context of a mutation", async () => {
    const uid = 'abc123';
    app.useGlobalGuards(authGuard(uid));
    await app.init();

    await runMutation();

    expect(mockFn).toHaveBeenCalledWith(uid);
  });
});
