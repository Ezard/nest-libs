import { Plugin } from '@nestjs/apollo';
import { Span } from '@opentelemetry/api';
import {
  ApolloServerPlugin,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextWillSendResponse,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { GoogleCloudTraceService } from './google-cloud-trace.service';

export type ContextWithRootSpan = { rootSpan?: Span };

@Plugin()
export class GoogleCloudTracePlugin implements ApolloServerPlugin {
  constructor(private readonly googleCloudTraceService: GoogleCloudTraceService) {}

  private createGraphQLRequestListener(googleCloudTraceService: GoogleCloudTraceService): GraphQLRequestListener {
    return {
      async didResolveOperation(
        requestContext: GraphQLRequestContextDidResolveOperation<ContextWithRootSpan>,
      ): Promise<void> {
        if (requestContext.operationName && requestContext.operationName !== 'IntrospectionQuery') {
          requestContext.context.rootSpan = googleCloudTraceService.startSpan(requestContext.operationName, {
            root: true,
            attributes: {
              'http.method': 'GraphQL',
            },
          });
        }
      },
      async willSendResponse(
        requestContext: GraphQLRequestContextWillSendResponse<ContextWithRootSpan>,
      ): Promise<void> {
        if (requestContext.context.rootSpan) {
          requestContext.context.rootSpan.end();
        }
      },
    };
  }

  async requestDidStart(): Promise<GraphQLRequestListener> {
    return this.createGraphQLRequestListener(this.googleCloudTraceService);
  }
}
