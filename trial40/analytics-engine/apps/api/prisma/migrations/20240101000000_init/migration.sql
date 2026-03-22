-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE "event_type" AS ENUM ('page_view', 'click', 'conversion', 'custom');
CREATE TYPE "pipeline_status" AS ENUM ('idle', 'running', 'completed', 'failed');
CREATE TYPE "data_source_type" AS ENUM ('database', 'api', 'file', 'stream');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'viewer',
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "type" "event_type" NOT NULL,
    "name" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "events_tenant_id_idx" ON "events"("tenant_id");
CREATE INDEX "events_type_idx" ON "events"("type");
CREATE INDEX "events_tenant_id_type_idx" ON "events"("tenant_id", "type");

-- CreateTable
CREATE TABLE "dashboards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "dashboards_tenant_id_idx" ON "dashboards"("tenant_id");
CREATE INDEX "dashboards_user_id_idx" ON "dashboards"("user_id");
CREATE INDEX "dashboards_tenant_id_is_public_idx" ON "dashboards"("tenant_id", "is_public");

-- CreateTable
CREATE TABLE "data_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "data_source_type" NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "data_sources_tenant_id_idx" ON "data_sources"("tenant_id");
CREATE INDEX "data_sources_type_idx" ON "data_sources"("type");

-- CreateTable
CREATE TABLE "pipelines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "pipeline_status" NOT NULL DEFAULT 'idle',
    "schedule" TEXT,
    "tenant_id" TEXT NOT NULL,
    "data_source_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pipelines_tenant_id_idx" ON "pipelines"("tenant_id");
CREATE INDEX "pipelines_status_idx" ON "pipelines"("status");
CREATE INDEX "pipelines_tenant_id_status_idx" ON "pipelines"("tenant_id", "status");

-- AddForeignKeys
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "data_sources" ADD CONSTRAINT "data_sources_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable Row Level Security
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
