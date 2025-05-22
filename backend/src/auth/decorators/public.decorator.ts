import { SetMetadata } from "@nestjs/common";

/**
 * Metadata key used to mark a route as public (not requiring authentication)
 */
export const IS_PUBLIC_KEY = "isPublic";

/**
 * Decorator to mark routes as public (no authentication required)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
