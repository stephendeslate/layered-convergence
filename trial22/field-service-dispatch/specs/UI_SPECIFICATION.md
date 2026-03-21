# UI Specification — Field Service Dispatch

## Overview

The frontend is built with Next.js 15 App Router, shadcn/ui components, and Tailwind CSS 4. It provides a responsive interface for dispatchers and technicians to manage field operations.

## Design System

### Component Library
<!-- VERIFY:UI-001 Uses 8 shadcn/ui components -->
The following 8 shadcn/ui components are used:
1. **Button** — Primary actions, form submissions
2. **Card** — Content containers for work orders, invoices
3. **Input** — Form text fields
4. **Label** — Form field labels (accessibility)
5. **Badge** — Status indicators for work orders, invoices
6. **Table** — Data display for lists
7. **Select** — Dropdown selectors for status, priority, technician assignment
8. **Dialog** — Confirmation modals for destructive actions

### Color Scheme
<!-- VERIFY:UI-002 Dark mode via prefers-color-scheme -->
- Light mode: Default with white backgrounds and slate text
- Dark mode: Activated via `prefers-color-scheme: dark` media query
- Status colors: Green (completed), Blue (in-progress), Yellow (assigned), Red (cancelled)
- Priority colors: Gray (low), Blue (medium), Orange (high), Red (urgent)

## Layout

<!-- VERIFY:UI-003 Navigation in root layout with skip-to-content link -->
### Root Layout (`app/layout.tsx`)
- Skip-to-content link as first focusable element
- Top navigation bar with links: Dashboard, Work Orders, Customers, Technicians, Invoices, Routes
- Main content area with `id="main-content"` for skip-to-content target
- Footer with company name

### Navigation
- Responsive: horizontal nav on desktop, hamburger menu on mobile
- Active route highlighted
- Role-based menu items (technicians see fewer options)

## Pages

### Login (`/login`)
- Email and password fields
- Submit button
- Error messages with `role="alert"`
- Redirect to dashboard on success

### Dashboard (`/dashboard`)
- Summary cards: Open work orders, Today's schedule, Pending invoices
- Recent work orders list
- Quick action buttons

### Work Orders (`/work-orders`)
- Table view with columns: Title, Customer, Technician, Status, Priority, Date
- Status badge with color coding
- Filter by status
- Link to create new work order

### Work Order Detail (`/work-orders/[id]`)
- Full work order details
- Status transition buttons (based on current state)
- Assign technician select
- Related invoice display

### New Work Order (`/work-orders/new`)
- Form with title, description, priority, customer select, scheduled date
- Validation feedback
- Submit creates work order and redirects to detail page

### Customers (`/customers`)
- Table view with name, email, phone, address
- Create new customer form

### Technicians (`/technicians`)
- Table view with name, phone, specialties
- Create new technician form

### Invoices (`/invoices`)
- Table view with invoice number, amount, status, work order
- Create invoice from completed work order

### Routes (`/routes`)
- List of routes with date, technician, estimated distance
- Create route with work order assignment

## Loading States
<!-- VERIFY:UI-004 Every route has loading.tsx with role="status" and aria-busy="true" -->
Every route directory contains a `loading.tsx` file that displays a loading skeleton with:
- `role="status"` for screen reader announcement
- `aria-busy="true"` to indicate loading state
- Visual skeleton matching the page layout

## Error States
<!-- VERIFY:UI-005 Every route has error.tsx with role="alert" -->
Every route directory contains an `error.tsx` file that:
- Displays the error message with `role="alert"`
- Provides a "Try again" button to retry the failed operation
- Uses the `"use client"` directive (required for error boundaries)

## Accessibility

- All form fields have associated labels
- All interactive elements are keyboard accessible
- Focus management on route changes
- Color contrast meets WCAG AA standards
- Screen reader announcements for status changes
- Skip-to-content link on every page
- axe-core automated testing
