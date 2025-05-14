import { SetMetadata } from "@nestjs/common";

/**
 * Metadata key used to mark a route as public (not requiring authentication)
 */
export const IS_PUBLIC_KEY = "isPublic";

/**
 * Decorator that marks a route as public, bypassing authentication checks
 *
 * When applied to a controller or a route handler, the AuthGuard will
 * not enforce authentication for this endpoint
 *
 * @example
 * ```typescript
 * @Public()
 * @Get('/login')
 * login() {
 *   // This endpoint will be accessible without authentication
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
