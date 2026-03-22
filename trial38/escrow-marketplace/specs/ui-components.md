# UI Components Specification

## Overview

The Escrow Marketplace frontend uses 8 shadcn/ui components, all implemented with Radix UI patterns, class-variance-authority (CVA) for variants, and the `cn()` utility for class merging.

## Component Catalogue

### 1. Button (`components/ui/button.tsx`)
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default (h-10), sm (h-9), lg (h-11), icon (h-10 w-10)
- Features: focus-visible ring, disabled opacity, ref forwarding

### 2. Card (`components/ui/card.tsx`)
- Sub-components: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Used for: listing cards, dashboard sections, info panels

### 3. Alert (`components/ui/alert.tsx`)
- Variants: default, destructive
- Includes `role="alert"` for accessibility
- Sub-components: Alert, AlertTitle, AlertDescription

### 4. Badge (`components/ui/badge.tsx`)
- Variants: default, secondary, destructive, outline
- Used for: transaction status, listing status indicators

### 5. Input (`components/ui/input.tsx`)
- Features: focus-visible ring, disabled styling, file input support
- Used with Label component for accessible forms

### 6. Label (`components/ui/label.tsx`)
- Features: peer-disabled styling for associated inputs
- Used with htmlFor to associate with Input components

### 7. Skeleton (`components/ui/skeleton.tsx`)
- Animated pulse placeholder for loading states
- Used in loading.tsx files for content placeholders

### 8. Table (`components/ui/table.tsx`)
- Sub-components: Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption
- Features: overflow scroll wrapper, hover states, checkbox alignment

## Design Tokens

All components use CSS custom properties defined in `globals.css`:
- Colors: --background, --foreground, --primary, --secondary, --muted, --accent, --destructive, --card, --border, --input, --ring
- Border radius: --radius (0.5rem)
- Dark mode: Automatically switches via `@media (prefers-color-scheme: dark)`

## Accessibility

- All interactive components support keyboard navigation
- Focus rings via `focus-visible:ring-2 focus-visible:ring-ring`
- Disabled states prevent interaction and reduce opacity
- Alert component includes `role="alert"` attribute
- Table uses semantic HTML elements

## Verification Tags

<!-- VERIFY: EM-UI-001 — Button component (shadcn/ui) -->
<!-- VERIFY: EM-UI-002 — Card component (shadcn/ui) -->
<!-- VERIFY: EM-UI-003 — Alert component (shadcn/ui) -->
<!-- VERIFY: EM-UI-004 — Badge component (shadcn/ui) -->
<!-- VERIFY: EM-UI-005 — Input component (shadcn/ui) -->
<!-- VERIFY: EM-UI-006 — Label component (shadcn/ui) -->
<!-- VERIFY: EM-UI-007 — Skeleton component (shadcn/ui) -->
<!-- VERIFY: EM-UI-008 — Table component (shadcn/ui) -->
