-- CreateTable
CREATE TABLE "hdb"."data_category" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "designation" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hdb"."data_entry" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "variable_code" TEXT NOT NULL,
    "value" REAL,
    "valid" BOOLEAN,
    "year" INTEGER,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "category_code" TEXT NOT NULL,
    "organization_element_code" TEXT NOT NULL,
    "profileId" INTEGER,
    "period" DATE,

    CONSTRAINT "data_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hdb"."dataSource" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "designation" TEXT,
    "type" TEXT,
    "parentId" INTEGER,

    CONSTRAINT "dataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hdb"."indicator" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL,
    "designation" TEXT,
    "definition" TEXT,
    "goal" TEXT,
    "formula" TEXT,
    "category_code" TEXT NOT NULL,
    "level" TEXT,
    "calculation_method" TEXT,
    "collection_frequency" TEXT,
    "constraints" TEXT,
    "interpretation" TEXT,
    "example" TEXT,

    CONSTRAINT "indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hdb"."organization_element" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL,
    "level" TEXT,
    "designation" TEXT,
    "acronym" TEXT,
    "gps" TEXT,
    "zone" TEXT,
    "department" TEXT,
    "data_manager_id" UUID,

    CONSTRAINT "organization_element_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hdb"."profile" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "theme" TEXT,
    "avatar" TEXT,
    "roles" JSONB DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" UUID NOT NULL,
    "organization_element_code" TEXT,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hdb"."role" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL,
    "designation" TEXT,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hdb"."variable" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL,
    "designation" TEXT,
    "type" JSONB DEFAULT '[]',
    "data_source_id" INTEGER NOT NULL,
    "category_code" TEXT NOT NULL,
    "frequency" TEXT,
    "level" TEXT,

    CONSTRAINT "variable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "data_category_code_key" ON "hdb"."data_category"("code");

-- CreateIndex
CREATE INDEX "idx_data_entry_category_code" ON "hdb"."data_entry"("category_code");

-- CreateIndex
CREATE INDEX "idx_data_entry_organization_element_code" ON "hdb"."data_entry"("organization_element_code");

-- CreateIndex
CREATE INDEX "idx_data_entry_profile_id" ON "hdb"."data_entry"("profileId");

-- CreateIndex
CREATE INDEX "idx_data_entry_variable_code" ON "hdb"."data_entry"("variable_code");

-- CreateIndex
CREATE UNIQUE INDEX "indicator_code_key" ON "hdb"."indicator"("code");

-- CreateIndex
CREATE INDEX "idx_indicator_category_code" ON "hdb"."indicator"("category_code");

-- CreateIndex
CREATE UNIQUE INDEX "organization_element_code_key" ON "hdb"."organization_element"("code");

-- CreateIndex
CREATE UNIQUE INDEX "profile_user_id_key" ON "hdb"."profile"("user_id");

-- CreateIndex
CREATE INDEX "idx_profile_organization_element_code" ON "hdb"."profile"("organization_element_code");

-- CreateIndex
CREATE UNIQUE INDEX "role_code_key" ON "hdb"."role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "variable_code_key" ON "hdb"."variable"("code");

-- CreateIndex
CREATE INDEX "idx_variable_category_code" ON "hdb"."variable"("category_code");

-- CreateIndex
CREATE INDEX "idx_variable_data_source_id" ON "hdb"."variable"("data_source_id");

-- AddForeignKey
ALTER TABLE "hdb"."data_entry" ADD CONSTRAINT "data_entry_category_code_fkey" FOREIGN KEY ("category_code") REFERENCES "hdb"."data_category"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hdb"."data_entry" ADD CONSTRAINT "data_entry_organization_element_code_fkey" FOREIGN KEY ("organization_element_code") REFERENCES "hdb"."organization_element"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hdb"."data_entry" ADD CONSTRAINT "data_entry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "hdb"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hdb"."data_entry" ADD CONSTRAINT "data_entry_variable_code_fkey" FOREIGN KEY ("variable_code") REFERENCES "hdb"."variable"("code") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hdb"."dataSource" ADD CONSTRAINT "dataSource_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "hdb"."dataSource"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hdb"."indicator" ADD CONSTRAINT "indicator_category_code_fkey" FOREIGN KEY ("category_code") REFERENCES "hdb"."data_category"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hdb"."profile" ADD CONSTRAINT "profile_organization_element_code_fkey" FOREIGN KEY ("organization_element_code") REFERENCES "hdb"."organization_element"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hdb"."variable" ADD CONSTRAINT "variable_category_code_fkey" FOREIGN KEY ("category_code") REFERENCES "hdb"."data_category"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hdb"."variable" ADD CONSTRAINT "variable_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "hdb"."dataSource"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
