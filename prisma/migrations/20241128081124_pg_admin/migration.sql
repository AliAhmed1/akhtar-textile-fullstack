-- CreateTable
CREATE TABLE "access_levels" (
    "id" BIGSERIAL NOT NULL,
    "accesslevels" VARCHAR(256) NOT NULL,
    "usersid" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chemical_association" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stepid" BIGINT,
    "chemicalid" BIGINT,
    "percentage" DOUBLE PRECISION,
    "dosage" DOUBLE PRECISION,

    CONSTRAINT "chemical_association_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chemicals" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(256),
    "kg_per_can" BIGINT,
    "cost_uom" VARCHAR(50),
    "type_and_use" VARCHAR(256),
    "cost_per_unit" DECIMAL(10,2),
    "unit_used" VARCHAR(256),
    "unit_conversion" DECIMAL(10,2),
    "cost_per_kg" DECIMAL(10,2),
    "full_name" VARCHAR(256),

    CONSTRAINT "chemicals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(256),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" BIGINT,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "load_size" BIGINT,
    "machine_type" VARCHAR(256),
    "finish" VARCHAR(256),
    "fabric" VARCHAR(256),
    "recipe" BIGINT,
    "fno" VARCHAR(256),
    "name" VARCHAR(256),

    CONSTRAINT "recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "steps" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" VARCHAR(256),
    "liters" BIGINT,
    "rpm" BIGINT,
    "centigrade" BIGINT,
    "ph" VARCHAR(256),
    "lr" VARCHAR(256),
    "tds" VARCHAR(256),
    "tss" VARCHAR(256),
    "recipesid" BIGINT,
    "step_no" VARCHAR(256),
    "minutes" VARCHAR(256),
    "step_id" BIGINT NOT NULL,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" VARCHAR(256) NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "department" VARCHAR(256),
    "designation" VARCHAR(256),
    "cnic" VARCHAR(256),
    "code" VARCHAR(256) NOT NULL,
    "manager" VARCHAR(256),
    "bank" VARCHAR(256),
    "phone" VARCHAR(256),
    "account" VARCHAR(256),
    "createdby" VARCHAR(256),
    "updatedby" VARCHAR(256),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_chemical_name" ON "chemicals"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_recipe_name" ON "recipes"("recipe");

-- CreateIndex
CREATE UNIQUE INDEX "unique_username" ON "users"("username");

-- AddForeignKey
ALTER TABLE "access_levels" ADD CONSTRAINT "access_levels_usersid_fkey" FOREIGN KEY ("usersid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemical_association" ADD CONSTRAINT "fk_chemical" FOREIGN KEY ("chemicalid") REFERENCES "chemicals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chemical_association" ADD CONSTRAINT "fk_step" FOREIGN KEY ("stepid") REFERENCES "steps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "fk_history_user" FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "steps" ADD CONSTRAINT "fk_stept_table" FOREIGN KEY ("recipesid") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
