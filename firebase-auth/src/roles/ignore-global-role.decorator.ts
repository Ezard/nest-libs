import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IgnoreGlobalRole: () => CustomDecorator = () => SetMetadata('ignore-global-role', true);
