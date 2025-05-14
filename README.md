# Storefront Processor

Multi-tenant e-commerce platform for managing online storefronts.

## Project Overview

Storefront Processor is a comprehensive e-commerce platform that enables multiple merchants to run their online stores from a single codebase and infrastructure. The system follows a modular, service-oriented architecture with a clear separation of concerns.

### Key Features

- **Multi-tenancy**: Support for multiple independent merchants with proper data isolation
- **Modular Architecture**: Domain-specific modules that can evolve independently
- **API-First Design**: All functionality is exposed through well-documented APIs
- **Secure by Default**: Security built into all aspects of the system
- **Scalable Infrastructure**: Components designed to scale horizontally

## Tech Stack

### Frontend

- Next.js (v14+)
- TypeScript
- Tailwind CSS
- React Query

### Backend

- NestJS
- TypeScript
- GraphQL/REST APIs
- Prisma ORM

### Database & Caching

- PostgreSQL (primary database)
- Redis (caching and session management)

### Infrastructure

- Docker/Kubernetes
- AWS (ECS/EKS, RDS, ElastiCache, S3)
- Terraform
- GitHub Actions

### Monitoring

- Prometheus (metrics collection)
- Grafana (visualization)
- Various exporters (Node, cAdvisor, Postgres, Redis)

## Multi-Tenancy Implementation

The platform uses a row-based multi-tenancy approach that:

1. **Tenant Data Model**:

   - Each tenant has a unique identifier
   - Domain-based routing for tenant identification
   - Custom domains support for white-labeling

2. **Middleware & Request Flow**:

   - Automatic tenant resolution based on domain
   - Tenant context injection in request pipeline
   - Tenant isolation enforced by guards

3. **Data Isolation**:

   - Row-level tenant filtering with Prisma
   - Automatic tenantId injection in database queries
   - Tenant-specific connection handling

4. **Shared vs. Tenant-Specific Resources**:
   - Clear separation of global and tenant-scoped data
   - Tenant-aware service implementations
   - Isolation of tenant settings and configurations

## Development Setup

### Prerequisites

- Node.js v18+
- Docker and Docker Compose
- Git

### Getting Started

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/storefront-processor.git
   cd storefront-processor
   ```

2. Run the setup script:

   ```
   ./setup_dev_environment.sh
   ```

   This will:

   - Create and initialize the frontend and backend projects
   - Set up environment files
   - Install dependencies
   - Configure Git hooks
   - Start Docker containers for PostgreSQL, Redis, and monitoring tools

3. Start development servers:

   - Frontend: `cd frontend && npm run dev`
   - Backend: `cd backend && npm run start:dev`

4. Access the applications:

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

5. Monitoring tools:
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001 (admin/admin)
   - Node Exporter: http://localhost:9100
   - cAdvisor: http://localhost:8080
   - Postgres Exporter: http://localhost:9187
   - Redis Exporter: http://localhost:9121

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

- **CI Pipeline**: Runs on pull requests and pushes to main/develop

  - Linting
  - Testing
  - Building
  - Docker image creation
  - Security scanning

- **Deployment Pipelines**:
  - Staging: Automatic deployment on merges to main
  - Production: Manual approval process with canary deployment

## Project Structure

```
├── .github/          # GitHub Actions workflows
├── backend/          # NestJS backend application
│   ├── prisma/       # Database schema and migrations
│   └── src/          # Application source code
│       ├── tenant/   # Multi-tenancy framework
│       └── prisma/   # Prisma service with tenant isolation
├── cursor-rules/     # Project documentation and guidelines
├── frontend/         # Next.js frontend application
├── infrastructure/   # Infrastructure as Code (Terraform, Docker)
│   ├── docker/       # Dockerfiles
│   ├── monitoring/   # Prometheus and Grafana configs
│   └── terraform/    # Terraform configurations
├── docker-compose.yml  # Local development environment
└── setup_dev_environment.sh  # Setup script
```

## Contributing

1. Create a feature branch from develop
2. Make your changes
3. Submit a pull request to develop
4. Ensure CI checks pass
5. Request review from team members

## License

[MIT License](LICENSE)
