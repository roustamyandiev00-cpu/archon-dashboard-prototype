---
description: Archon Dashboard API Specification
---

# Archon Dashboard API Specification

## Overview
Archon is een alles-in-een bouwsoftware voor facturatie, projectmanagement, planning en financieel inzicht.

## Core Features
- **Klantenbeheer**: CRM-functionaliteit voor bouwbedrijven
- **Facturatie**: Offertes, facturen en betalingen
- **Projectmanagement**: Projectplanning, budgettering en voortgang
- **Financiën**: Transactiebeheer en rapportages

## Target Users
- Bouwbedrijven (MKB)
- Projectmanagers
- Administratief medewerkers
- Eigenaren/bedrijfsleiders

## Technical Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: TailwindCSS + Radix UI
- **State Management**: React Hooks + Zustand

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Klanten (Customers)
- `GET /klanten` - List customers
- `POST /klanten` - Create customer
- `GET /klanten/{id}` - Get customer details
- `PUT /klanten/{id}` - Update customer
- `DELETE /klanten/{id}` - Delete customer

### Projecten (Projects)
- `GET /projecten` - List projects
- `POST /projecten` - Create project
- `GET /projecten/{id}` - Get project details
- `PUT /projecten/{id}` - Update project

### Facturen (Invoices)
- `GET /facturen` - List invoices
- `POST /facturen` - Create invoice
- `GET /facturen/{id}` - Get invoice details
- `PUT /facturen/{id}` - Update invoice

### Transacties (Transactions)
- `GET /transacties` - List transactions
- `POST /transacties` - Create transaction

## Data Models

### User
- UUID-based identification
- Email authentication
- Profile metadata

### Klant
- Personal/company information
- Contact details
- Financial history
- Status tracking

### Project
- Project details
- Budget management
- Progress tracking
- Milestone payments

### Factuur
- Invoice numbering
- Line items with VAT
- Payment status
- Due date management

## Security
- JWT-based authentication
- Row-level security (RLS)
- User data isolation
- API rate limiting

## Development Environment
- Local development: `http://localhost:3007`
- Production: `https://archonpro.com`
- Supabase project: `bpgcfjrxtjcmjruhcngn.supabase.co`

## Next Steps
1. TypeScript type generation
2. API client implementation
3. Error handling patterns
4. Testing strategies
