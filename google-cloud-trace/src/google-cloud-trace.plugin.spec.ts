import { Test } from '@nestjs/testing';
import { Span } from '@opentelemetry/api';
import {
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextWillSendResponse,
} from 'apollo-server-plugin-base';
import { GoogleCloudTraceModule } from './google-cloud-trace.module';
import { ContextWithRootSpan, GoogleCloudTracePlugin } from './google-cloud-trace.plugin';
import { GoogleCloudTraceService } from './google-cloud-trace.service';

jest.mock('./google-cloud-trace.service');

describe('GoogleCloudTracePlugin', () => {
  let googleCloudTraceService: GoogleCloudTraceService;
  let googleCloudTracePlugin: GoogleCloudTracePlugin;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        GoogleCloudTraceModule.forRoot({
          service: expect.getState().currentTestName,
        }),
      ],
    }).compile();
    googleCloudTraceService = module.get(GoogleCloudTraceService);
    googleCloudTracePlugin = module.get(GoogleCloudTracePlugin);
    jest.spyOn(googleCloudTraceService, 'startSpan').mockReturnValue({} as Span);
  });

  it('should create a root span if the GraphQL operation name is valid and not null', async () => {
    const operationName = 'FooBar';
    const context: ContextWithRootSpan = {};
    const graphQLRequestListener = await googleCloudTracePlugin.requestDidStart();

    graphQLRequestListener.didResolveOperation?.({
      operationName,
      context,
    } as GraphQLRequestContextDidResolveOperation<ContextWithRootSpan>);

    expect(googleCloudTraceService.startSpan).toHaveBeenCalledWith(operationName, {
      attributes: { 'http.method': 'GraphQL' },
      root: true,
    });
    expect(context.rootSpan).toBeDefined();
  });

  it('should not create a root span if the GraphQL operation name is null', async () => {
    const context: ContextWithRootSpan = {};
    const graphQLRequestListener = await googleCloudTracePlugin.requestDidStart();

    graphQLRequestListener.didResolveOperation?.({
      operationName: null,
      context,
    } as GraphQLRequestContextDidResolveOperation<ContextWithRootSpan>);

    expect(googleCloudTraceService.startSpan).not.toHaveBeenCalled();
    expect(context.rootSpan).not.toBeDefined();
  });

  it('should not create a root span if the GraphQL operation name is equal to "IntrospectionQuery"', async () => {
    const context: ContextWithRootSpan = {};
    const graphQLRequestListener = await googleCloudTracePlugin.requestDidStart();

    graphQLRequestListener.didResolveOperation?.({
      operationName: 'IntrospectionQuery',
      context,
    } as GraphQLRequestContextDidResolveOperation<ContextWithRootSpan>);

    expect(googleCloudTraceService.startSpan).not.toHaveBeenCalled();
    expect(context.rootSpan).not.toBeDefined();
  });

  it('should end the span when the response is about to be sent', async () => {
    const rootSpan = {
      end: jest.fn() as unknown,
    } as Span;
    jest.spyOn(googleCloudTraceService, 'startSpan').mockReturnValue(rootSpan);
    const graphQLRequestListener = await googleCloudTracePlugin.requestDidStart();

    await graphQLRequestListener.willSendResponse?.({
      context: {
        rootSpan,
      },
    } as GraphQLRequestContextWillSendResponse<ContextWithRootSpan>);

    expect(googleCloudTraceService.startSpan).not.toHaveBeenCalled();
  });

  it('should not throw an error if there is no span', async () => {
    const graphQLRequestListener = await googleCloudTracePlugin.requestDidStart();

    const result = graphQLRequestListener.willSendResponse?.({
      context: {},
    } as GraphQLRequestContextWillSendResponse<ContextWithRootSpan>);

    await expect(result).resolves.not.toThrow();
  });
});
