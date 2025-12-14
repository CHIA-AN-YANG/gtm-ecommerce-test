# Product Requirements Document  
**Project Name:** GTM Ecommerce Event Testing App (Angular)

---

## 1. Project Overview

### 1.1 Purpose

The purpose of this application is to provide a controlled, frontend-only testing environment for validating Google Tag Manager (GTM) ecommerce implementations and Google Analytics 4 (GA4) ecommerce reporting.

The application enables users to manually input ecommerce data and trigger GA4-compliant ecommerce events via GTM. This allows analytics engineers, frontend developers, and QA teams to verify GTM container configurations, data layer mappings, and GA4 ecommerce reports without relying on backend systems, payment gateways, or real transactions.

### 1.2 Core Goals

- Enable manual simulation of GA4 ecommerce events through an Angular web application
- Ensure emitted events conform to GA4 recommended ecommerce schemas
- Facilitate testing and debugging of GTM tags, triggers, and variables
- Reduce development and QA effort by decoupling analytics testing from production flows

### 1.3 Target Users

- Analytics engineers
- Frontend engineers integrating GTM and GA4
- Digital marketing and data teams
- QA engineers validating analytics implementations

---

## 2. Skills Required

### 2.1 Tech Stack
**Frontend**
Angular (standalone components preferred)
Reactive Forms (dynamic ecommerce fields)
TypeScript models aligned to GA4 schema

**Backend**
Node.js
Express or Fastify (Fastify preferred for lower overhead)
better-sqlite3 or Prisma (simple schema)
Database

**SQLite**
Max 10 rows enforced server-side

**Platform**
Zeabur
- Service 1: Angular app (served as static or via Node)
- Service 2: Node.js API (Express/Fastify)
- SQLite file stored in persistent volume

### 2.2 structure
[ Angular App ]
   |
   | dataLayer.push (GTM)
   |
   | POST /events
   v
[ Node.js API ]
   |
   v
[ SQLite (persistent volume) ]

---

## 3. Key Features

### 3.1 Manual Ecommerce Event Input

- Form-based UI for manually triggering ecommerce events
- Separate forms per GA4 ecommerce event type
- User-controlled input of all event parameters (e.g. `transaction_id`, `value`, `currency`)

---

### 3.2 Supported Ecommerce Events

#### Product Discovery & Engagement
- `view_item_list`
- `select_item`
- `view_item`

#### Shopping Cart Interactions
- `add_to_cart`
- `remove_from_cart`
- `view_cart`

#### Checkout Flow
- `begin_checkout`
- `add_shipping_info`
- `add_payment_info`

#### Transaction & Revenue
- `purchase`
- `refund`

---

### 3.3 Item-Level Configuration

- Dynamic add/remove/edit functionality for `items[]`
- Support for common GA4 item parameters:
  - `item_id`
  - `item_name`
  - `item_brand`
  - `item_category`
  - `price`
  - `quantity`
  - `discount`

---

### 3.4 GTM Data Layer Dispatch

- Pushes ecommerce events to `window.dataLayer` on form submission
- Uses GA4-recommended event names and payload structure
- Compatible with standard GTM GA4 event tags and triggers

---

### 3.5 Payload Transparency & Debugging

- UI preview of generated data layer payload before dispatch
- Enables validation against GTM Preview and GA4 DebugView

---

### 3.6 Validation & Error Handling

- Client-side validation for required fields
- Clear error messaging for invalid or incomplete data
- Prevents malformed events from being dispatched

---

## Essential Info
- **GTM container id:** GTM-KC4NJPD8
- **GA id:** G-EGMNEDBSC5
