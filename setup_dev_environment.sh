#!/bin/bash
set -e

echo "Setting up development environment for Storefront Processor..."

# Check if running on macOS
if [[ "$(uname)" == "Darwin" ]]; then
    echo "Detected macOS system"
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "Error: Homebrew is not installed. Please install Homebrew before proceeding."
        echo "Run this command to install: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    
    # Check if PostgreSQL is installed via Homebrew
    if ! brew list postgresql@14 &>/dev/null; then
        echo "Installing PostgreSQL via Homebrew..."
        brew install postgresql@14
    fi
    
    # Start PostgreSQL service if not running
    if ! brew services list | grep postgresql@14 | grep started &>/dev/null; then
        echo "Starting PostgreSQL service..."
        brew services start postgresql@14
        
        # Wait for PostgreSQL to start
        echo "Waiting for PostgreSQL to start..."
        sleep 5
    else
        echo "PostgreSQL is already running"
    fi
    
    # Create development database if it doesn't exist
    if ! psql -lqt postgres | cut -d \| -f 1 | grep -qw storefront_dev; then
        echo "Creating storefront_dev database..."
        createdb storefront_dev
    else
        echo "Database storefront_dev already exists"
    fi
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker before proceeding."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose before proceeding."
    exit 1
fi

# Start Docker Desktop on macOS if installed
if [[ "$(uname)" == "Darwin" ]]; then
    if [ -d "/Applications/Docker.app" ]; then
        echo "Starting Docker Desktop..."
        open -a Docker
        
        # Wait for Docker to start
        echo "Waiting for Docker to start..."
        while ! docker info &>/dev/null; do
            echo "Waiting for Docker to be ready..."
            sleep 2
        done
        echo "Docker is now running"
    fi
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js before proceeding."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Warning: Using Node.js version $(node -v). Recommended version is v18 or higher."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create frontend and backend directories if they don't exist
if [ ! -d "frontend" ]; then
    echo "Creating frontend directory..."
    mkdir -p frontend
    
    echo "Initializing Next.js project..."
    cd frontend
    npx create-next-app@latest . --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"
    cd ..
fi

if [ ! -d "backend" ]; then
    echo "Creating backend directory..."
    mkdir -p backend
    
    echo "Initializing NestJS project..."
    cd backend
    npx @nestjs/cli new . --package-manager npm
    cd ..
fi

# Create example .env files
if [ ! -f "frontend/.env.example" ]; then
    echo "Creating frontend .env.example file..."
    cat > frontend/.env.example << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_TELEMETRY_DISABLED=1
EOF
fi

if [ ! -f "backend/.env.example" ]; then
    echo "Creating backend .env.example file..."
    cat > backend/.env.example << EOF
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/storefront_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_secret_replace_in_production
JWT_EXPIRATION=1d
CORS_ORIGIN=http://localhost:3000
EOF
fi

# Make .env files from examples if they don't exist
if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend .env file from example..."
    cp frontend/.env.example frontend/.env
fi

if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env file from example..."
    cp backend/.env.example backend/.env
fi

# Create monitoring directories if they don't exist
if [ ! -d "infrastructure/monitoring/prometheus" ]; then
    echo "Creating Prometheus configuration directory..."
    mkdir -p infrastructure/monitoring/prometheus
fi

if [ ! -d "infrastructure/monitoring/grafana/provisioning/datasources" ]; then
    echo "Creating Grafana datasource directory..."
    mkdir -p infrastructure/monitoring/grafana/provisioning/datasources
fi

if [ ! -d "infrastructure/monitoring/grafana/provisioning/dashboards" ]; then
    echo "Creating Grafana dashboard directory..."
    mkdir -p infrastructure/monitoring/grafana/provisioning/dashboards
fi

# Make the script executable
chmod +x setup_dev_environment.sh

echo "Setting up Git hooks..."
# Initialize Git hooks directory if not already initialized
mkdir -p .git/hooks

# Create pre-commit hook
cat > .git/hooks/pre-commit << EOF
#!/bin/bash
set -e

echo "Running pre-commit checks..."

# Check for frontend linting
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "Running frontend linting..."
    cd frontend
    npm run lint
    cd ..
fi

# Check for backend linting
if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    echo "Running backend linting..."
    cd backend
    npm run lint
    cd ..
fi

echo "Pre-commit checks passed!"
EOF

# Make the pre-commit hook executable
chmod +x .git/hooks/pre-commit

echo "Starting Docker containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U postgres 2>/dev/null || psql -h localhost -U postgres -c '\q' 2>/dev/null; do
  echo "PostgreSQL is not ready yet... waiting"
  sleep 2
done

echo "Setting up database..."
# Install backend dependencies if not already installed
if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    cd backend
    npm install
    
    # Generate Prisma client
    echo "Generating Prisma client..."
    npx prisma generate
    
    # Run migrations
    echo "Running database migrations..."
    npx prisma migrate dev --name init --create-only
    npx prisma migrate deploy
    
    # Seed the database
    echo "Seeding the database..."
    npx prisma db seed
    
    cd ..
fi

echo "Development environment setup complete!"
echo ""
echo "You can now access:"
echo " - Frontend: http://localhost:3000"
echo " - Backend API: http://localhost:4000"
echo " - PostgreSQL: localhost:5432"
echo " - Redis: localhost:6379"
echo ""
echo "Monitoring tools:"
echo " - Prometheus: http://localhost:9090"
echo " - Grafana: http://localhost:3001 (admin/admin)"
echo " - Node Exporter: http://localhost:9100"
echo " - cAdvisor: http://localhost:8080"
echo " - Postgres Exporter: http://localhost:9187"
echo " - Redis Exporter: http://localhost:9121"
echo ""
echo "To start development:"
echo " - Frontend: cd frontend && npm run dev"
echo " - Backend: cd backend && npm run start:dev"
echo ""
echo "Happy coding!" 