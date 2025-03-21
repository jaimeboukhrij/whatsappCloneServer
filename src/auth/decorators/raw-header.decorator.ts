import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const RawHeaders = createParamDecorator(
  (data, ctx:ExecutionContext) => {
    const args = ctx.switchToHttp().getRequest().rawHeaders
    return args
  }
)
