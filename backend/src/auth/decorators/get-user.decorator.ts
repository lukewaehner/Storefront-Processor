import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "@prisma/client";

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): User | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If data is provided, return only that property from the user
    if (data) {
      return user && user[data];
    }

    // Otherwise return the entire user object
    return user;
  }
);
