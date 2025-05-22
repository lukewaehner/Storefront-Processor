# Authentication and Authorization

This document explains the JWT authentication and Role-Based Access Control (RBAC) implementation in the Storefront Processor application.

## JWT Authentication

JWT (JSON Web Token) authentication is implemented using NestJS Passport module with JWT strategy. The authentication flow works as follows:

1. A user logs in with email and password via the `/auth/login` endpoint
2. The server validates the credentials against the database
3. If valid, the server generates a JWT token containing the user ID and role
4. The token is returned to the client, which should store it and include it in subsequent requests
5. For protected routes, the server validates the token and extracts the user information

Key components:

- `AuthService`: Handles user validation and login
- `JwtStrategy`: Implements the JWT strategy for Passport
- `JwtAuthGuard`: Protects routes by validating JWT tokens
- `Public` decorator: Marks specific routes as public (no authentication required)

## Role-Based Access Control (RBAC)

RBAC allows controlling access to specific endpoints based on user roles. The system supports the following roles:

- `SUPER_ADMIN`: Platform administrator with access to all features
- `ADMIN`: Tenant administrator with access to tenant-specific administration
- `STAFF`: Staff member with limited administrative privileges
- `CUSTOMER`: End customer with access to customer-specific features

Key components:

- `RolesGuard`: Validates that a user has the required role(s) for a specific endpoint
- `Roles` decorator: Specifies which roles are allowed to access a specific endpoint
- `GetUser` decorator: Utility to extract the authenticated user from the request

## Global Guards

Both the `JwtAuthGuard` and `RolesGuard` are registered as global guards in the `AuthModule`, which means they are applied to all routes by default. Public routes can be explicitly marked with the `@Public()` decorator.

## Examples

### Marking a route as public

```typescript
@Get()
@Public()
publicEndpoint() {
  return 'This endpoint is accessible without authentication';
}
```

### Restricting access by role

```typescript
@Get('admin')
@Roles(UserRole.ADMIN)
adminEndpoint() {
  return 'This endpoint is only accessible to users with ADMIN role';
}
```

### Accessing the authenticated user

```typescript
@Get('profile')
getProfile(@GetUser() user: User) {
  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
}
```

## Testing

The authentication and authorization systems are extensively tested:

- Unit tests for individual components (auth service, guards, strategies)
- Integration tests for the auth module
- End-to-end tests for role-based access control

## Environment Configuration

The following environment variables are used for JWT configuration:

- `JWT_SECRET`: Secret key used to sign the JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time (e.g., '1h', '7d')

For development and testing, these can be set in the `.env` or `.env.test` files respectively.
