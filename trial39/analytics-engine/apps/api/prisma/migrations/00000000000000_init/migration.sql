-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE "pipeline_status" AS ENUM ('idle', 'running', 'completed', 'failed');
CREATE TYPE "run_status" AS ENUM ('pending', 'in_progress', 'success', 'failure', 'timed_out');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(150) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'viewer',
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateTable
CREATE TABLE "dashboards" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "dashboards_tenant_id_idx" ON "dashboards"("tenant_id");
CREATE INDEX "dashboards_created_by_id_idx" ON "dashboards"("created_by_id");
CREATE INDEX "dashboards_tenant_id_is_public_idx" ON "dashboards"("tenant_id", "is_public");

-- CreateTable
CREATE TABLE "pipelines" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "status" "pipeline_status" NOT NULL DEFAULT 'idle',
    "description" TEXT,
    "schedule" VARCHAR(50),
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pipelines_tenant_id_idx" ON "pipelines"("tenant_id");
CREATE INDEX "pipelines_status_idx" ON "pipelines"("status");
CREATE INDEX "pipelines_tenant_id_status_idx" ON "pipelines"("tenant_id", "status");

-- CreateTable
CREATE TABLE "pipeline_runs" (
    "id" TEXT NOT NULL,
    "status" "run_status" NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "error_msg" TEXT,
    "pipeline_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pipeline_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pipeline_runs_pipeline_id_idx" ON "pipeline_runs"("pipeline_id");
CREATE INDEX "pipeline_runs_status_idx" ON "pipeline_runs"("status");
CREATE INDEX "pipeline_runs_pipeline_id_status_idx" ON "pipeline_runs"("pipeline_id", "status");

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT,
    "format" VARCHAR(20) NOT NULL DEFAULT 'pdf',
    "dashboard_id" TEXT NOT NULL,
    "generated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reports_dashboard_id_idx" ON "reports"("dashboard_id");
CREATE INDEX "reports_generated_by_idx" ON "reports"("generated_by");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pipeline_runs" ADD CONSTRAINT "pipeline_runs_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable Row Level Security
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dashboards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pipelines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pipeline_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reports" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "dashboards" FORCE ROW LEVEL SECURITY;
ALTER TABLE "pipelines" FORCE ROW LEVEL SECURITY;
ALTER TABLE "pipeline_runs" FORCE ROW LEVEL SECURITY;
ALTER TABLE "reports" FORCE ROW LEVEL SECURITY;
