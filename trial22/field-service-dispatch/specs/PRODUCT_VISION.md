# Product Vision — Field Service Dispatch

## Purpose

Field Service Dispatch is a multi-tenant SaaS platform that enables service companies to manage their field operations end-to-end: scheduling work orders, dispatching technicians, tracking routes, recording GPS events, and generating invoices.

## Target Users

- **Dispatchers:** Office staff who create work orders, assign technicians, manage schedules, and generate invoices.
- **Technicians:** Field workers who receive assignments, update work order status, and log GPS location data.

## Problem Statement

Small-to-medium field service companies rely on fragmented tools (spreadsheets, phone calls, paper invoices) to coordinate dispatchers and technicians. This leads to missed appointments, inefficient routing, delayed invoicing, and poor visibility into field operations.

## Solution

A unified platform where dispatchers manage the full lifecycle of work orders — from creation through invoicing — while technicians receive real-time assignments and report status from the field.

## Core Value Propositions

1. **Centralized Work Order Management:** Single source of truth for all service requests with a clear state machine (OPEN through CLOSED).
2. **Real-Time Field Tracking:** GPS events tied to technicians and work orders provide live visibility.
3. **Integrated Invoicing:** Work orders flow directly into invoices, eliminating manual data entry.
4. **Multi-Tenant Isolation:** Each company's data is fully isolated via row-level security.

## Key Features

### Work Order Lifecycle
<!-- VERIFY:PV-001 Work orders follow OPEN→ASSIGNED→IN_PROGRESS→COMPLETED→INVOICED→CLOSED state machine -->
Work orders progress through a defined state machine: OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, INVOICED, CLOSED. Any state can transition to CANCELLED.

### Role-Based Access
<!-- VERIFY:PV-002 Two roles: DISPATCHER and TECHNICIAN with distinct permissions -->
The system supports two roles — DISPATCHER and TECHNICIAN — each with appropriate permissions. Dispatchers manage all entities; technicians manage their own assignments and GPS events.

### Multi-Tenant Architecture
<!-- VERIFY:PV-003 All data is company-scoped with row-level security -->
Every entity belongs to a company. PostgreSQL row-level security enforces tenant isolation at the database level, preventing cross-tenant data access even if application logic fails.

## Success Metrics

- Dispatcher can create and assign a work order in under 60 seconds
- Technician can update work order status from the field in under 10 seconds
- Invoice generation from completed work order in under 30 seconds
- Zero cross-tenant data leakage (enforced by RLS)

## Non-Goals

- Real-time chat between dispatcher and technician (out of scope)
- Customer-facing portal (out of scope for v1)
- Mobile native apps (web-responsive only for v1)
- Payment processing (invoices generated but payment handled externally)

## Technical Constraints

- PostgreSQL 16 required for RLS and JSON support
- JWT-based authentication with fail-fast on missing secrets
- All monetary values stored as Decimal(12,2)
- GPS coordinates stored as Float (sufficient precision for dispatch)
