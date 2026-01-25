---
description: Generate TypeScript types from OpenAPI specification
---

# TypeScript Type Generation Workflow

## Overview
This workflow generates TypeScript types from the OpenAPI specification for the Archon Dashboard API.

## Prerequisites
- OpenAPI specification file exists (`.windsurf/api-spec.yaml`)
- Node.js and npm/pnpm installed
- TypeScript installed in project

## Steps

### 1. Install Type Generation Tools
```bash
# Install openapi-typescript for type generation
pnpm add -D openapi-typescript
```

### 2. Generate Types
```bash
# Generate types from OpenAPI spec
npx openapi-typescript .windsurf/api-spec.yaml --output client/src/types/api.ts

# Alternative: With custom schema options
npx openapi-typescript .windsurf/api-spec.yaml --output client/src/types/api.ts --alphabetical --export-type
```

### 3. Create Type Utilities
```bash
# Create utility file for API types
mkdir -p client/src/types
```

### 4. Integration Steps
- Import generated types in API services
- Update existing type definitions to use generated types
- Ensure compatibility with current codebase

## Generated Type Structure
The generated types will include:
- API request/response types
- Parameter types
- Schema definitions
- Error types

## Usage Example
```typescript
import type { paths, components } from '@/types/api'

// Use generated types
type Customer = components['schemas']['Klant']
type CustomerList = paths['/klanten']['get']['responses']['200']['content']['application/json']
```

## Validation
- Check that generated types compile without errors
- Verify type coverage matches API endpoints
- Test type inference in IDE

## Maintenance
- Regenerate types when API specification changes
- Keep types in sync with OpenAPI spec
- Update type utilities as needed
