import { FirebaseService } from '@apposing/nest-firebase';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly bearerTokenPattern = /Bearer\s([a-zA-Z0-9._-]+)/;

  public constructor(private readonly reflector: Reflector, private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>('public', context.getHandler());
    if (isPublic) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context).getContext();

    const authHeader = ctx.req?.header('Authorization');
    if (!authHeader) {
      return false;
    }
    const matches = this.bearerTokenPattern.exec(ctx.req.header('Authorization'));
    if (!matches) {
      return false;
    }
    const token = matches[1];

    try {
      ctx.firebaseUser = await getAuth(this.firebaseService.app).verifyIdToken(token);
    } catch (e) {
      console.error(e);
      return false;
    }
    return true;
  }
}
