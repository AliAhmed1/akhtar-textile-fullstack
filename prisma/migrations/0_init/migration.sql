-- CreateTable
CREATE TABLE "access_levels" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "accesslevels" STRING(255) NOT NULL,
    "usersid" INT8 NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chemical_association" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stepid" INT8,
    "chemicalid" INT8,
    "percentage" FLOAT8,
    "dosage" FLOAT8,

    CONSTRAINT "chemical_association_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chemicals" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" STRING(255),
    "kg_per_can" INT8,
    "cost_uom" STRING(50),
    "type_and_use" STRING(255),
    "cost_per_unit" DECIMAL(10,2),
    "unit_used" STRING(255),
    "unit_conversion" DECIMAL(10,2),
    "cost_per_kg" DECIMAL(10,2),
    "full_name" STRING(255),

    CONSTRAINT "chemicals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "title" STRING(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" INT8,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "load_size" INT8,
    "machine_type" STRING(255),
    "finish" STRING(255),
    "fabric" STRING(255),
    "recipe" INT8,
    "fno" STRING(255),
    "name" STRING(255),

    CONSTRAINT "recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "steps" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" STRING(255),
    "liters" INT8,
    "rpm" INT8,
    "centigrade" INT8,
    "ph" STRING(255),
    "lr" STRING(255),
    "tds" STRING(255),
    "tss" STRING(255),
    "recipesid" INT8,
    "step_no" STRING(255),
    "minutes" STRING(255),
    "step_id" INT8 NOT NULL,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" STRING(255) NOT NULL,
    "password" STRING(255) NOT NULL,
    "name" STRING(255) NOT NULL,
    "department" STRING(255),
    "designation" STRING(255),
    "cnic" STRING(255),
    "code" STRING(255) NOT NULL,
    "manager" STRING(255),
    "bank" STRING(255),
    "phone" STRING(255),
    "account" STRING(255),
    "createdby" STRING(255),
    "updatedby" STRING(255),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_chemical_name" ON "chemicals"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_recipe_name" ON "recipes"("recipe");

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

