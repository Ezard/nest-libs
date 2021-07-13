import { createParamDecorator } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { GqlExecutionContext } from '@nestjs/graphql';
import { auth } from 'firebase-admin/lib/auth';
import DecodedIdToken = auth.DecodedIdToken;

export const FirebaseUid: () => ParameterDecorator = createParamDecorator(
  (_, executionContextHost: ExecutionContextHost) => {
    const ctx = GqlExecutionContext.create(executionContextHost);
    const arg = ctx.getArgByIndex<{ firebaseUser?: DecodedIdToken }>(2);
    return arg.firebaseUser?.uid;
  },
);
