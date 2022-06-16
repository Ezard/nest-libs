import { FirebaseService } from '@apposing/nest-firebase';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly basicTokenPattern = /Basic\s([a-zA-Z\d._-]+)/;
  private readonly bearerTokenPattern = /Bearer\s([a-zA-Z\d._-]+)/;

  public constructor(private readonly reflector: Reflector, private readonly firebaseService: FirebaseService) {}

  private isPublic(context: ExecutionContext): boolean {
    return this.reflector.get<boolean | undefined>('public', context.getHandler()) === true;
  }

  private isBasicAuthValid(context: ExecutionContext): boolean {
    const graphqlContext = GqlExecutionContext.create(context).getContext();

    if (!graphqlContext.req) {
      return false;
    }

    const basicAuth = this.reflector.get<{ username: string; password: string } | undefined>(
      'basic-auth',
      context.getHandler(),
    );
    if (basicAuth === undefined) {
      return false;
    }
    const basicAuthMatches = this.basicTokenPattern.exec(graphqlContext.req.header('Authorization'));
    if (!basicAuthMatches) {
      return false;
    }
    const basicAuthToken = basicAuthMatches[1];
    const [username, password] = Buffer.from(basicAuthToken, 'base64').toString('utf-8').split(':');
    return basicAuth.username === username && basicAuth.password === password;
  }

  private async isBearerValid(context: ExecutionContext): Promise<boolean> {
    const graphqlContext = GqlExecutionContext.create(context).getContext();

    if (!graphqlContext.req) {
      return false;
    }

    const bearerTokenMatches = this.bearerTokenPattern.exec(graphqlContext.req.header('Authorization'));
    if (!bearerTokenMatches) {
      return false;
    }
    const bearerToken = bearerTokenMatches[1];

    try {
      graphqlContext.firebaseUser = await getAuth(this.firebaseService.app).verifyIdToken(bearerToken);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.isPublic(context);
    const isBasicAuthValid = this.isBasicAuthValid(context);
    const isBearerValid = await this.isBearerValid(context);

    return isPublic || isBasicAuthValid || isBearerValid;
  }
}
