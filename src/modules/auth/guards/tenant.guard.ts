import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    const tenantId = request.params.organizationId || 
                      request.query.organizationId || 
                      request.body?.organizationId;
    
    if (tenantId && tenantId !== user.organizationId) {
      throw new ForbiddenException('Access denied');
    }
    
    request.organizationId = user.organizationId;
    return true;
  }
}
