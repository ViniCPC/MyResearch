import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEYS } from '../decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEYS,
      [context.getHandler(), context.getClass()],
    );

    if(!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if(!user) {
      throw new BadRequestException("Usuario não existe");
    };

    const hasRole = requiredRoles.includes(user.role);

    if(!hasRole) {
      throw new ForbiddenException("Você não tem permissão para acessar essa rota");
    }

    return true;
  }
}