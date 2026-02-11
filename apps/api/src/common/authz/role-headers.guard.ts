import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOWED_ROLES_KEY } from './allowed-roles.decorator';

@Injectable()
export class RoleHeadersGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<string[]>(ALLOWED_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowedRoles || allowedRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const roleHeader = request.headers['x-guild-role'];
    const role = typeof roleHeader === 'string' ? roleHeader.toUpperCase() : undefined;

    if (!role) throw new UnauthorizedException('Missing actor role');
    if (!allowedRoles.includes(role)) throw new ForbiddenException(`Role ${role} is not allowed`);

    request.actor = {
      role,
      memberId: typeof request.headers['x-member-id'] === 'string' ? request.headers['x-member-id'] : undefined,
    };

    return true;
  }
}
