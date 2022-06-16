import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const BasicAuth: (username: string, password: string) => CustomDecorator = (
  username: string,
  password: string,
) =>
  SetMetadata('basic-auth', {
    username,
    password,
  });
