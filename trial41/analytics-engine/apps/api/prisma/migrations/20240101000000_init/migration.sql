-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'user', 'viewer', 'editor');

-- CreateEnum
CREATE TYPE "event_status" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "pipeline_status" AS ENUM ('active', 'paused', 'error', 'disabled');

-- CreateEnum
CREATE TYPE "data_source_type" AS ENUM ('database', 'api', 'file', 'stream');

-- CreateTable
CREATE TABLE "tenants" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(36) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "tenant_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(2000),
    "status" "event_status" NOT NULL DEFAULT 'pending',
    "payload" JSONB,
    "cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tenant_id" VARCHAR(36) NOT NULL,
    "data_source_id" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboards" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(2000),
    "config" JSONB,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" VARCHAR(36) NOT NULL,
    "owner_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_sources" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(2000),
    "type" "data_source_type" NOT NULL,
    "connection_url" VARCHAR(2048),
    "cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipelines" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(2000),
    "status" "pipeline_status" NOT NULL DEFAULT 'active',
    "config" JSONB,
    "cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tenant_id" VARCHAR(36) NOT NULL,
    "data_source_id" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "users_email_idx" ON "users"("email");

CREATE INDEX "events_tenant_id_idx" ON "events"("tenant_id");
CREATE INDEX "events_status_idx" ON "events"("status");
CREATE INDEX "events_tenant_id_status_idx" ON "events"("tenant_id", "status");
CREATE INDEX "events_data_source_id_idx" ON "events"("data_source_id");

CREATE INDEX "dashboards_tenant_id_idx" ON "dashboards"("tenant_id");
CREATE INDEX "dashboards_owner_id_idx" ON "dashboards"("owner_id");
CREATE INDEX "dashboards_tenant_id_is_public_idx" ON "dashboards"("tenant_id", "is_public");

CREATE INDEX "data_sources_tenant_id_idx" ON "data_sources"("tenant_id");
CREATE INDEX "data_sources_type_idx" ON "data_sources"("type");
CREATE INDEX "data_sources_tenant_id_is_active_idx" ON "data_sources"("tenant_id", "is_active");

CREATE INDEX "pipelines_tenant_id_idx" ON "pipelines"("tenant_id");
CREATE INDEX "pipelines_status_idx" ON "pipelines"("status");
CREATE INDEX "pipelines_tenant_id_status_idx" ON "pipelines"("tenant_id", "status");
CREATE INDEX "pipelines_data_source_id_idx" ON "pipelines"("data_source_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "data_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "data_sources" ADD CONSTRAINT "data_sources_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "data_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enable RLS
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" FORCE ROW LEVEL SECURITY;
ALTER TABLE "dashboards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dashboards" FORCE ROW LEVEL SECURITY;
ALTER TABLE "data_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "data_sources" FORCE ROW LEVEL SECURITY;
ALTER TABLE "pipelines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pipelines" FORCE ROW LEVEL SECURITY;
