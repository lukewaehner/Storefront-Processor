# Storefront Processor Backend Documentation

## Overview

This backend is a **NestJS** application designed for a multi-tenant e-commerce platform. It uses **Prisma** as the ORM, **PostgreSQL** as the database, and is structured for modularity, testability, and scalability.

---

## Project Structure

```
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── auth/                # Auth-related modules and decorators
│   ├── prisma/              # Prisma service and module
│   └── tenant/              # Multi-tenancy: services, guards, middleware, decorators, DTOs, interfaces
├── prisma/
│   ├── schema.prisma        # Prisma schema (DB models, enums)
│   ├── seed.ts              # DB seeding script
│   └── migrations/          # Prisma migration files
├── test/                    # Test setup and utilities
│   └── utils/
│       └── db-test-utils.ts # Test DB reset/seed helpers
├── package.json
├── eslint.config.js         # ESLint flat config (v9+)
├── jest-unit.config.js      # Jest config for unit tests
├── tsconfig.json
└── .env, .env.test, .env.example
```

---

## Key Modules & Functions

### 1. **Tenant Module (`src/tenant/`)**

- **Services**
  - `tenant.service.ts`: CRUD for tenants, domain lookup, status updates.
  - `tenant-context.service.ts`: Manages per-request tenant context using AsyncLocalStorage.

- **Guards**
  - `tenant.guard.ts`: Ensures requests are tenant-scoped unless explicitly bypassed.

- **Middleware**
  - `tenant.middleware.ts`: Resolves tenant from hostname, attaches to request, sets context.

- **Decorators**
  - `bypass-tenant.decorator.ts`: `@BypassTenant()` to bypass tenant guard.
  - `tenant.decorators.ts`: `@GetTenant()`, `@GetTenantId()` to extract tenant info from requests.

- **DTOs & Interfaces**
  - `dto/`: Data transfer objects for tenant creation/update.
  - `interfaces/tenant-request.interface.ts`: Extends Express Request with `tenant`.

### 2. **Prisma Module (`src/prisma/`)**

- `prisma.service.ts`: Prisma client wrapper, supports multi-tenancy.
- `prisma.module.ts`: Exports PrismaService for DI.

### 3. **Database & Seeding (`prisma/`)**

- `schema.prisma`: All DB models, enums, and relations.
- `seed.ts`: Populates DB with demo/test tenants, users, domains.

### 4. **Testing Utilities (`test/utils/`)**

- `db-test-utils.ts`: Resets and seeds the test DB for isolated tests.

---

## Available Commands

Run these from the `backend` directory:

### **Development & Build**
- `npm run start:dev` — Start backend in watch mode
- `npm run build` — Compile TypeScript to `dist/`
- `npm run start:prod` — Run compiled app

### **Linting & Formatting**
- `npm run lint` — Run ESLint (auto-fix issues)
- `npm run format` — Run Prettier on all source and test files

### **Testing**
- `npm run test:unit` — Run unit tests with Jest (uses `.env.test`)
- `npm run test:watch` — Watch mode for tests
- `npm run test:cov` — Test coverage report

### **Prisma & Database**
- `npm run prisma:generate` — Generate Prisma client
- `npm run prisma:migrate:dev` — Run DB migrations in dev
- `npm run prisma:migrate:deploy` — Deploy migrations in prod
- `npm run prisma:seed` — Seed the dev database
- `npm run prisma:studio` — Open Prisma Studio (DB GUI)
- `npm run prisma:migrate:test:setup` — Reset and migrate test DB

---

## Maintenance & Usage

### **Environment Setup**
- Copy `.env.example` to `.env` and fill in secrets/DB URLs.
- Use `.env.test` for test DB config.

### **Database**
- To reset the dev DB:  
  ```bash
  npx prisma migrate reset
  ```
- To reset the test DB:  
  ```bash
  npm run prisma:migrate:test:setup
  ```

### **Seeding**
- To seed dev DB:  
  ```bash
  npm run prisma:seed
  ```
- To seed test DB (if you have a `seed-test.ts`):  
  ```bash
  npm run prisma:seed:test
  ```

### **Testing**
- All tests are in `src/**/*.spec.ts` and use Jest.
- Test DB is reset before each test run for isolation.

### **Linting**
- Run `npm run lint` to check/fix code style.
- ESLint config is in `eslint.config.js` (flat config for v9+).

### **Multi-Tenancy**
- Tenants are resolved by domain (see `tenant.middleware.ts`).
- Use `@BypassTenant()` to allow routes to skip tenant checks.
- Use `@GetTenant()` or `@GetTenantId()` in controllers to access tenant info.

### **Adding New Features**
- Add new modules/services under `src/`.
- Register new modules in `app.module.ts`.
- Add new DB models/enums to `prisma/schema.prisma` and run migrations.

### **Updating Prisma**
- After editing `schema.prisma`, run:
  ```bash
  npx prisma migrate dev
  npx prisma generate
  ```

---

## **Best Practices**

- Keep all tenant-specific logic inside the tenant context.
- Use DTOs for all input validation.
- Write tests for all new features and bugfixes.
- Keep dependencies up to date (`npm outdated`).

---

## **Troubleshooting**

- **Docker/DB issues:** If you see errors about database version mismatch, remove the old volume:
  ```bash
  docker-compose down
  docker volume rm storefront-processor_postgres_data
  docker-compose up -d
  ```
- **ESLint not working:** Make sure you have `eslint.config.js` and all plugins installed. Run `npm install` if needed.

---

## **Contact / Contribution**

- For questions, open an issue or contact the maintainers.
- To contribute, fork the repo, create a feature branch, and submit a PR with tests.

---

**This documentation should help you maintain, extend, and operate the backend with confidence!**  
If you need a more detailed API or code-level doc, let me know! 