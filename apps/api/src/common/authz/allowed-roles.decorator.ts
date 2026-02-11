import { SetMetadata } from '@nestjs/common';

export const ALLOWED_ROLES_KEY = 'allowedRoles';

export const AllowedRoles = (...roles: string[]) => SetMetadata(ALLOWED_ROLES_KEY, roles);
