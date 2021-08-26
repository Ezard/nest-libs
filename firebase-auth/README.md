# Nest Firebase Auth

## Installation

`npm i @apposing/nest-firebase-auth -S`

## Usage

### General

Register an `APP_GUARD` provider in `AppModule` for `AuthGuard`, e.g.

```
{
  provide: APP_GUARD,
  useClass: AuthGuard,
}
```

### Role-Based Access Control (RBAC)

Register an `APP_GUARD` provider in `AppModule` for `RolesGuard`, e.g.

```
{
  provide: APP_GUARD,
  useClass: RolesGuard,
}
```

*NOTE:* RBAC relies on each user's role having been set in Firebase Auth via `setCustomClaims(uid, { roles: ['my-role'] })`

#### RBAC with a global role

Register a `globalRole` provider in `AppModule` for a specific role, e.g.

```
{
  provide: 'globalRole',
  useValue: 'my-global-role',
}
```

### Example with all providers

```typescript
import { AuthGuard, RolesGuard } from '@apposing/nest-firebase-auth';
import { CanActivate, ClassProvider, Module, ValueProvider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

type Role = 'my-role-1' | 'my-role-2' | 'my-global-role';

@Module({
  providers: [
    {
      provide: 'globalRole',
      useValue: 'my-global-role',
    } as ValueProvider<Role>,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    } as ClassProvider<CanActivate>,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    } as ClassProvider<CanActivate>,
  ]
})
export class AppModule {
}
```
