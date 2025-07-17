-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Armor" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "durability" DOUBLE PRECISION NOT NULL,
    "max_durability" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "compatibleBackpacks" TEXT NOT NULL,
    "compatibleContainers" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Armor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArmorName" (
    "id" SERIAL NOT NULL,
    "armorId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ArmorName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArmorStat" (
    "id" SERIAL NOT NULL,
    "armorId" TEXT NOT NULL,
    "statKey" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ArmorStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artefact" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "artefactClass" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "durability" DOUBLE PRECISION NOT NULL,
    "maxDurability" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION,
    "freshness" TEXT,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artefact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtefactName" (
    "id" SERIAL NOT NULL,
    "artefactId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ArtefactName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtefactEffect" (
    "id" SERIAL NOT NULL,
    "artefactId" TEXT NOT NULL,
    "effectKey" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION NOT NULL,
    "maxValue" DOUBLE PRECISION NOT NULL,
    "isThreshold" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ArtefactEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Container" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "containerClass" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "capacity" DOUBLE PRECISION,
    "iconUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Container_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContainerName" (
    "id" SERIAL NOT NULL,
    "containerId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ContainerName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContainerStat" (
    "id" SERIAL NOT NULL,
    "containerId" TEXT NOT NULL,
    "statKey" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ContainerStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "builds" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "build_data" JSONB NOT NULL,
    "armor_id" TEXT,
    "container_id" TEXT,
    "total_stats" JSONB,
    "total_weight" DOUBLE PRECISION,
    "total_cost" DOUBLE PRECISION,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "builds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "build_likes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "build_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "build_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "build_artefacts" (
    "id" SERIAL NOT NULL,
    "build_id" INTEGER NOT NULL,
    "artefact_id" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "build_artefacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "build_tags" (
    "id" SERIAL NOT NULL,
    "build_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "build_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "build_favorites" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "build_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "build_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BuildTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BuildTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "build_likes_user_id_build_id_key" ON "build_likes"("user_id", "build_id");

-- CreateIndex
CREATE UNIQUE INDEX "build_artefacts_build_id_slot_key" ON "build_artefacts"("build_id", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "build_tags_build_id_tag_id_key" ON "build_tags"("build_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "build_favorites_user_id_build_id_key" ON "build_favorites"("user_id", "build_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "_BuildTags_B_index" ON "_BuildTags"("B");

-- AddForeignKey
ALTER TABLE "ArmorName" ADD CONSTRAINT "ArmorName_armorId_fkey" FOREIGN KEY ("armorId") REFERENCES "Armor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArmorStat" ADD CONSTRAINT "ArmorStat_armorId_fkey" FOREIGN KEY ("armorId") REFERENCES "Armor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtefactName" ADD CONSTRAINT "ArtefactName_artefactId_fkey" FOREIGN KEY ("artefactId") REFERENCES "Artefact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtefactEffect" ADD CONSTRAINT "ArtefactEffect_artefactId_fkey" FOREIGN KEY ("artefactId") REFERENCES "Artefact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContainerName" ADD CONSTRAINT "ContainerName_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContainerStat" ADD CONSTRAINT "ContainerStat_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "builds" ADD CONSTRAINT "builds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "builds" ADD CONSTRAINT "builds_armor_id_fkey" FOREIGN KEY ("armor_id") REFERENCES "Armor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "builds" ADD CONSTRAINT "builds_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "Container"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_likes" ADD CONSTRAINT "build_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_likes" ADD CONSTRAINT "build_likes_build_id_fkey" FOREIGN KEY ("build_id") REFERENCES "builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_artefacts" ADD CONSTRAINT "build_artefacts_build_id_fkey" FOREIGN KEY ("build_id") REFERENCES "builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_artefacts" ADD CONSTRAINT "build_artefacts_artefact_id_fkey" FOREIGN KEY ("artefact_id") REFERENCES "Artefact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_tags" ADD CONSTRAINT "build_tags_build_id_fkey" FOREIGN KEY ("build_id") REFERENCES "builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_tags" ADD CONSTRAINT "build_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_favorites" ADD CONSTRAINT "build_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_favorites" ADD CONSTRAINT "build_favorites_build_id_fkey" FOREIGN KEY ("build_id") REFERENCES "builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildTags" ADD CONSTRAINT "_BuildTags_A_fkey" FOREIGN KEY ("A") REFERENCES "builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildTags" ADD CONSTRAINT "_BuildTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
