import { createParamDecorator } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Span } from '@opentelemetry/api';

export const RootSpan: () => ParameterDecorator = createParamDecorator(
  (_, executionContextHost: ExecutionContextHost) => {
    const ctx = GqlExecutionContext.create(executionContextHost);
    const arg = ctx.getArgByIndex<{ rootSpan?: Span }>(2);
    return arg.rootSpan;
  },
);
