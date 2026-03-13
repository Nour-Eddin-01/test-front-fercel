# TradeHub – Virtual Trading Platform with Community Feed

**DevOps Status:** 🟢 Infrastructure is operational. ELK Stack is live with automated ILM policies and dual-stream UDP logging.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Development Workflow](#2-development-workflow)
3. [Infrastructure & Tech Stack](#3-infrastructure--tech-stack)
4. [Observability & Logging (The Overseer View)](#4-observability--logging-the-overseer-view)
5. [Setup & Deployment](#5-setup--deployment)
6. [Database Schema Highlights](#6-database-schema-highlights)

---

## 1. Project Overview

TradeHub is a virtual stock trading platform where users practice trading with **1,000,000 in-game currency**.

* **Virtual Trading:** Real-time-like P&L tracking, portfolio management, and trade history.
* **Community Feed:** A social layer featuring stock-specific discussion threads and followers-first feeds.
* **Progression:** XP-based leveling and skill tiers from Beginner to Expert.

---

## 2. Development Workflow

To maintain code stability, we follow a strict branching and PR strategy:

* **`main`**: Production-ready code. Direct commits are strictly prohibited.
* **`dev`**: The integration hub. All features merge here first.
* **PR Rules**: 
  - Feature → `dev` (1 Approval)
  - `dev` → `main` (2 Peer Reviews + DevOps Stability Check)

---

## 3. Infrastructure & Tech Stack

* **Frontend:** React + Vite (TypeScript) — Port 3001
* **Backend:** NestJS (Node.js) — Port 3000
* **Proxy:** Nginx (SSL Termination & Reverse Proxy) — Ports 80/443
* **Database:** PostgreSQL 15 (Main Store) — Port 5432
* **Cache:** Redis 7 (Real-time tracking)
* **Search & Logs:** Elasticsearch, Logstash, Kibana (v7.17.10)

---

## 4. Observability & Logging (The Overseer View)

We utilize a centralized logging architecture using the **GELF (UDP)** driver to ensure non-blocking performance and system resilience.

### 4.1 Dual-Stream Indexing

Logs are automatically categorized and routed by Logstash into two distinct indices:

| Index Name | Source | Data Type |
|------------|--------|-----------|
| `tradehub-traffic-*` | Nginx (JSON) | Structured request data (IP, Status, Request Path, Response Time). |
| `tradehub-status-*` | System/All | Startup sequences, error traces, and system notices from all containers. |

### 4.2 Automated Lifecycle Management (ILM)

All logs are governed by a **7-day retention policy** managed by the `elk-setup` container:

* **Hot Phase:** Automatic rollover after 50GB or 2 days.
* **Delete Phase:** Permanent deletion after 7 days to preserve host disk space.

---

## 5. Setup & Deployment

### 5.1 Host Machine Preparation (Linux)

Before launching the stack, the Linux host must be prepared for Elasticsearch requirements:

```bash
# 1. Increase Virtual Memory (Required for ES startup)
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf

# 2. Fix Directory Permissions for ELK Volumes
sudo chown -R 1000:1000 ./infrastructure/elk/elasticsearch/data

# 3. Apply changes and restart Docker
sudo systemctl restart docker
```

### 5.2 Launch Commands

```bash
make up         # Start the platform in detached mode
make migrate    # Run DB migrations via Prisma
make generate   # Generate Prisma client
make seed       # Seed initial market data and admin user
```

### 5.3 Infrastructure Debugging (Kibana UI)

Access Kibana Dev Tools to verify the automated setup:

* **Check ILM Policy:** `GET _ilm/policy/tradehub_retention_policy`
* **Check Template:** `GET _template/tradehub_logs_template`
* **Explain Shards:** `GET tradehub-*/_ilm/explain`
* **List Indices:** `GET _cat/indices/tradehub-*?v`

---

## 6. Database Schema Highlights

* **Precision:** Financial values use `Decimal(15, 2)` for floating-point accuracy.
* **Scale:** `BigInt` used for stock volumes to handle global market caps.
* **Social:** Integrated `Post` and `Stock` models allow for real-time stock-tagging in the community feed.

---

---
## 7, dev need to provide  logs  for monitoring 
## logs  for tradehub-status for stack health
dev need to inject logs using 

```ts
private readonly logger = new Logger(UsersService.name);

this.logger.log('User logged in'); 
// Result: Clean text in Kibana, no ANSI trash.
```
## logs  for tradehub-traffic for analysing traffic
dev need to inject logs using 

```ts
this.logger.log({
  action: 'crypto_purchase',
  user_id: '1337',
  amount: 0.5,
  symbol: 'BTC',
  price: 50000
});
// Result: Your Smart Pipe detects the object, adds metadata, and parses it into fields.
```


---