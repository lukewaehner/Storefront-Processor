1. Implement JWT-based Authentication
   a. Install dependencies
   @nestjs/jwt, @nestjs/passport, passport, passport-jwt, bcrypt (for password hashing)
   b. Configure JWT Module
   In your AuthModule, import and configure JwtModule with secret and expiration from config.
   c. Create Auth Service
   Implement methods for validating users, generating JWTs, and hashing passwords.
   d. Create Auth Guard
   Use PassportStrategy with passport-jwt to protect routes.
   e. Add JWT strategy
   Extract user info from JWT and attach to request.
2. Create User Model with Tenant Association
   a. Update Prisma Schema
   Ensure your User model has a tenantId field and a relation to the Tenant model.
   Example:
   Apply to Plan.md
   }
   b. Run Prisma Migrations
   npx prisma migrate dev --name add-user-tenant-association
   c. Update User Service/Repository
   Ensure user creation and queries always include tenantId.
3. Build Login/Registration Flow for Tenant Admins
   a. Registration Endpoint
   Create a POST /auth/register endpoint.
   Accepts email, password, tenant info, and role (default to ADMIN for first user per tenant).
   Hash password before saving.
   Associate user with tenant.
   b. Login Endpoint
   Create a POST /auth/login endpoint.
   Accepts email and password.
   Validate credentials, return JWT on success.
   c. Validation
   Ensure only one ADMIN per tenant on initial registration, or allow multiple as per your business logic.
   Validate tenant existence during registration.
   d. Testing
   Write unit/integration tests for registration and login flows.
4. Set Up Role-Based Access Control (RBAC)
   a. Define Roles
   In your Prisma schema, ensure UserRole enum includes at least: SUPER_ADMIN, ADMIN, STAFF, CUSTOMER.
   b. Create Roles Decorator
   Implement a @Roles() decorator to annotate protected routes.
   c. Create Roles Guard
   Implement a guard that checks the user’s role (from JWT) against allowed roles for the route.
   d. Apply Guards
   Use the @UseGuards(AuthGuard, RolesGuard) and @Roles() decorators on controllers/routes that require RBAC.
   e. Test RBAC
   Write tests to ensure only users with the correct roles can access protected endpoints.
   Example Implementation Order
   User Model & Migration
   Update schema, migrate, and update services.
   JWT Auth
   Set up JWT module, strategy, and guards.
   Registration/Login
   Implement endpoints, hashing, and JWT issuance.
   RBAC
   Implement roles, decorators, guards, and apply to routes.
   Optional: Admin Seeding
   Seed a default SUPER_ADMIN user for platform-level management.
