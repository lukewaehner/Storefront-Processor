#!/usr/bin/env bash

# Base project directory (adjust if needed)
BASE_DIR="."

# An array of all the directories to create
DIRS=(
  "$BASE_DIR/.cursor/rules"
  "$BASE_DIR/frontend/.cursor/rules"
  "$BASE_DIR/backend/.cursor/rules"
  "$BASE_DIR/backend/auth/.cursor/rules"
  "$BASE_DIR/backend/payments/.cursor/rules"
  "$BASE_DIR/data/.cursor/rules"
  "$BASE_DIR/infrastructure/.cursor/rules"
  "$BASE_DIR/tenant/.cursor/rules"
  "$BASE_DIR/docs/notes"
)

# An associative array mapping each target .md or .mdc file to its directory
declare -A FILES=(
  ["architecture-overview.mdc"]="$BASE_DIR/.cursor/rules"
  ["development-standards.mdc"]="$BASE_DIR/.cursor/rules"
  ["sla-commitments.mdc"]="$BASE_DIR/.cursor/rules"

  ["frontend-conventions.mdc"]="$BASE_DIR/frontend/.cursor/rules"
  ["accessibility-standards.mdc"]="$BASE_DIR/frontend/.cursor/rules"
  ["performance-targets.mdc"]="$BASE_DIR/frontend/.cursor/rules"
  ["seo-best-practices.mdc"]="$BASE_DIR/frontend/.cursor/rules"
  ["mobile-strategy.mdc"]="$BASE_DIR/frontend/.cursor/rules"

  ["backend-conventions.mdc"]="$BASE_DIR/backend/.cursor/rules"
  ["api-versioning.mdc"]="$BASE_DIR/backend/.cursor/rules"
  ["fraud-prevention.mdc"]="$BASE_DIR/backend/.cursor/rules"
  ["security-best-practices.mdc"]="$BASE_DIR/backend/.cursor/rules"

  ["auth-implementation.mdc"]="$BASE_DIR/backend/auth/.cursor/rules"
  ["gdpr-compliance.mdc"]="$BASE_DIR/backend/auth/.cursor/rules"

  ["payment-integration.mdc"]="$BASE_DIR/backend/payments/.cursor/rules"
  ["international-payments.mdc"]="$BASE_DIR/backend/payments/.cursor/rules"

  ["data-layer-conventions.mdc"]="$BASE_DIR/data/.cursor/rules"
  ["multi-tenancy.mdc"]="$BASE_DIR/data/.cursor/rules"
  ["migrations-strategy.mdc"]="$BASE_DIR/data/.cursor/rules"
  ["inventory-management.mdc"]="$BASE_DIR/data/.cursor/rules"

  ["infrastructure-conventions.mdc"]="$BASE_DIR/infrastructure/.cursor/rules"
  ["disaster-recovery.mdc"]="$BASE_DIR/infrastructure/.cursor/rules"
  ["load-testing.mdc"]="$BASE_DIR/infrastructure/.cursor/rules"
  ["monitoring-guidelines.mdc"]="$BASE_DIR/infrastructure/.cursor/rules"

  ["tenant-management.mdc"]="$BASE_DIR/tenant/.cursor/rules"
  ["tenant-onboarding.mdc"]="$BASE_DIR/tenant/.cursor/rules"

  ["feature-flags-config.md"]="$BASE_DIR/docs/notes"
  ["third-party-integrations.md"]="$BASE_DIR/docs/notes"
  ["ci-cd.md"]="$BASE_DIR/docs/notes"
  ["analytics-marketing.md"]="$BASE_DIR/docs/notes"
  ["documentation-sdk.md"]="$BASE_DIR/docs/notes"
  ["internationalization.md"]="$BASE_DIR/docs/notes"
)

echo "Creating directories..."
for dir in "${DIRS[@]}"; do
  mkdir -p "$dir"
done

echo "Touching files..."
for file in "${!FILES[@]}"; do
  touch "${FILES[$file]}/$file"
done

echo "Project structure generated under '$BASE_DIR/'."
