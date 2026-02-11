import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type ActorContext = {
  role?: string;
  memberId?: string;
};

export const Actor = createParamDecorator((_data: unknown, ctx: ExecutionContext): ActorContext => {
  const request = ctx.switchToHttp().getRequest();
  return request.actor ?? {};
});
