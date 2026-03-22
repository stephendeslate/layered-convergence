-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'user', 'viewer', 'editor');
CREATE TYPE "event_type" AS ENUM ('click', 'page_view', 'api_call', 'custom', 'error');
CREATE TYPE "event_status" AS ENUM ('pending', 'processed', 'failed', 'archived');
CREATE TYPE "pipeline_status" AS ENUM ('active', 'paused', 'failed', 'disabled');
CREATE TYPE "data_source_type" AS ENUM ('postgresql', 'mysql', 'rest_api', 'csv', 's3');
CREATE TYPE "data_source_status" AS ENUM ('connected', 'disconnected', 'error');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "type" "event_type" NOT NULL,
    "status" "event_status" NOT NULL DEFAULT 'pending',
    "payload" JSONB NOT NULL DEFAULT '{}',
    "source" VARCHAR(255) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboards" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_sources" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "data_source_type" NOT NULL,
    "status" "data_source_status" NOT NULL DEFAULT 'disconnected',
    "connection_uri" VARCHAR(500) NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "monthly_cost" DECIMAL(12,2) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipelines" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "pipeline_status" NOT NULL DEFAULT 'active',
    "schedule" VARCHAR(100),
    "config" JSONB NOT NULL DEFAULT '{}',
    "processing_cost" DECIMAL(12,2) NOT NULL,
    "data_source_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "users_email_idx" ON "users"("email");

CREATE INDEX "events_tenant_id_idx" ON "events"("tenant_id");
CREATE INDEX "events_status_idx" ON "events"("status");
CREATE INDEX "events_tenant_id_status_idx" ON "events"("tenant_id", "status");
CREATE INDEX "events_type_idx" ON "events"("type");

CREATE INDEX "dashboards_tenant_id_idx" ON "dashboards"("tenant_id");
CREATE INDEX "dashboards_user_id_idx" ON "dashboards"("user_id");
CREATE INDEX "dashboards_tenant_id_user_id_idx" ON "dashboards"("tenant_id", "user_id");

CREATE INDEX "data_sources_tenant_id_idx" ON "data_sources"("tenant_id");
CREATE INDEX "data_sources_status_idx" ON "data_sources"("status");
CREATE INDEX "data_sources_tenant_id_status_idx" ON "data_sources"("tenant_id", "status");

CREATE INDEX "pipelines_tenant_id_idx" ON "pipelines"("tenant_id");
CREATE INDEX "pipelines_status_idx" ON "pipelines"("status");
CREATE INDEX "pipelines_data_source_id_idx" ON "pipelines"("data_source_id");
CREATE INDEX "pipelines_tenant_id_status_idx" ON "pipelines"("tenant_id", "status");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "data_sources" ADD CONSTRAINT "data_sources_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable RLS
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dashboards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "data_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pipelines" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "events" FORCE ROW LEVEL SECURITY;
ALTER TABLE "dashboards" FORCE ROW LEVEL SECURITY;
ALTER TABLE "data_sources" FORCE ROW LEVEL SECURITY;
ALTER TABLE "pipelines" FORCE ROW LEVEL SECURITY;
