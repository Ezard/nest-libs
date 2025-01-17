import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { DecodedIdToken } from 'firebase-admin/auth';
import { CustomClaims } from '../custom-claims';

function userHasRequiredRoles<Role extends string>(userRoles: Role[], requiredRoles: Role[]): boolean {
  return requiredRoles.every(role => userRoles.includes(role));
}

function isDefined<T>(value: T | null | undefined): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

@Injectable()
export class RolesGuard<Role extends string> implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('globalRole')
    private readonly globalRole?: Role,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>('public', context.getHandler());
    if (isPublic) {
      return true;
    }

    const role = this.reflector.get<Role | null | undefined>('role', context.getHandler());
    const ignoreGlobalRole = this.reflector.get<boolean>('ignore-global-role', context.getHandler()) ?? false;
    const requiredRoles = [ignoreGlobalRole ? null : this.globalRole, role].filter(isDefined);
    if (requiredRoles.length === 0) {
      return true;
    }
    const ctx: { firebaseUser: DecodedIdToken & CustomClaims<Role> } = GqlExecutionContext.create(context).getContext();
    const userRoles = ctx.firebaseUser.roles ?? [];
    return userHasRequiredRoles(userRoles, requiredRoles);
  }
}
