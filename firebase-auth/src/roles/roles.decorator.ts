import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const RequiresRole: <Role extends string>(role: Role) => CustomDecorator = role => SetMetadata('role', role);
