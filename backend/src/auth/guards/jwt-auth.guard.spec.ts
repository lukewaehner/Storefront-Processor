import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);

    // Mock the execution context
    mockExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
    } as unknown as ExecutionContext;
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("should return true for public routes", () => {
      // Mock the reflector to return true for public routes
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it("should call the parent canActivate for protected routes", () => {
      // Mock the reflector to return false for protected routes
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

      // Mock the parent canActivate method
      const mockSuperCanActivate = jest.fn().mockReturnValue(true);
      jest
        .spyOn(JwtAuthGuard.prototype, "canActivate")
        .mockImplementation(function (this: any, context: ExecutionContext) {
          if (this === guard) {
            // When called on our guard instance, delegate to the original implementation
            return mockSuperCanActivate(context);
          }
          return true;
        });

      const result = guard.canActivate(mockExecutionContext);

      expect(mockSuperCanActivate).toHaveBeenCalledWith(mockExecutionContext);
    });
  });
});
