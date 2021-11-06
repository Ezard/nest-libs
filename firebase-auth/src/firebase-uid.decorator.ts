import { createParamDecorator } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { GqlExecutionContext } from '@nestjs/graphql';
import { DecodedIdToken } from 'firebase-admin/auth';

export const FirebaseUid: () => ParameterDecorator = createParamDecorator(
  (_, executionContextHost: ExecutionContextHost) => {
    const ctx = GqlExecutionContext.create(executionContextHost);
    const arg = ctx.getArgByIndex<{ firebaseUser?: DecodedIdToken }>(2);
    return arg.firebaseUser?.uid;
  },
);
