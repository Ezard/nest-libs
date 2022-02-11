import { ApolloDriver } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { Span } from '@opentelemetry/api';
import { unlinkSync } from 'fs';
import { join } from 'path';
import supertest from 'supertest';
import { GoogleCloudTraceModule } from './google-cloud-trace.module';
import { GoogleCloudTracePlugin } from './google-cloud-trace.plugin';
import { GoogleCloudTraceService } from './google-cloud-trace.service';
import { RootSpan } from './root-span.decorator';

const mockFn = jest.fn();

@Resolver()
class TestResolver {
  @Query(() => Int)
  query(@RootSpan() rootSpan: Span): number {
    mockFn(rootSpan);
    return 1;
  }

  @Mutation(() => Int)
  mutation(@RootSpan() rootSpan: Span): number {
    mockFn(rootSpan);
    return 1;
  }
}

describe('RootSpan', () => {
  const autoSchemaFile = 'RootSpan.test.graphql';
  let app: INestApplication;
  let googleCloudTraceService: GoogleCloudTraceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GoogleCloudTraceModule.forRoot({
          service: expect.getState().currentTestName,
        }),
        GraphQLModule.forRootAsync({
          driver: ApolloDriver,
          useFactory: (googleCloudTracePlugin: GoogleCloudTracePlugin) => ({
            autoSchemaFile,
            plugins: [googleCloudTracePlugin],
          }),
          inject: [GoogleCloudTracePlugin],
        }),
      ],
      providers: [TestResolver],
    }).compile();
    app = module.createNestApplication();
    googleCloudTraceService = app.get(GoogleCloudTraceService);
  });

  afterEach(() => {
    unlinkSync(join(process.cwd(), autoSchemaFile));
    jest.resetAllMocks();
  });

  async function runQuery(): Promise<void> {
    await supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'TestQuery',
        query: `
          query TestQuery {
            query
          }
        `,
      });
  }

  async function runMutation(): Promise<void> {
    await supertest(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'TestMutation',
        query: `
          mutation TestMutation {
            mutation
          }
        `,
      });
  }

  it('should provide the root span attached to the context', async () => {
    const span = {
      spanContext: () => ({
        spanId: 'abc123',
      }),
    } as Span;
    jest.spyOn(googleCloudTraceService, 'startSpan').mockReturnValue(span);

    await app.init();

    await runQuery();

    expect(mockFn).toHaveBeenCalledWith(span);
  });

  it("should provide the user's UID if a Firebase user has been attached to the context of a mutation", async () => {
    const span = {
      spanContext: () => ({
        spanId: 'abc123',
      }),
    } as Span;
    jest.spyOn(googleCloudTraceService, 'startSpan').mockReturnValue(span);

    await app.init();

    await runMutation();

    expect(mockFn).toHaveBeenCalledWith(span);
  });
});
